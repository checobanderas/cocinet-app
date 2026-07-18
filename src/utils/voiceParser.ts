export interface Product {
  id: string;
  name: string;
  price: number;
  category: "food" | "drinks" | "desserts";
  subcategory: string;
}

// Helper to calculate Levenshtein distance for fuzzy matches 🧠
function getLevenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

// Helper to normalize strings uniformly 📜
const normalizeStr = (str: string): string => {
  if (!str) return "";
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "") // remove punctuation
    .trim();
};

// String similarity metric (0.0 to 1.0) 🎯
function getStringSimilarity(s1: string, s2: string): number {
  const norm1 = normalizeStr(s1);
  const norm2 = normalizeStr(s2);
  if (norm1 === norm2) return 1.0;
  if (!norm1 || !norm2) return 0.0;
  
  const maxLength = Math.max(norm1.length, norm2.length);
  const distance = getLevenshteinDistance(norm1, norm2);
  return (maxLength - distance) / maxLength;
}

// Highly robust product match scorer combining word-level overlap and fuzzy distance 🔬
function getProductSimilarity(transcriptItem: string, productName: string): number {
  const normT = normalizeStr(transcriptItem);
  const normP = normalizeStr(productName);
  if (normT === normP) return 1.0;
  if (!normT || !normP) return 0.0;

  // 1. Character-level direct similarity (handles minor spelling errors directly)
  const directSim = getStringSimilarity(normT, normP);
  if (directSim > 0.82) return directSim;

  // 2. Word-level similarity (handles extra words, rearrangements, missing articles)
  const wordsT = normT.split(/\s+/).filter(w => w.length > 1);
  const wordsP = normP.split(/\s+/).filter(w => w.length > 1);
  if (wordsT.length === 0 || wordsP.length === 0) return 0.0;

  let totalMatchScore = 0;
  wordsT.forEach(w1 => {
    let bestWordSim = 0;
    wordsP.forEach(w2 => {
      const sim = getStringSimilarity(w1, w2);
      if (sim > bestWordSim) {
        bestWordSim = sim;
      }
    });
    if (bestWordSim >= 0.7) {
      totalMatchScore += bestWordSim;
    }
  });

  const wordSim = totalMatchScore / Math.max(wordsT.length, wordsP.length);
  return Math.max(directSim, wordSim);
}

// Main local offline parsing logic using greedy similarity matching 🚀
export function parseVoiceTranscriptLocally(
  transcript: string,
  products: Product[],
  currentComensal: number
): { product: Product; quantity: number; plate: number; notes?: string }[] {
  const normTranscript = normalizeStr(transcript);
  console.log("Analyzing voice transcript offline via fuzzy similarity:", normTranscript);

  const detectedItems: { product: Product; quantity: number; plate: number; notes?: string }[] = [];

  const comensalRegexes = [
    { num: 1, patterns: [/comensal 1/g, /comensal uno/g, /para el uno/g, /persona uno/g, /persona 1/g, /plato uno/g, /plato 1/g] },
    { num: 2, patterns: [/comensal 2/g, /comensal dos/g, /para el dos/g, /persona dos/g, /persona 2/g, /plato dos/g, /plato 2/g] },
    { num: 3, patterns: [/comensal 3/g, /comensal tres/g, /para el tres/g, /persona tres/g, /persona 3/g, /plato tres/g, /plato 3/g] },
    { num: 4, patterns: [/comensal 4/g, /comensal cuatro/g, /para el cuatro/g, /persona cuatro/g, /persona 4/g, /plato cuatro/g, /plato 4/g] },
    { num: 5, patterns: [/comensal 5/g, /comensal cinco/g, /para el cinco/g, /persona cinco/g, /persona 5/g, /plato cinco/g, /plato 5/g] },
  ];

  // Segment transcription by coordinate conjunctions
  const segments = normTranscript.split(/\s+(?:y|tambien|ademas|además|luego)\s+/);
  let tempComensal = currentComensal;

  const spanishNumbers: { [key: string]: number } = {
    un: 1, uno: 1, una: 1,
    dos: 2,
    tres: 3,
    cuatro: 4,
    cinco: 5,
    seis: 6,
    siete: 7,
    ocho: 8,
    nueve: 9,
    diez: 10
  };

  segments.forEach(segment => {
    if (!segment.trim()) return;

    // Detect target comensal plate for this segment
    for (const item of comensalRegexes) {
      for (const pattern of item.patterns) {
        if (pattern.test(segment)) {
          tempComensal = item.num;
        }
      }
    }

    // Attempt to extract prefix quantity (e.g. "dos", "1", "un")
    let quantity = 1;
    let textToMatch = segment;

    const words = segment.split(/\s+/).filter(Boolean);
    if (words.length > 0) {
      const firstWord = words[0];
      if (/^\d+$/.test(firstWord)) {
        quantity = parseInt(firstWord, 10);
        textToMatch = words.slice(1).join(" ");
      } else if (spanishNumbers[firstWord]) {
        quantity = spanishNumbers[firstWord];
        textToMatch = words.slice(1).join(" ");
      }
    }

    // Find candidate with maximum similarity above a safe threshold
    let bestSimilarity = 0;
    let bestProduct: Product | null = null;

    products.forEach(product => {
      const sim = getProductSimilarity(textToMatch, product.name);
      if (sim > bestSimilarity) {
        bestSimilarity = sim;
        bestProduct = product;
      }
    });

    // Accept product match if above threshold (handles colloquial words/pronunciations)
    if (bestProduct && bestSimilarity >= 0.38) {
      const pNameWords = normalizeStr((bestProduct as Product).name).split(/\s+/).filter(w => w.length > 2);
      const remainingWords = normalizeStr(textToMatch).split(/\s+/).filter(w => w.length > 2);
      
      // Determine potential custom notes by isolating unmatched details in voice audio
      const unmatchedWords = remainingWords.filter(w1 => {
        return !pNameWords.some(w2 => getStringSimilarity(w1, w2) > 0.65);
      });

      const notes = unmatchedWords.length > 0 ? unmatchedWords.join(" ") : undefined;

      detectedItems.push({
        product: bestProduct,
        quantity,
        plate: tempComensal,
        notes
      });
    }
  });

  return detectedItems;
}
