import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import Auth from './Auth';
import styles from './Navbar.module.css';

export default function Navbar({ toggleDark, dark, showToast, onAuth }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  function shareSite() {
    const url = window.location.origin;
    if (navigator.share) navigator.share({ title: 'القرآن الكريم', url });
    else { navigator.clipboard.writeText(url); showToast('📋 تم نسخ الرابط'); }
  }

  const links = [
    { href: '/', label: '📖 القرآن' },
    { href: '/search', label: '🔍 بحث' },
    { href: '/juz', label: '🗂 الأجزاء' },
    { href: '/khatma', label: '🌙 الختمة' },
    { href: '/bookmarks', label: '🔖 علاماتي' },
    { href: '/athkar', label: '📿 الأذكار' },
    { href: '/tasbih', label: '🔵 التسبيح' },
    { href: '/hadya', label: '🤲 إهداء' },
  ];

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>

        {/* ── الشعار ── */}
        <Link href="/" className={styles.logo}>
          {/* أيقونة SVG مضمّنة */}
          <svg width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg" className={styles.logoSvg}>
            <rect width="36" height="36" rx="8" fill="#0a1a10"/>
            <ellipse cx="19" cy="18" rx="13" ry="12" fill="none" stroke="#4A90E2" strokeWidth="0.7" opacity="0.45"/>
            <ellipse cx="16" cy="17" rx="10" ry="9.5" fill="none" stroke="#D4AF37" strokeWidth="1" opacity="0.7"/>
            {/* وهج مركزي */}
            <circle cx="18" cy="18" r="8" fill="#D4AF37" opacity="0.08"/>
            <circle cx="18" cy="18" r="6" fill="#ffe066" opacity="0.18"/>
            <circle cx="18" cy="18" r="4" fill="#fff8d0" opacity="0.35"/>
            {/* حلقة داخلية */}
            <circle cx="18" cy="18" r="5" fill="none" stroke="#D4AF37" strokeWidth="1.2" opacity="0.9"/>
            {/* حرف ن */}
            <path d="M15 16.5 Q18 12.5 21 16.5" fill="none" stroke="#D4AF37" strokeWidth="1.7" strokeLinecap="round"/>
            <circle cx="16.5" cy="20" r="1.2" fill="#D4AF37"/>
            <circle cx="19.5" cy="20" r="1.2" fill="#D4AF37"/>
            {/* نقطة بيضاء مركزية */}
            <circle cx="18" cy="17" r="0.8" fill="#fff" opacity="0.95"/>
            {/* وميض */}
            <line x1="7" y1="7" x2="10" y2="7" stroke="#fff" strokeWidth="0.8" opacity="0.45"/>
            <line x1="8.5" y1="5.5" x2="8.5" y2="8.5" stroke="#fff" strokeWidth="0.8" opacity="0.45"/>
            {/* نقطة ذهبية */}
            <circle cx="14" cy="9" r="1.2" fill="#D4AF37" opacity="0.65"/>
            <circle cx="26" cy="12" r="1" fill="#4A90E2" opacity="0.6"/>
          </svg>

          {/* فاصل رأسي */}
          <div className={styles.logoDivider} />

          {/* النصوص */}
          <div className={styles.logoTexts}>
            <span className={styles.logoMain}>القرآن الكريم</span>
            <span className={styles.logoSub}>نُورٌ عَلَى نُور</span>
          </div>
        </Link>

        {/* ── روابط ── */}
        <div className={styles.links}>
          {links.map(l => (
            <Link key={l.href} href={l.href}
              className={`${styles.link} ${router.pathname === l.href || (l.href !== '/' && router.pathname.startsWith(l.href)) ? styles.active : ''}`}>
              {l.label}
            </Link>
          ))}
        </div>

        {/* ── تحكم ── */}
        <div className={styles.controls}>
          <Auth onAuth={onAuth} showToast={showToast} />
          <button className={styles.ctrl} onClick={toggleDark}>{dark ? '☀️' : '🌙'}</button>
          <button className={styles.ctrl} onClick={shareSite}>📤</button>
          <button className={styles.ctrl} onClick={() => setMenuOpen(v => !v)}>☰</button>
        </div>
      </div>

      {/* ── موبايل ── */}
      {menuOpen && (
        <div className={styles.mobileMenu}>
          {links.map(l => (
            <Link key={l.href} href={l.href}
              className={`${styles.mobileLink} ${router.pathname === l.href ? styles.mobileActive : ''}`}
              onClick={() => setMenuOpen(false)}>
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
