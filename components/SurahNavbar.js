import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from './SurahNavbar.module.css';

/**
 * SurahNavbar — شريط التنقل الخاص بصفحة السورة
 * يشبه النموذج: بحث | اسم السورة (pill) | ☰
 * يظهر فقط في صفحة السورة
 */
export default function SurahNavbar({ surahName, surahNum, toggleDark, dark, showToast, onAuth }) {
  const router = useRouter();

  function handleSearch() {
    router.push('/search');
  }

  function shareSite() {
    const url = window.location.href;
    if (navigator.share) navigator.share({ title: surahName, url });
    else { navigator.clipboard.writeText(url); showToast('📋 تم نسخ الرابط'); }
  }

  return (
    <nav className={`${styles.nav} ${dark ? styles.dark : ''}`}>

      {/* يسار — زر البحث */}
      <button className={styles.iconBtn} onClick={handleSearch} title="بحث">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
      </button>

      {/* وسط — pill اسم السورة + معلومات */}
      <div className={styles.surahPill}>
        <div className={styles.pillName}>
          {surahName || '...'}
        </div>
      </div>

      {/* يمين — زر القائمة */}
      <button className={styles.iconBtn} onClick={() => router.push('/')} title="الرئيسية">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>

    </nav>
  );
}
