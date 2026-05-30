import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const NAV_ITEMS = [
  { href: '/',        label: 'القرآن',  icon: '📖' },
  { href: '/search',  label: 'بحث',    icon: '🔍' },
  { href: '/khatma',  label: 'الختمة', icon: '🌙' },
  { href: '/athkar',  label: 'الأذكار',icon: '📿' },
  { href: '/tasbih',  label: 'تسبيح',  icon: '🔵' },
];

export default function BottomNav() {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth <= 768);
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isMobile) return null;
  if (router.pathname.startsWith('/surah/')) return null;

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0, left: 0, right: 0,
      height: '56px',
      background: 'var(--parchment, #faf6ef)',
      borderTop: '1px solid rgba(184,151,58,.2)',
      zIndex: 997,
      display: 'flex',
      alignItems: 'stretch',
      boxShadow: '0 -2px 10px rgba(0,0,0,.08)',
    }}>
      {NAV_ITEMS.map(item => {
        const active = router.pathname === item.href ||
          (item.href !== '/' && router.pathname.startsWith(item.href));
        return (
          <Link key={item.href} href={item.href} style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2px',
            textDecoration: 'none',
            background: active ? 'rgba(45,90,61,.1)' : 'transparent',
          }}>
            <span style={{ fontSize: '1.25rem', lineHeight: '1.2' }}>{item.icon}</span>
            <span style={{
              fontFamily: 'Tajawal, sans-serif',
              fontSize: '10px',
              color: active ? '#2d5a3d' : '#8b6340',
              fontWeight: active ? 700 : 500,
            }}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
