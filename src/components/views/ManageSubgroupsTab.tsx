import React, { useState, useMemo } from "react";
import {
  bulkUpdateProductsSubgroupsInFirebase,
  updateProductInFirebase,
  getAllProductsFromFirebase,
} from "../../utils/firestore";

interface ManageSubgroupsTabProps {
  products: any[];
  selectedTenant: any;
  COMPANY_CATALOG: any[];
  triggerAppNotification: (title: string, msg: string, type: "success" | "warning" | "error" | "info") => void;
  onClose: () => void;
}

// 🧠 Advanced NLP & Heuristic Classifier for Taquerías and Restaurants (Waiter / POS Perspective)
export function classifyProductSmartly(
  productName: string,
  currentCategory?: string,
  currentSubcategory?: string,
  currentSubgroup?: string,
  currentSubsubgroup?: string
) {
  const upperName = (productName || "").toUpperCase().trim();
  const upperSec = (currentSubcategory || "").toUpperCase().trim();
  const combined = (upperName + " " + upperSec).trim();

  // Explicit Masa detection
  const isHarina =
    combined.includes("HARINA") ||
    upperName.startsWith("BURR") ||
    upperName.includes("BURRITO") ||
    upperName.includes("BURRITA") ||
    upperName.startsWith("GRING") ||
    upperName.includes("SINCRONIZAD") ||
    upperName.includes("PIRUET");

  const isMaiz =
    combined.includes("MAIZ") ||
    combined.includes("MAÍZ") ||
    upperName.startsWith("TLAYUD") ||
    upperName.startsWith("VAMPIR") ||
    upperName.startsWith("VOLCAN") ||
    upperName.startsWith("TOSTAD");

  // --- 1. BEBIDAS ---
  if (
    upperSec.includes("BEBID") ||
    combined.includes("REFRESCO") ||
    combined.includes("COCA") ||
    combined.includes("AGUA DE") ||
    combined.includes("AGUA 600") ||
    combined.includes("AGUIA 600") ||
    combined.includes("JARRA") ||
    combined.includes("CERVEZA") ||
    combined.includes("CORONA") ||
    combined.includes("VICTORIA") ||
    combined.includes("MODELO") ||
    combined.includes("BARRILITO") ||
    combined.includes("CAFÉ") ||
    combined.includes("CAFE") ||
    combined.includes("LIMONAD") ||
    combined.includes("ATOLE") ||
    combined.includes("CHOCOLAT") ||
    combined.includes("TIZANA") ||
    combined.includes("SMOTHIE") ||
    combined.includes("COLD BREW") ||
    combined.includes("MOKA") ||
    combined.includes("LATTE") ||
    combined.includes("FRAPUCHINO") ||
    combined.includes("FRAAPUCHINO") ||
    combined.includes("TARO") ||
    combined.includes("CHAPARRA") ||
    combined.includes("MICHELADA")
  ) {
    if (
      combined.includes("COCA") ||
      combined.includes("REFRESCO") ||
      combined.includes("CHAPARRA") ||
      combined.includes("SODA")
    ) {
      return {
        proposedCategory: "drinks",
        proposedSubcategory: "REFRESCOS",
        proposedSubgroup: combined.includes("LATA")
          ? "Latas"
          : combined.includes("SIN AZUCAR")
          ? "Sin Azúcar"
          : "Embotellados",
        proposedSubsubgroup: combined.includes("600") ? "600 ml" : "Refrescos",
      };
    }
    if (
      combined.includes("AGUA") ||
      combined.includes("AGUIA") ||
      combined.includes("LIMONAD") ||
      combined.includes("SMOTHIE")
    ) {
      return {
        proposedCategory: "drinks",
        proposedSubcategory: "AGUAS FRESCAS Y JARRAS",
        proposedSubgroup: combined.includes("JARRA")
          ? "Jarras"
          : combined.includes("FRAPE")
          ? "Frapé"
          : combined.includes("LIMONAD")
          ? "Limonadas"
          : "Vasos y Botellas",
        proposedSubsubgroup: combined.includes("JARRA") ? "Jarras" : "Individual",
      };
    }
    if (
      combined.includes("CERVEZA") ||
      combined.includes("CORONA") ||
      combined.includes("VICTORIA") ||
      combined.includes("MODELO") ||
      combined.includes("BARRILITO") ||
      combined.includes("MICHELADA") ||
      combined.includes("SUERO")
    ) {
      return {
        proposedCategory: "drinks",
        proposedSubcategory: "CERVEZAS",
        proposedSubgroup:
          combined.includes("MICHELADA") || combined.includes("SUERO")
            ? "Preparadas"
            : "Nacionales",
        proposedSubsubgroup: "Cervezas",
      };
    }
    return {
      proposedCategory: "drinks",
      proposedSubcategory: "CAFETERÍA Y CALIENTES",
      proposedSubgroup:
        combined.includes("FRAP") || combined.includes("FRAAP")
          ? "Frapuchinos"
          : combined.includes("LATTE") || combined.includes("CAPUCHINO")
          ? "Lattes y Capuchinos"
          : "Café y Té",
      proposedSubsubgroup: "Calientes",
    };
  }

  // --- 2. POSTRES ---
  if (
    upperSec.includes("POSTRE") ||
    combined.includes("PANQUE") ||
    combined.includes("FLAN") ||
    combined.includes("TARTA") ||
    combined.includes("PASTEL")
  ) {
    return {
      proposedCategory: "desserts",
      proposedSubcategory: "POSTRES DE LA CASA",
      proposedSubgroup: combined.includes("FLAN")
        ? "Flanes"
        : combined.includes("TARTA")
        ? "Tartas"
        : "Panqués",
      proposedSubsubgroup: "Postres",
    };
  }

  // --- 3. POZOLES (Debe evaluarse PRIMERO para que 'sin carne' jamás caiga en carnes) ---
  if (upperName.includes("POZOLE")) {
    let sg = "Grande";
    if (upperName.includes("SIN CARNE")) {
      sg =
        upperName.includes("CH") || upperName.includes("CHICO") || upperName.includes("CHQ")
          ? "Sin Carne (Chico)"
          : "Sin Carne (Grande)";
    } else if (
      upperName.includes("CH") ||
      upperName.includes("CHICO") ||
      upperName.includes("CHQ")
    ) {
      sg = "Chico";
    } else if (upperName.includes("MED") || upperName.includes("MEDIANO")) {
      sg = "Mediano";
    } else if (upperName.includes("LLEVAR")) {
      sg = "Para Llevar";
    } else if (upperName.includes("GDE") || upperName.includes("GRANDE")) {
      sg = "Grande";
    }

    return {
      proposedCategory: "food",
      proposedSubcategory: "POZOLES",
      proposedSubgroup: sg,
      proposedSubsubgroup: upperName.includes("SIN CARNE") ? "Sin Carne" : "Tradicional",
    };
  }

  // --- 4. EXTRAS Y COMPLEMENTOS (Debe evaluarse ANTES de carnes para 'carne extra') ---
  if (
    upperName.includes("EXTRA") ||
    upperName.startsWith("EXTRA ") ||
    upperName.endsWith(" EXTRA") ||
    upperName.includes("DESECHABLE") ||
    upperName.includes("SERVICIO") ||
    upperName.includes("DIFERENCIA")
  ) {
    let sg = "Extras";
    if (upperName.includes("CARNE")) sg = "Carnes Extras";
    else if (upperName.includes("QUESO")) sg = "Queso Extra";
    else if (upperName.includes("TORTILLA") || upperName.includes("TOSTADA"))
      sg = "Tortillas y Tostadas";
    else if (
      upperName.includes("DESECHABLE") ||
      upperName.includes("SERVICIO") ||
      upperName.includes("DIFERENCIA")
    )
      sg = "Servicios y Extras";

    return {
      proposedCategory: "food",
      proposedSubcategory: "EXTRAS",
      proposedSubgroup: sg,
      proposedSubsubgroup: "Extras",
    };
  }

  // --- 5. PAPAS Y CHARROS ---
  if (
    upperName.includes("PAPA") ||
    upperName.includes("CHARRO") ||
    upperName.includes("CARROS") ||
    upperName.includes("FRIJOL")
  ) {
    return {
      proposedCategory: "food",
      proposedSubcategory: "PAPAS Y CHARROS",
      proposedSubgroup:
        upperName.includes("CHARRO") ||
        upperName.includes("CARROS") ||
        upperName.includes("FRIJOL")
          ? "Frijoles Charros"
          : isHarina || upperName.includes("HARINA")
          ? "Papas con Harina"
          : "Papas con Maíz",
      proposedSubsubgroup: upperName.includes("CARNE")
        ? "Con Carne"
        : upperName.includes("QUESO")
        ? "Con Queso"
        : "Asada",
    };
  }

  // --- 6. CARNES POR PESO (1 Kilo, 1/2 Kilo, 300 Gramos, Órdenes, Revueltos) ---
  if (
    upperName.includes("KILO") ||
    upperName.includes("1/2") ||
    upperName.includes("1/4") ||
    upperName.includes("300") ||
    upperName.includes("GRS") ||
    upperName.includes("GRAMO") ||
    upperName.includes("REVUELTO") ||
    upperName.startsWith("ORDEN CARNE") ||
    upperName.startsWith("CARNE ")
  ) {
    let sg = "Carnes por Peso";
    if (
      upperName.includes("300") ||
      upperName.includes("GRS") ||
      upperName.includes("GRAMO") ||
      upperName.includes("1/4") ||
      upperName.includes("CUARTO")
    ) {
      sg = "300 Gramos";
    } else if (upperName.includes("1/2") || upperName.includes("MEDIO")) {
      sg = isHarina || upperName.includes("HARINA") ? "1/2 Kilo (Harina)" : "1/2 Kilo";
    } else if (
      upperName.includes("1 KILO") ||
      upperName.includes("UN KILO") ||
      upperName.startsWith("KILO ") ||
      upperName.endsWith(" KG") ||
      upperName.includes(" KILO")
    ) {
      sg = isHarina || upperName.includes("HARINA") ? "1 Kilo (Harina)" : "1 Kilo";
    } else if (upperName.includes("REVUELTO")) {
      sg = "Revueltos";
    } else if (upperName.includes("ORDEN")) {
      sg = isHarina || upperName.includes("HARINA") ? "Órdenes (Harina)" : "Órdenes de Carne";
    }

    return {
      proposedCategory: "food",
      proposedSubcategory: "CARNES",
      proposedSubgroup: sg,
      proposedSubsubgroup: isHarina ? "Harina" : "Maíz",
    };
  }

  // --- 7. TACOS ---
  if (upperName.includes("TACO")) {
    let sg = "Tacos de Maíz";
    if (upperName.includes("QUESO") || upperName.includes("GRATINADO")) {
      sg = isHarina ? "Harina Con Queso" : "Maíz Con Queso";
    } else if (isHarina || upperName.includes("HARINA")) {
      sg = "Tacos de Harina";
    }
    return {
      proposedCategory: "food",
      proposedSubcategory: "TACOS",
      proposedSubgroup: sg,
      proposedSubsubgroup: isHarina ? "Harina" : "Maíz",
    };
  }

  // --- 8. ALAMBRES Y PREPARADOS ---
  if (upperName.includes("ALAMBRE") || upperName.includes("PREPARADO")) {
    return {
      proposedCategory: "food",
      proposedSubcategory: "ALAMBRES Y PREPARADOS",
      proposedSubgroup: isHarina || upperName.includes("HARINA") ? "Alambres en Harina" : "Alambres en Maíz",
      proposedSubsubgroup: isHarina ? "Harina" : "Maíz",
    };
  }

  // --- 9. ESPECIALIDADES Y BURROS (GRINGAS, QUESADILLAS, BURROS, PIRUETAS) ---
  if (
    upperName.includes("GRINGA") ||
    upperName.includes("QUESADILLA") ||
    upperName.includes("BURRO") ||
    upperName.includes("BURRA") ||
    upperName.includes("PIRUETA") ||
    upperName.includes("SINCRONIZADA")
  ) {
    let sg = "Especialidades";
    if (upperName.includes("BURRO") || upperName.includes("BURRA")) sg = "Burros";
    else if (upperName.includes("GRINGA"))
      sg = isMaiz || upperName.includes("MAIZ") || upperName.includes("MAÍZ") ? "Gringas de Maíz" : "Gringas de Harina";
    else if (upperName.includes("QUESADILLA"))
      sg = isMaiz || upperName.includes("MAIZ") || upperName.includes("MAÍZ") ? "Quesadillas de Maíz" : "Quesadillas de Harina";
    else if (upperName.includes("PIRUETA") || upperName.includes("SINCRONIZADA"))
      sg = "Piruetas y Sincronizadas";

    return {
      proposedCategory: "food",
      proposedSubcategory: "ESPECIALIDADES",
      proposedSubgroup: sg,
      proposedSubsubgroup: isHarina ? "Harina" : "Maíz",
    };
  }

  // --- 10. QUESOS FUNDIDOS ---
  if (upperName.includes("QUESO FUNDIDO") || upperName.includes("FUNDIDO")) {
    return {
      proposedCategory: "food",
      proposedSubcategory: "QUESOS FUNDIDOS",
      proposedSubgroup: isHarina || upperName.includes("HARINA") ? "Fundidos con Harina" : "Fundidos con Maíz",
      proposedSubsubgroup: isHarina ? "Harina" : "Maíz",
    };
  }

  // --- 11. TLAYUDAS, VAMPIROS Y VOLCANES ---
  if (upperName.includes("TLAYUDA") || upperName.includes("VAMPIRO") || upperName.includes("VOLCAN")) {
    return {
      proposedCategory: "food",
      proposedSubcategory: upperName.includes("TLAYUDA")
        ? "TLAYUDAS"
        : "VAMPIROS Y VOLCANES",
      proposedSubgroup: upperName.includes("TLAYUDA")
        ? "Tlayudas"
        : upperName.includes("VAMPIRO")
        ? (upperName.includes("QUESO") ? "Vampiros con Queso" : "Vampiros")
        : "Volcanes",
      proposedSubsubgroup: "Maíz",
    };
  }

  // --- 12. GUARNICIONES ---
  if (
    upperName.includes("AGUACATE") ||
    upperName.includes("CEBOLLA") ||
    upperName.includes("NOPAL") ||
    upperName.includes("GUACAMOLE") ||
    upperName.includes("PICO DE GALLO")
  ) {
    return {
      proposedCategory: "food",
      proposedSubcategory: "GUARNICIONES",
      proposedSubgroup: "Guarniciones",
      proposedSubsubgroup: "Guarniciones",
    };
  }

  return {
    proposedCategory: "food",
    proposedSubcategory: upperSec || "GENERAL",
    proposedSubgroup: isHarina ? "Harina" : "Maíz",
    proposedSubsubgroup: "General",
  };
}

export const ManageSubgroupsTab: React.FC<ManageSubgroupsTabProps> = ({
  products,
  selectedTenant,
  COMPANY_CATALOG,
  triggerAppNotification,
  onClose,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("ALL");
  const [selectedSubgroupFilter, setSelectedSubgroupFilter] = useState<string>("ALL");
  const [selectedSubsubgroupFilter, setSelectedSubsubgroupFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [bulkSubgroupInput, setBulkSubgroupInput] = useState<string>("");
  const [bulkSubsubgroupInput, setBulkSubsubgroupInput] = useState<string>("");
  const [bulkSubcategoryInput, setBulkSubcategoryInput] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isReplicating, setIsReplicating] = useState<boolean>(false);
  const [isClassifyingAI, setIsClassifyingAI] = useState<boolean>(false);
  const [showMagicPanel, setShowMagicPanel] = useState<boolean>(false);
  const [magicSuggestionsList, setMagicSuggestionsList] = useState<any[]>([]);

  // Active products of this tenant
  const activeProducts = useMemo(() => {
    return products.filter((p) => !p.isDeleted);
  }, [products]);

  // Unique subcategories
  const availableSubcategories = useMemo(() => {
    const subs = new Set<string>();
    activeProducts.forEach((p) => {
      if (selectedCategory === "all" || p.category === selectedCategory) {
        if (p.subcategory && p.subcategory.trim()) {
          subs.add(p.subcategory.trim());
        }
      }
    });
    return Array.from(subs).sort();
  }, [activeProducts, selectedCategory]);

  // Unique subgroups (Tier 3)
  const availableSubgroups = useMemo(() => {
    const sgs = new Set<string>();
    activeProducts.forEach((p) => {
      if (p.subgroup && p.subgroup.trim()) {
        sgs.add(p.subgroup.trim());
      }
    });
    return Array.from(sgs).sort();
  }, [activeProducts]);

  // Unique subsubgroups (Tier 4)
  const availableSubsubgroups = useMemo(() => {
    const ssgs = new Set<string>();
    activeProducts.forEach((p) => {
      if (p.subsubgroup && p.subsubgroup.trim()) {
        ssgs.add(p.subsubgroup.trim());
      }
    });
    return Array.from(ssgs).sort();
  }, [activeProducts]);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return activeProducts.filter((p) => {
      // Category filter
      if (selectedCategory !== "all" && p.category !== selectedCategory) {
        return false;
      }
      // Subcategory filter
      if (selectedSubcategory !== "ALL" && p.subcategory !== selectedSubcategory) {
        return false;
      }
      // Subgroup filter
      if (selectedSubgroupFilter === "UNASSIGNED") {
        if (p.subgroup && p.subgroup.trim() !== "") return false;
      } else if (selectedSubgroupFilter === "ASSIGNED") {
        if (!p.subgroup || p.subgroup.trim() === "") return false;
      } else if (selectedSubgroupFilter !== "ALL") {
        if (p.subgroup !== selectedSubgroupFilter) return false;
      }
      // Subsubgroup filter
      if (selectedSubsubgroupFilter === "UNASSIGNED") {
        if (p.subsubgroup && p.subsubgroup.trim() !== "") return false;
      } else if (selectedSubsubgroupFilter === "ASSIGNED") {
        if (!p.subsubgroup || p.subsubgroup.trim() === "") return false;
      } else if (selectedSubsubgroupFilter !== "ALL") {
        if (p.subsubgroup !== selectedSubsubgroupFilter) return false;
      }
      // Search query
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase().trim();
        const matchName = (p.name || "").toLowerCase().includes(q);
        const matchSub = (p.subcategory || "").toLowerCase().includes(q);
        const matchSg = (p.subgroup || "").toLowerCase().includes(q);
        const matchSsg = (p.subsubgroup || "").toLowerCase().includes(q);
        if (!matchName && !matchSub && !matchSg && !matchSsg) return false;
      }
      return true;
    });
  }, [activeProducts, selectedCategory, selectedSubcategory, selectedSubgroupFilter, selectedSubsubgroupFilter, searchQuery]);

  // Calculate smart suggestions using the NLP engine
  const autoSuggestions = useMemo(() => {
    const list: any[] = [];
    filteredProducts.forEach((p) => {
      const { proposedCategory, proposedSubcategory, proposedSubgroup, proposedSubsubgroup } = classifyProductSmartly(
        p.name,
        p.category,
        p.subcategory,
        p.subgroup,
        p.subsubgroup
      );
      const isSubgroupDiff = proposedSubgroup && p.subgroup !== proposedSubgroup;
      const isSubsubgroupDiff = proposedSubsubgroup && p.subsubgroup !== proposedSubsubgroup;
      const isSubcatDiff = proposedSubcategory && p.subcategory !== proposedSubcategory;

      if (isSubgroupDiff || isSubsubgroupDiff || isSubcatDiff) {
        list.push({
          productId: p.id,
          name: p.name,
          currentCategory: p.category || "food",
          currentSubcategory: p.subcategory || "(Sin Sección)",
          currentSubgroup: p.subgroup || "(Sin Subgrupo)",
          currentSubsubgroup: p.subsubgroup || "(Sin Variante)",
          proposedCategory,
          proposedSubcategory,
          proposedSubgroup,
          proposedSubsubgroup,
        });
      }
    });
    return list;
  }, [filteredProducts]);

  // Execute Gemini AI Cloud Auto-Classification
  const handleRunGeminiAI = async () => {
    const apiKeyToUse =
      localStorage.getItem("custom_gemini_api_key") ||
      localStorage.getItem("local_gemini_api_key") ||
      ((import.meta as any).env?.VITE_GEMINI_API_KEY as string) ||
      "";

    setIsClassifyingAI(true);
    try {
      const itemsToClassify = filteredProducts.map((p) => ({
        id: p.id,
        name: p.name,
        currentSubcategory: p.subcategory || "",
        currentSubgroup: p.subgroup || "",
      }));

      if (!apiKeyToUse) {
        // Fallback to local high-precision NLP engine
        setMagicSuggestionsList(autoSuggestions);
        setShowMagicPanel(true);
        triggerAppNotification(
          "Clasificación Inteligente Local 🪄",
          `Se procesaron ${autoSuggestions.length} sugerencias con el motor semántico de alta precisión.`,
          "info"
        );
        return;
      }

      const promptText = `Eres un experto chef y consultor de restaurantes y taquerías en México.
Tu tarea es clasificar la siguiente lista de productos de un restaurante en una jerarquía estricta de 4 NIVELES:
1. 'category': "food" (alimentos), "drinks" (bebidas) o "desserts" (postres).
2. 'subcategory' (SECCIÓN MAYOR):
   - ALAMBRES Y PREPARADOS (para alambres de pastor, asada, arrachera, chistorra, mixtos)
   - CARNES (para tacos/órdenes de kilo, medio kilo, revueltos, carnes por porción)
   - ESPECIALIDADES (para burras, gringas, quesadillas, piruetas, sincronizadas)
   - BURROS (para burros de asada, arrachera, chistorra, etc.)
   - TACOS (para tacos individuales, con queso, de harina o de maíz)
   - PAPAS Y CHARROS (para papa asada, papa con queso, papa con carne, frijoles charros)
   - QUESOS FUNDIDOS (naturales, asada, arrachera, chistorra, mixto)
   - TLAYUDAS (tlayudas de asada, arrachera, chistorra, mixta)
   - VAMPIROS Y VOLCANES (vampiros o volcanes sencillos o con queso)
   - POZOLES (para pozoles grandes, chicos, medianos)
   - GUARNICIONES Y EXTRAS (guacamole, cebolla, aguacate, tortillas)
   - REFRESCOS, AGUAS FRESCAS, CERVEZAS, CAFETERÍA Y CALIENTES
   - POSTRES (panqués, flanes, tartas, pasteles)
3. 'subgroup' (NIVEL 3: MASA / FAMILIA):
   - Si el producto o su sección dice "HARINA" (o es Burro/Gringa/Pirueta): "Harina"
   - Si el producto o su sección dice "MAIZ" o es tradicional sin harina: "Maíz"
   - Si es carne por peso: "Por Kilo" (o "Harina" si dice harina)
   - Si es pozole: "Tradicional" o "Para Llevar"
   - Si es bebida: "Refrescos", "Aguas Frescas", "Cervezas", "Cafetería"
   - Si es postre: "Postres"
4. 'subsubgroup' (NIVEL 4: VARIANTE / PROTEÍNA / TAMAÑO ESPECÍFICO):
   - En ALAMBRES: "Pastor Especial", "Arrachera", "Asada", "Chistorra", "Longaniza", "Mixtos"
   - En PAPAS: "Papa Asada", "Papa con Queso", "Papa con Carne", "Frijoles Charros"
   - En ESPECIALIDADES / BURROS: "Gringas", "Quesadillas", "Burros", "Piruetas"
   - En CARNES: "1 Kilo", "1/2 Kilo", "1/4 Kilo", "Órdenes de Carne", "Revueltos"
   - En TACOS: "Pastor", "Arrachera", "Asada", "Con Queso", "Sencillos"
   - En POZOLES: "Grande", "Chico", "Mediano"
   - En BEBIDAS: "Lata", "Sin Azúcar", "600 ml", "Jarras", "Litros", "Frapé", "Preparadas", "Nacionales"

Retorna EXCLUSIVAMENTE un JSON ARRAY con objetos: [{"id": "...", "category": "...", "subcategory": "...", "subgroup": "...", "subsubgroup": "..."}].
Productos a clasificar:
${JSON.stringify(itemsToClassify)}`;

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKeyToUse}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
          generationConfig: {
            responseMimeType: "application/json",
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Error en API Gemini: ${response.statusText}`);
      }

      const resData = await response.json();
      const rawText = resData.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
      const aiResults: any[] = JSON.parse(rawText);

      const parsedSuggestions: any[] = [];
      aiResults.forEach((ai) => {
        const prod = filteredProducts.find((p) => p.id === ai.id);
        if (prod) {
          parsedSuggestions.push({
            productId: prod.id,
            name: prod.name,
            currentCategory: prod.category,
            currentSubcategory: prod.subcategory || "(Sin Sección)",
            currentSubgroup: prod.subgroup || "(Sin Subgrupo)",
            currentSubsubgroup: prod.subsubgroup || "(Sin Variante)",
            proposedCategory: ai.category || prod.category,
            proposedSubcategory: ai.subcategory || prod.subcategory,
            proposedSubgroup: ai.subgroup || prod.subgroup,
            proposedSubsubgroup: ai.subsubgroup || prod.subsubgroup || "General",
          });
        }
      });

      setMagicSuggestionsList(parsedSuggestions);
      setShowMagicPanel(true);
      triggerAppNotification(
        "¡Gemini IA Finalizado! 🤖",
        `Se generó la estructura de 4 niveles para ${parsedSuggestions.length} productos con Inteligencia Artificial.`,
        "success"
      );
    } catch (error: any) {
      console.warn("Fallback a motor local:", error);
      setMagicSuggestionsList(autoSuggestions);
      setShowMagicPanel(true);
      triggerAppNotification(
        "Motor Semántico Local 🪄",
        `Gemini no disponible. Se utilizó el motor local de 4 niveles con ${autoSuggestions.length} sugerencias.`,
        "info"
      );
    } finally {
      setIsClassifyingAI(false);
    }
  };

  // Apply Magic Suggestions in Bulk
  const handleApplyMagicSuggestions = async () => {
    const listToApply = magicSuggestionsList.length > 0 ? magicSuggestionsList : autoSuggestions;
    if (listToApply.length === 0) return;
    setIsSaving(true);
    try {
      const updates = listToApply.map((s) => ({
        productId: s.productId,
        updates: {
          category: s.proposedCategory,
          subcategory: s.proposedSubcategory,
          subgroup: s.proposedSubgroup,
          subsubgroup: s.proposedSubsubgroup,
        },
      }));

      await bulkUpdateProductsSubgroupsInFirebase(updates);

      triggerAppNotification(
        "¡Estructura Guardada con Éxito! ✨",
        `Se actualizaron las secciones, subgrupos y variantes de ${updates.length} productos en Firebase.`,
        "success"
      );
      setShowMagicPanel(false);
      setMagicSuggestionsList([]);
    } catch (error: any) {
      console.error("Error al aplicar sugerencias:", error);
      triggerAppNotification("Error ❌", error.message || "No se pudieron aplicar las sugerencias.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Bulk Apply Subgroup (Tier 3)
  const handleApplyBulkSubgroup = async () => {
    if (selectedProductIds.length === 0) {
      triggerAppNotification("Aviso ⚠️", "Selecciona al menos un producto de la lista.", "warning");
      return;
    }
    const val = bulkSubgroupInput.trim();
    if (!val) {
      triggerAppNotification("Aviso ⚠️", "Escribe el nombre del subgrupo a asignar.", "warning");
      return;
    }

    setIsSaving(true);
    try {
      const updates = selectedProductIds.map((id) => ({
        productId: id,
        updates: { subgroup: val },
      }));

      await bulkUpdateProductsSubgroupsInFirebase(updates);

      triggerAppNotification(
        "Subgrupo Actualizado 🏷️",
        `Se asignó el subgrupo "${val}" a ${selectedProductIds.length} producto(s).`,
        "success"
      );
      setSelectedProductIds([]);
      setBulkSubgroupInput("");
    } catch (error: any) {
      console.error("Error al asignar subgrupo:", error);
      triggerAppNotification("Error ❌", error.message || "Error al actualizar subgrupo.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Bulk Apply Sub-subgroup (Tier 4: Variante / Platillo)
  const handleApplyBulkSubsubgroup = async () => {
    if (selectedProductIds.length === 0) {
      triggerAppNotification("Aviso ⚠️", "Selecciona al menos un producto de la lista.", "warning");
      return;
    }
    const val = bulkSubsubgroupInput.trim();
    if (!val) {
      triggerAppNotification("Aviso ⚠️", "Escribe el nombre de la variante a asignar (ej: Burras, Gringas, 1/2 Kilo).", "warning");
      return;
    }

    setIsSaving(true);
    try {
      const updates = selectedProductIds.map((id) => ({
        productId: id,
        updates: { subsubgroup: val },
      }));

      await bulkUpdateProductsSubgroupsInFirebase(updates);

      triggerAppNotification(
        "Variante Actualizada 🏷️",
        `Se asignó la variante "${val}" a ${selectedProductIds.length} producto(s).`,
        "success"
      );
      setSelectedProductIds([]);
      setBulkSubsubgroupInput("");
    } catch (error: any) {
      console.error("Error al asignar variante:", error);
      triggerAppNotification("Error ❌", error.message || "Error al actualizar variante.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Bulk Apply Subcategory (Sección/Grupo)
  const handleApplyBulkSubcategory = async () => {
    if (selectedProductIds.length === 0) {
      triggerAppNotification("Aviso ⚠️", "Selecciona al menos un producto de la lista.", "warning");
      return;
    }
    const val = bulkSubcategoryInput.trim();
    if (!val) {
      triggerAppNotification("Aviso ⚠️", "Escribe el nombre de la sección/subcategoría.", "warning");
      return;
    }

    setIsSaving(true);
    try {
      const updates = selectedProductIds.map((id) => ({
        productId: id,
        updates: { subcategory: val },
      }));

      await bulkUpdateProductsSubgroupsInFirebase(updates);

      triggerAppNotification(
        "Sección Actualizada 📁",
        `Se movieron ${selectedProductIds.length} producto(s) a la sección "${val}".`,
        "success"
      );
      setSelectedProductIds([]);
      setBulkSubcategoryInput("");
    } catch (error: any) {
      console.error("Error al mover sección:", error);
      triggerAppNotification("Error ❌", error.message || "Error al mover sección.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Bulk Clear Subgroup & Subsubgroup
  const handleClearBulkSubgroup = async () => {
    if (selectedProductIds.length === 0) return;
    setIsSaving(true);
    try {
      const updates = selectedProductIds.map((id) => ({
        productId: id,
        updates: { subgroup: "", subsubgroup: "" },
      }));

      await bulkUpdateProductsSubgroupsInFirebase(updates);

      triggerAppNotification(
        "Subgrupos Removidos 🚫",
        `Se quitaron los subgrupos de ${selectedProductIds.length} producto(s).`,
        "info"
      );
      setSelectedProductIds([]);
    } catch (error: any) {
      console.error("Error al remover subgrupos:", error);
      triggerAppNotification("Error ❌", error.message || "Error al remover subgrupos.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // In-line single product update
  const handleInlineUpdate = async (productId: string, field: "subgroup" | "subsubgroup" | "subcategory" | "category", value: string) => {
    try {
      await updateProductInFirebase(productId, { [field]: value.trim() });
      triggerAppNotification("Guardado ✓", "Cambio guardado al instante.", "info");
    } catch (error: any) {
      console.error("Error en edición rápida:", error);
    }
  };

  // Replicate Subgroups to Sibling Branches
  const handleReplicateToSiblingBranches = async () => {
    const siblingBranches = COMPANY_CATALOG.filter(
      (c) =>
        c.id !== selectedTenant?.id &&
        (selectedTenant?.ownerKey ? c.ownerKey === selectedTenant.ownerKey : false)
    );

    if (siblingBranches.length === 0) {
      triggerAppNotification("Aviso", "No hay otras sucursales registradas para este propietario.", "info");
      return;
    }

    if (!window.confirm(`¿Deseas sincronizar la estructura de grupos y subgrupos de "${selectedTenant?.name}" a las ${siblingBranches.length} sucursales hermanas?`)) {
      return;
    }

    setIsReplicating(true);
    try {
      const allDbProducts = await getAllProductsFromFirebase();
      const currentMapByName = new Map<string, { category: string; subcategory: string; subgroup: string; subsubgroup: string }>();

      activeProducts.forEach((p) => {
        if (p.name) {
          currentMapByName.set(p.name.trim().toLowerCase(), {
            category: p.category || "food",
            subcategory: p.subcategory || "",
            subgroup: p.subgroup || "",
            subsubgroup: p.subsubgroup || "",
          });
        }
      });

      const updates: { productId: string; updates: { category?: string; subgroup?: string; subsubgroup?: string; subcategory?: string } }[] = [];

      siblingBranches.forEach((branch) => {
        const branchProds = allDbProducts.filter((p: any) => p.tenantId === branch.id && !p.isDeleted);
        branchProds.forEach((p: any) => {
          const key = (p.name || "").trim().toLowerCase();
          const match = currentMapByName.get(key);
          if (match) {
            if (
              p.subcategory !== match.subcategory ||
              p.subgroup !== match.subgroup ||
              p.subsubgroup !== match.subsubgroup ||
              p.category !== match.category
            ) {
              updates.push({
                productId: p.id,
                updates: {
                  category: match.category,
                  subcategory: match.subcategory,
                  subgroup: match.subgroup,
                  subsubgroup: match.subsubgroup,
                },
              });
            }
          }
        });
      });

      if (updates.length > 0) {
        await bulkUpdateProductsSubgroupsInFirebase(updates);
        triggerAppNotification(
          "¡Sincronización Exitosa! 📡",
          `Se actualizaron los grupos, subgrupos y variantes de ${updates.length} productos en ${siblingBranches.length} sucursal(es).`,
          "success"
        );
      } else {
        triggerAppNotification(
          "Catálogos Sincronizados ✓",
          "Todas las sucursales ya tienen la misma estructura jerárquica.",
          "info"
        );
      }
    } catch (error: any) {
      console.error("Error al replicar grupos a sucursales:", error);
      triggerAppNotification("Error ❌", error.message || "Error durante la sincronización.", "error");
    } finally {
      setIsReplicating(false);
    }
  };

  const isAllVisibleSelected =
    filteredProducts.length > 0 &&
    filteredProducts.every((p) => selectedProductIds.includes(p.id));

  // Current display suggestions
  const activeSuggestions = magicSuggestionsList.length > 0 ? magicSuggestionsList : autoSuggestions;

  return (
    <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "20px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px", flexWrap: "wrap", gap: "12px", borderBottom: "1px solid #f1f5f9", paddingBottom: "14px" }}>
        <div>
          <h2 style={{ margin: 0, fontWeight: "900", fontSize: "1.25rem", color: "#1e293b", display: "flex", alignItems: "center", gap: "8px" }}>
            <span>🏷️</span> Organizar Grupos, Subgrupos y Variantes con IA
          </h2>
          <p style={{ margin: "4px 0 0 0", fontSize: "0.85rem", color: "#64748b" }}>
            Estructura jerárquica de 4 niveles: <strong>Categoría Mayor</strong> ➔ <strong>Sección</strong> ➔ <strong>Subgrupo (Masa/Familia)</strong> ➔ <strong>Variante (Burras/Gringas/Pesos)</strong>.
          </p>
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {/* Gemini AI Auto-Classify Button */}
          <button
            type="button"
            disabled={isClassifyingAI}
            onClick={handleRunGeminiAI}
            style={{
              padding: "9px 16px",
              background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
              color: "white",
              fontWeight: "900",
              borderRadius: "10px",
              border: "none",
              cursor: isClassifyingAI ? "not-allowed" : "pointer",
              fontSize: "0.85rem",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: "0 4px 8px rgba(79, 70, 229, 0.25)",
            }}
          >
            {isClassifyingAI ? (
              <>
                <span className="animate-spin">🔄</span> Analizando con IA...
              </>
            ) : (
              <>
                <span>🧠</span> Clasificar con IA ({autoSuggestions.length})
              </>
            )}
          </button>

          {/* Sibling Replicate Button */}
          <button
            type="button"
            disabled={isReplicating}
            onClick={handleReplicateToSiblingBranches}
            style={{
              padding: "9px 14px",
              background: "#eff6ff",
              color: "#2563eb",
              fontWeight: "bold",
              borderRadius: "10px",
              border: "1px solid #bfdbfe",
              cursor: isReplicating ? "not-allowed" : "pointer",
              fontSize: "0.82rem",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            {isReplicating ? (
              <>
                <span className="animate-spin">🔄</span> Sincronizando...
              </>
            ) : (
              <>
                <span>📡</span> Replicar a Sucursales
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "9px 14px",
              background: "#f1f5f9",
              color: "#475569",
              fontWeight: "bold",
              borderRadius: "10px",
              border: "1px solid #cbd5e1",
              cursor: "pointer",
              fontSize: "0.82rem",
            }}
          >
            Volver al Menú
          </button>
        </div>
      </div>

      {/* Magic Suggestions Panel (Conditionally visible) */}
      {showMagicPanel && (
        <div style={{ background: "#f8fafc", border: "1.5px solid #818cf8", borderRadius: "14px", padding: "16px", marginBottom: "18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", flexWrap: "wrap", gap: "8px" }}>
            <div>
              <h4 style={{ margin: 0, fontWeight: "bold", fontSize: "0.95rem", color: "#3730a3", display: "flex", alignItems: "center", gap: "6px" }}>
                <span>✨</span> Vista Previa de Clasificación Jerárquica de 4 Niveles ({activeSuggestions.length} sugerencias)
              </h4>
              <p style={{ margin: "2px 0 0 0", fontSize: "0.8rem", color: "#6b7280" }}>
                Organiza <strong>Harina ➔ Burras, Gringas, Quesadillas</strong>; <strong>Por Kilo ➔ 1 Kilo, 1/2 Kilo, 1/4 Kilo</strong>; <strong>Pozoles ➔ Grande, Chico</strong>.
              </p>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                type="button"
                disabled={activeSuggestions.length === 0 || isSaving}
                onClick={handleApplyMagicSuggestions}
                style={{
                  padding: "8px 18px",
                  background: activeSuggestions.length > 0 ? "#4f46e5" : "#94a3b8",
                  color: "white",
                  fontWeight: "900",
                  borderRadius: "10px",
                  border: "none",
                  cursor: activeSuggestions.length > 0 ? "pointer" : "not-allowed",
                  fontSize: "0.85rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: "0 2px 4px rgba(79, 70, 229, 0.2)",
                }}
              >
                <span>✅</span> Aplicar {activeSuggestions.length} Clasificaciones
              </button>
              <button
                type="button"
                onClick={() => setShowMagicPanel(false)}
                style={{
                  padding: "8px 12px",
                  background: "white",
                  color: "#64748b",
                  border: "1px solid #cbd5e1",
                  borderRadius: "10px",
                  fontSize: "0.8rem",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                Cerrar Panel
              </button>
            </div>
          </div>

          {activeSuggestions.length > 0 ? (
            <div style={{ maxHeight: "220px", overflowY: "auto", background: "white", borderRadius: "8px", border: "1px solid #e2e8f0", padding: "8px" }}>
              <table style={{ width: "100%", fontSize: "0.8rem", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1.5px solid #e2e8f0", color: "#64748b", textAlign: "left" }}>
                    <th style={{ padding: "6px 8px" }}>Producto</th>
                    <th style={{ padding: "6px 8px" }}>Sección Mayor</th>
                    <th style={{ padding: "6px 8px" }}>Subgrupo 1 (Masa/Familia)</th>
                    <th style={{ padding: "6px 8px" }}>Variante 2 (Platillo/Tamaño)</th>
                    <th style={{ padding: "6px 8px" }}>Categoría</th>
                  </tr>
                </thead>
                <tbody>
                  {activeSuggestions.map((s) => (
                    <tr key={s.productId} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "6px 8px", fontWeight: "bold", color: "#1e293b" }}>{s.name}</td>
                      <td style={{ padding: "6px 8px", color: "#0d9488", fontWeight: "bold" }}>📁 {s.proposedSubcategory}</td>
                      <td style={{ padding: "6px 8px", color: "#4f46e5", fontWeight: "bold" }}>🏷️ {s.proposedSubgroup}</td>
                      <td style={{ padding: "6px 8px", color: "#d946ef", fontWeight: "bold" }}>✨ {s.proposedSubsubgroup}</td>
                      <td style={{ padding: "6px 8px", color: "#64748b" }}>{s.proposedCategory === "food" ? "🍔 Alimentos" : s.proposedCategory === "drinks" ? "🥤 Bebidas" : "🍰 Postres"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ margin: 0, fontSize: "0.82rem", color: "#059669", fontWeight: "bold" }}>
              ✓ Todos los productos visibles ya cuentan con una jerarquía completa y coherente asignada.
            </p>
          )}
        </div>
      )}

      {/* Filters Toolbar */}
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center", marginBottom: "16px", background: "#f8fafc", padding: "12px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
        {/* Category Pill Buttons */}
        <div style={{ display: "flex", gap: "4px" }}>
          {[
            { id: "all", label: "Todos" },
            { id: "food", label: "🍔 Alimentos" },
            { id: "drinks", label: "🥤 Bebidas" },
            { id: "desserts", label: "🍰 Postres" },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setSelectedCategory(cat.id);
                setSelectedSubcategory("ALL");
              }}
              style={{
                padding: "6px 12px",
                borderRadius: "8px",
                fontSize: "0.8rem",
                fontWeight: "bold",
                border: selectedCategory === cat.id ? "none" : "1px solid #cbd5e1",
                background: selectedCategory === cat.id ? "#1e293b" : "white",
                color: selectedCategory === cat.id ? "white" : "#475569",
                cursor: "pointer",
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Subcategory Select */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <label style={{ fontSize: "0.8rem", fontWeight: "bold", color: "#475569" }}>
            Sección:
          </label>
          <select
            value={selectedSubcategory}
            onChange={(e) => setSelectedSubcategory(e.target.value)}
            style={{
              padding: "6px 10px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              fontSize: "0.82rem",
              background: "white",
              fontWeight: "bold",
              color: "#1e293b",
            }}
          >
            <option value="ALL">📁 Todas ({availableSubcategories.length})</option>
            {availableSubcategories.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
        </div>

        {/* Subgroup 1 Filter */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <label style={{ fontSize: "0.8rem", fontWeight: "bold", color: "#475569" }}>
            Subgrupo 1:
          </label>
          <select
            value={selectedSubgroupFilter}
            onChange={(e) => setSelectedSubgroupFilter(e.target.value)}
            style={{
              padding: "6px 10px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              fontSize: "0.82rem",
              background: "white",
              fontWeight: "bold",
              color: "#1e293b",
            }}
          >
            <option value="ALL">🏷️ Todos</option>
            <option value="UNASSIGNED">⚠️ Sin asignar</option>
            {availableSubgroups.map((sg) => (
              <option key={sg} value={sg}>
                🏷️ {sg}
              </option>
            ))}
          </select>
        </div>

        {/* Sub-subgroup 2 Filter */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <label style={{ fontSize: "0.8rem", fontWeight: "bold", color: "#475569" }}>
            Variante 2:
          </label>
          <select
            value={selectedSubsubgroupFilter}
            onChange={(e) => setSelectedSubsubgroupFilter(e.target.value)}
            style={{
              padding: "6px 10px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              fontSize: "0.82rem",
              background: "white",
              fontWeight: "bold",
              color: "#1e293b",
            }}
          >
            <option value="ALL">✨ Todas</option>
            <option value="UNASSIGNED">⚠️ Sin variante</option>
            {availableSubsubgroups.map((ssg) => (
              <option key={ssg} value={ssg}>
                ✨ {ssg}
              </option>
            ))}
          </select>
        </div>

        {/* Search input */}
        <div style={{ flex: 1, minWidth: "150px" }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 Buscar producto..."
            style={{
              width: "100%",
              padding: "6px 12px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              fontSize: "0.82rem",
              background: "white",
              boxSizing: "border-box",
            }}
          />
        </div>
      </div>

      {/* Bulk Action Bar (Visible when products selected) */}
      {selectedProductIds.length > 0 && (
        <div style={{ background: "#e0e7ff", border: "1.5px solid #6366f1", borderRadius: "12px", padding: "12px 16px", marginBottom: "16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontWeight: "900", color: "#3730a3", fontSize: "0.9rem" }}>
              ⚡ {selectedProductIds.length} productos seleccionados
            </span>
            <button
              type="button"
              onClick={() => setSelectedProductIds([])}
              style={{ background: "none", border: "none", color: "#4f46e5", fontSize: "0.78rem", fontWeight: "bold", textDecoration: "underline", cursor: "pointer" }}
            >
              Deseleccionar
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            {/* Set Subgroup 1 input */}
            <div style={{ display: "flex", gap: "4px" }}>
              <input
                type="text"
                value={bulkSubgroupInput}
                onChange={(e) => setBulkSubgroupInput(e.target.value)}
                placeholder="Subgrupo 1 (ej: Harina, Por Kilo)"
                list="bulk-subgroups-options"
                style={{
                  padding: "6px 10px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.82rem",
                  width: "160px",
                  background: "white",
                }}
              />
              <datalist id="bulk-subgroups-options">
                {availableSubgroups.map((sg) => (
                  <option key={sg} value={sg} />
                ))}
              </datalist>
              <button
                type="button"
                disabled={isSaving || !bulkSubgroupInput.trim()}
                onClick={handleApplyBulkSubgroup}
                style={{
                  padding: "6px 10px",
                  background: "#4f46e5",
                  color: "white",
                  fontWeight: "bold",
                  borderRadius: "8px",
                  border: "none",
                  fontSize: "0.82rem",
                  cursor: isSaving || !bulkSubgroupInput.trim() ? "not-allowed" : "pointer",
                }}
              >
                🏷️ Subgrupo 1
              </button>
            </div>

            {/* Set Sub-subgroup 2 input */}
            <div style={{ display: "flex", gap: "4px" }}>
              <input
                type="text"
                value={bulkSubsubgroupInput}
                onChange={(e) => setBulkSubsubgroupInput(e.target.value)}
                placeholder="Variante 2 (ej: Burras, 1/2 Kilo)"
                list="bulk-subsubgroups-options"
                style={{
                  padding: "6px 10px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.82rem",
                  width: "160px",
                  background: "white",
                }}
              />
              <datalist id="bulk-subsubgroups-options">
                {availableSubsubgroups.map((ssg) => (
                  <option key={ssg} value={ssg} />
                ))}
              </datalist>
              <button
                type="button"
                disabled={isSaving || !bulkSubsubgroupInput.trim()}
                onClick={handleApplyBulkSubsubgroup}
                style={{
                  padding: "6px 10px",
                  background: "#9333ea",
                  color: "white",
                  fontWeight: "bold",
                  borderRadius: "8px",
                  border: "none",
                  fontSize: "0.82rem",
                  cursor: isSaving || !bulkSubsubgroupInput.trim() ? "not-allowed" : "pointer",
                }}
              >
                ✨ Variante 2
              </button>
            </div>

            {/* Set Subcategory input */}
            <div style={{ display: "flex", gap: "4px" }}>
              <input
                type="text"
                value={bulkSubcategoryInput}
                onChange={(e) => setBulkSubcategoryInput(e.target.value)}
                placeholder="Sección (ej: ESPECIALIDADES)"
                list="bulk-subcategories-options"
                style={{
                  padding: "6px 10px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.82rem",
                  width: "150px",
                  background: "white",
                }}
              />
              <datalist id="bulk-subcategories-options">
                {availableSubcategories.map((sc) => (
                  <option key={sc} value={sc} />
                ))}
              </datalist>
              <button
                type="button"
                disabled={isSaving || !bulkSubcategoryInput.trim()}
                onClick={handleApplyBulkSubcategory}
                style={{
                  padding: "6px 10px",
                  background: "#0d9488",
                  color: "white",
                  fontWeight: "bold",
                  borderRadius: "8px",
                  border: "none",
                  fontSize: "0.82rem",
                  cursor: isSaving || !bulkSubcategoryInput.trim() ? "not-allowed" : "pointer",
                }}
              >
                📁 Sección
              </button>
            </div>

            {/* Clear Subgroups */}
            <button
              type="button"
              disabled={isSaving}
              onClick={handleClearBulkSubgroup}
              style={{
                padding: "6px 10px",
                background: "#fef2f2",
                color: "#dc2626",
                fontWeight: "bold",
                borderRadius: "8px",
                border: "1px solid #fecaca",
                fontSize: "0.82rem",
                cursor: isSaving ? "not-allowed" : "pointer",
              }}
            >
              🚫 Limpiar
            </button>
          </div>
        </div>
      )}

      {/* Table of Products */}
      <div style={{ overflowX: "auto", border: "1px solid #e2e8f0", borderRadius: "12px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
          <thead>
            <tr style={{ background: "#f8fafc", borderBottom: "1.5px solid #e2e8f0", color: "#475569", textAlign: "left" }}>
              <th style={{ padding: "10px 12px", width: "40px", textAlign: "center" }}>
                <input
                  type="checkbox"
                  checked={isAllVisibleSelected}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedProductIds(filteredProducts.map((p) => p.id));
                    } else {
                      setSelectedProductIds([]);
                    }
                  }}
                  style={{ cursor: "pointer" }}
                />
              </th>
              <th style={{ padding: "10px 12px" }}>Producto ({filteredProducts.length})</th>
              <th style={{ padding: "10px 12px", width: "80px" }}>Precio</th>
              <th style={{ padding: "10px 12px", width: "160px" }}>Sección Mayor</th>
              <th style={{ padding: "10px 12px", width: "170px" }}>Subgrupo 1 (Masa/Familia)</th>
              <th style={{ padding: "10px 12px", width: "180px" }}>Variante 2 (Platillo/Tamaño)</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: "30px", textAlign: "center", color: "#64748b" }}>
                  No se encontraron productos con los filtros seleccionados.
                </td>
              </tr>
            ) : (
              filteredProducts.map((prod) => {
                const isChecked = selectedProductIds.includes(prod.id);
                return (
                  <tr
                    key={prod.id}
                    style={{
                      borderBottom: "1px solid #f1f5f9",
                      background: isChecked ? "#f5f3ff" : "white",
                      transition: "background 0.15s",
                    }}
                  >
                    {/* Checkbox */}
                    <td style={{ padding: "10px 12px", textAlign: "center" }}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedProductIds((prev) => [...prev, prod.id]);
                          } else {
                            setSelectedProductIds((prev) => prev.filter((id) => id !== prod.id));
                          }
                        }}
                        style={{ cursor: "pointer" }}
                      />
                    </td>

                    {/* Name */}
                    <td style={{ padding: "10px 12px", fontWeight: "bold", color: "#1e293b" }}>
                      {prod.name}
                    </td>

                    {/* Price */}
                    <td style={{ padding: "10px 12px", color: "#059669", fontWeight: "900" }}>
                      ${Number(prod.price || 0).toFixed(2)}
                    </td>

                    {/* Subcategory In-line input */}
                    <td style={{ padding: "8px 12px" }}>
                      <input
                        type="text"
                        defaultValue={prod.subcategory || ""}
                        key={`subcat_${prod.id}_${prod.subcategory}`}
                        onBlur={(e) => {
                          if (e.target.value.trim() !== (prod.subcategory || "").trim()) {
                            handleInlineUpdate(prod.id, "subcategory", e.target.value);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.currentTarget.blur();
                          }
                        }}
                        list="table-subcategories-list"
                        placeholder="Sin sección"
                        style={{
                          width: "100%",
                          padding: "6px 8px",
                          borderRadius: "6px",
                          border: "1px solid #e2e8f0",
                          fontSize: "0.82rem",
                          fontWeight: "600",
                          color: "#334155",
                          background: "#fafafa",
                          boxSizing: "border-box",
                        }}
                      />
                    </td>

                    {/* Subgroup 1 In-line input */}
                    <td style={{ padding: "8px 12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <input
                          type="text"
                          defaultValue={prod.subgroup || ""}
                          key={`subgrp_${prod.id}_${prod.subgroup}`}
                          onBlur={(e) => {
                            if (e.target.value.trim() !== (prod.subgroup || "").trim()) {
                              handleInlineUpdate(prod.id, "subgroup", e.target.value);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.currentTarget.blur();
                            }
                          }}
                          list="table-subgroups-list"
                          placeholder="Sin subgrupo"
                          style={{
                            flex: 1,
                            padding: "6px 8px",
                            borderRadius: "6px",
                            border: prod.subgroup ? "1.5px solid #818cf8" : "1px dashed #cbd5e1",
                            fontSize: "0.82rem",
                            fontWeight: "bold",
                            color: prod.subgroup ? "#4338ca" : "#64748b",
                            background: prod.subgroup ? "#eef2ff" : "#ffffff",
                            boxSizing: "border-box",
                          }}
                        />
                      </div>
                    </td>

                    {/* Sub-subgroup 2 In-line input */}
                    <td style={{ padding: "8px 12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <input
                          type="text"
                          defaultValue={prod.subsubgroup || ""}
                          key={`subsubgrp_${prod.id}_${prod.subsubgroup}`}
                          onBlur={(e) => {
                            if (e.target.value.trim() !== (prod.subsubgroup || "").trim()) {
                              handleInlineUpdate(prod.id, "subsubgroup", e.target.value);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.currentTarget.blur();
                            }
                          }}
                          list="table-subsubgroups-list"
                          placeholder="Sin variante"
                          style={{
                            flex: 1,
                            padding: "6px 8px",
                            borderRadius: "6px",
                            border: prod.subsubgroup ? "1.5px solid #c084fc" : "1px dashed #cbd5e1",
                            fontSize: "0.82rem",
                            fontWeight: "bold",
                            color: prod.subsubgroup ? "#7e22ce" : "#64748b",
                            background: prod.subsubgroup ? "#faf5ff" : "#ffffff",
                            boxSizing: "border-box",
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Datalists for autocompletion */}
      <datalist id="table-subcategories-list">
        {availableSubcategories.map((sc) => (
          <option key={sc} value={sc} />
        ))}
      </datalist>
      <datalist id="table-subgroups-list">
        {availableSubgroups.map((sg) => (
          <option key={sg} value={sg} />
        ))}
      </datalist>
      <datalist id="table-subsubgroups-list">
        {availableSubsubgroups.map((ssg) => (
          <option key={ssg} value={ssg} />
        ))}
      </datalist>
    </div>
  );
};

