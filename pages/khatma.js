import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import { supabase } from '../lib/supabase';
import styles from '../styles/Khatma.module.css';

const SURAH_NAMES = ["الفاتحة","البقرة","آل عمران","النساء","المائدة","الأنعام","الأعراف","الأنفال","التوبة","يونس","هود","يوسف","الرعد","إبراهيم","الحجر","النحل","الإسراء","الكهف","مريم","طه","الأنبياء","الحج","المؤمنون","النور","الفرقان","الشعراء","النمل","القصص","العنكبوت","الروم","لقمان","السجدة","الأحزاب","سبأ","فاطر","يس","الصافات","ص","الزمر","غافر","فصلت","الشورى","الزخرف","الدخان","الجاثية","الأحقاف","محمد","الفتح","الحجرات","ق","الذاريات","الطور","النجم","القمر","الرحمن","الواقعة","الحديد","المجادلة","الحشر","الممتحنة","الصف","الجمعة","المنافقون","التغابن","الطلاق","التحريم","الملك","القلم","الحاقة","المعارج","نوح","الجن","المزمل","المدثر","القيامة","الإنسان","المرسلات","النبأ","النازعات","عبس","التكوير","الانفطار","المطففين","الانشقاق","البروج","الطارق","الأعلى","الغاشية","الفجر","البلد","الشمس","الليل","الضحى","الشرح","التين","العلق","القدر","البينة","الزلزلة","العاديات","القارعة","التكاثر","العصر","الهمزة","الفيل","قريش","الماعون","الكوثر","الكافرون","النصر","المسد","الإخلاص","الفلق","الناس"];
const SURAH_PAGES = [1,2,50,77,106,128,151,177,187,208,221,235,249,255,261,267,282,293,305,312,322,332,342,350,359,367,377,385,396,404,411,415,418,428,434,440,446,453,458,467,477,483,489,496,499,502,507,511,515,518,520,523,526,528,531,534,537,542,545,549,551,553,554,556,558,560,562,564,566,568,570,572,574,575,577,578,580,582,583,585,586,587,587,589,590,591,591,592,593,594,595,595,596,596,597,597,598,598,599,599,600,600,601,601,601,602,602,602,603,603,603,604,604,604,604,604,604];

const PLANS = [
  { days: 7,  label: 'أسبوع',    pagesPerDay: Math.ceil(604/7) },
  { days: 15, label: 'نصف شهر', pagesPerDay: Math.ceil(604/15) },
  { days: 30, label: 'شهر',      pagesPerDay: Math.ceil(604/30) },
  { days: 60, label: 'شهرين',   pagesPerDay: Math.ceil(604/60) },
  { days: 90, label: '3 أشهر',  pagesPerDay: Math.ceil(604/90) },
];

export default function KhatmaPage({ toggleDark, dark, showToast, user, onAuth }) {
  const [done, setDone] = useState([]);
  const [plan, setPlan] = useState(30);
  const [syncing, setSyncing] = useState(false);
  const [startDate, setStartDate] = useState(null);

  useEffect(() => {
    if (user) {
      loadFromSupabase(user.id);
    } else {
      setDone(JSON.parse(localStorage.getItem('q_khatma') || '[]'));
      setPlan(parseInt(localStorage.getItem('q_plan') || '30'));
      setStartDate(localStorage.getItem('q_khatma_start') || new Date().toISOString().split('T')[0]);
    }
  }, [user]);

  async function loadFromSupabase(userId) {
    const { data } = await supabase.from('khatma').select('*').eq('user_id', userId).single();
    if (data) {
      setDone(JSON.parse(data.done_surahs || '[]'));
      setPlan(data.plan_days || 30);
      setStartDate(data.start_date || new Date().toISOString().split('T')[0]);
    } else {
      const today = new Date().toISOString().split('T')[0];
      setStartDate(today);
    }
  }

  async function save(newDone, newPlan, newStart) {
    const p = newPlan || plan;
    const s = newStart || startDate || new Date().toISOString().split('T')[0];
    setDone(newDone);
    localStorage.setItem('q_khatma', JSON.stringify(newDone));
    localStorage.setItem('q_plan', p);
    localStorage.setItem('q_khatma_start', s);

    if (user) {
      setSyncing(true);
      const { data: existing } = await supabase.from('khatma').select('id').eq('user_id', user.id).single();
      if (existing) {
        await supabase.from('khatma').update({
          done_surahs: JSON.stringify(newDone),
          plan_days: p,
          start_date: s,
        }).eq('user_id', user.id);
      } else {
        await supabase.from('khatma').insert({
          user_id: user.id,
          done_surahs: JSON.stringify(newDone),
          plan_days: p,
          start_date: s,
        });
      }
      setSyncing(false);
    }
  }

  function toggle(num) {
    const idx = done.indexOf(num);
    let next = [...done];
    if (idx > -1) next.splice(idx, 1);
    else { next.push(num); showToast('✅ بارك الله بك!'); }
    save(next);
  }

  function changePlan(days) {
    setPlan(days);
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
    save(done, days, today);
  }

  function completeToday() {
    const todaySurahs = getTodaySurahs();
    const next = [...done];
    todaySurahs.forEach(n => { if (!next.includes(n)) next.push(n); });
    save(next);
    showToast('✅ أحسنت! تم إكمال ورد اليوم');
  }

  function resetKhatma() {
    if (window.confirm('هل تريد إعادة تعيين الختمة من البداية؟')) {
      const today = new Date().toISOString().split('T')[0];
      setStartDate(today);
      save([], plan, today);
      showToast('🔄 تمت إعادة الختمة');
    }
  }

  // حساب السور المتبقية
  const remaining = SURAH_NAMES.map((_, i) => i + 1).filter(n => !done.includes(n));
  const pct = Math.round((done.length / 114) * 100);
  const circ = 2 * Math.PI * 50;
  const offset = circ - (circ * pct / 100);

  // حساب الصفحات المنجزة والمتبقية
  const doneSurahs = done;
  const lastDoneSurah = doneSurahs.length > 0 ? Math.max(...doneSurahs) : 0;
  const pagesRead = lastDoneSurah > 0 ? SURAH_PAGES[Math.min(lastDoneSurah, 113)] - 1 : 0;
  const pagesLeft = 604 - pagesRead;

  // حساب الأيام المتبقية
  const currentPlan = PLANS.find(p => p.days === plan) || PLANS[2];
  const daysLeft = Math.ceil(pagesLeft / currentPlan.pagesPerDay);
  const finishDate = new Date();
  finishDate.setDate(finishDate.getDate() + daysLeft);

  // ورد اليوم
  function getTodaySurahs() {
    const perDay = Math.ceil(remaining.length / Math.max(daysLeft, 1));
    return remaining.slice(0, Math.max(perDay, 1));
  }
  const todaySurahs = getTodaySurahs();
  const todayFrom = SURAH_NAMES[todaySurahs[0] - 1] || '—';
  const todayTo = SURAH_NAMES[todaySurahs[todaySurahs.length - 1] - 1] || '—';
  const todayDone = todaySurahs.every(n => done.includes(n));

  return (
    <>
      <Head><title>ختمة القرآن - القرآن الكريم</title></Head>
      <Navbar toggleDark={toggleDark} dark={dark} showToast={showToast} onAuth={onAuth} />

      <div className={styles.page}>
        {/* Hero */}
        <div className={styles.hero}>
          <h1 className={styles.title}>🌙 ختمة القرآن الكريم</h1>
          <p className={styles.sub}>
            {user
              ? `${user.user_metadata?.full_name?.split(' ')[0] || 'أهلاً'} — ختمتك محفوظة في السحابة ☁️`
              : 'سجّل دخولك لحفظ ختمتك على جميع أجهزتك'}
          </p>
          {syncing && <div className={styles.syncBadge}>جارٍ الحفظ...</div>}

          {/* Progress Ring */}
          <div className={styles.ringWrap}>
            <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="70" cy="70" r="50" fill="none" stroke="var(--border)" strokeWidth="10" />
              <circle cx="70" cy="70" r="50" fill="none" stroke={pct === 100 ? '#d4af5a' : 'var(--green)'} strokeWidth="10"
                strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
                style={{ transition: 'stroke-dashoffset .8s ease' }} />
            </svg>
            <div className={styles.ringText}>{pct}%</div>
            <div className={styles.ringSub}>
              {pct === 0 ? 'لم تبدأ بعد' : pct === 100 ? '🎉 ختمة مكتملة!' : `${done.length} من 114 سورة`}
            </div>
          </div>

          {/* Stats Cards */}
          <div className={styles.statsRow}>
            <div className={styles.statCard}>
              <div className={styles.statNum}>{pagesLeft}</div>
              <div className={styles.statLabel}>صفحة متبقية</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNum}>{daysLeft}</div>
              <div className={styles.statLabel}>يوم متبقي</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNum}>{currentPlan.pagesPerDay}</div>
              <div className={styles.statLabel}>صفحة/يوم</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNum}>{finishDate.toLocaleDateString('ar-SA', {month:'short',day:'numeric'})}</div>
              <div className={styles.statLabel}>تاريخ الإنهاء</div>
            </div>
          </div>

          {/* Plan Selector */}
          <div className={styles.plans}>
            {PLANS.map(p => (
              <button key={p.days} className={`${styles.planBtn} ${plan===p.days?styles.planActive:''}`}
                onClick={() => changePlan(p.days)}>
                <span className={styles.planDays}>{p.days}</span>
                <span className={styles.planLabel}>{p.label}</span>
                <span className={styles.planPages}>{p.pagesPerDay} ص/يوم</span>
              </button>
            ))}
          </div>
        </div>

        {/* ورد اليوم */}
        <div className={`${styles.wirdCard} ${todayDone ? styles.wirdDone : ''}`}>
          <div className={styles.wirdHeader}>
            <span className={styles.wirdIcon}>{todayDone ? '✅' : '📋'}</span>
            <span className={styles.wirdTitle}>ورد اليوم</span>
            {todayDone && <span className={styles.wirdBadgeDone}>مكتمل 🎉</span>}
          </div>
          <div className={styles.wirdBody}>
            <div className={styles.wirdInfo}>
              <div className={styles.wirdItem}><span>من:</span> <strong>{todayFrom}</strong></div>
              <div className={styles.wirdItem}><span>إلى:</span> <strong>{todayTo}</strong></div>
              <div className={styles.wirdItem}><span>عدد السور:</span> <strong>{todaySurahs.length}</strong></div>
              <div className={styles.wirdItem}><span>صفحات تقريباً:</span> <strong>{currentPlan.pagesPerDay}</strong></div>
            </div>
            {!todayDone && (
              <Link href={`/surah/${todaySurahs[0]}`} className={styles.startBtn}>
                ابدأ القراءة →
              </Link>
            )}
          </div>
          <div className={styles.wirdActions}>
            <button className={styles.completeBtn} onClick={completeToday} disabled={todayDone || remaining.length === 0}>
              {todayDone ? '✅ تم الإكمال' : '✅ إكمال ورد اليوم'}
            </button>
            <button className={styles.resetBtn} onClick={resetKhatma}>🔄 إعادة تعيين</button>
          </div>
        </div>

        {/* سور الختمة */}
        <h2 className={styles.gridTitle}>السور — اضغط لتعليم المكتملة</h2>
        <div className={styles.surahGrid}>
          {SURAH_NAMES.map((name, i) => {
            const num = i + 1;
            const isDone = done.includes(num);
            const isToday = todaySurahs.includes(num);
            return (
              <button key={num}
                className={`${styles.surahBtn} ${isDone ? styles.surahDone : ''} ${isToday && !isDone ? styles.surahToday : ''}`}
                onClick={() => toggle(num)}>
                <span className={styles.surahBtnNum}>{num}</span>
                <span>{name}</span>
                {isToday && !isDone && <span className={styles.todayDot}>•</span>}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
