import { useState, useEffect } from 'react';
import Head from 'next/head';
import Navbar from '../components/Navbar';
import { supabase } from '../lib/supabase';
import styles from '../styles/Khatma.module.css';

const SURAH_NAMES = ["الفاتحة","البقرة","آل عمران","النساء","المائدة","الأنعام","الأعراف","الأنفال","التوبة","يونس","هود","يوسف","الرعد","إبراهيم","الحجر","النحل","الإسراء","الكهف","مريم","طه","الأنبياء","الحج","المؤمنون","النور","الفرقان","الشعراء","النمل","القصص","العنكبوت","الروم","لقمان","السجدة","الأحزاب","سبأ","فاطر","يس","الصافات","ص","الزمر","غافر","فصلت","الشورى","الزخرف","الدخان","الجاثية","الأحقاف","محمد","الفتح","الحجرات","ق","الذاريات","الطور","النجم","القمر","الرحمن","الواقعة","الحديد","المجادلة","الحشر","الممتحنة","الصف","الجمعة","المنافقون","التغابن","الطلاق","التحريم","الملك","القلم","الحاقة","المعارج","نوح","الجن","المزمل","المدثر","القيامة","الإنسان","المرسلات","النبأ","النازعات","عبس","التكوير","الانفطار","المطففين","الانشقاق","البروج","الطارق","الأعلى","الغاشية","الفجر","البلد","الشمس","الليل","الضحى","الشرح","التين","العلق","القدر","البينة","الزلزلة","العاديات","القارعة","التكاثر","العصر","الهمزة","الفيل","قريش","الماعون","الكوثر","الكافرون","النصر","المسد","الإخلاص","الفلق","الناس"];

export default function KhatmaPage({ toggleDark, dark, showToast, user, onAuth }) {
  const [done, setDone] = useState([]);
  const [plan, setPlan] = useState(30);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (user) {
      loadFromSupabase(user.id);
    } else {
      setDone(JSON.parse(localStorage.getItem('q_khatma') || '[]'));
      setPlan(parseInt(localStorage.getItem('q_plan') || '30'));
    }
  }, [user]);

  async function loadFromSupabase(userId) {
    const { data } = await supabase
      .from('khatma')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (data) {
      setDone(JSON.parse(data.done_surahs || '[]'));
      setPlan(data.plan_days || 30);
    }
  }

  async function save(newDone, newPlan) {
    setDone(newDone);
    localStorage.setItem('q_khatma', JSON.stringify(newDone));
    localStorage.setItem('q_plan', newPlan || plan);

    if (user) {
      setSyncing(true);
      const { data: existing } = await supabase
        .from('khatma')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (existing) {
        await supabase.from('khatma').update({
          done_surahs: JSON.stringify(newDone),
          plan_days: newPlan || plan,
        }).eq('user_id', user.id);
      } else {
        await supabase.from('khatma').insert({
          user_id: user.id,
          done_surahs: JSON.stringify(newDone),
          plan_days: newPlan || plan,
        });
      }
      setSyncing(false);
      showToast('☁️ تم الحفظ في السحابة');
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
    save(done, days);
  }

  function completeToday() {
    const remaining = SURAH_NAMES.map((_,i) => i+1).filter(n => !done.includes(n));
    const perDay = Math.ceil(114 / plan);
    const next = [...done];
    remaining.slice(0, perDay).forEach(n => { if (!next.includes(n)) next.push(n); });
    save(next);
    showToast('✅ تم إكمال ورد اليوم!');
  }

  function resetKhatma() {
    if (window.confirm('هل تريد إعادة تعيين الختمة من البداية؟')) {
      save([]);
      showToast('🔄 تمت إعادة الختمة');
    }
  }

  const pct = Math.round((done.length / 114) * 100);
  const circ = 2 * Math.PI * 50;
  const offset = circ - (circ * pct / 100);
  const remaining = SURAH_NAMES.map((_,i) => i+1).filter(n => !done.includes(n));
  const perDay = Math.ceil(114 / plan);
  const todayFrom = SURAH_NAMES[remaining[0] - 1] || '—';
  const todayTo = SURAH_NAMES[(remaining[Math.min(perDay-1, remaining.length-1)]) - 1] || '—';

  return (
    <>
      <Head><title>ختمة القرآن - القرآن الكريم</title></Head>
      <Navbar toggleDark={toggleDark} dark={dark} showToast={showToast} onAuth={onAuth} />

      <div className={styles.page}>
        <div className={styles.hero}>
          <h1 className={styles.title}>🌙 ختمة القرآن الكريم</h1>
          <p className={styles.sub}>
            {user
              ? `مرحباً ${user.user_metadata?.full_name?.split(' ')[0] || ''} — ختمتك محفوظة في السحابة ☁️`
              : 'سجّل دخولك لحفظ ختمتك على جميع أجهزتك'}
          </p>
          {syncing && <div style={{fontSize:'.8rem',color:'var(--gold)'}}>جارٍ الحفظ...</div>}

          <div className={styles.ringWrap}>
            <svg width="130" height="130" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="65" cy="65" r="50" fill="none" stroke="var(--border)" strokeWidth="9" />
              <circle cx="65" cy="65" r="50" fill="none" stroke="var(--green)" strokeWidth="9"
                strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
                style={{ transition: 'stroke-dashoffset .8s ease' }} />
            </svg>
            <div className={styles.ringText}>{pct}%</div>
            <div className={styles.ringSub}>
              {pct === 0 ? 'لم تبدأ بعد' : pct === 100 ? '🎉 أكملت الختمة!' : `${done.length} من 114 سورة`}
            </div>
          </div>

          <div className={styles.plans}>
            {[[7,'أسبوعية'],[15,'نصف شهر'],[30,'شهرية'],[60,'شهرين']].map(([d,l]) => (
              <button key={d} className={`${styles.planBtn} ${plan===d?styles.planActive:''}`} onClick={() => changePlan(d)}>
                <span className={styles.planDays}>{d}</span>
                <span className={styles.planLabel}>{l}</span>
              </button>
            ))}
          </div>

          <div className={styles.wird}>
            <h3>📋 ورد اليوم</h3>
            <div className={styles.wirdRow}>
              <div className={styles.wirdBadge}>من: <strong>{todayFrom}</strong></div>
              <div className={styles.wirdBadge}>إلى: <strong>{todayTo}</strong></div>
              <div className={styles.wirdBadge}>متبقي: <strong>{remaining.length}</strong></div>
            </div>
          </div>

          <div className={styles.btns}>
            <button className={styles.completeBtn} onClick={completeToday} disabled={remaining.length === 0}>
              ✅ إكمال ورد اليوم
            </button>
            <button className={styles.resetBtn} onClick={resetKhatma}>🔄 إعادة تعيين</button>
          </div>
        </div>

        <h2 className={styles.gridTitle}>اضغط على السورة لتعليمها مكتملة</h2>
        <div className={styles.surahGrid}>
          {SURAH_NAMES.map((name, i) => (
            <button key={i+1}
              className={`${styles.surahBtn} ${done.includes(i+1) ? styles.surahDone : ''}`}
              onClick={() => toggle(i+1)}>
              <span className={styles.surahBtnNum}>{i+1}</span>
              <span>{name}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
