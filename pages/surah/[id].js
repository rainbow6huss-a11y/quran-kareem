import { useState, useEffect, useRef, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Navbar from '../../components/Navbar';
import AudioPlayer from '../../components/AudioPlayer';
import { supabase } from '../../lib/supabase';
import styles from '../../styles/Surah.module.css';

export default function SurahPage({ toggleDark, dark, showToast, user, onAuth }) {
  const router = useRouter();
  const { id } = router.query;
  const surahNum = parseInt(id);

  const [surah, setSurah] = useState(null);
  const [verses, setVerses] = useState([]);
  const [wordData, setWordData] = useState({});
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('read');
  const [fontSize, setFontSize] = useState(1.75);
  const [bookmarks, setBookmarks] = useState([]);
  const [showTrans, setShowTrans] = useState(true);
  const [playingVerse, setPlayingVerse] = useState(null);
  const [saving, setSaving] = useState(false);
  const saveTimerRef = useRef(null);
  const observerRef = useRef(null);

  const saveLastRead = useCallback(async (sNum, vNum) => {
    localStorage.setItem('q_last_read', JSON.stringify({ surah: sNum, verse: vNum }));
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      if (!user) return;
      setSaving(true);
      try {
        const { data: existing } = await supabase.from('last_read').select('id').eq('user_id', user.id).single();
        if (existing) {
          await supabase.from('last_read').update({ surah_num: sNum, verse_num: vNum, updated_at: new Date().toISOString() }).eq('user_id', user.id);
        } else {
          await supabase.from('last_read').insert({ user_id: user.id, surah_num: sNum, verse_num: vNum });
        }
      } catch(e) {}
      setSaving(false);
    }, 2000);
  }, [user]);

  useEffect(() => {
    if (!surahNum) return;
    setLoading(true); setVerses([]); setSurah(null); setPlayingVerse(null);
    const saved = JSON.parse(localStorage.getItem('q_bookmarks') || '[]');
    setBookmarks(saved);

    Promise.all([
      fetch(`https://api.alquran.cloud/v1/surah/${surahNum}`).then(r => r.json()),
      fetch(`https://api.alquran.cloud/v1/surah/${surahNum}/ar.muyassar`).then(r => r.json()),
    ]).then(([ar, tafsir]) => {
      setSurah(ar.data);
      setVerses(ar.data.ayahs.map((v, i) => ({
        number: v.numberInSurah, text: v.text,
        tafsir: tafsir.data?.ayahs?.[i]?.text || '',
      })));
      setLoading(false);
      saveLastRead(surahNum, 1);
      setTimeout(() => {
        const hash = window.location.hash;
        if (hash && hash.startsWith('#v')) {
          const el = document.querySelector(hash);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.style.transition = 'background 0.3s';
            el.style.background = 'rgba(184,151,58,0.15)';
            setTimeout(() => { el.style.background = ''; }, 2000);
          }
        }
      }, 800);
    }).catch(() => setLoading(false));

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [surahNum]);

  // Auto-save on scroll
  useEffect(() => {
    if (!verses.length || tab !== 'read') return;
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const vNum = parseInt(entry.target.getAttribute('data-verse'));
          if (vNum) saveLastRead(surahNum, vNum);
        }
      });
    }, { threshold: 0.5 });
    setTimeout(() => {
      verses.forEach(v => {
        const el = document.getElementById(`v${v.number}`);
        if (el) observerRef.current.observe(el);
      });
    }, 500);
    return () => { if (observerRef.current) observerRef.current.disconnect(); };
  }, [verses, tab]);

  useEffect(() => {
    if (tab !== 'words' || !surahNum || Object.keys(wordData).length > 0) return;
    fetch(`https://api.alquran.cloud/v1/surah/${surahNum}/en.transliteration`)
      .then(r => r.json()).then(d => {
        const map = {};
        d.data?.ayahs?.forEach(a => { map[a.numberInSurah] = a.text; });
        setWordData(map);
      });
  }, [tab, surahNum]);

  async function toggleBookmark(vNum) {
    const isBmNow = isBm(vNum);
    let saved = JSON.parse(localStorage.getItem('q_bookmarks') || '[]');
    if (isBmNow) {
      saved = saved.filter(b => !(b.s === surahNum && b.v === vNum));
      showToast('تم إزالة العلامة');
    } else {
      const verseText = verses.find(v => v.number === vNum)?.text || '';
      saved.push({ s: surahNum, v: vNum, sName: surah?.name, t: verseText });
      showToast('🔖 تم الحفظ');
    }
    localStorage.setItem('q_bookmarks', JSON.stringify(saved));
    setBookmarks(saved);
    if (user) {
      if (isBmNow) {
        await supabase.from('bookmarks').delete().eq('user_id', user.id).eq('surah_num', surahNum).eq('verse_num', vNum);
      } else {
        const verseText = verses.find(v => v.number === vNum)?.text || '';
        await supabase.from('bookmarks').insert({ user_id: user.id, surah_num: surahNum, verse_num: vNum, surah_name: surah?.name, verse_text: verseText });
      }
    }
  }

  function copyVerse(vNum) {
    const v = verses.find(x => x.number === vNum);
    if (!v) return;
    navigator.clipboard.writeText(`${v.text}\n\n[${surah?.name} - آية ${vNum}]`);
    showToast('📋 تم النسخ');
  }

  function isBm(vNum) { return bookmarks.some(b => b.s === surahNum && b.v === vNum); }

  if (!surahNum) return null;

  return (
    <>
      <Head><title>{surah ? `${surah.name} - القرآن الكريم` : 'جارٍ التحميل...'}</title></Head>
      <Navbar toggleDark={toggleDark} dark={dark} showToast={showToast} onAuth={onAuth} />

      <div className={styles.page} style={{ paddingBottom: '80px' }}>
        <div className={styles.breadcrumb}>
          <Link href="/">الرئيسية</Link>
          <span>›</span>
          <span>{surah ? surah.name : '...'}</span>
          {saving && <span style={{color:'var(--gold)',fontSize:'.75rem'}}>• جارٍ الحفظ...</span>}
        </div>

        {loading ? (
          <div className="loading"><div className="loader" /><div>جارٍ تحميل السورة...</div></div>
        ) : surah ? (
          <>
            <div className={styles.surahHeader}>
              <div className={styles.surahNav}>
                {surahNum > 1 && <Link href={`/surah/${surahNum - 1}`} className={styles.navArrow}>› السابقة</Link>}
                <div>
                  <h1 className={styles.surahName}>{surah.name}</h1>
                  <div className={styles.surahMeta}>
                    <span>📍 {surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}</span>
                    <span>📜 {surah.numberOfAyahs} آية</span>
                    <span>🔢 رقم {surah.number}</span>
                  </div>
                </div>
                {surahNum < 114 && <Link href={`/surah/${surahNum + 1}`} className={styles.navArrow}>التالية ‹</Link>}
              </div>
              {surahNum !== 9 && <div className={styles.bismillah}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>}
            </div>

            <div className={styles.tabs}>
              {[['read','📖 القراءة'],['tafsir','📚 التفسير'],['words','🔤 كلمة بكلمة']].map(([v,l]) => (
                <button key={v} className={`${styles.tab} ${tab===v?styles.tabActive:''}`} onClick={() => setTab(v)}>{l}</button>
              ))}
            </div>

            {tab === 'read' && (
              <div className={styles.fontControls}>
                <label>الخط:</label>
                <button className={styles.fontBtn} onClick={() => setFontSize(f => Math.max(1.1, f-.15))}>أ−</button>
                <button className={styles.fontBtn} onClick={() => setFontSize(f => Math.min(2.5, f+.15))}>أ+</button>
                <button className={`${styles.fontBtn} ${showTrans?styles.fontBtnActive:''}`} onClick={() => setShowTrans(v=>!v)}>التفسير</button>
              </div>
            )}

            <div className={styles.content}>
              {tab === 'read' && (
                <div className={styles.verses}>
                  {verses.map(v => (
                    <div key={v.number} id={`v${v.number}`} data-verse={v.number}
                      className={`${styles.verse} ${playingVerse === v.number ? styles.playing : ''}`}>
                      <div className={styles.verseTop}>
                        <div className={styles.verseNum}>{v.number}</div>
                        <div className={styles.verseBody}>
                          <div className={styles.verseText} style={{ fontSize: `${fontSize}rem` }}>{v.text}</div>
                          {showTrans && v.tafsir && <div className={styles.verseTrans}>{v.tafsir}</div>}
                        </div>
                        <button
                          className={`${styles.playBtn} ${playingVerse === v.number ? styles.playBtnActive : ''}`}
                          onClick={() => setPlayingVerse(v.number)}>
                          {playingVerse === v.number ? '🔊' : '▶'}
                        </button>
                      </div>
                      <div className={styles.verseActions}>
                        <button className={`${styles.actionBtn} ${isBm(v.number)?styles.bmActive:''}`} onClick={() => toggleBookmark(v.number)}>
                          {isBm(v.number)?'🔖 محفوظ':'🔖 حفظ'}
                        </button>
                        <button className={styles.actionBtn} onClick={() => copyVerse(v.number)}>📋 نسخ</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {tab === 'tafsir' && (
                <div className={styles.tafsirList}>
                  {verses.map(v => (
                    <div key={v.number} className={styles.tafsirItem}>
                      <div className={styles.tafsirAyah} style={{ fontSize: `${fontSize}rem` }}>{v.text}</div>
                      <div className={styles.tafsirBox}>
                        <strong className={styles.tafsirNum}>[{v.number}]</strong> {v.tafsir || 'التفسير غير متوفر'}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {tab === 'words' && (
                <div className={styles.wordsList}>
                  {verses.map(v => (
                    <div key={v.number} className={styles.wordVerse}>
                      <div className={styles.wordVerseNum}>آية {v.number}</div>
                      <div className={styles.wordVerseText}>{v.text}</div>
                      <div className={styles.wordGrid}>
                        {v.text.split(' ').map((word, wi) => (
                          <div key={wi} className={styles.wordCard}>
                            <div className={styles.wordAr}>{word}</div>
                            <div className={styles.wordEn}>{wordData[v.number]?.split(' ')[wi] || '...'}</div>
                          </div>
                        ))}
                      </div>
                      {v.tafsir && <div className={styles.wordTafsir}>{v.tafsir}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="loading">حدث خطأ في التحميل</div>
        )}
      </div>

      {/* شريط الصوت الثابت */}
      <AudioPlayer
        surahNum={surahNum}
        surahName={surah?.name}
        verses={verses}
        playingVerse={playingVerse}
        onVerseChange={setPlayingVerse}
      />
    </>
  );
}
