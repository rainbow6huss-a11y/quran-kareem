import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from './BottomNav.module.css';

const NAV_ITEMS = [
  { href: '/',       icon: '📖', label: 'القرآن' },
  { href: '/search', icon: '🔍', label: 'بحث' },
  { href: '/khatma', icon: '🌙', label: 'الختمة' },
  { href: '/athkar', icon: '📿', label: 'الأذكار' },
  { href: '/tasbih', icon: '🔵', label: 'التسبيح' },
];

export default function BottomNav() {
  const router = useRouter();
  // فقط على الجوال وليس على صفحات السورة
  const hiddenPaths = ['/surah/'];
  const shouldHide = hiddenPaths.some(p => router.pathname.startsWith(p));
  if (shouldHide) return null;

  return (
    <nav className={styles.nav}>
      {NAV_ITEMS.map(item => {
        const active = router.pathname === item.href ||
          (item.href !== '/' && router.pathname.startsWith(item.href));
        return (
          <Link key={item.href} href={item.href}
            className={`${styles.item} ${active ? styles.active : ''}`}>
            <span className={styles.icon}>{item.icon}</span>
            <span className={styles.label}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
