import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './AudioPlayer.module.css';

const RECITERS = [
  { name: 'مشاري العفاسي', id: 'ar.alafasy' },
  { name: 'عبدالرحمن السديس', id: 'ar.abdurrahmaansudais' },
  { name: 'محمود الحصري', id: 'ar.husary' },
  { name: 'المنشاوي', id: 'ar.minshawi' },
];

const SURAH_START = [];
const AYAH_COUNTS = [7,286,200,176,120,165,206,75,129,109,123,111,43,52,99,128,111,110,98,135,112,78,118,64,77,227,93,88,69,60,34,30,73,54,45,83,182,88,75,85,54,53,89,59,37,35,38,29,18,45,60,49,62,55,78,96,29,22,24,13,14,11,29,15,52,60,22,6,73,52,28,44,28,56,40,31,54,31,46,38,23,18,8,17,16,11,12,3,18,12,12,30,7,6,6,8,3,5,4,5,8,4,7,3,6,3,5,4,5,6,1,5,4,6,1,3,6,6,3,5,12,5,8,9,5,6,5,9,6,3,5,4,3,3,3,3,4,3,1,4,6,5,8,3,3,6,4];
(function(){ let c=1; for(let i=0;i<114;i++){SURAH_START[i]=c; c+=AYAH_COUNTS[i];} })();
function globalAyah(s,v){ return SURAH_START[s-1]+(v-1); }

export default function AudioPlayer({ surahNum, surahName, verses, playingVerse, onVerseChange }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [repeat, setRepeat]       = useState(false);
  const [reciter, setReciter]     = useState('ar.alafasy');
  const [loading, setLoading]     = useState(false);
  const [progress, setProgress]   = useState(0);
  const [currentTime, setCT]      = useState(0);
  const [duration, setDur]        = useState(0);
  const [minimized, setMin]       = useState(false);

  // ─── single <audio> element in DOM ───
  const audioEl = useRef(null);

  // ─── refs so callbacks always read fresh values ───
  const activeVerse = useRef(null);
  const repeatRef   = useRef(false);
  const reciterRef  = useRef('ar.alafasy');
  const versesRef   = useRef([]);
  const playing     = useRef(false); // shadow of isPlaying for callbacks

  useEffect(()=>{ repeatRef.current  = repeat;  }, [repeat]);
  useEffect(()=>{ reciterRef.current = reciter; }, [reciter]);
  useEffect(()=>{ versesRef.current  = verses||[]; }, [verses]);

  // ─── wire up the single audio element once ───
  useEffect(()=>{
    const a = audioEl.current;
    if(!a) return;

    a.oncanplay = ()=>{
      setLoading(false);
      if(playing.current) a.play().catch(()=>{});
    };
    a.ontimeupdate = ()=>{
      setCT(a.currentTime);
      if(a.duration) setProgress((a.currentTime/a.duration)*100);
    };
    a.onloadedmetadata = ()=>{ setDur(a.duration); };
    a.onwaiting  = ()=>{ setLoading(true);  };
    a.onplaying  = ()=>{ setLoading(false); setIsPlaying(true); playing.current=true; };
    a.onpause    = ()=>{ setIsPlaying(false); playing.current=false; };
    a.onerror    = ()=>{ setLoading(false);  setIsPlaying(false); playing.current=false; };

    // انتهاء الآية → التالية أو تكرار
    a.onended = ()=>{
      if(repeatRef.current){
        a.currentTime=0; a.play(); return;
      }
      const cur = activeVerse.current;
      const next = versesRef.current.find(v=>v.number===cur+1);
      if(next){ loadVerse(next.number); }
      else    { stop(); onVerseChange?.(null); }
    };

    return ()=>{
      a.oncanplay=a.ontimeupdate=a.onloadedmetadata=null;
      a.onwaiting=a.onplaying=a.onpause=a.onerror=a.onended=null;
    };
  }, []);

  // ─── reset on surah change ───
  useEffect(()=>{ stop(); }, [surahNum]);

  // ─── play when external verse changes ───
  useEffect(()=>{
    if(playingVerse && playingVerse !== activeVerse.current){
      loadVerse(playingVerse);
    }
  }, [playingVerse]);

  // ─── core: load a verse into the audio element ───
  const loadVerse = useCallback((vNum)=>{
    const a = audioEl.current;
    if(!a || !surahNum || !vNum) return;

    activeVerse.current = vNum;
    playing.current     = true;
    onVerseChange?.(vNum);

    setLoading(true);
    setProgress(0); setCT(0); setDur(0);

    const g   = globalAyah(surahNum, vNum);
    const url = `https://cdn.islamic.network/quran/audio/128/${reciterRef.current}/${g}.mp3`;

    // change src → browser stops old audio automatically
    a.src = url;
    a.load();
    // play() triggered inside oncanplay via playing.current flag

    // auto-scroll
    setTimeout(()=>{
      document.getElementById(`v${vNum}`)
        ?.scrollIntoView({ behavior:'smooth', block:'center' });
    }, 250);
  }, [surahNum]);

  function stop(){
    const a = audioEl.current;
    if(a){ a.pause(); a.src=''; a.load(); }
    playing.current     = false;
    activeVerse.current = null;
    setIsPlaying(false); setLoading(false);
    setProgress(0); setCT(0); setDur(0);
  }

  function togglePlay(){
    const a = audioEl.current;
    if(!a) return;

    if(!activeVerse.current){
      // لا توجد آية محددة → ابدأ من الأولى
      const first = versesRef.current[0]?.number;
      if(first) loadVerse(first);
      return;
    }

    if(isPlaying){
      a.pause();
    } else {
      playing.current = true;
      a.play().catch(()=>{ playing.current=false; setIsPlaying(false); });
    }
  }

  function prev(){
    const cur = activeVerse.current || 1;
    if(cur > 1) loadVerse(cur-1);
  }

  function next(){
    const cur  = activeVerse.current || 0;
    const nxt  = versesRef.current.find(v=>v.number===cur+1);
    if(nxt) loadVerse(nxt.number);
  }

  function seek(e){
    const a = audioEl.current;
    if(!a || !a.duration) return;
    const r   = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1,(e.clientX-r.left)/r.width));
    a.currentTime = pct * a.duration;
  }

  function changeReciter(val){
    reciterRef.current = val;
    setReciter(val);
    if(activeVerse.current) setTimeout(()=>loadVerse(activeVerse.current), 50);
  }

  function fmt(t){
    if(!t||isNaN(t)) return '0:00';
    return `${Math.floor(t/60)}:${Math.floor(t%60).toString().padStart(2,'0')}`;
  }

  if(!surahNum) return null;

  return (
    <>
      {/* العنصر الصوتي الوحيد في DOM */}
      <audio ref={audioEl} style={{display:'none'}} preload="auto" />

      <div className={`${styles.player} ${minimized?styles.minimized:''}`}>
        {/* شريط التقدم */}
        <div className={styles.progressWrap} onClick={seek}>
          <div className={styles.progressBg}>
            <div className={styles.progressFill} style={{width:`${progress}%`}}>
              <div className={styles.progressDot}/>
            </div>
          </div>
        </div>

        <div className={styles.inner}>
          {/* معلومات */}
          <div className={styles.info}>
            <div className={styles.surahLabel}>{surahName||'—'}</div>
            <div className={styles.verseLabel}>
              {activeVerse.current
                ? <span className={styles.verseNum}>آية {activeVerse.current}</span>
                : <span className={styles.verseHint}>اضغط ▶ على أي آية</span>}
              {loading && <span className={styles.dot}>◌</span>}
            </div>
            <div className={styles.time}>{fmt(currentTime)} / {fmt(duration)}</div>
          </div>

          {/* تحكم */}
          <div className={styles.controls}>
            <button className={styles.ctrl} onClick={prev}>⏮</button>
            <button className={styles.mainBtn} onClick={togglePlay}>
              {loading ? <span className={styles.spinner}/> : isPlaying ? '⏸' : '▶'}
            </button>
            <button className={styles.ctrl} onClick={next}>⏭</button>
          </div>

          {/* خيارات */}
          <div className={styles.opts}>
            <button
              className={`${styles.opt} ${repeat?styles.optOn:''}`}
              onClick={()=>setRepeat(v=>!v)}
              title="تكرار الآية">🔁</button>
            <select className={styles.sel} value={reciter} onChange={e=>changeReciter(e.target.value)}>
              {RECITERS.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
            <button className={styles.minBtn} onClick={()=>setMin(v=>!v)}>
              {minimized?'▲':'▼'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
