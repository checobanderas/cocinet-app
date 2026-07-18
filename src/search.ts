import { execSync } from 'child_process';
import * as cheerio from 'cheerio';
async function run() {
  try {
    const res = await fetch('https://html.duckduckgo.com/html/?q=print+to+bluetooth+printer+intent+android+app');
    const text = await res.text();
    const $ = cheerio.load(text);
    $('.result__snippet').each((i, el) => {
      console.log($(el).text());
    });
  } catch(e) { console.log(e); }
}
run();
