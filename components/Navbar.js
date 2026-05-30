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
    { href: '/',             label: '📖 القرآن' },
    { href: '/search',       label: '🔍 بحث' },
    { href: '/juz',          label: '🗂 الأجزاء' },
    { href: '/khatma',       label: '🌙 الختمة' },
    { href: '/bookmarks',    label: '🔖 علاماتي' },
    { href: '/achievements', label: '🏆 إنجازاتي' },
    { href: '/athkar',       label: '📿 الأذكار' },
    { href: '/tasbih',       label: '🔵 التسبيح' },
    { href: '/contact',      label: '✉️ تواصل' },
    { href: '/hadya',        label: '🤲 إهداء' },
  ];

  // روابط تظهر على الجوال مباشرة في الشريط
  const mobileQuickLinks = [
    { href: '/',       label: '📖' },
    { href: '/search', label: '🔍' },
    { href: '/khatma', label: '🌙' },
    { href: '/athkar', label: '📿' },
  ];

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        {/* الشعار */}
        <Link href="/" className={styles.logo}>
          <svg width="34" height="34" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg" className={styles.logoSvg}>
            <rect width="36" height="36" rx="8" fill="#0a1a10"/>
            <ellipse cx="19" cy="18" rx="13" ry="12" fill="none" stroke="#4A90E2" strokeWidth="0.7" opacity="0.45"/>
            <ellipse cx="16" cy="17" rx="10" ry="9.5" fill="none" stroke="#D4AF37" strokeWidth="1" opacity="0.7"/>
            <circle cx="18" cy="18" r="8" fill="#D4AF37" opacity="0.08"/>
            <circle cx="18" cy="18" r="6" fill="#ffe066" opacity="0.18"/>
            <circle cx="18" cy="18" r="4" fill="#fff8d0" opacity="0.35"/>
            <circle cx="18" cy="18" r="5" fill="none" stroke="#D4AF37" strokeWidth="1.2" opacity="0.9"/>
            <path d="M15 16.5 Q18 12.5 21 16.5" fill="none" stroke="#D4AF37" strokeWidth="1.7" strokeLinecap="round"/>
            <circle cx="16.5" cy="20" r="1.2" fill="#D4AF37"/>
            <circle cx="19.5" cy="20" r="1.2" fill="#D4AF37"/>
            <circle cx="18" cy="17" r="0.8" fill="#fff" opacity="0.95"/>
          </svg>
          <div className={styles.logoDivider}/>
          <div className={styles.logoTexts}>
            <span className={styles.logoMain}>القرآن الكريم</span>
            <span className={styles.logoSub}>نُورٌ عَلَى نُور</span>
          </div>
        </Link>

        {/* روابط Desktop */}
        <div className={styles.links}>
          {links.map(l => (
            <Link key={l.href} href={l.href}
              className={`${styles.link} ${router.pathname === l.href || (l.href !== '/' && router.pathname.startsWith(l.href)) ? styles.active : ''}`}>
              {l.label}
            </Link>
          ))}
        </div>

        {/* روابط سريعة Mobile */}
        <div className={styles.mobileQuick}>
          {mobileQuickLinks.map(l => (
            <Link key={l.href} href={l.href}
              className={`${styles.mobileQuickBtn} ${router.pathname === l.href ? styles.mobileQuickActive : ''}`}>
              {l.label}
            </Link>
          ))}
        </div>

        {/* تحكم */}
        <div className={styles.controls}>
          <Auth onAuth={onAuth} showToast={showToast} />
          <button className={styles.ctrl} onClick={toggleDark}>{dark ? '☀️' : '🌙'}</button>
          <button className={`${styles.ctrl} ${styles.shareBtn}`} onClick={shareSite}>📤</button>
          <button className={`${styles.ctrl} ${styles.menuBtn} ${menuOpen ? styles.ctrlActive : ''}`}
            onClick={() => setMenuOpen(v => !v)}>☰</button>
        </div>
      </div>

      {/* القائمة المنسدلة */}
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
