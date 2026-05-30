import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import { supabase } from '../lib/supabase';
import styles from '../styles/Achievements.module.css';

const ACHIEVEMENTS = [
  // قراءة
  { id: 'first_surah',   icon: '📖', title: 'أول سورة',        desc: 'قرأت سورة كاملة لأول مرة',         cat: 'قراءة',    check: (s) => s.surahs >= 1 },
  { id: 'ten_surahs',    icon: '📚', title: 'قارئ نشيط',       desc: 'قرأت 10 سور',                       cat: 'قراءة',    check: (s) => s.surahs >= 10 },
  { id: 'fifty_surahs',  icon: '🌟', title: 'حافظ متميز',      desc: 'قرأت 50 سورة',                      cat: 'قراءة',    check: (s) => s.surahs >= 50 },
  { id: 'all_surahs',    icon: '👑', title: 'ختمة كاملة',      desc: 'أتممت قراءة القرآن كاملاً',         cat: 'قراءة',    check: (s) => s.surahs >= 114 },
  // استماع
  { id: 'first_listen',  icon: '🎧', title: 'مستمع',           desc: 'استمعت لأول آية',                   cat: 'استماع',   check: (s) => s.listened >= 1 },
  { id: 'listen_100',    icon: '🎵', title: 'محب التلاوة',     desc: 'استمعت لـ 100 آية',                 cat: 'استماع',   check: (s) => s.listened >= 100 },
  // ختمة
  { id: 'start_khatma',  icon: '🌙', title: 'بداية الختمة',   desc: 'بدأت ختمتك الأولى',                 cat: 'ختمة',     check: (s) => s.khatmaPct >= 1 },
  { id: 'half_khatma',   icon: '⭐', title: 'نصف الطريق',     desc: 'أكملت نصف الختمة',                  cat: 'ختمة',     check: (s) => s.khatmaPct >= 50 },
  { id: 'full_khatma',   icon: '🏆', title: 'ختمة مباركة',    desc: 'أتممت ختمة القرآن كاملاً',         cat: 'ختمة',     check: (s) => s.khatmaPct >= 100 },
  // streak
  { id: 'streak_3',      icon: '🔥', title: 'ثلاثة أيام',     desc: '3 أيام متتالية من القراءة',         cat: 'مداومة',   check: (s) => s.streak >= 3 },
  { id: 'streak_7',      icon: '💫', title: 'أسبوع كامل',     desc: '7 أيام متتالية من القراءة',         cat: 'مداومة',   check: (s) => s.streak >= 7 },
  { id: 'streak_30',     icon: '🌈', title: 'شهر من الإخلاص', desc: '30 يوماً متتالياً من القراءة',      cat: 'مداومة',   check: (s) => s.streak >= 30 },
  // علامات
  { id: 'first_bm',      icon: '🔖', title: 'أول علامة',      desc: 'حفظت أول آية في علاماتك',           cat: 'علامات',   check: (s) => s.bookmarks >= 1 },
  { id: 'ten_bm',        icon: '📌', title: 'مُعلِّم',        desc: 'حفظت 10 علامات',                    cat: 'علامات',   check: (s) => s.bookmarks >= 10 },
  // تسبيح
  { id: 'tasbih_100',    icon: '📿', title: 'مسبِّح',         desc: 'أكملت 100 تسبيحة',                  cat: 'تسبيح',    check: (s) => s.tasbih >= 100 },
];

export default function AchievementsPage({ toggleDark, dark, showToast, user, onAuth }) {
  const [stats, setStats] = useState({ surahs: 0, listened: 0, khatmaPct: 0, streak: 0, bookmarks: 0, tasbih: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [user]);

  async function loadStats() {
    setLoading(true);
    const newStats = { surahs: 0, listened: 0, khatmaPct: 0, streak: 0, bookmarks: 0, tasbih: 0 };

    // من localStorage
    const khatma = JSON.parse(localStorage.getItem('q_khatma') || '[]');
    newStats.surahs = khatma.length;
    newStats.khatmaPct = Math.round((khatma.length / 114) * 100);

    const khatmaLog = JSON.parse(localStorage.getItem('q_khatma_log') || '[]');
    // حساب streak
    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    let cur = today;
    for (const date of [...khatmaLog].sort((a,b) => b.localeCompare(a))) {
      if (date === cur) { streak++; cur = new Date(new Date(cur) - 86400000).toISOString().split('T')[0]; }
      else break;
    }
    newStats.streak = streak;

    // من Supabase
    if (user) {
      const { data: bm } = await supabase.from('bookmarks').select('id').eq('user_id', user.id);
      newStats.bookmarks = bm?.length || 0;

      const { data: log } = await supabase.from('khatma_log').select('pages_read').eq('user_id', user.id);
      if (log) newStats.listened = log.reduce((s, r) => s + (r.pages_read || 0), 0);
    } else {
      const bm = JSON.parse(localStorage.getItem('q_bookmarks') || '[]');
      newStats.bookmarks = bm.length;
    }

    setStats(newStats);
    setLoading(false);
  }

  const unlocked = ACHIEVEMENTS.filter(a => a.check(stats));
  const locked = ACHIEVEMENTS.filter(a => !a.check(stats));
  const pct = Math.round((unlocked.length / ACHIEVEMENTS.length) * 100);

  const cats = [...new Set(ACHIEVEMENTS.map(a => a.cat))];

  return (
    <>
      <Head><title>إنجازاتي - القرآن الكريم</title></Head>
      <Navbar toggleDark={toggleDark} dark={dark} showToast={showToast} onAuth={onAuth} />

      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>🏆 إنجازاتي</h1>
          <p className={styles.sub}>{unlocked.length} من {ACHIEVEMENTS.length} إنجاز مكتمل</p>
          <div className={styles.progressWrap}>
            <div className={styles.progressBar} style={{ width: `${pct}%` }} />
          </div>
          <div className={styles.pct}>{pct}%</div>
        </div>

        {/* إحصائيات سريعة */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}><div className={styles.statNum}>{stats.surahs}</div><div className={styles.statLabel}>سورة مقروءة</div></div>
          <div className={styles.statCard}><div className={styles.statNum}>{stats.streak}</div><div className={styles.statLabel}>أيام متتالية</div></div>
          <div className={styles.statCard}><div className={styles.statNum}>{stats.bookmarks}</div><div className={styles.statLabel}>علامة محفوظة</div></div>
          <div className={styles.statCard}><div className={styles.statNum}>{stats.khatmaPct}%</div><div className={styles.statLabel}>تقدم الختمة</div></div>
        </div>

        {/* الإنجازات حسب الفئة */}
        {cats.map(cat => (
          <div key={cat} className={styles.section}>
            <h2 className={styles.catTitle}>{cat}</h2>
            <div className={styles.grid}>
              {ACHIEVEMENTS.filter(a => a.cat === cat).map(a => {
                const done = a.check(stats);
                return (
                  <div key={a.id} className={`${styles.card} ${done ? styles.cardDone : styles.cardLocked}`}>
                    <div className={styles.cardIcon}>{done ? a.icon : '🔒'}</div>
                    <div className={styles.cardTitle}>{a.title}</div>
                    <div className={styles.cardDesc}>{a.desc}</div>
                    {done && <div className={styles.doneTag}>✅ مكتمل</div>}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {!user && (
          <div className={styles.loginNote}>
            💡 سجّل دخولك لحفظ إنجازاتك على جميع أجهزتك
          </div>
        )}
      </div>
    </>
  );
}
