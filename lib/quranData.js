/**
 * quranData.js — بيانات القرآن المحلية
 * تحميل من الملف المحلي بدلاً من API خارجي
 * النتيجة: تحميل فوري 0ms بدون أي انتظار
 */

import quranJson from '../data/quran.json';

/**
 * جلب بيانات سورة محددة — فوري من الذاكرة
 */
export function getSurah(surahNum) {
  const data = quranJson[String(surahNum)];
  if (!data) throw new Error(`السورة ${surahNum} غير موجودة`);
  return data;
}

/**
 * جلب كل السور — للصفحة الرئيسية
 */
export function getAllSurahs() {
  return Array.from({ length: 114 }, (_, i) => {
    const data = quranJson[String(i + 1)];
    return data?.surah || null;
  }).filter(Boolean);
}

/**
 * بحث في نصوص الآيات — محلي 100%
 */
export function searchVerses(query, maxResults = 50) {
  if (!query || query.trim().length < 2) return [];

  const normalize = text => text
    .replace(/[ً-ٰٟ]/g, '')
    .replace(/[أإآا]/g, 'ا')
    .replace(/[ىي]/g, 'ي')
    .replace(/ة/g, 'ه')
    .trim();

  const q = normalize(query.trim());
  const results = [];

  for (let num = 1; num <= 114; num++) {
    const data = quranJson[String(num)];
    if (!data) continue;
    for (const verse of data.verses) {
      if (normalize(verse.text).includes(q)) {
        results.push({
          surah: data.surah,
          numberInSurah: verse.number,
          text: verse.text,
          tafsir: verse.tafsir,
        });
        if (results.length >= maxResults) return results;
      }
    }
  }
  return results;
}
