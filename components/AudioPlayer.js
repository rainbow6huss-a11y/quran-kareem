import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import styles from './AudioPlayer.module.css';

const RECITERS = [
  { name: 'مشاري العفاسي', id: 'ar.alafasy' },
  { name: 'عبدالرحمن السديس', id: 'ar.abdurrahmaansudais' },
  { name: 'محمود خليل الحصري', id: 'ar.husary' },
  { name: 'محمد صديق المنشاوي', id: 'ar.minshawi' },
];

const SURAH_START = [];
const AYAH_COUNTS = [7,286,200,176,120,165,206,75,129,109,123,111,43,52,99,128,111,110,98,135,112,78,118,64,77,227,93,88,69,60,34,30,73,54,45,83,182,88,75,85,54,53,89,59,37,35,38,29,18,45,60,49,62,55,78,96,29,22,24,13,14,11,29,15,52,60,22,6,73,52,28,44,28,56,40,31,54,31,46,38,23,18,8,17,16,11,12,3,18,12,12,30,7,6,6,8,3,5,4,5,8,4,7,3,6,3,5,4,5,6,1,5,4,6,1,3,6,6,3,5,12,5,8,9,5,6,5,9,6,3,5,4,3,3,3,3,4,3,1,4,6,5,8,3,3,6,4];
(function() { let c = 1; for (let i = 0; i < 114; i++) { SURAH_START[i] = c; c += AYAH_COUNTS[i]; } })();
function globalAyah(surah, verse) { return SURAH_START[surah - 1] + (verse - 1); }

export default function AudioPlayer({ surahNum, surahName, verses, currentVerse, onVerseChange }) {
  const [playing, setPlaying] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [reciter, setReciter] = useState('ar.alafasy');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrent] = useState(0);
  const [minimized, setMinimized] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    return () => { if (audioRef.current) audioRef.current.pause(); };
  }, []);

  useEffect(() => {
    if (currentVerse && playing) {
      playVerse(currentVerse);
    }
  }, [currentVerse]);

  function playVerse(vNum) {
    if (!surahNum || !vNum) return;
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }

    const g = globalAyah(surahNum, vNum);
    const url = `https://cdn.islamic.network/quran/audio/128/${reciter}/${g}.mp3`;
    const audio = new Audio(url);
    audioRef.current = audio;
    setLoading(true);
    setPlaying(true);

    audio.addEventListener('canplay', () => setLoading(false));
    audio.addEventListener('timeupdate', () => {
      setCurrent(audio.currentTime);
      setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0);
    });
    audio.addEventListener('loadedmetadata', () => setDuration(audio.duration));
    audio.addEventListener('ended', () => {
      if (repeat) {
        audio.currentTime = 0;
        audio.play();
      } else {
        // تشغيل الآية التالية
        const nextVerse = verses?.find(v => v.number === vNum + 1);
        if (nextVerse) {
          onVerseChange?.(nextVerse.number);
          setTimeout(() => playVerse(nextVerse.number), 300);
        } else {
          setPlaying(false);
          setProgress(0);
        }
      }
    });
    audio.play().catch(() => setLoading(false));

    // Auto scroll للآية
    setTimeout(() => {
      const el = document.getElementById(`v${vNum}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  }

  function togglePlay() {
    if (!currentVerse) return;
    if (playing) {
      audioRef.current?.pause();
      setPlaying(false);
    } else {
      if (audioRef.current?.paused) {
        audioRef.current.play();
        setPlaying(true);
      } else {
        playVerse(currentVerse);
      }
    }
  }

  function prevVerse() {
    if (!currentVerse || currentVerse <= 1) return;
    const prev = currentVerse - 1;
    onVerseChange?.(prev);
    playVerse(prev);
  }

  function nextVerse() {
    if (!currentVerse) return;
    const next = currentVerse + 1;
    const exists = verses?.find(v => v.number === next);
    if (exists) { onVerseChange?.(next); playVerse(next); }
  }

  function seek(e) {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = x / rect.width;
    audioRef.current.currentTime = pct * duration;
  }

  function formatTime(t) {
    if (!t || isNaN(t)) return '0:00';
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  if (!surahNum) return null;

  return (
    <div className={`${styles.player} ${minimized ? styles.minimized : ''}`}>
      {/* Progress bar */}
      <div className={styles.progressBar} onClick={seek}>
        <div className={styles.progressFill} style={{ width: `${progress}%` }} />
      </div>

      <div className={styles.inner}>
        {/* Info */}
        <div className={styles.info}>
          <div className={styles.surahInfo}>{surahName}</div>
          <div className={styles.verseInfo}>
            {currentVerse ? `آية ${currentVerse}` : 'اختر آية'}
            {loading && <span className={styles.loadingDot}>...</span>}
          </div>
        </div>

        {/* Controls */}
        <div className={styles.controls}>
          <button className={styles.ctrlBtn} onClick={prevVerse} title="الآية السابقة">⏮</button>
          <button className={`${styles.playBtn} ${loading ? styles.loadingBtn : ''}`} onClick={togglePlay}>
            {loading ? '⌛' : playing ? '⏸' : '▶'}
          </button>
          <button className={styles.ctrlBtn} onClick={nextVerse} title="الآية التالية">⏭</button>
        </div>

        {/* Options */}
        <div className={styles.options}>
          <span className={styles.timeText}>{formatTime(currentTime)}</span>
          <button
            className={`${styles.repeatBtn} ${repeat ? styles.repeatActive : ''}`}
            onClick={() => setRepeat(v => !v)}
            title="تكرار الآية">
            🔁
          </button>
          <select className={styles.reciterSelect} value={reciter}
            onChange={e => { setReciter(e.target.value); if (playing && currentVerse) setTimeout(() => playVerse(currentVerse), 100); }}>
            {RECITERS.map(r => <option key={r.id} value={r.id}>{r.name.split(' ')[0]}</option>)}
          </select>
          <button className={styles.minimizeBtn} onClick={() => setMinimized(v => !v)}>
            {minimized ? '▲' : '▼'}
          </button>
        </div>
      </div>
    </div>
  );
}
