import { useEffect, useState } from 'react';
import styles from './SurahBottomBar.module.css';

/**
 * SurahBottomBar — الشريط السفلي لصفحة السورة على الموبايل فقط
 * تجويد / تنقل / ▶ تشغيل / علامة / أعلى
 */
export default function SurahBottomBar({
  dark,
  surahNum,
  surahName,
  showTajweed,
  onToggleTajweed,
  playingVerse,
  onPlayPause,
  isBookmarked,
  onToggleBookmark,
  onScrollTop,
  onPrevSurah,
  onNextSurah,
}) {
  const [isMobile, setIsMobile] = useState(false);
  const [showNav, setShowNav] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  if (!isMobile) return null;

  return (
    <>
      {/* تنقل السور — منبثق */}
      {showNav && (
        <div className={styles.navPopup}>
          <div className={styles.navPopupInner}>
            <button
              className={styles.navPopupBtn}
              onClick={() => { onPrevSurah?.(); setShowNav(false); }}
              disabled={surahNum <= 1}
            >
              ‹ السورة السابقة
            </button>
            <span className={styles.navPopupName}>{surahName}</span>
            <button
              className={styles.navPopupBtn}
              onClick={() => { onNextSurah?.(); setShowNav(false); }}
              disabled={surahNum >= 114}
            >
              السورة التالية ›
            </button>
          </div>
        </div>
      )}

      {/* الشريط السفلي */}
      <div className={`${styles.bar} ${dark ? styles.dark : ''}`}>

        {/* تجويد */}
        <button
          className={`${styles.btn} ${showTajweed ? styles.btnActive : ''}`}
          onClick={onToggleTajweed}
        >
          <span className={styles.btnIcon}>🎨</span>
          <span className={styles.btnLabel}>تجويد</span>
        </button>

        {/* تنقل */}
        <button
          className={`${styles.btn} ${showNav ? styles.btnActive : ''}`}
          onClick={() => setShowNav(v => !v)}
        >
          <span className={styles.btnIcon}>‹ ›</span>
          <span className={styles.btnLabel}>تنقل</span>
        </button>

        {/* زر التشغيل الرئيسي */}
        <button className={styles.playFab} onClick={onPlayPause}>
          <span>{playingVerse ? '⏸' : '▶'}</span>
        </button>

        {/* علامة */}
        <button
          className={`${styles.btn} ${isBookmarked ? styles.btnActive : ''}`}
          onClick={onToggleBookmark}
        >
          <span className={styles.btnIcon}>🔖</span>
          <span className={styles.btnLabel}>علامة</span>
        </button>

        {/* أعلى */}
        <button className={styles.btn} onClick={onScrollTop}>
          <span className={styles.btnIcon}>↑</span>
          <span className={styles.btnLabel}>أعلى</span>
        </button>

      </div>
    </>
  );
}
