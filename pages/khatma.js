import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import { supabase } from '../lib/supabase';
import styles from '../styles/Khatma.module.css';
import Link from 'next/link';

const SURAH_NAMES = ["الفاتحة","البقرة","آل عمران","النساء","المائدة","الأنعام","الأعراف","الأنفال","التوبة","يونس","هود","يوسف","الرعد","إبراهيم","الحجر","النحل","الإسراء","الكهف","مريم","طه","الأنبياء","الحج","المؤمنون","النور","الفرقان","الشعراء","النمل","القصص","العنكبوت","الروم","لقمان","السجدة","الأحزاب","سبأ","فاطر","يس","الصافات","ص","الزمر","غافر","فصلت","الشورى","الزخرف","الدخان","الجاثية","الأحقاف","محمد","الفتح","الحجرات","ق","الذاريات","الطور","النجم","القمر","الرحمن","الواقعة","الحديد","المجادلة","الحشر","الممتحنة","الصف","الجمعة","المنافقون","التغابن","الطلاق","التحريم","الملك","القلم","الحاقة","المعارج","نوح","الجن","المزمل","المدثر","القيامة","الإنسان","المرسلات","النبأ","النازعات","عبس","التكوير","الانفطار","المطففين","الانشقاق","البروج","الطارق","الأعلى","الغاشية","الفجر","البلد","الشمس","الليل","الضحى","الشرح","التين","العلق","القدر","البينة","الزلزلة","العاديات","القارعة","التكاثر","العصر","الهمزة","الفيل","قريش","الماعون","الكوثر","الكافرون","النصر","المسد","الإخلاص","الفلق","الناس"];

// صفحة بداية كل سورة في المصحف
const SURAH_START_PAGE = [1,2,50,77,106,128,151,177,187,208,221,235,249,255,261,267,282,293,305,312,322,332,342,350,359,367,377,385,396,404,411,415,418,428,434,440,446,453,458,467,477,483,489,496,499,502,507,511,515,518,520,523,526,528,531,534,537,542,545,549,551,553,554,556,558,560,562,564,566,568,570,572,574,575,577,578,580,582,583,585,586,587,587,589,590,591,591,592,593,594,595,595,596,596,597,597,598,598,599,599,600,600,601,601,601,602,602,602,603,603,603,604,604,604];

const PLANS = [
  { days: 7,  label: 'أسبوع',   juz: 4.3, pages: 87 },
  { days: 15, label: 'نصف شهر', juz: 2,   pages: 41 },
  { days: 30, label: 'شهر',     juz: 1,   pages: 20 },
  { days: 60, label: 'شهرين',  juz: 0.5, pages: 10 },
  { days: 90, label: '3 أشهر', juz: 0.3, pages: 7  },
];

function getToday() {
  return new Date().toISOString().split('T')[0];
}

function daysBetween(d1, d2) {
  const diff = new Date(d2) - new Date(d1);
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export default function KhatmaPage({ toggleDark, dark, showToast, user, onAuth }) {
  const [done, setDone] = useState([]);
  const [plan, setPlan] = useState(30);
  const [startDate, setStartDate] = useState(getToday());
  const [log, setLog] = useState([]); // سجل الأيام المنجزة
  const [syncing, setSyncing] = useState(false);
  const [todayDone, setTodayDone] = useState(false);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (user) {
      loadFromSupabase(user.id);
    } else {
      setDone(JSON.parse(localStorage.getItem('q_khatma') || '[]'));
      setPlan(parseInt(localStorage.getItem('q_plan') || '30'));
      setStartDate(localStorage.getItem('q_khatma_start') || getToday());
      const savedLog = JSON.parse(localStorage.getItem('q_khatma_log') || '[]');
      setLog(savedLog);
      setTodayDone(savedLog.includes(getToday()));
      setStreak(calcStreak(savedLog));
    }
  }, [user]);

  async function loadFromSupabase(userId) {
    const [khatmaRes, logRes] = await Promise.all([
      supabase.from('khatma').select('*').eq('user_id', userId).single(),
      supabase.from('khatma_log').select('log_date').eq('user_id', userId).order('log_date', { ascending: false })
    ]);
    if (khatmaRes.data) {
      setDone(JSON.parse(khatmaRes.data.done_surahs || '[]'));
      setPlan(khatmaRes.data.plan_days || 30);
      setStartDate(khatmaRes.data.start_date || getToday());
    }
    if (logRes.data) {
      const dates = logRes.data.map(r => r.log_date);
      setLog(dates);
      setTodayDone(dates.includes(getToday()));
      setStreak(calcStreak(dates));
    }
  }

  function calcStreak(dates) {
    if (!dates.length) return 0;
    const sorted = [...dates].sort((a,b) => b.localeCompare(a));
    let s = 0;
    let current = getToday();
    for (const date of sorted) {
      if (date === current) { s++; current = new Date(new Date(current) - 86400000).toISOString().split('T')[0]; }
      else break;
    }
    return s;
  }

  async function saveKhatma(newDone, newPlan, newStart) {
    const p = newPlan || plan;
    const s = newStart || startDate;
    setDone(newDone);
    localStorage.setItem('q_khatma', JSON.stringify(newDone));
    localStorage.setItem('q_plan', p);
    localStorage.setItem('q_khatma_start', s);
    if (user) {
      setSyncing(true);
      const { data: existing } = await supabase.from('khatma').select('id').eq('user_id', user.id).single();
      if (existing) {
        await supabase.from('khatma').update({ done_surahs: JSON.stringify(newDone), plan_days: p, start_date: s }).eq('user_id', user.id);
      } else {
        await supabase.from('khatma').insert({ user_id: user.id, done_surahs: JSON.stringify(newDone), plan_days: p, start_date: s });
      }
      setSyncing(false);
    }
  }

  async function completeTodayWird() {
    if (todayDone) return;
    const today = getToday();
    const newLog = [...log, today];
    setLog(newLog);
    setTodayDone(true);
    const newStreak = calcStreak(newLog);
    setStreak(newStreak);
    localStorage.setItem('q_khatma_log', JSON.stringify(newLog));

    // تعليم سور اليوم كمكتملة
    const todaySurahs = getTodaySurahs();
    const newDone = [...done];
    todaySurahs.forEach(n => { if (!newDone.includes(n)) newDone.push(n); });
    await saveKhatma(newDone, plan, startDate);

    if (user) {
      await supabase.from('khatma_log').insert({ user_id: user.id, log_date: today, pages_read: currentPlan.pages });
    }
    if (newStreak > 1) showToast(`🔥 ${newStreak} أيام متتالية! استمر!`);
    else showToast('✅ أحسنت! تم تسجيل ورد اليوم');
  }

  function toggle(num) {
    const idx = done.indexOf(num);
    const next = [...done];
    if (idx > -1) next.splice(idx, 1);
    else { next.push(num); showToast('✅ بارك الله بك!'); }
    saveKhatma(next, plan, startDate);
  }

  function changePlan(days) {
    const today = getToday();
    setPlan(days);
    setStartDate(today);
    saveKhatma(done, days, today);
  }

  function resetKhatma() {
    if (!window.confirm('هل تريد إعادة تعيين الختمة من البداية؟')) return;
    const today = getToday();
    setLog([]); setTodayDone(false); setStreak(0);
    localStorage.setItem('q_khatma_log', '[]');
    saveKhatma([], plan, today);
    showToast('🔄 تمت إعادة الختمة');
  }

  // حسابات
  const currentPlan = PLANS.find(p => p.days === plan) || PLANS[2];
  const pct = Math.round((done.length / 114) * 100);
  const circ = 2 * Math.PI * 54;
  const offset = circ - (circ * pct / 100);
  const daysPassed = daysBetween(startDate, getToday());
  const daysLeft = Math.max(currentPlan.days - daysPassed, 1);
  const finishDate = new Date(startDate);
  finishDate.setDate(finishDate.getDate() + currentPlan.days);

  // ورد اليوم — بناءً على الصفحات
  function getTodaySurahs() {
    const remaining = SURAH_NAMES.map((_, i) => i + 1).filter(n => !done.includes(n));
    const perDay = Math.max(Math.ceil(remaining.length / daysLeft), 1);
    return remaining.slice(0, perDay);
  }
  const todaySurahs = getTodaySurahs();
  const todayFrom = SURAH_NAMES[(todaySurahs[0] || 1) - 1];
  const todayTo = SURAH_NAMES[(todaySurahs[todaySurahs.length - 1] || 1) - 1];
  const remaining = SURAH_NAMES.map((_, i) => i + 1).filter(n => !done.includes(n));

  // الصفحات المنجزة
  const lastDone = done.length > 0 ? Math.max(...done) : 0;
  const pagesRead = lastDone > 0 ? (SURAH_START_PAGE[lastDone] || 604) - 1 : 0;
  const pagesLeft = 604 - pagesRead;

  return (
    <>
      <Head><title>ختمة القرآن - القرآن الكريم</title></Head>
      <Navbar toggleDark={toggleDark} dark={dark} showToast={showToast} onAuth={onAuth} />

      <div className={styles.page}>
        {/* HERO */}
        <div className={styles.hero}>
          <h1 className={styles.title}>🌙 ختمة القرآن الكريم</h1>
          <p className={styles.sub}>
            {user ? `${user.user_metadata?.full_name?.split(' ')[0] || 'أهلاً'} — ختمتك محفوظة ☁️` : 'سجّل دخولك لحفظ ختمتك'}
          </p>
          {syncing && <div className={styles.syncBadge}>جارٍ الحفظ...</div>}

          {/* Ring */}
          <div className={styles.ringWrap}>
            <svg width="150" height="150" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="75" cy="75" r="54" fill="none" stroke="var(--border)" strokeWidth="10" />
              <circle cx="75" cy="75" r="54" fill="none" stroke={pct===100?'#d4af5a':'var(--green)'} strokeWidth="10"
                strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
                style={{ transition: 'stroke-dashoffset .8s ease' }} />
            </svg>
            <div className={styles.ringInner}>
              <div className={styles.ringPct}>{pct}%</div>
              <div className={styles.ringLabel}>{done.length}/114 سورة</div>
            </div>
          </div>

          {/* Streak */}
          {streak > 0 && (
            <div className={styles.streakBadge}>
              🔥 {streak} {streak === 1 ? 'يوم' : 'أيام'} متتالية
            </div>
          )}

          {/* Stats */}
          <div className={styles.statsRow}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>📖</div>
              <div className={styles.statNum}>{pagesLeft}</div>
              <div className={styles.statLabel}>صفحة متبقية</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>📅</div>
              <div className={styles.statNum}>{daysLeft}</div>
              <div className={styles.statLabel}>يوم متبقي</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>⚡</div>
              <div className={styles.statNum}>{currentPlan.pages}</div>
              <div className={styles.statLabel}>صفحة/يوم</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>🎯</div>
              <div className={styles.statNum}>{finishDate.toLocaleDateString('ar-SA',{month:'short',day:'numeric'})}</div>
              <div className={styles.statLabel}>تاريخ الإنهاء</div>
            </div>
          </div>

          {/* Plans */}
          <div className={styles.plansWrap}>
            <div className={styles.plansLabel}>اختر خطتك:</div>
            <div className={styles.plans}>
              {PLANS.map(p => (
                <button key={p.days} className={`${styles.planBtn} ${plan===p.days?styles.planActive:''}`}
                  onClick={() => changePlan(p.days)}>
                  <span className={styles.planDays}>{p.days}</span>
                  <span className={styles.planLabel}>{p.label}</span>
                  <span className={styles.planPages}>{p.pages} ص/يوم</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* WIRD CARD */}
        <div className={`${styles.wirdCard} ${todayDone?styles.wirdDone:''}`}>
          <div className={styles.wirdHeader}>
            <div className={styles.wirdTitleWrap}>
              <span className={styles.wirdIcon}>{todayDone?'✅':'📋'}</span>
              <span className={styles.wirdTitle}>ورد اليوم</span>
            </div>
            {todayDone && <span className={styles.doneBadge}>مكتمل 🎉</span>}
          </div>

          <div className={styles.wirdStats}>
            <div className={styles.wirdStat}><span className={styles.wirdStatLabel}>من</span><strong>{todayFrom}</strong></div>
            <div className={styles.wirdDivider}>←</div>
            <div className={styles.wirdStat}><span className={styles.wirdStatLabel}>إلى</span><strong>{todayTo}</strong></div>
            <div className={styles.wirdDivider}>|</div>
            <div className={styles.wirdStat}><span className={styles.wirdStatLabel}>الصفحات</span><strong>~{currentPlan.pages}</strong></div>
            <div className={styles.wirdDivider}>|</div>
            <div className={styles.wirdStat}><span className={styles.wirdStatLabel}>الأجزاء</span><strong>~{currentPlan.juz}</strong></div>
          </div>

          {!todayDone && (
            <Link href={`/surah/${todaySurahs[0] || 1}`} className={styles.startReadBtn}>
              📖 ابدأ القراءة الآن ←
            </Link>
          )}

          <div className={styles.wirdActions}>
            <button className={`${styles.completeBtn} ${todayDone?styles.completeBtnDone:''}`}
              onClick={completeTodayWird} disabled={todayDone}>
              {todayDone ? '✅ تم تسجيل ورد اليوم' : '✅ إكمال ورد اليوم'}
            </button>
            <button className={styles.resetBtn} onClick={resetKhatma}>🔄 إعادة</button>
          </div>
        </div>

        {/* LOG — آخر 7 أيام */}
        <div className={styles.logCard}>
          <div className={styles.logTitle}>📊 سجل الأيام السبعة الأخيرة</div>
          <div className={styles.logDays}>
            {Array.from({length:7}).map((_,i) => {
              const d = new Date(); d.setDate(d.getDate() - (6-i));
              const dateStr = d.toISOString().split('T')[0];
              const isDone = log.includes(dateStr);
              const isToday = dateStr === getToday();
              return (
                <div key={i} className={`${styles.logDay} ${isDone?styles.logDayDone:''} ${isToday?styles.logDayToday:''}`}>
                  <div className={styles.logDayName}>{d.toLocaleDateString('ar-SA',{weekday:'short'})}</div>
                  <div className={styles.logDayIcon}>{isDone?'✅':'○'}</div>
                  <div className={styles.logDayNum}>{d.getDate()}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SURAHS GRID */}
        <h2 className={styles.gridTitle}>السور — اضغط لتعليم المكتملة</h2>
        <div className={styles.surahGrid}>
          {SURAH_NAMES.map((name, i) => {
            const num = i+1;
            const isDone = done.includes(num);
            const isToday = todaySurahs.includes(num);
            return (
              <button key={num} onClick={() => toggle(num)}
                className={`${styles.surahBtn} ${isDone?styles.surahDone:''} ${isToday&&!isDone?styles.surahToday:''}`}>
                <span className={styles.surahNum}>{num}</span>
                <span className={styles.surahName}>{name}</span>
                {isToday && !isDone && <span className={styles.todayDot} />}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
