import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import { supabase } from '../lib/supabase';
import styles from '../styles/Home.module.css';

const DAILY_AYAHS = [
  'إِنَّ مَعَ الْعُسْرِ يُسْرًا ﴿الشرح:٦﴾',
  'وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ ﴿الطلاق:٣﴾',
  'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا ﴿الشرح:٥﴾',
  'وَاللَّهُ غَالِبٌ عَلَىٰ أَمْرِهِ ﴿يوسف:٢١﴾',
  'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً ﴿البقرة:٢٠١﴾',
  'إِنَّ اللَّهَ مَعَ الصَّابِرِينَ ﴿البقرة:١٥٣﴾',
  'وَلَا تَيْأَسُوا مِن رَّوْحِ اللَّهِ ﴿يوسف:٨٧﴾',
];

const SURAH_NAMES = ["الفاتحة","البقرة","آل عمران","النساء","المائدة","الأنعام","الأعراف","الأنفال","التوبة","يونس","هود","يوسف","الرعد","إبراهيم","الحجر","النحل","الإسراء","الكهف","مريم","طه","الأنبياء","الحج","المؤمنون","النور","الفرقان","الشعراء","النمل","القصص","العنكبوت","الروم","لقمان","السجدة","الأحزاب","سبأ","فاطر","يس","الصافات","ص","الزمر","غافر","فصلت","الشورى","الزخرف","الدخان","الجاثية","الأحقاف","محمد","الفتح","الحجرات","ق","الذاريات","الطور","النجم","القمر","الرحمن","الواقعة","الحديد","المجادلة","الحشر","الممتحنة","الصف","الجمعة","المنافقون","التغابن","الطلاق","التحريم","الملك","القلم","الحاقة","المعارج","نوح","الجن","المزمل","المدثر","القيامة","الإنسان","المرسلات","النبأ","النازعات","عبس","التكوير","الانفطار","المطففين","الانشقاق","البروج","الطارق","الأعلى","الغاشية","الفجر","البلد","الشمس","الليل","الضحى","الشرح","التين","العلق","القدر","البينة","الزلزلة","العاديات","القارعة","التكاثر","العصر","الهمزة","الفيل","قريش","الماعون","الكوثر","الكافرون","النصر","المسد","الإخلاص","الفلق","الناس"];

export default function Home({ toggleDark, dark, showToast, user, onAuth }) {
  const [surahs, setSurahs] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [lastRead, setLastRead] = useState(null);
  const [khatmaPct, setKhatmaPct] = useState(0);

  useEffect(() => {
    fetch('https://api.alquran.cloud/v1/surah')
      .then(r => r.json())
      .then(d => { setSurahs(d.data); setLoading(false); })
      .catch(() => setLoading(false));

    // تحميل آخر قراءة
    loadLastRead();
    // تحميل نسبة الختمة
    const done = JSON.parse(localStorage.getItem('q_khatma') || '[]');
    setKhatmaPct(Math.round((done.length / 114) * 100));
  }, [user]);

  async function loadLastRead() {
    if (user) {
      const { data } = await supabase
        .from('last_read')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (data) setLastRead({ surah: data.surah_num, verse: data.verse_num });
    } else {
      const saved = localStorage.getItem('q_last_read');
      if (saved) setLastRead(JSON.parse(saved));
    }
  }

  const ayah = DAILY_AYAHS[new Date().getDay() % DAILY_AYAHS.length];

  const filtered = surahs.filter(s => {
    const matchSearch = s.name.includes(search) || String(s.number).includes(search) || s.englishName.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || (filter === 'meccan' && s.revelationType === 'Meccan') || (filter === 'medinan' && s.revelationType === 'Medinan');
    return matchSearch && matchFilter;
  });

  return (
    <>
      <Head>
        <title>القرآن الكريم</title>
        <meta name="description" content="قراءة القرآن الكريم مع التفسير والاستماع" />
      </Head>
      <Navbar toggleDark={toggleDark} dark={dark} showToast={showToast} onAuth={onAuth} />

      <div className={styles.hero}>
        <div className={styles.ornament}>❧ ✦ ❧</div>
        <div className={styles.bismillah}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
        <h1 className={styles.title}>القرآن الكريم</h1>
        <p className={styles.sub}>قراءة · استماع · تفسير · ختمة</p>
        <div className={styles.ayahBox}>
          <div className={styles.ayahLabel}>✦ آية اليوم ✦</div>
          <div className={styles.ayahText}>{ayah}</div>
        </div>
      </div>

      <div className={styles.container}>

        {/* بطاقات المستخدم */}
        {(lastRead || khatmaPct > 0) && (
          <div className={styles.userCards}>
            {lastRead && (
              <Link href={`/surah/${lastRead.surah}#v${lastRead.verse}`} className={styles.userCard}>
                <div className={styles.userCardIcon}>📖</div>
                <div>
                  <div className={styles.userCardLabel}>آخر قراءة</div>
                  <div className={styles.userCardValue}>سورة {SURAH_NAMES[lastRead.surah - 1]} — آية {lastRead.verse}</div>
                </div>
                <div className={styles.userCardArrow}>←</div>
              </Link>
            )}
            {khatmaPct > 0 && (
              <Link href="/khatma" className={styles.userCard}>
                <div className={styles.userCardIcon}>🌙</div>
                <div>
                  <div className={styles.userCardLabel}>تقدم الختمة</div>
                  <div className={styles.userCardValue}>{khatmaPct}% مكتمل</div>
                </div>
                <div className={styles.progressBar}>
                  <div className={styles.progressFill} style={{ width: `${khatmaPct}%` }} />
                </div>
              </Link>
            )}
          </div>
        )}

        <div className={styles.controls}>
          <input className={styles.search} type="text" placeholder="🔍 ابحث عن سورة..."
            value={search} onChange={e => setSearch(e.target.value)} />
          <div className={styles.filters}>
            {[['all','الكل'],['meccan','مكية'],['medinan','مدنية']].map(([v,l]) => (
              <button key={v} className={`${styles.filterBtn} ${filter===v?styles.filterActive:''}`} onClick={() => setFilter(v)}>{l}</button>
            ))}
          </div>
        </div>

        <div className={styles.stats}>
          <div className={styles.stat}><span>{surahs.length}</span> سورة</div>
          <div className={styles.stat}><span>٦٢٣٦</span> آية</div>
          <div className={styles.stat}><span>٣٠</span> جزء</div>
          <div className={styles.stat}><span>١١٤</span> سورة كريمة</div>
        </div>

        {loading ? (
          <div className="loading"><div className="loader" /><div>جارٍ التحميل...</div></div>
        ) : (
          <div className={styles.grid}>
            {filtered.map(s => (
              <Link key={s.number} href={`/surah/${s.number}`} className={styles.card}>
                <div className={styles.cardNum}>{s.number}</div>
                <div className={styles.cardInfo}>
                  <div className={styles.cardName}>{s.name}</div>
                  <div className={styles.cardMeta}>{s.revelationType === 'Meccan' ? 'مكية' : 'مدنية'} · {s.numberOfAyahs} آية</div>
                </div>
                <div className={styles.cardEn}>{s.englishName}</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
