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

export default function AudioPlayer({ surahNum, surahName, verses, playingVerse, onVerseChange, onPlayStateChange }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [reciter, setReciter] = useState('ar.alafasy');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [minimized, setMinimized] = useState(false);
  const audioRef = useRef(null);
  const currentVerseRef = useRef(null);

  // تنظيف عند تغيير السورة
  useEffect(() => {
    stopAll();
    return () => stopAll();
  }, [surahNum]);

  function stopAll() {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    setIsPlaying(false);
    setLoading(false);
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);
  }

  // عند الضغط على ▶ في آية من الخارج
  useEffect(() => {
    if (playingVerse && playingVerse !== currentVerseRef.current) {
      startVerse(playingVerse);
    }
  }, [playingVerse]);

  const startVerse = useCallback((vNum) => {
    if (!surahNum || !vNum) return;

    // إيقاف الصوت الحالي
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }

    currentVerseRef.current = vNum;
    onVerseChange?.(vNum);
    setIsPlaying(true);
    setLoading(true);
    setProgress(0);

    const g = globalAyah(surahNum, vNum);
    const url = `https://cdn.islamic.network/quran/audio/128/${reciter}/${g}.mp3`;
    const audio = new Audio(url);
    audioRef.current = audio;

    audio.addEventListener('canplay', () => {
      setLoading(false);
      audio.play().catch(() => {});
    });

    audio.addEventListener('timeupdate', () => {
      if (!audio.duration) return;
      setCurrentTime(audio.currentTime);
      setProgress((audio.currentTime / audio.duration) * 100);
    });

    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration);
    });

    audio.addEventListener('ended', () => {
      if (repeat) {
        // تكرار نفس الآية
        audio.currentTime = 0;
        audio.play();
        return;
      }
      // الانتقال للآية التالية تلقائياً
      const nextVerse = verses?.find(v => v.number === vNum + 1);
      if (nextVerse) {
        setTimeout(() => startVerse(nextVerse.number), 500);
      } else {
        // انتهت السورة
        setIsPlaying(false);
        setProgress(0);
        onVerseChange?.(null);
        onPlayStateChange?.(false);
      }
    });

    audio.addEventListener('error', () => {
      setLoading(false);
      setIsPlaying(false);
    });

    // Auto scroll للآية مع تمييز
    setTimeout(() => {
      const el = document.getElementById(`v${vNum}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 200);

    onPlayStateChange?.(true);
  }, [surahNum, reciter, repeat, verses]);

  function togglePlayPause() {
    if (!audioRef.current) {
      // ابدأ من أول آية أو الآية الحالية
      const startFrom = currentVerseRef.current || verses?.[0]?.number || 1;
      startVerse(startFrom);
      return;
    }
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }

  function prevVerse() {
    const cur = currentVerseRef.current || 1;
    if (cur <= 1) return;
    startVerse(cur - 1);
  }

  function nextVerse() {
    const cur = currentVerseRef.current || 0;
    const next = verses?.find(v => v.number === cur + 1);
    if (next) startVerse(next.number);
  }

  function seek(e) {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = pct * duration;
  }

  function changeReciter(newReciter) {
    setReciter(newReciter);
    if (isPlaying && currentVerseRef.current) {
      setTimeout(() => startVerse(currentVerseRef.current), 100);
    }
  }

  function formatTime(t) {
    if (!t || isNaN(t)) return '0:00';
    return `${Math.floor(t/60)}:${Math.floor(t%60).toString().padStart(2,'0')}`;
  }

  if (!surahNum) return null;

  return (
    <div className={`${styles.player} ${minimized ? styles.minimized : ''}`}>
      {/* شريط التقدم */}
      <div className={styles.progressWrap} onClick={seek}>
        <div className={styles.progressBg}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }}>
            <div className={styles.progressDot} />
          </div>
        </div>
      </div>

      <div className={styles.inner}>
        {/* معلومات الآية */}
        <div className={styles.info}>
          <div className={styles.surahLabel}>{surahName || '—'}</div>
          <div className={styles.verseLabel}>
            {currentVerseRef.current
              ? <span className={styles.verseNum}>آية {currentVerseRef.current}</span>
              : <span className={styles.verseHint}>اضغط ▶ على أي آية</span>
            }
            {loading && <span className={styles.loadingAnim}>◌</span>}
          </div>
          <div className={styles.timeDisplay}>
            <span>{formatTime(currentTime)}</span>
            <span className={styles.timeSep}>/</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* أزرار التحكم */}
        <div className={styles.controls}>
          <button className={styles.ctrlBtn} onClick={prevVerse} disabled={!currentVerseRef.current || currentVerseRef.current <= 1}>⏮</button>

          <button className={styles.mainPlayBtn} onClick={togglePlayPause}>
            {loading
              ? <span className={styles.spinner} />
              : isPlaying ? '⏸' : '▶'
            }
          </button>

          <button className={styles.ctrlBtn} onClick={nextVerse}>⏭</button>
        </div>

        {/* خيارات */}
        <div className={styles.options}>
          <button
            className={`${styles.optBtn} ${repeat ? styles.optActive : ''}`}
            onClick={() => setRepeat(v => !v)}
            title="تكرار الآية">
            🔁
          </button>

          <select
            className={styles.reciterSel}
            value={reciter}
            onChange={e => changeReciter(e.target.value)}>
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
