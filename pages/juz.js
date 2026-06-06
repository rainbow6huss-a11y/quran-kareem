import { useState, useEffect } from 'react';
import SeoHead from '../components/SeoHead';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import { fetchSurahListWithCache } from '../lib/apiCache';
import styles from '../styles/Juz.module.css';

const JUZ_DATA = [
  { juz:1,  starts:'الفاتحة', surah:1,  verse:1   },
  { juz:2,  starts:'البقرة',  surah:2,  verse:142  },
  { juz:3,  starts:'البقرة',  surah:2,  verse:253  },
  { juz:4,  starts:'آل عمران',surah:3,  verse:92   },
  { juz:5,  starts:'النساء',  surah:4,  verse:24   },
  { juz:6,  starts:'النساء',  surah:4,  verse:148  },
  { juz:7,  starts:'المائدة', surah:5,  verse:82   },
  { juz:8,  starts:'الأنعام', surah:6,  verse:111  },
  { juz:9,  starts:'الأعراف', surah:7,  verse:88   },
  { juz:10, starts:'الأنفال', surah:8,  verse:41   },
  { juz:11, starts:'التوبة',  surah:9,  verse:93   },
  { juz:12, starts:'هود',     surah:11, verse:6    },
  { juz:13, starts:'يوسف',   surah:12, verse:53   },
  { juz:14, starts:'الحجر',   surah:15, verse:1    },
  { juz:15, starts:'الإسراء', surah:17, verse:1    },
  { juz:16, starts:'الكهف',   surah:18, verse:75   },
  { juz:17, starts:'الأنبياء',surah:21, verse:1    },
  { juz:18, starts:'المؤمنون',surah:23, verse:1    },
  { juz:19, starts:'الفرقان', surah:25, verse:21   },
  { juz:20, starts:'النمل',   surah:27, verse:60   },
  { juz:21, starts:'العنكبوت',surah:29, verse:46   },
  { juz:22, starts:'الأحزاب', surah:33, verse:31   },
  { juz:23, starts:'يس',      surah:36, verse:28   },
  { juz:24, starts:'الزمر',   surah:39, verse:32   },
  { juz:25, starts:'فصلت',    surah:41, verse:47   },
  { juz:26, starts:'الأحقاف', surah:46, verse:1    },
  { juz:27, starts:'الذاريات',surah:51, verse:31   },
  { juz:28, starts:'المجادلة',surah:58, verse:1    },
  { juz:29, starts:'الملك',   surah:67, verse:1    },
  { juz:30, starts:'النبأ',   surah:78, verse:1    },
];

const PAGES_PER_JUZ = 20; // تقريباً

export default function JuzPage({ toggleDark, dark, showToast }) {
  const [surahs,   setSurahs]   = useState([]);
  const [readData, setReadData] = useState({});
  const [view,     setView]     = useState('grid'); // grid | list

  useEffect(() => {
    // جلب قائمة السور مع cache
    fetchSurahListWithCache().then(setSurahs).catch(() => {});

    // تحميل بيانات القراءة
    try {
      const lastRead = JSON.parse(localStorage.getItem('q_last_read') || '{}');
      if (lastRead.surah) {
        // حساب الجزء الحالي
        const juzIdx = JUZ_DATA.findLastIndex(j => j.surah <= lastRead.surah);
        setReadData({ currentJuz: juzIdx + 1, surah: lastRead.surah });
      }
    } catch { /* تجاهل */ }
  }, []);

  return (
    <>
      <SeoHead title="الأجزاء الثلاثون" description="تصفح القرآن الكريم مقسماً إلى ثلاثين جزءاً" path="/juz" />
      <Navbar toggleDark={toggleDark} dark={dark} showToast={showToast} />

      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>الأجزاء الثلاثون</h1>
          <p className={styles.sub}>تصفح القرآن الكريم بالأجزاء</p>

          {/* آخر موضع قراءة */}
          {readData.currentJuz && (
            <Link href={`/surah/${readData.surah}`} className={styles.lastReadBanner}>
              📖 آخر قراءة في الجزء {readData.currentJuz} — اكمل من هنا
            </Link>
          )}

          {/* تبديل العرض */}
          <div className={styles.viewToggle}>
            <button className={`${styles.viewBtn} ${view === 'grid' ? styles.viewActive : ''}`} onClick={() => setView('grid')}>⊞ بطاقات</button>
            <button className={`${styles.viewBtn} ${view === 'list' ? styles.viewActive : ''}`} onClick={() => setView('list')}>☰ قائمة</button>
          </div>
        </div>

        {/* عرض البطاقات */}
        {view === 'grid' && (
          <div className={styles.grid}>
            {JUZ_DATA.map(j => {
              const isCurrentJuz = readData.currentJuz === j.juz;
              return (
                <Link key={j.juz} href={`/surah/${j.surah}`} className={`${styles.card} ${isCurrentJuz ? styles.cardCurrent : ''}`}>
                  {isCurrentJuz && <div className={styles.currentBadge}>📖 موضعك</div>}
                  <div className={styles.cardTop}>
                    <div className={styles.juzNum}>{j.juz}</div>
                    <div className={styles.juzLabel}>الجزء</div>
                  </div>
                  <div className={styles.cardBody}>
                    <div className={styles.startsSurah}>يبدأ بـ {j.starts}</div>
                    <div className={styles.startsVerse}>آية {j.verse}</div>
                    <div className={styles.pagesInfo}>~{PAGES_PER_JUZ} صفحة</div>
                  </div>
                  <div className={styles.cardArrow}>←</div>
                </Link>
              );
            })}
          </div>
        )}

        {/* عرض القائمة بالسور */}
        {view === 'list' && surahs.length > 0 && (
          <div className={styles.surahsSection}>
            {JUZ_DATA.map(j => {
              const nextJuz  = JUZ_DATA[JUZ_DATA.indexOf(j) + 1];
              const juzSurahs = surahs.filter(s => s.number >= j.surah && (!nextJuz || s.number < nextJuz.surah));
              const isCurrentJuz = readData.currentJuz === j.juz;
              return (
                <div key={j.juz} id={`juz-${j.juz}`} className={`${styles.juzGroup} ${isCurrentJuz ? styles.juzGroupCurrent : ''}`}>
                  <div className={styles.juzGroupHeader}>
                    <span className={styles.juzGroupNum}>الجزء {j.juz}</span>
                    <span className={styles.juzGroupSub}>يبدأ من {j.starts}</span>
                    {isCurrentJuz && <span className={styles.currentTag}>📖 موضعك</span>}
                  </div>
                  <div className={styles.juzSurahs}>
                    {juzSurahs.map(s => (
                      <Link key={s.number} href={`/surah/${s.number}`} className={styles.surahChip}>
                        <span className={styles.chipNum}>{s.number}</span>
                        {s.name}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
