import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import styles from '../styles/Search.module.css';

const SURAH_NAMES = ["الفاتحة","البقرة","آل عمران","النساء","المائدة","الأنعام","الأعراف","الأنفال","التوبة","يونس","هود","يوسف","الرعد","إبراهيم","الحجر","النحل","الإسراء","الكهف","مريم","طه","الأنبياء","الحج","المؤمنون","النور","الفرقان","الشعراء","النمل","القصص","العنكبوت","الروم","لقمان","السجدة","الأحزاب","سبأ","فاطر","يس","الصافات","ص","الزمر","غافر","فصلت","الشورى","الزخرف","الدخان","الجاثية","الأحقاف","محمد","الفتح","الحجرات","ق","الذاريات","الطور","النجم","القمر","الرحمن","الواقعة","الحديد","المجادلة","الحشر","الممتحنة","الصف","الجمعة","المنافقون","التغابن","الطلاق","التحريم","الملك","القلم","الحاقة","المعارج","نوح","الجن","المزمل","المدثر","القيامة","الإنسان","المرسلات","النبأ","النازعات","عبس","التكوير","الانفطار","المطففين","الانشقاق","البروج","الطارق","الأعلى","الغاشية","الفجر","البلد","الشمس","الليل","الضحى","الشرح","التين","العلق","القدر","البينة","الزلزلة","العاديات","القارعة","التكاثر","العصر","الهمزة","الفيل","قريش","الماعون","الكوثر","الكافرون","النصر","المسد","الإخلاص","الفلق","الناس"];

export default function SearchPage({ toggleDark, dark, showToast, onAuth }) {
  const [query, setQuery]       = useState('');
  const [results, setResults]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [searched, setSearched] = useState(false);
  const [total, setTotal]       = useState(0);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults([]); setSearched(false); return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query.trim()), 600);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  async function search(q) {
    setLoading(true); setSearched(false);
    try {
      const res = await fetch(`https://api.alquran.cloud/v1/search/${encodeURIComponent(q)}/all/ar`);
      const data = await res.json();
      const matches = data.data?.matches || [];
      setResults(matches);
      setTotal(data.data?.count || 0);
      setSearched(true);
    } catch(e) {
      showToast('حدث خطأ في البحث');
    }
    setLoading(false);
  }

  function highlight(text, q) {
    if (!q) return text;
    const parts = text.split(new RegExp(`(${q})`, 'g'));
    return parts.map((p, i) =>
      p === q ? <mark key={i} className={styles.mark}>{p}</mark> : p
    );
  }

  return (
    <>
      <Head><title>بحث في القرآن الكريم</title></Head>
      <Navbar toggleDark={toggleDark} dark={dark} showToast={showToast} onAuth={onAuth} />

      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>🔍 البحث في القرآن الكريم</h1>
          <p className={styles.sub}>ابحث في نصوص الآيات الكريمة</p>
        </div>

        {/* Search Box */}
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
          </div>

          {/* Quick suggestions */}
          {!query && (
            <div className={styles.suggestions}>
              <span className={styles.sugLabel}>اقتراحات:</span>
              {['الرحمن','الصبر','الجنة','التوبة','الإخلاص'].map(s => (
                <button key={s} className={styles.sugBtn} onClick={() => setQuery(s)}>{s}</button>
              ))}
            </div>
          )}
        </div>

        {/* Results */}
        {loading && (
          <div className={styles.loadingWrap}>
            <div className="loader" />
            <p>جارٍ البحث...</p>
          </div>
        )}

        {searched && !loading && (
          <div className={styles.resultsHeader}>
            {total > 0
              ? <span>وُجد <strong>{total}</strong> نتيجة لـ "<strong>{query}</strong>"</span>
              : <span>لم يُعثر على نتائج لـ "<strong>{query}</strong>"</span>}
          </div>
        )}

        {results.length > 0 && (
          <div className={styles.results}>
            {results.slice(0, 50).map((r, i) => {
              const surahNum = r.surah?.number;
              const verseNum = r.numberInSurah;
              const surahName = SURAH_NAMES[surahNum - 1] || r.surah?.name;
              return (
                <Link key={i} href={`/surah/${surahNum}#v${verseNum}`} className={styles.result}>
                  <div className={styles.resultHeader}>
                    <span className={styles.resultSurah}>{surahName}</span>
                    <span className={styles.resultVerse}>آية {verseNum}</span>
                  </div>
                  <div className={styles.resultText}>
                    {highlight(r.text, query)}
                  </div>
                </Link>
              );
            })}
            {total > 50 && (
              <div className={styles.moreResults}>
                + {total - 50} نتيجة أخرى — دقق بحثك للحصول على نتائج أدق
              </div>
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
