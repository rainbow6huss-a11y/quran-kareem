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
    { href: '/hadya', label: '🤲 إهداء' },
  ];

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          <div className={styles.logoIcon}>
            <svg viewBox="0 0 36 36" width="36" height="36" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <radialGradient id="ncg" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95"/>
                  <stop offset="35%" stopColor="#ffe066" stopOpacity="0.7"/>
                  <stop offset="100%" stopColor="#D4AF37" stopOpacity="0"/>
                </radialGradient>
              </defs>
              <rect width="36" height="36" rx="8" fill="#0a1a10"/>
              <ellipse cx="19" cy="18" rx="13" ry="12" fill="none" stroke="#4A90E2" strokeWidth="0.7" opacity="0.45"/>
              <ellipse cx="16" cy="17" rx="10" ry="9.5" fill="none" stroke="#D4AF37" strokeWidth="1" opacity="0.7"/>
              <circle cx="18" cy="18" r="8" fill="url(#ncg)"/>
              <circle cx="18" cy="18" r="5" fill="none" stroke="#D4AF37" strokeWidth="1.2" opacity="0.9"/>
              <path d="M15 16.5 Q18 12.5 21 16.5" fill="none" stroke="#D4AF37" strokeWidth="1.6" strokeLinecap="round"/>
              <circle cx="16.5" cy="20" r="1.1" fill="#D4AF37" opacity="0.95"/>
              <circle cx="19.5" cy="20" r="1.1" fill="#D4AF37" opacity="0.95"/>
              <circle cx="18" cy="17" r="0.7" fill="#fff" opacity="0.95"/>
              <line x1="7" y1="7" x2="10" y2="7" stroke="#fff" strokeWidth="0.7" opacity="0.4"/>
              <line x1="8.5" y1="5.5" x2="8.5" y2="8.5" stroke="#fff" strokeWidth="0.7" opacity="0.4"/>
            </svg>
          </div>
          <div className={styles.logoDivider}/>
          <div className={styles.logoText}>
            <span className={styles.logoAr}>القرآن الكريم</span>
            <span className={styles.logoSub}>نُورٌ عَلَى نُور</span>
          </div>
        </Link>
        <div className={styles.links}>
          {links.map(l => (
            <Link key={l.href} href={l.href}
              className={`${styles.link} ${router.pathname === l.href || (l.href !== '/' && router.pathname.startsWith(l.href)) ? styles.active : ''}`}>
              {l.label}
            </Link>
          ))}
        </div>
        <div className={styles.controls}>
          <Auth onAuth={onAuth} showToast={showToast} />
          <button className={styles.ctrl} onClick={toggleDark}>{dark ? '☀️' : '🌙'}</button>
          <button className={styles.ctrl} onClick={shareSite}>📤</button>
          <button className={styles.ctrl} onClick={() => setMenuOpen(v => !v)} id="menuToggle">☰</button>
        </div>
      </div>
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
