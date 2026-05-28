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
    if (navigator.share) {
      navigator.share({ title: 'القرآن الكريم', url });
    } else {
      navigator.clipboard.writeText(url);
      showToast('📋 تم نسخ الرابط');
    }
  }

  const links = [
    { href: '/', label: '📖 القرآن' },
    { href: '/juz', label: '🗂 الأجزاء' },
    { href: '/khatma', label: '🌙 الختمة' },
    { href: '/hadya', label: '🤲 إهداء' },
  ];

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoAr}>القرآن الكريم</span>
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
          <button className={styles.ctrl} onClick={toggleDark} title="وضع ليلي">{dark ? '☀️' : '🌙'}</button>
          <button className={styles.ctrl} onClick={shareSite} title="مشاركة">📤</button>
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
