import { useState, useEffect, useRef, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Navbar from '../../components/Navbar';
import { supabase } from '../../lib/supabase';
import styles from '../../styles/Surah.module.css';

const SURAH_START = [];
const AYAH_COUNTS = [7,286,200,176,120,165,206,75,129,109,123,111,43,52,99,128,111,110,98,135,112,78,118,64,77,227,93,88,69,60,34,30,73,54,45,83,182,88,75,85,54,53,89,59,37,35,38,29,18,45,60,49,62,55,78,96,29,22,24,13,14,11,29,15,52,60,22,6,73,52,28,44,28,56,40,31,54,31,46,38,23,18,8,17,16,11,12,3,18,12,12,30,7,6,6,8,3,5,4,5,8,4,7,3,6,3,5,4,5,6,1,5,4,6,1,3,6,6,3,5,12,5,8,9,5,6,5,9,6,3,5,4,3,3,3,3,4,3,1,4,6,5,8,3,3,6,4];
(function() { let c = 1; for (let i = 0; i < 114; i++) { SURAH_START[i] = c; c += AYAH_COUNTS[i]; } })();
function globalAyah(surah, verse) { return SURAH_START[surah - 1] + (verse - 1); }

const RECITERS = [
  { name: 'مشاري العفاسي', id: 'ar.alafasy' },
  { name: 'عبدالرحمن السديس', id: 'ar.abdurrahmaansudais' },
  { name: 'محمود خليل الحصري', id: 'ar.husary' },
  { name: 'محمد صديق المنشاوي', id: 'ar.minshawi' },
];

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
  const [reciter, setReciter] = useState('ar.alafasy');
  const [playingVerse, setPlayingVerse] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [showTrans, setShowTrans] = useState(true);
  const [currentVisibleVerse, setCurrentVisibleVerse] = useState(1);
  const [saving, setSaving] = useState(false);
  const audioRef = useRef(null);
  const saveTimerRef = useRef(null);
  const observerRef = useRef(null);

  // حفظ آخر قراءة — مع debounce لتجنب الحفظ الكثير
  const saveLastRead = useCallback(async (sNum, vNum) => {
    // حفظ محلي فوري
    localStorage.setItem('q_last_read', JSON.stringify({ surah: sNum, verse: vNum }));

    // حفظ في Supabase مع تأخير 2 ثانية
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      if (!user) return;
      setSaving(true);
      try {
        const { data: existing } = await supabase
          .from('last_read')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (existing) {
          await supabase.from('last_read').update({
            surah_num: sNum,
            verse_num: vNum,
            updated_at: new Date().toISOString()
          }).eq('user_id', user.id);
        } else {
          await supabase.from('last_read').insert({
            user_id: user.id,
            surah_num: sNum,
            verse_num: vNum
          });
        }
      } catch(e) {}
      setSaving(false);
    }, 2000);
  }, [user]);

  useEffect(() => {
    if (!surahNum) return;
    setLoading(true);
    setVerses([]);
    setSurah(null);
    setCurrentVisibleVerse(1);

    const saved = JSON.parse(localStorage.getItem('q_bookmarks') || '[]');
    setBookmarks(saved);

    Promise.all([
      fetch(`https://api.alquran.cloud/v1/surah/${surahNum}`).then(r => r.json()),
      fetch(`https://api.alquran.cloud/v1/surah/${surahNum}/ar.muyassar`).then(r => r.json()),
    ]).then(([ar, tafsir]) => {
      setSurah(ar.data);
      setVerses(ar.data.ayahs.map((v, i) => ({
        number: v.numberInSurah,
        text: v.text,
        tafsir: tafsir.data?.ayahs?.[i]?.text || '',
      })));
      setLoading(false);
      saveLastRead(surahNum, 1);
      // التمرير للآية المحددة في الرابط (#v142 مثلاً)
      setTimeout(() => {
        const hash = window.location.hash;
        if (hash && hash.startsWith('#v')) {
          const verseEl = document.querySelector(hash);
          if (verseEl) {
            verseEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // تمييز الآية لثانيتين
            verseEl.style.transition = 'background 0.3s';
            verseEl.style.background = 'rgba(184,151,58,0.15)';
            setTimeout(() => { verseEl.style.background = ''; }, 2000);
          }
        }
      }, 800);
    }).catch(() => setLoading(false));

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [surahNum]);

  // Intersection Observer — يحفظ الآية عند التمرير إليها
  useEffect(() => {
    if (!verses.length || tab !== 'read') return;

    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const vNum = parseInt(entry.target.getAttribute('data-verse'));
          if (vNum && vNum !== currentVisibleVerse) {
            setCurrentVisibleVerse(vNum);
            saveLastRead(surahNum, vNum);
          }
        }
      });
    }, { threshold: 0.5 }); // يحفظ عند ظهور 50% من الآية

    // مراقبة كل الآيات
    setTimeout(() => {
      verses.forEach(v => {
        const el = document.getElementById(`v${v.number}`);
        if (el) observerRef.current.observe(el);
      });
    }, 500);

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [verses, tab]);

  useEffect(() => {
    if (tab !== 'words' || !surahNum || Object.keys(wordData).length > 0) return;
    fetch(`https://api.alquran.cloud/v1/surah/${surahNum}/en.transliteration`)
      .then(r => r.json())
      .then(d => {
        const map = {};
        d.data?.ayahs?.forEach(a => { map[a.numberInSurah] = a.text; });
        setWordData(map);
      });
  }, [tab, surahNum]);

  function stopAudio() {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    setPlayingVerse(null);
  }

  function playSurah() {
    stopAudio();
    const url = `https://cdn.islamic.network/quran/audio-surah/128/${reciter}/${surahNum}.mp3`;
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.play();
    showToast('▶ جارٍ تشغيل ' + (surah?.name?.startsWith('سورة') ? surah.name : `سورة ${surah?.name}`));
  }

  function playVerse(vNum) {
    stopAudio();
    if (playingVerse === vNum) return;
    const g = globalAyah(surahNum, vNum);
    const url = `https://cdn.islamic.network/quran/audio/128/${reciter}/${g}.mp3`;
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.play();
    setPlayingVerse(vNum);
    audio.addEventListener('ended', () => {
      setPlayingVerse(null);
      audioRef.current = null;
      const next = verses.find(v => v.number === vNum + 1);
      if (next) setTimeout(() => playVerse(next.number), 400);
    });
    document.getElementById(`v${vNum}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  async function toggleBookmark(vNum) {
    const isBmNow = isBm(vNum);
    // تحديث محلي فوري
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

    // حفظ في Supabase
    if (user) {
      if (isBmNow) {
        await supabase.from('bookmarks').delete()
          .eq('user_id', user.id).eq('surah_num', surahNum).eq('verse_num', vNum);
      } else {
        const verseText = verses.find(v => v.number === vNum)?.text || '';
        await supabase.from('bookmarks').insert({
          user_id: user.id,
          surah_num: surahNum,
          verse_num: vNum,
          surah_name: surah?.name,
          verse_text: verseText,
        });
      }
    }
  }

  function copyVerse(vNum) {
    const v = verses.find(x => x.number === vNum);
    if (!v) return;
    navigator.clipboard.writeText(`${v.text}\n\n[سورة ${surah?.name} - آية ${vNum}]`);
    showToast('📋 تم النسخ');
  }

  function isBm(vNum) { return bookmarks.some(b => b.s === surahNum && b.v === vNum); }

  if (!surahNum) return null;

  return (
    <>
      <Head>
        <title>{surah ? `${surah.name} - القرآن الكريم` : 'جارٍ التحميل...'}</title>
      </Head>
      <Navbar toggleDark={toggleDark} dark={dark} showToast={showToast} onAuth={onAuth} />

      <div className={styles.page}>
        <div className={styles.breadcrumb}>
          <Link href="/">الرئيسية</Link>
          <span>›</span>
          <span>{surah ? surah.name : '...'}</span>
          {saving && <span style={{color:'var(--gold)',fontSize:'.75rem'}}>• جارٍ الحفظ...</span>}
          {!saving && currentVisibleVerse > 1 && (
            <span style={{color:'var(--green)',fontSize:'.75rem'}}>• محفوظ عند آية {currentVisibleVerse} ☁️</span>
          )}
        </div>

        {loading ? (
          <div className="loading"><div className="loader" /><div>جارٍ تحميل السورة...</div></div>
        ) : surah ? (
          <>
            <div className={styles.surahHeader}>
              <div className={styles.surahNav}>
                {surahNum > 1 && <Link href={`/surah/${surahNum - 1}`} className={styles.navArrow}>› السابقة</Link>}
                <div>
                  <h1 className={styles.surahName}>{surah.name.startsWith("سورة") ? surah.name : `سورة ${surah.name}`}</h1>
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
              {[['read','📖 القراءة'],['tafsir','📚 التفسير'],['listen','🎧 الاستماع'],['words','🔤 كلمة بكلمة']].map(([v,l]) => (
                <button key={v} className={`${styles.tab} ${tab===v?styles.tabActive:''}`} onClick={() => setTab(v)}>{l}</button>
              ))}
            </div>

            <div className={styles.toolbar}>
              <div className={styles.toolGroup}>
                <label>القارئ:</label>
                <select className={styles.select} value={reciter} onChange={e => { setReciter(e.target.value); stopAudio(); }}>
                  {RECITERS.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
                <button className={styles.playAllBtn} onClick={playSurah}>▶ السورة كاملة</button>
              </div>
              {tab === 'read' && (
                <div className={styles.toolGroup}>
                  <label>الخط:</label>
                  <button className={styles.fontBtn} onClick={() => setFontSize(f => Math.max(1.1, f - .15))}>أ−</button>
                  <button className={styles.fontBtn} onClick={() => setFontSize(f => Math.min(2.5, f + .15))}>أ+</button>
                  <button className={`${styles.fontBtn} ${showTrans ? styles.fontBtnActive : ''}`} onClick={() => setShowTrans(v => !v)}>التفسير</button>
                </div>
              )}
            </div>

            <div className={styles.content}>
              {tab === 'read' && (
                <div className={styles.verses}>
                  {verses.map(v => (
                    <div key={v.number} id={`v${v.number}`} data-verse={v.number}
                      className={`${styles.verse} ${playingVerse === v.number ? styles.playing : ''} ${currentVisibleVerse === v.number ? styles.currentVerse : ''}`}>
                      <div className={styles.verseTop}>
                        <div className={styles.verseNum}>{v.number}</div>
                        <div className={styles.verseBody}>
                          <div className={styles.verseText} style={{ fontSize: `${fontSize}rem` }}>{v.text}</div>
                          {showTrans && v.tafsir && <div className={styles.verseTrans}>{v.tafsir}</div>}
                        </div>
                        <button className={`${styles.playBtn} ${playingVerse === v.number ? styles.playBtnActive : ''}`}
                          onClick={() => playingVerse === v.number ? stopAudio() : playVerse(v.number)}>
                          {playingVerse === v.number ? '⏸' : '▶'}
                        </button>
                      </div>
                      <div className={styles.verseActions}>
                        <button className={`${styles.actionBtn} ${isBm(v.number) ? styles.bmActive : ''}`} onClick={() => toggleBookmark(v.number)}>
                          {isBm(v.number) ? '🔖 محفوظ' : '🔖 حفظ'}
                        </button>
                        <button className={styles.actionBtn} onClick={() => copyVerse(v.number)}>📋 نسخ</button>
                        <button className={styles.actionBtn} onClick={() => playVerse(v.number)}>🔊 استمع</button>
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

              {tab === 'listen' && (
                <div className={styles.listenTab}>
                  <div className={styles.listenCard}>
                    <div className={styles.listenIcon}>🎧</div>
                    <h3>استمع إلى {surah.name.startsWith("سورة") ? surah.name : `سورة ${surah.name}`}</h3>
                    <p>بصوت {RECITERS.find(r => r.id === reciter)?.name}</p>
                    <audio controls src={`https://cdn.islamic.network/quran/audio-surah/128/${reciter}/${surahNum}.mp3`}
                      style={{ width: '100%', marginTop: '16px', direction: 'ltr' }} />
                  </div>
                  <h3 className={styles.verseByVerseTitle}>أو استمع آية بآية:</h3>
                  <div className={styles.verseListenGrid}>
                    {verses.map(v => (
                      <button key={v.number}
                        className={`${styles.verseListenBtn} ${playingVerse === v.number ? styles.verseListenActive : ''}`}
                        onClick={() => playingVerse === v.number ? stopAudio() : playVerse(v.number)}>
                        {playingVerse === v.number ? '⏸' : '▶'} آية {v.number}
                      </button>
                    ))}
                  </div>
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
    </>
  );
}
