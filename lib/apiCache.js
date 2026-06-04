/**
 * API Cache — يحفظ بيانات السور في localStorage مع TTL
 * يقلل طلبات الشبكة بشكل كبير عند التنقل بين السور
 */

const CACHE_VERSION = 'v2';
const TTL_MS = 7 * 24 * 60 * 60 * 1000; // أسبوع كامل

function cacheKey(key) {
  return `q_cache_${CACHE_VERSION}_${key}`;
}

export function getCached(key) {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(cacheKey(key));
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > TTL_MS) {
      localStorage.removeItem(cacheKey(key));
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function setCached(key, data) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(cacheKey(key), JSON.stringify({ data, ts: Date.now() }));
  } catch {
    // localStorage ممتلئ — امسح قديم وحاول مجدداً
    clearOldCache();
    try {
      localStorage.setItem(cacheKey(key), JSON.stringify({ data, ts: Date.now() }));
    } catch { /* تجاهل */ }
  }
}

export function clearOldCache() {
  if (typeof window === 'undefined') return;
  const prefix = 'q_cache_';
  Object.keys(localStorage)
    .filter(k => k.startsWith(prefix) && !k.startsWith(cacheKey('')))
    .forEach(k => localStorage.removeItem(k));
}

/**
 * جلب بيانات السورة مع caching — البيانات الأساسية فقط
 */
export async function fetchSurahWithCache(surahNum) {
  const key = `surah_${surahNum}`;
  const cached = getCached(key);
  if (cached) return cached;

  const [arRes, tafsirRes] = await Promise.all([
    fetch(`https://api.alquran.cloud/v1/surah/${surahNum}/quran-uthmani`),
    fetch(`https://api.alquran.cloud/v1/surah/${surahNum}/ar.muyassar`),
  ]);

  if (!arRes.ok) throw new Error('فشل تحميل السورة');

  const [arJson, tafsirJson] = await Promise.all([arRes.json(), tafsirRes.json()]);

  const verses = arJson.data.ayahs.map((a, i) => ({
    number: a.numberInSurah,
    text: a.text,
    tafsir: tafsirJson.data?.ayahs?.[i]?.text || '',
    page: a.page,
    juz: a.juz,
    hizb: a.hizbQuarter,
    sajda: a.sajda,
  }));

  // إزالة البسملة من الآية الأولى
  let filteredVerses = verses;
  if (arJson.data.number !== 1 && arJson.data.number !== 9 && verses.length > 0) {
    const words = verses[0].text.trim().split(/\s+/);
    if (words.length > 4) {
      filteredVerses = [
        { ...verses[0], text: words.slice(4).join(' ').trim() },
        ...verses.slice(1),
      ];
    }
  }

  const result = { surah: arJson.data, verses: filteredVerses };
  setCached(key, result);
  return result;
}

/**
 * جلب قائمة السور مع caching
 */
export async function fetchSurahListWithCache() {
  const key = 'surah_list';
  const cached = getCached(key);
  if (cached) return cached;

  const res = await fetch('https://api.alquran.cloud/v1/surah');
  if (!res.ok) throw new Error('فشل تحميل قائمة السور');
  const json = await res.json();
  setCached(key, json.data);
  return json.data;
}
