import quranJson from '../data/quran.json';

export function getSurah(surahNum) {
  const data = quranJson[String(surahNum)];
  if (!data) throw new Error(`السورة ${surahNum} غير موجودة`);
  return data;
}

export function getAllSurahs() {
  return Array.from({ length: 114 }, (_, i) => {
    const data = quranJson[String(i + 1)];
    return data?.surah || null;
  }).filter(Boolean);
}

export function searchVerses(query, maxResults = 100) {
  if (!query || query.trim().length < 2) return [];
  const normalize = t => t.replace(/[ً-ٰٟ]/g,'').replace(/[أإآا]/g,'ا').replace(/[ىي]/g,'ي').replace(/ة/g,'ه').trim();
  const q = normalize(query.trim());
  const results = [];
  for (let num = 1; num <= 114; num++) {
    const data = quranJson[String(num)];
    if (!data) continue;
    for (const verse of data.verses) {
      if (normalize(verse.text).includes(q)) {
        results.push({ surah: data.surah, numberInSurah: verse.number, text: verse.text });
        if (results.length >= maxResults) return results;
      }
    }
  }
  return results;
}
