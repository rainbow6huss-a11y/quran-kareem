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
(function() { let c = 1; for (let i = 0; i < 114; i++) { SURAH_START[i] = c; c += AYAH_COUNTS[i]; } })();
function globalAyah(surah, verse) { return SURAH_START[surah - 1] + (verse - 1); }

export default function AudioPlayer({ surahNum, surahName, verses, playingVerse, onVerseChange }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [reciter, setReciter] = useState('ar.alafasy');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [minimized, setMinimized] = useState(false);

  // مرجع واحد فقط للـ Audio
  const audioRef = useRef(null);
  const activeVerseRef = useRef(null);
  const shouldPlayRef = useRef(false); // هل يجب التشغيل؟
  const reciterRef = useRef('ar.alafasy');
  const repeatRef = useRef(false);
  const versesRef = useRef([]);

  useEffect(() => { reciterRef.current = reciter; }, [reciter]);
  useEffect(() => { repeatRef.current = repeat; }, [repeat]);
  useEffect(() => { versesRef.current = verses || []; }, [verses]);

  // تنظيف عند تغيير السورة
  useEffect(() => {
    hardStop();
  }, [surahNum]);

  // عند تغيير الآية من الخارج (ضغط ▶)
  useEffect(() => {
    if (playingVerse && playingVerse !== activeVerseRef.current) {
      loadAndPlay(playingVerse);
    }
  }, [playingVerse]);

  function hardStop() {
    shouldPlayRef.current = false;
    if (audioRef.current) {
      audioRef.current.onended = null;
      audioRef.current.ontimeupdate = null;
      audioRef.current.oncanplay = null;
      audioRef.current.onerror = null;
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current.load();
      audioRef.current = null;
    }
    activeVerseRef.current = null;
    setIsPlaying(false);
    setLoading(false);
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);
  }

  const loadAndPlay = useCallback((vNum) => {
    if (!surahNum || !vNum) return;

    // إيقاف القديم تماماً
    hardStop();

    activeVerseRef.current = vNum;
    shouldPlayRef.current = true;
    onVerseChange?.(vNum);
    setIsPlaying(true);
    setLoading(true);
    setProgress(0);
    setCurrentTime(0);

    const g = globalAyah(surahNum, vNum);
    const url = `https://cdn.islamic.network/quran/audio/128/${reciterRef.current}/${g}.mp3`;

    const audio = new Audio();
    audioRef.current = audio;

    audio.oncanplay = () => {
      if (!shouldPlayRef.current || audioRef.current !== audio) return;
      setLoading(false);
      audio.play().catch(() => {
        setIsPlaying(false);
        setLoading(false);
      });
    };

    audio.ontimeupdate = () => {
      if (audioRef.current !== audio) return;
      setCurrentTime(audio.currentTime);
      if (audio.duration) setProgress((audio.currentTime / audio.duration) * 100);
    };

    audio.onloadedmetadata = () => {
      setDuration(audio.duration);
    };

    audio.onended = () => {
      if (audioRef.current !== audio) return;
      if (repeatRef.current) {
        audio.currentTime = 0;
        audio.play();
        return;
      }
      // الآية التالية
      const next = versesRef.current.find(v => v.number === vNum + 1);
      if (next && shouldPlayRef.current) {
        setTimeout(() => {
          if (shouldPlayRef.current) loadAndPlay(next.number);
        }, 400);
      } else {
        hardStop();
        onVerseChange?.(null);
      }
    };

    audio.onerror = () => {
      if (audioRef.current !== audio) return;
      setLoading(false);
      setIsPlaying(false);
    };

    audio.src = url;
    audio.load();

    // Auto scroll
    setTimeout(() => {
      const el = document.getElementById(`v${vNum}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  }, [surahNum]);

  function togglePlay() {
    if (!audioRef.current || !activeVerseRef.current) {
      // ابدأ من أول آية
      const first = versesRef.current[0]?.number;
      if (first) loadAndPlay(first);
      return;
    }
    if (isPlaying) {
      // إيقاف مؤقت — لا تمسح الـ audio
      shouldPlayRef.current = false;
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      // استكمال
      shouldPlayRef.current = true;
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }

  function prevVerse() {
    const cur = activeVerseRef.current || 1;
    if (cur <= 1) return;
    loadAndPlay(cur - 1);
  }

  function nextVerse() {
    const cur = activeVerseRef.current || 0;
    const next = versesRef.current.find(v => v.number === cur + 1);
    if (next) loadAndPlay(next.number);
  }

  function seek(e) {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audioRef.current.currentTime = pct * duration;
  }

  function changeReciter(val) {
    setReciter(val);
    reciterRef.current = val;
    if (isPlaying && activeVerseRef.current) {
      setTimeout(() => loadAndPlay(activeVerseRef.current), 50);
    }
  }

  function formatTime(t) {
    if (!t || isNaN(t)) return '0:00';
    return `${Math.floor(t/60)}:${Math.floor(t%60).toString().padStart(2,'0')}`;
  }

  if (!surahNum) return null;

  return (
    <div className={`${styles.player} ${minimized ? styles.minimized : ''}`}>
      <div className={styles.progressWrap} onClick={seek}>
        <div className={styles.progressBg}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }}>
            <div className={styles.progressDot} />
          </div>
        </div>
      </div>

      <div className={styles.inner}>
        <div className={styles.info}>
          <div className={styles.surahLabel}>{surahName || '—'}</div>
          <div className={styles.verseLabel}>
            {activeVerseRef.current
              ? <span className={styles.verseNum}>آية {activeVerseRef.current}</span>
              : <span className={styles.verseHint}>اضغط ▶ على أي آية</span>}
            {loading && <span className={styles.loadingAnim}>◌</span>}
          </div>
          <div className={styles.timeDisplay}>
            <span>{formatTime(currentTime)}</span>
            <span className={styles.timeSep}>/</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className={styles.controls}>
          <button className={styles.ctrlBtn} onClick={prevVerse}>⏮</button>
          <button className={styles.mainPlayBtn} onClick={togglePlay}>
            {loading ? <span className={styles.spinner} /> : isPlaying ? '⏸' : '▶'}
          </button>
          <button className={styles.ctrlBtn} onClick={nextVerse}>⏭</button>
        </div>

        <div className={styles.options}>
          <button className={`${styles.optBtn} ${repeat ? styles.optActive : ''}`}
            onClick={() => setRepeat(v => !v)} title="تكرار">🔁</button>
          <select className={styles.reciterSel} value={reciter} onChange={e => changeReciter(e.target.value)}>
            {RECITERS.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
          <button className={styles.minBtn} onClick={() => setMinimized(v => !v)}>
            {minimized ? '▲' : '▼'}
          </button>
        </div>
      </div>
    </div>
  );
}
