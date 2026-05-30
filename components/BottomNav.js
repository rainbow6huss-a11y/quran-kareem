import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from './BottomNav.module.css';

const NAV_ITEMS = [
  {
    href: '/',
    label: 'القرآن',
    icon: (active) => (
      <svg viewBox="0 0 24 24" width="22" height="22" fill={active ? '#2d5a3d' : '#8b6340'}>
        <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/>
      </svg>
    )
  },
  {
    href: '/search',
    label: 'بحث',
    icon: (active) => (
      <svg viewBox="0 0 24 24" width="22" height="22" fill={active ? '#2d5a3d' : '#8b6340'}>
        <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
      </svg>
    )
  },
  {
    href: '/khatma',
    label: 'الختمة',
    icon: (active) => (
      <svg viewBox="0 0 24 24" width="22" height="22" fill={active ? '#2d5a3d' : '#8b6340'}>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
      </svg>
    )
  },
  {
    href: '/athkar',
    label: 'الأذكار',
    icon: (active) => (
      <svg viewBox="0 0 24 24" width="22" height="22" fill={active ? '#2d5a3d' : '#8b6340'}>
        <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
      </svg>
    )
  },
  {
    href: '/tasbih',
    label: 'التسبيح',
    icon: (active) => (
      <svg viewBox="0 0 24 24" width="22" height="22" fill={active ? '#2d5a3d' : '#8b6340'}>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
      </svg>
    )
  },
];

export default function BottomNav() {
  const router = useRouter();
  const hiddenPaths = ['/surah/'];
  if (hiddenPaths.some(p => router.pathname.startsWith(p))) return null;

  return (
    <nav className={styles.nav}>
      {NAV_ITEMS.map(item => {
        const active = router.pathname === item.href ||
          (item.href !== '/' && router.pathname.startsWith(item.href));
        return (
          <Link key={item.href} href={item.href}
            className={`${styles.item} ${active ? styles.active : ''}`}>
            <span className={styles.icon}>{item.icon(active)}</span>
            <span className={styles.label}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
