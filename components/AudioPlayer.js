import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './AudioPlayer.module.css';

const RECITERS = [
  { name: 'مشاري العفاسي',     id: 'ar.alafasy' },
  { name: 'عبدالرحمن السديس', id: 'ar.abdurrahmaansudais' },
  { name: 'محمود الحصري',      id: 'ar.husary' },
  { name: 'المنشاوي',          id: 'ar.minshawi' },
];

const SURAH_START = [];
const AYAH_COUNTS = [7,286,200,176,120,165,206,75,129,109,123,111,43,52,99,128,111,110,98,135,112,78,118,64,77,227,93,88,69,60,34,30,73,54,45,83,182,88,75,85,54,53,89,59,37,35,38,29,18,45,60,49,62,55,78,96,29,22,24,13,14,11,29,15,52,60,22,6,73,52,28,44,28,56,40,31,54,31,46,38,23,18,8,17,16,11,12,3,18,12,12,30,7,6,6,8,3,5,4,5,8,4,7,3,6,3,5,4,5,6,1,5,4,6,1,3,6,6,3,5,12,5,8,9,5,6,5,9,6,3,5,4,3,3,3,3,4,3,1,4,6,5,8,3,3,6,4];
(function(){ let c=1; for(let i=0;i<114;i++){SURAH_START[i]=c; c+=AYAH_COUNTS[i];} })();
function globalAyah(s,v){ return SURAH_START[s-1]+(v-1); }
function verseUrl(reciter,s,v){ return `https://cdn.islamic.network/quran/audio/128/${reciter}/${globalAyah(s,v)}.mp3`; }

export default function AudioPlayer({ surahNum, surahName, verses, playingVerse, onVerseChange }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [repeat,    setRepeat]    = useState(false);
  const [reciter,   setReciter]   = useState('ar.alafasy');
  const [loading,   setLoading]   = useState(false);
  const [progress,  setProgress]  = useState(0);
  const [curTime,   setCurTime]   = useState(0);
  const [duration,  setDuration]  = useState(0);
  const [minimized, setMinimized] = useState(false);
  const [buffering, setBuffering] = useState(false);

  // ─── Single DOM audio element ───
  const audioEl   = useRef(null);
  // ─── Preload audio for next verse ───
  const preloadEl = useRef(null);

  // ─── Refs so callbacks always see fresh values ───
  const activeVerse  = useRef(null);
  const activeSurah  = useRef(null);
  const repeatRef    = useRef(false);
  const reciterRef   = useRef('ar.alafasy');
  const versesRef    = useRef([]);
  const isPlayingRef = useRef(false);
  // Debounce rapid taps
  const loadingVerse = useRef(null);

  useEffect(()=>{ repeatRef.current  = repeat;  },[repeat]);
  useEffect(()=>{ reciterRef.current = reciter; },[reciter]);
  useEffect(()=>{ versesRef.current  = verses||[]; },[verses]);

  // ─── Wire audio element events ONCE ───
  useEffect(()=>{
    const a = audioEl.current;
    if(!a) return;

    a.oncanplay        = ()=>{ setBuffering(false); setLoading(false); if(isPlayingRef.current) a.play().catch(()=>{}); };
    a.onwaiting        = ()=>{ setBuffering(true); };
    a.onplaying        = ()=>{ setBuffering(false); setIsPlaying(true); isPlayingRef.current=true; };
    a.onpause          = ()=>{ setIsPlaying(false); isPlayingRef.current=false; };
    a.onerror          = ()=>{ setLoading(false); setBuffering(false); setIsPlaying(false); isPlayingRef.current=false; };
    a.onloadedmetadata = ()=>{ setDuration(a.duration); };
    a.ontimeupdate     = ()=>{
      setCurTime(a.currentTime);
      if(a.duration) setProgress((a.currentTime/a.duration)*100);
    };
    a.onended = ()=>{
      if(repeatRef.current){ a.currentTime=0; a.play(); return; }
      const cur  = activeVerse.current;
      const next = versesRef.current.find(v=>v.number===cur+1);
      if(next && activeSurah.current) loadVerse(activeSurah.current, next.number);
      else { hardStop(); onVerseChange?.(null); }
    };

    return ()=>{
      ['oncanplay','onwaiting','onplaying','onpause','onerror',
       'onloadedmetadata','ontimeupdate','onended'].forEach(ev=>{ a[ev]=null; });
    };
  },[]);

  // ─── Stop everything when surah changes ───
  useEffect(()=>{
    if(surahNum && surahNum !== activeSurah.current){
      hardStop();
    }
    activeSurah.current = surahNum;
  },[surahNum]);

  // ─── External verse trigger ───
  useEffect(()=>{
    if(playingVerse && playingVerse !== activeVerse.current && surahNum){
      loadVerse(surahNum, playingVerse);
    }
  },[playingVerse]);

  function hardStop(){
    const a = audioEl.current;
    if(a){ a.pause(); a.src=''; a.load(); }
    isPlayingRef.current = false;
    activeVerse.current  = null;
    loadingVerse.current = null;
    setIsPlaying(false); setLoading(false); setBuffering(false);
    setProgress(0); setCurTime(0); setDuration(0);
  }

  // ─── CORE: load + play a verse ───
  const loadVerse = useCallback((sNum, vNum)=>{
    // Debounce — ignore if already loading this exact verse
    if(loadingVerse.current === vNum) return;
    loadingVerse.current = vNum;

    const a = audioEl.current;
    if(!a || !sNum || !vNum) return;

    activeVerse.current  = vNum;
    isPlayingRef.current = true;
    onVerseChange?.(vNum);

    setLoading(true); setBuffering(false);
    setProgress(0); setCurTime(0); setDuration(0);

    // Change src — browser stops old audio automatically
    a.src = verseUrl(reciterRef.current, sNum, vNum);
    a.load();
    // play triggered inside oncanplay via isPlayingRef

    // ─── PRELOAD next verse ───
    const nextVerse = versesRef.current.find(v=>v.number===vNum+1);
    if(nextVerse){
      if(!preloadEl.current) preloadEl.current = new Audio();
      preloadEl.current.src = verseUrl(reciterRef.current, sNum, nextVerse.number);
      preloadEl.current.preload = 'auto';
      preloadEl.current.load();
    }

    // ─── Auto scroll with smooth highlight ───
    setTimeout(()=>{
      const el = document.getElementById(`v${vNum}`);
      if(el){
        el.scrollIntoView({ behavior:'smooth', block:'center' });
        // Flash animation
        el.classList.add('verse-playing-flash');
        setTimeout(()=>el.classList.remove('verse-playing-flash'), 600);
      }
    }, 150);
  },[]);

  function togglePlay(){
    const a = audioEl.current;
    if(!activeVerse.current){
      const first = versesRef.current[0]?.number;
      if(first && surahNum) loadVerse(surahNum, first);
      return;
    }
    if(isPlaying){
      a.pause();
    } else {
      isPlayingRef.current=true;
      a.play().catch(()=>{ isPlayingRef.current=false; setIsPlaying(false); });
    }
  }

  function prev(){
    const cur = activeVerse.current||1;
    if(cur>1 && surahNum) loadVerse(surahNum, cur-1);
  }

  function next(){
    const cur = activeVerse.current||0;
    const nxt = versesRef.current.find(v=>v.number===cur+1);
    if(nxt && surahNum) loadVerse(surahNum, nxt.number);
  }

  function seek(e){
    const a = audioEl.current;
    if(!a||!a.duration) return;
    const r   = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0,Math.min(1,(e.clientX-r.left)/r.width));
    a.currentTime = pct*a.duration;
  }

  function changeReciter(val){
    reciterRef.current=val; setReciter(val);
    if(activeVerse.current && surahNum) setTimeout(()=>loadVerse(surahNum,activeVerse.current),50);
  }

  function fmt(t){
    if(!t||isNaN(t)) return '0:00';
    return `${Math.floor(t/60)}:${Math.floor(t%60).toString().padStart(2,'0')}`;
  }

  if(!surahNum) return null;

  return (
    <>
      <audio ref={audioEl} style={{display:'none'}} preload="auto"/>

      <div className={`${styles.player} ${minimized?styles.minimized:''}`}>
        {/* Progress bar */}
        <div className={styles.progressWrap} onClick={seek}>
          <div className={styles.progressBg}>
            <div className={styles.progressFill} style={{width:`${progress}%`}}>
              <div className={styles.progressDot}/>
            </div>
          </div>
          {buffering && <div className={styles.bufferingBar}/>}
        </div>

        <div className={styles.inner}>
          {/* Info */}
          <div className={styles.info}>
            <div className={styles.surahLabel}>{surahName||'—'}</div>
            <div className={styles.verseLabel}>
              {activeVerse.current
                ? <span className={styles.verseNum}>آية {activeVerse.current}</span>
                : <span className={styles.verseHint}>اضغط ▶ على أي آية</span>}
              {(loading||buffering) && <span className={styles.dot}>◌</span>}
            </div>
            <div className={styles.time}>{fmt(curTime)} / {fmt(duration)}</div>
          </div>

          {/* Controls */}
          <div className={styles.controls}>
            <button className={styles.ctrl} onClick={prev} disabled={!activeVerse.current||activeVerse.current<=1}>⏮</button>
            <button className={styles.mainBtn} onClick={togglePlay}>
              {(loading||buffering) ? <span className={styles.spinner}/> : isPlaying ? '⏸' : '▶'}
            </button>
            <button className={styles.ctrl} onClick={next}>⏭</button>
          </div>

          {/* Options */}
          <div className={styles.opts}>
            <button className={`${styles.opt} ${repeat?styles.optOn:''}`} onClick={()=>setRepeat(v=>!v)} title="تكرار">🔁</button>
            <select className={styles.sel} value={reciter} onChange={e=>changeReciter(e.target.value)}>
              {RECITERS.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
            <button className={styles.minBtn} onClick={()=>setMinimized(v=>!v)}>{minimized?'▲':'▼'}</button>
          </div>
        </div>
      </div>
    </>
  );
}
