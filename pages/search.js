import { useState, useEffect, useRef } from 'react';
import SeoHead from '../components/SeoHead';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import { SURAH_NAMES } from '../lib/constants';
import { getCached, setCached } from '../lib/apiCache';
import { searchVerses } from '../lib/quranData';
import styles from '../styles/Search.module.css';

function normalizeArabic(text) {
  return text
    .replace(/[ً-ٰٟ]/g, '')
    .replace(/[أإآا]/g, 'ا')
    .replace(/[ىي]/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/\s+/g, ' ').trim();
}

// تمييز نص البحث بلون ذهبي
function Highlight({ text, query }) {
  if (!query || !text) return <>{text}</>;
  const normalized = normalizeArabic(query);
  const parts = text.split(new RegExp(`(${normalized})`, 'gi'));
  return (
    <>
      {parts.map((p, i) =>
        normalizeArabic(p) === normalized
          ? <mark key={i} className={styles.mark}>{p}</mark>
          : p
      )}
    </>
  );
}

export default function SearchPage({ toggleDark, dark, showToast, onAuth }) {
  const [query,    setQuery]    = useState('');
  const [results,  setResults]  = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [searched, setSearched] = useState(false);
  const [total,    setTotal]    = useState(0);
  const [history,  setHistory]  = useState([]);
  const [listening,setListening]= useState(false);
  const inputRef    = useRef(null);
  const debounceRef = useRef(null);

  // تحميل سجل البحث
  useEffect(() => {
    inputRef.current?.focus();
    const h = JSON.parse(localStorage.getItem('q_search_history') || '[]');
    setHistory(h);
  }, []);

  // بحث فوري مع debounce 400ms
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults([]); setSearched(false); return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query.trim()), 400);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  async function search(q) {
    setLoading(true); setSearched(false);
    const cacheKey = `search_${normalizeArabic(q)}`;
    const cached = getCached(cacheKey);
    if (cached) {
      setResults(cached.matches);
      setTotal(cached.count);
      setSearched(true);
      setLoading(false);
      return;
    }
    try {
      const normalizedQ = normalizeArabic(q);
      const res  = await fetch(`https://api.alquran.cloud/v1/search/${encodeURIComponent(normalizedQ)}/all/ar`);
      const data = await res.json();
      const matches = data.data?.matches || [];
      const count   = data.data?.count   || 0;
      setResults(matches);
      setTotal(count);
      setSearched(true);
      setCached(cacheKey, { matches, count });
      // حفظ في السجل
      if (matches.length > 0) {
        const h = [q, ...history.filter(x => x !== q)].slice(0, 5);
        setHistory(h);
        localStorage.setItem('q_search_history', JSON.stringify(h));
      }
    } catch {
      showToast('حدث خطأ في البحث');
    }
    setLoading(false);
  }

  function startVoiceSearch() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      showToast('⚠️ المتصفح لا يدعم البحث الصوتي'); return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR();
    recognition.lang = 'ar-SA';
    recognition.continuous = false;
    recognition.interimResults = false;
    setListening(true);
    recognition.start();
    recognition.onresult = e => { setQuery(e.results[0][0].transcript); setListening(false); };
    recognition.onerror  = () => { setListening(false); showToast('حدث خطأ في البحث الصوتي'); };
    recognition.onend    = () => setListening(false);
  }

  return (
    <>
      <SeoHead title="بحث في القرآن الكريم" description="ابحث في آيات القرآن الكريم بالكلمات والعبارات" path="/search" />
      <Navbar toggleDark={toggleDark} dark={dark} showToast={showToast} onAuth={onAuth} />

      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>البحث في القرآن الكريم</h1>
          <p className={styles.sub}>ابحث في نصوص الآيات الكريمة</p>
        </div>

        {/* صندوق البحث */}
        <div className={styles.searchWrap}>
          <div className={styles.searchBox}>
            <svg className={styles.searchIcon} viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            <input
              ref={inputRef}
              className={styles.input}
              type="text"
              placeholder="ابحث عن كلمة أو آية... مثال: الرحمن"
              value={query}
              onChange={e => setQuery(e.target.value)}
              dir="rtl"
            />
            {query && (
              <button className={styles.clearBtn} onClick={() => { setQuery(''); setResults([]); setSearched(false); }}>✕</button>
            )}
            <button
              className={`${styles.voiceBtn} ${listening ? styles.voiceBtnActive : ''}`}
              onClick={startVoiceSearch}
              title="بحث صوتي">
              {listening ? '🔴' : '🎤'}
            </button>
          </div>

          {/* اقتراحات + سجل البحث */}
          {!query && (
            <div className={styles.suggestions}>
              {history.length > 0 && (
                <div className={styles.historyRow}>
                  <span className={styles.sugLabel}>🕐 أخيراً:</span>
                  {history.map(h => (
                    <button key={h} className={`${styles.sugBtn} ${styles.historyBtn}`} onClick={() => setQuery(h)}>{h}</button>
                  ))}
                </div>
              )}
              <div className={styles.sugRow}>
                <span className={styles.sugLabel}>اقتراحات:</span>
                {['الرحمن','الصبر','الجنة','التوبة','الإخلاص','البر','النور'].map(s => (
                  <button key={s} className={styles.sugBtn} onClick={() => setQuery(s)}>{s}</button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* حالة التحميل */}
        {loading && (
          <div className={styles.loadingWrap}>
            <div className="loader" />
            <p>جارٍ البحث...</p>
          </div>
        )}

        {/* رأس النتائج */}
        {searched && !loading && (
          <div className={styles.resultsHeader}>
            {total > 0
              ? <span>وُجد <strong>{total}</strong> نتيجة لـ &quot;<strong>{query}</strong>&quot;</span>
              : <span>لم يُعثر على نتائج لـ &quot;<strong>{query}</strong>&quot;</span>}
          </div>
        )}

        {/* النتائج */}
        {results.length > 0 && (
          <div className={styles.results}>
            {results.slice(0, 50).map((r, i) => {
              const surahNum  = r.surah?.number;
              const verseNum  = r.numberInSurah;
              const surahName = SURAH_NAMES[surahNum - 1] || r.surah?.name;
              return (
                <Link key={i} href={`/surah/${surahNum}#v${verseNum}`} className={styles.result}>
                  <div className={styles.resultHeader}>
                    <span className={styles.resultSurah}>{surahName}</span>
                    <span className={styles.resultVerse}>آية {verseNum}</span>
                  </div>
                  <div className={styles.resultText}>
                    <Highlight text={r.text} query={query} />
                  </div>
                </Link>
              );
            })}
            {total > 50 && (
              <div className={styles.moreResults}>+ {total - 50} نتيجة أخرى — دقق بحثك للحصول على نتائج أدق</div>
            )}
          </div>
        )}

        {searched && results.length === 0 && !loading && (
          <div className={styles.noResults}>
            <div className={styles.noResultsIcon}>🔍</div>
            <h3>لا توجد نتائج</h3>
            <p>جرّب كلمات أخرى أو تأكد من الإملاء</p>
          </div>
        )}
      </div>
    </>
  );
}
