import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Navbar from '../../components/Navbar';
import SeoHead from '../../components/SeoHead';
import { SurahSkeleton } from '../../components/Skeleton';
import ErrorRetry from '../../components/ErrorRetry';
import ReadingControls from '../../components/ReadingControls';
import VerseCard from '../../components/VerseCard';
import SurahBottomBar from '../../components/SurahBottomBar';
import SurahNavbar from '../../components/SurahNavbar';
import { supabase } from '../../lib/supabase';
import { fetchSurahWithCache } from '../../lib/apiCache';
import styles from '../../styles/Surah.module.css';
import TajweedText from '../../components/TajweedText';
import VerseNumStar from '../../components/VerseNumStar';

export default function SurahPage({
  toggleDark, dark, showToast, user, onAuth,
  setAudioSurah, setAudioName, setAudioVerses,
  playingVerse, setPlayingVerse,
}) {
  const router   = useRouter();
  const { id }   = router.query;
  const surahNum = parseInt(id);

  // ─── بيانات السورة ───
  const [surah,    setSurah]    = useState(null);
  const [verses,   setVerses]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  // ─── بيانات إضافية ───
  const [wordData,    setWordData]    = useState({});
  const [saadiData,   setSaadiData]   = useState({});
  const [tajweedData, setTajweedData] = useState({});
  const [translation, setTranslation] = useState({});
  const [bookmarks,   setBookmarks]   = useState([]);

  // ─── حالة القراءة ───
  const [tab,         setTab]         = useState('read');
  const [fontSize,    setFontSize]    = useState(1.75);
  const [fontFamily,  setFontFamily]  = useState('amiri-quran');
  const [showTrans,   setShowTrans]   = useState(true);
  const [showTranslation, setShowTranslation] = useState(false);
  const [translationLang, setTranslationLang] = useState('en.sahih');
  const [showTajweed, setShowTajweed] = useState(false);
  const [focusMode,   setFocusMode]   = useState(false);
  const [readingMode, setReadingMode] = useState('page');
  const [showAsbab,   setShowAsbab]   = useState(null);
  const [readPct,     setReadPct]     = useState(0);
  const [saving,      setSaving]      = useState(false);
  const [lastVerse,   setLastVerse]   = useState(1);

  const saveTimerRef = useRef(null);
  const observerRef  = useRef(null);
  const audioRef     = useRef(null); // للتحكم بالصوت من الشريط السفلي

  // ─── تحميل تفضيلات المستخدم ───
  useEffect(() => {
    const s = localStorage.getItem('q_font_size');
    const f = localStorage.getItem('q_font_family');
    const t = localStorage.getItem('q_show_trans');
    const m = localStorage.getItem('q_reading_mode');
    // تأكد من قيم سليمة
    const parsedSize = s ? parseFloat(s) : 1.75;
    if (parsedSize >= 1.0 && parsedSize <= 2.5) setFontSize(parsedSize);
    if (f) setFontFamily(f);
    if (t !== null) setShowTrans(t === 'true');
    // الوضع الافتراضي دائماً صفحة كاملة
    setReadingMode(m || 'page');
  }, []);

  // ─── حفظ آخر موضع ───
  const saveLastRead = useCallback(async (sNum, vNum) => {
    localStorage.setItem('q_last_read', JSON.stringify({ surah: sNum, verse: vNum }));
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      if (!user) return;
      setSaving(true);
      try {
        const { data: ex } = await supabase.from('last_read').select('id').eq('user_id', user.id).single();
        if (ex) {
          await supabase.from('last_read')
            .update({ surah_num: sNum, verse_num: vNum, updated_at: new Date().toISOString() })
            .eq('user_id', user.id);
        } else {
          await supabase.from('last_read').insert({ user_id: user.id, surah_num: sNum, verse_num: vNum });
        }
      } catch { /* تجاهل أخطاء الشبكة */ }
      setSaving(false);
    }, 2000);
  }, [user]);

  // ─── تحميل السورة ───
  useEffect(() => {
    if (!surahNum || isNaN(surahNum)) return;
    setLoading(true); setError(null);
    setVerses([]); setSurah(null);
    setSaadiData({}); setTajweedData({}); setTranslation({});

    const saved = JSON.parse(localStorage.getItem('q_bookmarks') || '[]');
    setBookmarks(saved);

    fetchSurahWithCache(surahNum)
      .then(({ surah: s, verses: v }) => {
        setSurah(s);
        setVerses(v);
        setLoading(false);
        saveLastRead(surahNum, 1);

        setAudioSurah?.(surahNum);
        setAudioName?.(s.name);
        setAudioVerses?.(v);

        // تحميل بيانات التجويد
        fetch('https://raw.githubusercontent.com/cpfair/quran-tajweed/master/output/tajweed.hafs.uthmani-pause-sajdah.json')
          .then(r => r.json())
          .then(d => {
            const map = {};
            d.filter(e => e.surah === surahNum).forEach(e => { map[e.ayah] = e.annotations || []; });
            setTajweedData(map);
          }).catch(() => {});

        // الانتقال للآية من الرابط
        setTimeout(() => {
          const hash = window.location.hash;
          if (hash?.startsWith('#v')) {
            const el = document.querySelector(hash);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              el.style.transition = 'background .3s';
              el.style.background = 'rgba(184,151,58,.15)';
              setTimeout(() => { el.style.background = ''; }, 2000);
            }
          }
        }, 800);
      })
      .catch(() => {
        setError('تعذّر تحميل السورة. تحقق من اتصالك بالإنترنت.');
        setLoading(false);
      });

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      if (observerRef.current)  observerRef.current.disconnect();
    };
  }, [surahNum]);

  // ─── IntersectionObserver للحفظ التلقائي ───
  useEffect(() => {
    if (!verses.length || tab !== 'read') return;
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const v = parseInt(e.target.getAttribute('data-verse'));
          if (v) {
            saveLastRead(surahNum, v);
            setLastVerse(v);
            if (verses.length > 0) setReadPct(Math.round((v / verses.length) * 100));
          }
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

  // ─── تحميل الترجمة ───
  useEffect(() => {
    if (!showTranslation || !surahNum || Object.keys(translation).length > 0) return;
    fetch(`https://api.alquran.cloud/v1/surah/${surahNum}/${translationLang}`)
      .then(r => r.json())
      .then(d => {
        const map = {};
        d.data?.ayahs?.forEach(a => { map[a.numberInSurah] = a.text; });
        setTranslation(map);
      }).catch(() => {});
  }, [showTranslation, surahNum, translationLang]);

  // ─── تحميل التفسير (تبويب التفسير) ───
  useEffect(() => {
    if (tab !== 'tafsir' || !surahNum || Object.keys(saadiData).length > 0) return;
    fetch(`https://api.alquran.cloud/v1/surah/${surahNum}/ar.muyassar`)
      .then(r => r.json())
      .then(d => {
        const map = {};
        d.data?.ayahs?.forEach(a => { map[a.numberInSurah] = a.text; });
        setSaadiData(map);
      }).catch(() => {});
  }, [tab, surahNum]);

  // ─── تحميل كلمة بكلمة ───
  useEffect(() => {
    if (tab !== 'words' || !surahNum || Object.keys(wordData).length > 0) return;
    fetch(`https://api.alquran.cloud/v1/surah/${surahNum}/en.transliteration`)
      .then(r => r.json())
      .then(d => {
        const map = {};
        d.data?.ayahs?.forEach(a => { map[a.numberInSurah] = a.text; });
        setWordData(map);
      }).catch(() => {});
  }, [tab, surahNum]);

  // ─── الإجراءات ───
  function isBm(vNum) { return bookmarks.some(b => b.s === surahNum && b.v === vNum); }

  async function toggleBookmark(vNum) {
    const isBmNow = isBm(vNum);
    let saved = JSON.parse(localStorage.getItem('q_bookmarks') || '[]');
    if (isBmNow) {
      saved = saved.filter(b => !(b.s === surahNum && b.v === vNum));
      showToast('تم إزالة العلامة');
    } else {
      const t = verses.find(v => v.number === vNum)?.text || '';
      saved.push({ s: surahNum, v: vNum, sName: surah?.name, t });
      showToast('🔖 تم الحفظ');
    }
    localStorage.setItem('q_bookmarks', JSON.stringify(saved));
    setBookmarks(saved);
    if (user) {
      if (isBmNow) {
        await supabase.from('bookmarks').delete().eq('user_id', user.id).eq('surah_num', surahNum).eq('verse_num', vNum);
      } else {
        const t = verses.find(v => v.number === vNum)?.text || '';
        await supabase.from('bookmarks').insert({ user_id: user.id, surah_num: surahNum, verse_num: vNum, surah_name: surah?.name, verse_text: t });
      }
    }
  }

  function copyVerse(vNum) {
    const v = verses.find(x => x.number === vNum);
    if (!v) return;
    navigator.clipboard.writeText(`${v.text}\n\n[${surah?.name} - آية ${vNum}]`);
    showToast('📋 تم النسخ');
  }

  function shareVerse(vNum) {
    const v = verses.find(x => x.number === vNum);
    if (!v) return;
    const url = `${window.location.origin}/surah/${surahNum}#v${vNum}`;
    const text = `${v.text}\n\n[${surah?.name} - آية ${vNum}]\n${url}`;
    if (navigator.share) {
      navigator.share({ title: `${surah?.name} - آية ${vNum}`, text: v.text, url });
    } else {
      navigator.clipboard.writeText(text);
      showToast('📋 تم نسخ الآية والرابط');
    }
  }

  function toggleAsbab(vNum) {
    setShowAsbab(prev => prev === vNum ? null : vNum);
  }

  if (!surahNum || isNaN(surahNum)) return null;

  return (
    <>
      <SeoHead
        title={surah ? `${surah.name} — ${surah.numberOfAyahs} آية` : undefined}
        description={surah ? `اقرأ سورة ${surah.name} — ${surah.numberOfAyahs} آية — ${surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'} مع التفسير والاستماع` : undefined}
        path={`/surah/${surahNum}`}
      />
      {/* Navbar الموبايل — pill اسم السورة */}
      <SurahNavbar
        surahName={surah?.name}
        surahNum={surahNum}
        toggleDark={toggleDark}
        dark={dark}
        showToast={showToast}
        onAuth={onAuth}
      />
      {/* Navbar الديسكتوب — يظهر فقط على الشاشات الكبيرة */}
      <div className="desktopOnly">
        <Navbar toggleDark={toggleDark} dark={dark} showToast={showToast} onAuth={onAuth} />
      </div>

      {/* شريط تقدم القراءة — من اليمين لليسار */}
      <div style={{
        position: 'fixed', top: '60px', left: 0, right: 0,
        zIndex: 999, height: '3px',
        background: dark ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.06)',
        direction: 'rtl',
      }}>
        <div style={{
          height: '100%',
          width: `${readPct}%`,
          background: 'linear-gradient(270deg, #2d5a3d 0%, #5aaa70 50%, #c9a84c 100%)',
          transition: 'width .8s cubic-bezier(.4,0,.2,1)',
          borderRadius: '0 2px 2px 0',
          boxShadow: '0 0 8px rgba(201,168,76,.5)',
        }}/>
        {/* نقطة متوهجة في نهاية الشريط */}
        {readPct > 0 && readPct < 100 && (
          <div style={{
            position: 'absolute',
            top: '50%', transform: 'translateY(-50%)',
            right: `${readPct}%`,
            width: '8px', height: '8px',
            borderRadius: '50%',
            background: '#c9a84c',
            boxShadow: '0 0 6px 2px rgba(201,168,76,.6)',
            transition: 'right .8s cubic-bezier(.4,0,.2,1)',
          }}/>
        )}
      </div>

      <div className={styles.page} style={{ paddingBottom:'90px', paddingTop: readPct > 0 ? '10px' : '0' }}>
        <div className={styles.breadcrumb}>
          <Link href="/">الرئيسية</Link>
          <span>›</span>
          <span>{surah ? surah.name : '...'}</span>
          {saving && <span style={{ color:'var(--gold)', fontSize:'.73rem' }}>• جارٍ الحفظ...</span>}
        </div>

        {loading ? (
          <SurahSkeleton />
        ) : error ? (
          <ErrorRetry message={error} onRetry={() => router.replace(router.asPath)} />
        ) : surah ? (
          <>
            {/* رأس السورة */}
            <div className={styles.surahHeader}>
              {/* شريط التنقل */}
              <div className={styles.surahNav}>
                {surahNum > 1
                  ? <Link href={`/surah/${surahNum - 1}`} className={styles.navArrow}>› السابقة</Link>
                  : <span />}
                <div className={styles.surahTitleWrap} style={{flex:1,textAlign:'center'}}>
                  <div className={styles.surahTitleFrame}>
                    <h1 className={styles.surahName}>{surah.name}</h1>
                  </div>
                </div>
                {surahNum < 114
                  ? <Link href={`/surah/${surahNum + 1}`} className={styles.navArrow}>التالية ‹</Link>
                  : <span />}
              </div>

              {/* معلومات السورة */}
              <div className={styles.surahMeta}>
                <span>📍 {surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}</span>
                <span>📜 {surah.numberOfAyahs} آية</span>
                <span>🔢 رقم {surah.number}</span>
                <span className={styles.riwayaBadge}>رواية حفص عن عاصم</span>
              </div>

              {/* البسملة */}
              {surahNum !== 9 && surahNum !== 1 && (
                <div className={styles.bismillah}>
                  <div className={styles.bismillahOrnament}>❧ ✦ ❧</div>
                  <div className={styles.bismillahText}>بِسۡمِ ٱللَّهِ ٱلرَّحۡمَـٰنِ ٱلرَّحِیمِ</div>
                </div>
              )}
            </div>

            {/* التبويبات */}
            <div className={styles.tabs}>
              {[['read','📖 القراءة'],['tafsir','📚 التفسير'],['words','🔤 كلمة بكلمة']].map(([v,l]) => (
                <button key={v} className={`${styles.tab} ${tab === v ? styles.tabActive : ''}`} onClick={() => setTab(v)}>{l}</button>
              ))}
            </div>

            {/* تحكم القراءة */}
            {tab === 'read' && (
              <ReadingControls
                readingMode={readingMode} setReadingMode={setReadingMode}
                fontSize={fontSize} setFontSize={setFontSize}
                fontFamily={fontFamily} setFontFamily={setFontFamily}
                showTrans={showTrans} setShowTrans={setShowTrans}
                showTranslation={showTranslation} setShowTranslation={setShowTranslation}
                translationLang={translationLang} setTranslationLang={setTranslationLang}
                showTajweed={showTajweed} setShowTajweed={setShowTajweed}
                focusMode={focusMode} setFocusMode={setFocusMode}
                onResetTranslation={() => setTranslation({})}
              />
            )}

            <div className={styles.content}>
              {/* ── تبويب القراءة ── */}
              {tab === 'read' && (
                <div className={styles.verses}>
                  {readingMode === 'page' ? (
                    /* وضع الصفحة الكاملة */
                    <div className={styles.pageMode}>
                      {verses.map((v, idx) => {
                        const fontStyle = {
                          fontSize: `${fontSize}rem`,
                          fontFamily: fontFamily === 'noto-naskh' ? "'Noto Naskh Arabic', serif"
                            : fontFamily === 'amiri' ? "'Amiri', serif" : "'Amiri Quran', serif",
                        };
                        return (
                          <span key={v.number} id={`v${v.number}`} data-verse={v.number}>
                            {v.page && idx > 0 && verses[idx - 1]?.page !== v.page && (
                              <div className={styles.pageMarker}>
                                <div className={styles.pageMarkerLine}/>
                                <div className={styles.pageMarkerInfo}>
                                  <span>صفحة {v.page}</span>
                                  <span>•</span>
                                  <span>جزء {v.juz}</span>
                                </div>
                                <div className={styles.pageMarkerLine}/>
                              </div>
                            )}
                            <span
                              className={`${styles.inlineVerse} ${playingVerse === v.number ? styles.playing : ''}`}
                              style={{...fontStyle, color: dark ? '#e8dcc8' : '#1a0800'}}
                              onClick={() => setPlayingVerse(v.number)}
                            >
                              {showTajweed && tajweedData[v.number]
                                ? <TajweedText
                                    text={v.text}
                                    annotations={tajweedData[v.number]}
                                    fontSize={fontSize}
                                    fontFamily={fontStyle.fontFamily}
                                    dark={dark}
                                  />
                                : v.text
                              }
                            </span>
                            <span style={{ display:'inline-block', verticalAlign:'middle', margin:'0 2px', color: dark ? '#c9a84c' : '#8b6340' }}>
                              <VerseNumStar num={v.number} size={22} />
                            </span>
                            {' '}
                            {showTranslation && translation[v.number] && (
                              <span style={{
                                display: 'block',
                                fontFamily: "'Tajawal', sans-serif",
                                fontSize: '0.8rem',
                                color: dark ? '#8a9e7a' : '#7a5c30',
                                direction: 'ltr',
                                textAlign: 'left',
                                padding: '4px 8px',
                                margin: '2px 0 6px',
                                borderRadius: '6px',
                                background: dark ? 'rgba(45,90,61,.08)' : 'rgba(45,90,61,.04)',
                                lineHeight: '1.7',
                              }}>
                                {translation[v.number]}
                              </span>
                            )}
                          </span>
                        );
                      })}
                    </div>
                  ) : (
                    /* وضع آية بآية — يستخدم VerseCard */
                    <>
                      {verses.map((v, idx) => (
                        <VerseCard
                          key={v.number}
                          verse={v}
                          prevVerse={verses[idx - 1]}
                          surahNum={surahNum}
                          playingVerse={playingVerse}
                          fontSize={fontSize}
                          fontFamily={fontFamily}
                          showTrans={showTrans}
                          showTranslation={showTranslation}
                          showTajweed={showTajweed}
                          focusMode={focusMode}
                          tajweedData={tajweedData}
                          translation={translation}
                          showAsbab={showAsbab}
                          isBookmarked={isBm(v.number)}
                          dark={dark}
                          onPlay={setPlayingVerse}
                          onToggleBookmark={toggleBookmark}
                          onCopy={copyVerse}
                          onShare={shareVerse}
                          onToggleAsbab={toggleAsbab}
                        />
                      ))}
                    </>
                  )}
                </div>
              )}

              {/* ── تبويب التفسير ── */}
              {tab === 'tafsir' && (
                <div className={styles.tafsirList}>
                  <div className={styles.tafsirNote}>📚 تفسير الميسر — مختصر وواضح</div>
                  {verses.map(v => (
                    <div key={v.number} className={styles.tafsirItem}>
                      <div className={styles.tafsirAyah} style={{ fontSize:`${Math.min(fontSize, 1.5)}rem` }}>{v.text}</div>
                      <div className={styles.tafsirBox}>
                        <strong className={styles.tafsirNum}>[{v.number}]</strong>{' '}
                        {saadiData[v.number] || v.tafsir || 'التفسير غير متوفر'}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ── تبويب كلمة بكلمة ── */}
              {tab === 'words' && (
                <div className={styles.wordsList}>
                  {verses.map(v => (
                    <div key={v.number} className={styles.wordVerse}>
                      <div className={styles.wordVerseNum}>آية {v.number}</div>
                      <div className={styles.wordVerseText} style={{ color: dark ? '#e8dcc8' : '#1a0e00' }}>{v.text}</div>
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
        ) : null}
      </div>
      {/* الشريط السفلي — موبايل السورة */}
      <SurahBottomBar
        dark={dark}
        surahNum={surahNum}
        surahName={surah?.name}
        showTajweed={showTajweed}
        onToggleTajweed={() => setShowTajweed(v => !v)}
        playingVerse={playingVerse}
        onPlayPause={() => {
          const audio = document.querySelector('audio');
          if (playingVerse && audio) {
            if (audio.paused) {
              audio.play().catch(() => {});
            } else {
              audio.pause();
              setPlayingVerse(null);
            }
          } else {
            // ابدأ من أول آية
            if (verses.length > 0) setPlayingVerse(verses[0].number);
          }
        }}
        isBookmarked={isBm(lastVerse)}
        onToggleBookmark={() => toggleBookmark(lastVerse)}
        onScrollTop={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        onPrevSurah={() => router.push(`/surah/${surahNum - 1}`)}
        onNextSurah={() => router.push(`/surah/${surahNum + 1}`)}
      />
    </>
  );
}
