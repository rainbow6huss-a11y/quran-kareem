import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';
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

export default function Home({ toggleDark, dark, showToast }) {
  const [surahs, setSurahs] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | meccan | medinan

  useEffect(() => {
    fetch('https://api.alquran.cloud/v1/surah')
      .then(r => r.json())
      .then(d => { setSurahs(d.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

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
      <Navbar toggleDark={toggleDark} dark={dark} showToast={showToast} />

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
        {/* Search & Filter */}
        <div className={styles.controls}>
          <input
            className={styles.search}
            type="text"
            placeholder="🔍 ابحث عن سورة..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className={styles.filters}>
            {[['all','الكل'],['meccan','مكية'],['medinan','مدنية']].map(([v,l]) => (
              <button key={v} className={`${styles.filterBtn} ${filter===v?styles.filterActive:''}`} onClick={() => setFilter(v)}>{l}</button>
            ))}
          </div>
        </div>

        {/* Stats */}
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
                  <div className={styles.cardMeta}>
                    {s.revelationType === 'Meccan' ? 'مكية' : 'مدنية'} · {s.numberOfAyahs} آية
                  </div>
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
