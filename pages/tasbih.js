import { useState, useEffect } from 'react';
import Head from 'next/head';
import Navbar from '../components/Navbar';
import styles from '../styles/Tasbih.module.css';

const TASBIHAT = [
  { text: 'سُبْحَانَ اللهِ', meaning: 'سبحان الله', color: '#2d5a3d', target: 33 },
  { text: 'الْحَمْدُ لِلَّهِ', meaning: 'الحمد لله', color: '#b8973a', target: 33 },
  { text: 'اللهُ أَكْبَرُ', meaning: 'الله أكبر', color: '#4A90E2', target: 33 },
  { text: 'لَا إِلَهَ إِلَّا اللهُ', meaning: 'لا إله إلا الله', color: '#8b4513', target: 100 },
  { text: 'أَسْتَغْفِرُ اللهَ', meaning: 'استغفر الله', color: '#6b3a8b', target: 100 },
];

export default function TasbihPage({ toggleDark, dark, showToast, onAuth }) {
  const [active, setActive] = useState(0);
  const [count, setCount] = useState(0);
  const [total, setTotal] = useState(0);
  const [vibrate, setVibrate] = useState(false);

  const current = TASBIHAT[active];
  const pct = Math.min((count / current.target) * 100, 100);
  const done = count >= current.target;

  function tap() {
    if (navigator.vibrate) navigator.vibrate(30);
    setVibrate(true);
    setTimeout(() => setVibrate(false), 150);
    setCount(c => c + 1);
    setTotal(t => t + 1);
    if (count + 1 >= current.target) {
      showToast(`✅ أتممت ${current.target} ${current.meaning}`);
    }
  }

  function reset() {
    setCount(0);
  }

  function selectTasbih(i) {
    setActive(i);
    setCount(0);
  }

  const circ = 2 * Math.PI * 54;
  const offset = circ - (circ * pct / 100);

  return (
    <>
      <Head><title>التسبيح الإلكتروني - القرآن الكريم</title></Head>
      <Navbar toggleDark={toggleDark} dark={dark} showToast={showToast} onAuth={onAuth} />

      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>📿 التسبيح الإلكتروني</h1>
          <div className={styles.totalBadge}>المجموع الكلي: {total}</div>
        </div>

        {/* اختيار التسبيح */}
        <div className={styles.selector}>
          {TASBIHAT.map((t, i) => (
            <button key={i}
              className={`${styles.selBtn} ${active === i ? styles.selActive : ''}`}
              style={active === i ? { borderColor: t.color, color: t.color } : {}}
              onClick={() => selectTasbih(i)}>
              {t.meaning}
            </button>
          ))}
        </div>

        {/* الدائرة الرئيسية */}
        <div className={styles.ringWrap}>
          <svg width="160" height="160" style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
            <circle cx="80" cy="80" r="54" fill="none" stroke="var(--border)" strokeWidth="8"/>
            <circle cx="80" cy="80" r="54" fill="none"
              stroke={current.color} strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset .3s ease' }}/>
          </svg>
          <div className={styles.ringContent}>
            <div className={styles.ringCount} style={{ color: current.color }}>{count}</div>
            <div className={styles.ringTarget}>من {current.target}</div>
          </div>
        </div>

        {/* النص */}
        <div className={styles.tasbihText} style={{ color: current.color }}>
          {current.text}
        </div>

        {/* زر التسبيح */}
        <button
          className={`${styles.tapBtn} ${vibrate ? styles.tapBtnActive : ''} ${done ? styles.tapBtnDone : ''}`}
          style={{ '--btn-color': current.color }}
          onClick={tap}>
          {done ? '✅' : '○'}
        </button>

        {/* أزرار التحكم */}
        <div className={styles.controls}>
          <button className={styles.resetBtn} onClick={reset}>🔄 إعادة</button>
          <button className={styles.nextBtn}
            onClick={() => selectTasbih((active + 1) % TASBIHAT.length)}>
            التالي →
          </button>
        </div>

        {/* إحصائيات */}
        <div className={styles.stats}>
          {TASBIHAT.map((t, i) => (
            <div key={i} className={styles.statItem}
              style={active === i ? { borderColor: t.color } : {}}>
              <div className={styles.statText}>{t.meaning}</div>
              <div className={styles.statCount} style={active === i ? { color: t.color } : {}}>
                {active === i ? count : 0}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
