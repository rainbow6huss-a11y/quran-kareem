/**
 * quranData.js — بيانات القرآن المحلية المقسّمة
 * كل سورة ملف منفصل — تحميل فوري بدون انتظار
 */

// قائمة السور فقط — خفيفة 14KB للصفحة الرئيسية
import surahsList from '../data/surahs-list.json';

/**
 * جلب سورة محددة — يُحمَّل ملفها فقط عند الطلب
 * يستخدم في getStaticProps فقط (server-side)
 */
export function getSurah(surahNum) {
  // في بيئة Node.js (وقت البناء) نقرأ مباشرة
  const data = require(`../data/surahs/${surahNum}.json`);
  if (!data) throw new Error(`السورة ${surahNum} غير موجودة`);
  return data;
}

/**
 * قائمة السور للصفحة الرئيسية — فورية 14KB فقط
 */
export function getAllSurahs() {
  return surahsList;
}

/**
 * بحث في نصوص الآيات — محلي وسريع
 */
export function searchVerses(query, maxResults = 100) {
  if (!query || query.trim().length < 2) return [];
  const normalize = t => t
    .replace(/[ً-ٰٟ]/g, '')
    .replace(/[أإآا]/g, 'ا')
    .replace(/[ىي]/g, 'ي')
    .replace(/ة/g, 'ه')
    .trim();
  const q = normalize(query.trim());
  const results = [];
  for (let num = 1; num <= 114; num++) {
    const data = require(`../data/surahs/${num}.json`);
    if (!data) continue;
    for (const verse of data.verses) {
      if (normalize(verse.text).includes(q)) {
        results.push({
          surah: data.surah,
          numberInSurah: verse.number,
          text: verse.text,
        });
        if (results.length >= maxResults) return results;
      }
    }
  }
  return results;
}
