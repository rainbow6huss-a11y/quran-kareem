/**
 * API Cache — نظام cache ذكي متعدد المستويات
 * Memory Cache (سريع جداً) + localStorage (دائم)
 */

const CACHE_VERSION = 'v3';
const TTL_MS = 7 * 24 * 60 * 60 * 1000; // أسبوع

// ── Memory Cache — أسرع من localStorage ──
const memoryCache = new Map();

function cacheKey(key) {
  return `q_${CACHE_VERSION}_${key}`;
}

// ── قراءة من الـ cache ──
export function getCached(key) {
  // 1 — Memory أولاً (فوري)
  if (memoryCache.has(key)) return memoryCache.get(key);

  // 2 — localStorage (يحتاج parse)
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(cacheKey(key));
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > TTL_MS) {
      localStorage.removeItem(cacheKey(key));
      return null;
    }
    // احفظ في memory للمرة القادمة
    memoryCache.set(key, data);
    return data;
  } catch {
    return null;
  }
}

// ── حفظ في الـ cache ──
export function setCached(key, data) {
  // حفظ في memory أولاً (فوري)
  memoryCache.set(key, data);

  // حفظ في localStorage (للزيارات القادمة)
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(cacheKey(key), JSON.stringify({ data, ts: Date.now() }));
  } catch {
    clearOldCache();
    try {
      localStorage.setItem(cacheKey(key), JSON.stringify({ data, ts: Date.now() }));
    } catch { /* localStorage ممتلئ */ }
  }
}

export function clearOldCache() {
  if (typeof window === 'undefined') return;
  const prefix = 'q_';
  Object.keys(localStorage)
    .filter(k => k.startsWith(prefix) && !k.startsWith(cacheKey('')))
    .forEach(k => localStorage.removeItem(k));
}

// ── Prefetch السور المجاورة ──
export function prefetchAdjacentSurahs(surahNum) {
  if (typeof window === 'undefined') return;
  // prefetch بعد 2 ثانية حتى لا يؤثر على التحميل الحالي
  setTimeout(() => {
    [surahNum - 1, surahNum + 1].forEach(num => {
      if (num >= 1 && num <= 114 && !getCached(`surah_${num}`)) {
        fetchSurahWithCache(num).catch(() => {});
      }
    });
  }, 2000);
}

// ── جلب السورة مع cache ──
export async function fetchSurahWithCache(surahNum) {
  const key = `surah_${surahNum}`;
  const cached = getCached(key);
  if (cached) return cached;

  // جلب النص والتفسير بالتوازي
  const [arRes, tafsirRes] = await Promise.all([
    fetch(`https://api.alquran.cloud/v1/surah/${surahNum}/quran-uthmani`),
    fetch(`https://api.alquran.cloud/v1/surah/${surahNum}/ar.muyassar`),
  ]);

  if (!arRes.ok) throw new Error('فشل تحميل السورة');

  const [arJson, tafsirJson] = await Promise.all([
    arRes.json(),
    tafsirRes.json(),
  ]);

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

// ── جلب قائمة السور مع cache ──
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
