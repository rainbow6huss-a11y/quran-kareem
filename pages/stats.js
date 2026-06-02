import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import styles from '../styles/Stats.module.css';

export default function StatsPage({ toggleDark, dark, showToast, onAuth }) {
  const [stats, setStats] = useState({
    totalVerses: 0,
    todayVerses: 0,
    totalSurahs: 0,
    streak: 0,
    lastRead: null,
    weekData: [],
    favSurah: null,
  });

  useEffect(() => {
    // حساب الإحصائيات من localStorage
    const readLog = JSON.parse(localStorage.getItem('q_read_log') || '[]');
    const khatma = JSON.parse(localStorage.getItem('q_khatma') || '[]');
    const lastRead = JSON.parse(localStorage.getItem('q_last_read') || 'null');
    const khatmaLog = JSON.parse(localStorage.getItem('q_khatma_log') || '[]');

    const today = new Date().toISOString().split('T')[0];
    const todayVerses = readLog.filter(r => r.date === today).length;
    const totalVerses = readLog.length;

    // حساب streak
    let streak = 0;
    let cur = today;
    const sortedLog = [...new Set(khatmaLog)].sort((a,b) => b.localeCompare(a));
    for (const date of sortedLog) {
      if (date === cur) {
        streak++;
        const d = new Date(cur);
        d.setDate(d.getDate() - 1);
        cur = d.toISOString().split('T')[0];
      } else break;
    }

    // بيانات الأسبوع
    const weekData = Array.from({length: 7}, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];
      const count = readLog.filter(r => r.date === dateStr).length;
      return {
        day: ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'][d.getDay()],
        count,
        isToday: dateStr === today,
      };
    });

    const maxCount = Math.max(...weekData.map(d => d.count), 1);

    setStats({
      totalVerses,
      todayVerses,
      totalSurahs: khatma.length,
      streak,
      lastRead,
      weekData,
      maxCount,
      khatmaPct: Math.round((khatma.length / 114) * 100),
    });
  }, []);

  // تسجيل قراءة آية
  function logReading() {
    const log = JSON.parse(localStorage.getItem('q_read_log') || '[]');
    const today = new Date().toISOString().split('T')[0];
    log.push({ date: today, time: Date.now() });
    // احتفظ بآخر 30 يوم فقط
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    const filtered = log.filter(r => new Date(r.date) >= cutoff);
    localStorage.setItem('q_read_log', JSON.stringify(filtered));
  }

  return (
    <>
      <Head><title>إحصائياتي - القرآن الكريم</title></Head>
      <Navbar toggleDark={toggleDark} dark={dark} showToast={showToast} onAuth={onAuth} />

      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>📊 إحصائياتي</h1>
          <p className={styles.sub}>تتبع رحلتك مع القرآن الكريم</p>
        </div>

        {/* بطاقات الإحصائيات */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>📖</div>
            <div className={styles.statNum}>{stats.todayVerses}</div>
            <div className={styles.statLabel}>آية اليوم</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>🔥</div>
            <div className={styles.statNum}>{stats.streak}</div>
            <div className={styles.statLabel}>أيام متتالية</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>📚</div>
            <div className={styles.statNum}>{stats.totalSurahs}</div>
            <div className={styles.statLabel}>سورة أكملت</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>🌙</div>
            <div className={styles.statNum}>{stats.khatmaPct}%</div>
            <div className={styles.statLabel}>تقدم الختمة</div>
          </div>
        </div>

        {/* آخر قراءة */}
        {stats.lastRead && (
          <div className={styles.lastReadCard}>
            <div className={styles.lastReadTitle}>📍 آخر قراءة</div>
            <div className={styles.lastReadInfo}>
              آخر آية: سورة رقم {stats.lastRead.surah} — آية {stats.lastRead.verse}
            </div>
            <Link href={`/surah/${stats.lastRead.surah}#v${stats.lastRead.verse}`}
              className={styles.continueBtn}>
              متابعة القراءة ←
            </Link>
          </div>
        )}

        {/* مخطط الأسبوع */}
        <div className={styles.weekCard}>
          <div className={styles.weekTitle}>📅 نشاط الأسبوع</div>
          <div className={styles.weekChart}>
            {stats.weekData.map((d, i) => (
              <div key={i} className={styles.weekBar}>
                <div className={styles.weekBarWrap}>
                  <div className={styles.weekBarFill}
                    style={{ height: `${stats.maxCount > 0 ? (d.count / stats.maxCount) * 100 : 0}%`,
                      background: d.isToday ? 'var(--green)' : 'var(--gold)' }}/>
                </div>
                <div className={styles.weekBarCount}>{d.count || ''}</div>
                <div className={`${styles.weekBarDay} ${d.isToday ? styles.weekBarDayActive : ''}`}>
                  {d.day}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* رواية المصحف */}
        <div className={styles.infoCard}>
          <div className={styles.infoTitle}>📜 رواية المصحف</div>
          <div className={styles.infoContent}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>الرواية:</span>
              <span className={styles.infoValue}>حفص عن عاصم</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>الطريق:</span>
              <span className={styles.infoValue}>الشاطبية</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>عدد الآيات:</span>
              <span className={styles.infoValue}>٦٢٣٦ آية</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>عدد الصفحات:</span>
              <span className={styles.infoValue}>٦٠٤ صفحة</span>
            </div>
          </div>
        </div>

        {/* روابط سريعة */}
        <div className={styles.quickLinks}>
          <Link href="/khatma" className={styles.quickLink}>🌙 الختمة</Link>
          <Link href="/achievements" className={styles.quickLink}>🏆 الإنجازات</Link>
          <Link href="/bookmarks" className={styles.quickLink}>🔖 العلامات</Link>
        </div>
      </div>
    </>
  );
}
