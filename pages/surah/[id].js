import { useState, useEffect, useRef, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Navbar from '../../components/Navbar';
import { SurahSkeleton } from '../../components/Skeleton';
import { supabase } from '../../lib/supabase';
import styles from '../../styles/Surah.module.css';

export default function SurahPage({
  toggleDark, dark, showToast, user, onAuth,
  setAudioSurah, setAudioName, setAudioVerses,
  playingVerse, setPlayingVerse,
}) {
  const router   = useRouter();
  const { id }   = router.query;
  const surahNum = parseInt(id);

  const [surah,    setSurah]    = useState(null);
  const [verses,   setVerses]   = useState([]);
  const [wordData, setWordData] = useState({});
  const [loading,  setLoading]  = useState(true);
  const [tab,      setTab]      = useState('read');
  const [fontSize, setFontSize] = useState(1.75);
  const [bookmarks,setBookmarks]= useState([]);
  const [showTrans,  setShowTrans]  = useState(true);
  const [fontFamily, setFontFamily] = useState('amiri-quran');

  // تحميل تفضيلات المستخدم المحفوظة
  useEffect(() => {
    const savedSize   = localStorage.getItem('q_font_size');
    const savedFamily = localStorage.getItem('q_font_family');
    const savedTrans  = localStorage.getItem('q_show_trans');
    if (savedSize)   setFontSize(parseFloat(savedSize));
    if (savedFamily) setFontFamily(savedFamily);
    if (savedTrans !== null) setShowTrans(savedTrans === 'true');
  }, []);
  const [saving,   setSaving]   = useState(false);
  const [readPct,  setReadPct]  = useState(0);
  const [translation, setTranslation] = useState({});
  const [showTranslation, setShowTranslation] = useState(false);
  const [translationLang, setTranslationLang] = useState('en.sahih');

  const saveTimerRef = useRef(null);
  const observerRef  = useRef(null);

  const saveLastRead = useCallback(async (sNum, vNum) => {
    localStorage.setItem('q_last_read', JSON.stringify({ surah: sNum, verse: vNum }));
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      if (!user) return;
      setSaving(true);
      try {
        const { data: ex } = await supabase.from('last_read').select('id').eq('user_id', user.id).single();
        if (ex) await supabase.from('last_read').update({ surah_num: sNum, verse_num: vNum, updated_at: new Date().toISOString() }).eq('user_id', user.id);
        else    await supabase.from('last_read').insert({ user_id: user.id, surah_num: sNum, verse_num: vNum });
      } catch(e) {}
      setSaving(false);
    }, 2000);
  }, [user]);

  useEffect(() => {
    if (!surahNum) return;
    setLoading(true); setVerses([]); setSurah(null);
    const saved = JSON.parse(localStorage.getItem('q_bookmarks') || '[]');
    setBookmarks(saved);

    Promise.all([
      fetch(`https://api.alquran.cloud/v1/surah/${surahNum}`).then(r => r.json()),
      fetch(`https://api.alquran.cloud/v1/surah/${surahNum}/ar.muyassar`).then(r => r.json()),
    ]).then(([ar, tafsir]) => {
      const v = ar.data.ayahs.map((a, i) => ({
        number: a.numberInSurah, text: a.text,
        tafsir: tafsir.data?.ayahs?.[i]?.text || '',
      }));
      setSurah(ar.data);
      setVerses(v);
      setLoading(false);
      saveLastRead(surahNum, 1);

      // Feed AudioPlayer in _app
      setAudioSurah?.(surahNum);
      setAudioName?.(ar.data.name);
      setAudioVerses?.(v);

      // Scroll to hash verse
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
    }).catch(() => setLoading(false));

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      if (observerRef.current)  observerRef.current.disconnect();
    };
  }, [surahNum]);

  // Auto-save on scroll
  useEffect(() => {
    if (!verses.length || tab !== 'read') return;
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const v = parseInt(e.target.getAttribute('data-verse'));
          if (v) {
            saveLastRead(surahNum, v);
            // حساب نسبة التقدم
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

  useEffect(() => {
    if (!showTranslation || !surahNum || Object.keys(translation).length > 0) return;
    fetch(`https://api.alquran.cloud/v1/surah/${surahNum}/${translationLang}`)
      .then(r => r.json())
      .then(d => {
        const map = {};
        d.data?.ayahs?.forEach(a => { map[a.numberInSurah] = a.text; });
        setTranslation(map);
      });
  }, [showTranslation, surahNum, translationLang]);

  useEffect(() => {
    // Reset translation when surah changes
    setTranslation({});
  }, [surahNum]);

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
    const isBmNow = bookmarks.some(b => b.s === surahNum && b.v === vNum);
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
      if (isBmNow) await supabase.from('bookmarks').delete().eq('user_id', user.id).eq('surah_num', surahNum).eq('verse_num', vNum);
      else {
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

  function isBm(vNum) { return bookmarks.some(b => b.s === surahNum && b.v === vNum); }

  function shareVerse(vNum) {
    const v = verses.find(x => x.number === vNum);
    if (!v) return;
    const url = `${window.location.origin}/surah/${surahNum}#v${vNum}`;
    const text = `${v.text}

[${surah?.name} - آية ${vNum}]
${url}`;
    if (navigator.share) {
      navigator.share({ title: `${surah?.name} - آية ${vNum}`, text: v.text, url });
    } else {
      navigator.clipboard.writeText(text);
      showToast('📋 تم نسخ الآية والرابط');
    }
  }

  if (!surahNum) return null;

  return (
    <>
      <Head>
        <title>{surah ? `${surah.name} - القرآن الكريم` : 'جارٍ التحميل...'}</title>
        {surah && <>
          <meta name="description" content={`اقرأ ${surah.name} - ${surah.numberOfAyahs} آية - ${surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}`} />
          <meta property="og:title" content={`${surah.name} - القرآن الكريم`} />
          <meta property="og:description" content={`اقرأ واستمع إلى ${surah.name} مع التفسير والترجمة`} />
          <meta property="og:type" content="website" />
          <meta name="twitter:card" content="summary" />
          <meta name="twitter:title" content={`${surah.name} - القرآن الكريم`} />
        </>}
      </Head>
      <Navbar toggleDark={toggleDark} dark={dark} showToast={showToast} onAuth={onAuth} />

      {/* شريط تقدم القراءة — ثابت أعلى الصفحة */}
      {readPct > 0 && (
        <div style={{
          position:'fixed', top:'56px', left:0, right:0, zIndex:998,
          height:'4px', background:'rgba(0,0,0,.08)',
          direction:'ltr',
        }}>
          <div style={{
            height:'100%', width:`${readPct}%`,
            background:'linear-gradient(90deg,#2d5a3d,#c9a84c)',
            transition:'width .6s ease',
            marginLeft:'auto',
            float:'right',
          }}/>
        </div>
      )}
      <div className={styles.page} style={{ paddingBottom: '90px', paddingTop: readPct > 0 ? '10px' : '0' }}>
        <div className={styles.breadcrumb}>
          <Link href="/">الرئيسية</Link>
          <span>›</span>
          <span>{surah ? surah.name : '...'}</span>
          {saving && <span style={{color:'var(--gold)',fontSize:'.73rem'}}>• جارٍ الحفظ...</span>}
        </div>


        {loading ? <SurahSkeleton /> : surah ? (
          <>
            <div className={styles.surahHeader}>
              <div className={styles.surahNav}>
                {surahNum > 1 && <Link href={`/surah/${surahNum-1}`} className={styles.navArrow}>› السابقة</Link>}
                <div>
                  <h1 className={styles.surahName}>{surah.name}</h1>
                  <div className={styles.surahMeta}>
                    <span>📍 {surah.revelationType==='Meccan'?'مكية':'مدنية'}</span>
                    <span>📜 {surah.numberOfAyahs} آية</span>
                    <span>🔢 رقم {surah.number}</span>
                  </div>
                </div>
                {surahNum < 114 && <Link href={`/surah/${surahNum+1}`} className={styles.navArrow}>التالية ‹</Link>}
              </div>
              {surahNum !== 9 && <div className={styles.bismillah}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>}
            </div>

            <div className={styles.tabs}>
              {[['read','📖 القراءة'],['tafsir','📚 التفسير'],['words','🔤 كلمة بكلمة']].map(([v,l])=>(
                <button key={v} className={`${styles.tab} ${tab===v?styles.tabActive:''}`} onClick={()=>setTab(v)}>{l}</button>
              ))}
            </div>

            {tab==='read' && (
              <div className={styles.fontControls}>
                <div className={styles.fontSizeRow}>
                  <button className={styles.fontIconBtn} onClick={()=>{ const v=Math.max(1.1,fontSize-.15); setFontSize(v); localStorage.setItem('q_font_size',v); }} title="تصغير">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M9 4v3h5v12h3V7h5V4H9zm-6 8h3v7h2v-7h3v-2H3v2z"/></svg>
                  </button>
                  <div className={styles.fontSteps}>
                    {[100,125,150,175,200,225].map(p=>(
                      <button key={p}
                        className={`${styles.fontStep} ${Math.round(fontSize*100)===p?styles.fontStepActive:''}`}
                        onClick={()=>{ const v=p/100; setFontSize(v); localStorage.setItem('q_font_size',v); }}>
                        {p}%
                      </button>
                    ))}
                  </div>
                  <button className={styles.fontIconBtn} onClick={()=>{ const v=Math.min(2.5,fontSize+.15); setFontSize(v); localStorage.setItem('q_font_size',v); }} title="تكبير">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M9 4v3h5v12h3V7h5V4H9zm-6 8h3v7h2v-7h3v-2H3v2z"/></svg>
                  </button>
                </div>
                <div className={styles.fontRow}>
                  <select className={styles.fontSelect} value={fontFamily} onChange={e=>{ setFontFamily(e.target.value); localStorage.setItem('q_font_family', e.target.value); }}>
                    <option value="amiri-quran">Amiri Quran</option>
                    <option value="noto-naskh">Noto Naskh</option>
                    <option value="amiri">Amiri Classic</option>
                  </select>
                  <button className={`${styles.transBtn} ${showTrans?styles.transBtnOn:''}`} onClick={()=>setShowTrans(v=>!v)}>
                    {showTrans ? '📖 إخفاء التفسير' : '📖 التفسير'}
                  </button>
                  <button className={`${styles.transBtn} ${showTranslation?styles.transBtnOn:''}`}
                    onClick={()=>setShowTranslation(v=>!v)}>
                    {showTranslation ? '🌐 إخفاء الترجمة' : '🌐 ترجمة'}
                  </button>
                  {showTranslation && (
                    <select className={styles.fontSelect} value={translationLang}
                      onChange={e=>{ setTranslationLang(e.target.value); setTranslation({}); }}>
                      <option value="en.sahih">English - Sahih</option>
                      <option value="en.pickthall">English - Pickthall</option>
                      <option value="fr.hamidullah">Français</option>
                      <option value="tr.diyanet">Türkçe</option>
                      <option value="ur.jalandhry">اردو</option>
                    </select>
                  )}
                </div>
              </div>
            )}

            <div className={styles.content}>
              {tab==='read' && (
                <div className={styles.verses}>
                  {verses.map(v => (
                    <div key={v.number} id={`v${v.number}`} data-verse={v.number}
                      className={`${styles.verse} ${playingVerse===v.number?styles.playing:''}`}>
                      <div className={styles.verseTop}>
                        <div className={styles.verseNum}>{v.number}</div>
                        <div className={styles.verseBody}>
                          <div className={styles.verseText} style={{
                            fontSize:`${fontSize}rem`,
                            fontFamily: fontFamily==='noto-naskh' ? "'Noto Naskh Arabic', serif"
                                      : fontFamily==='amiri' ? "'Amiri', serif"
                                      : "'Amiri Quran', serif"
                          }}>{v.text}</div>
                          {showTrans && v.tafsir && <div className={styles.verseTrans}>{v.tafsir}</div>}
                          {showTranslation && translation[v.number] && (
                            <div className={styles.verseTranslation}>{translation[v.number]}</div>
                          )}
                        </div>
                        <button
                          className={`${styles.playBtn} ${playingVerse===v.number?styles.playBtnActive:''}`}
                          onClick={()=>setPlayingVerse(v.number)}>
                          {playingVerse===v.number?'🔊':'▶'}
                        </button>
                      </div>
                      <div className={styles.verseActions}>
                        <button className={`${styles.actionBtn} ${isBm(v.number)?styles.bmActive:''}`} onClick={()=>toggleBookmark(v.number)}>
                          {isBm(v.number)?'🔖 محفوظ':'🔖 حفظ'}
                        </button>
                        <button className={styles.actionBtn} onClick={()=>copyVerse(v.number)}>📋 نسخ</button>
                        <button className={styles.actionBtn} onClick={()=>shareVerse(v.number)}>🔗 مشاركة</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {tab==='tafsir' && (
                <div className={styles.tafsirList}>
                  {verses.map(v=>(
                    <div key={v.number} className={styles.tafsirItem}>
                      <div className={styles.tafsirAyah} style={{fontSize:`${fontSize}rem`}}>{v.text}</div>
                      <div className={styles.tafsirBox}><strong className={styles.tafsirNum}>[{v.number}]</strong> {v.tafsir||'التفسير غير متوفر'}</div>
                    </div>
                  ))}
                </div>
              )}

              {tab==='words' && (
                <div className={styles.wordsList}>
                  {verses.map(v=>(
                    <div key={v.number} className={styles.wordVerse}>
                      <div className={styles.wordVerseNum}>آية {v.number}</div>
                      <div className={styles.wordVerseText}>{v.text}</div>
                      <div className={styles.wordGrid}>
                        {v.text.split(' ').map((word,wi)=>(
                          <div key={wi} className={styles.wordCard}>
                            <div className={styles.wordAr}>{word}</div>
                            <div className={styles.wordEn}>{wordData[v.number]?.split(' ')[wi]||'...'}</div>
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
        ) : <div className="loading">حدث خطأ في التحميل</div>}
      </div>
    </>
  );
}
