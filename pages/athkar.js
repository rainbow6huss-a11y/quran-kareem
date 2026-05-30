import { useState } from 'react';
import Head from 'next/head';
import Navbar from '../components/Navbar';
import styles from '../styles/Athkar.module.css';

const ATHKAR = {
  morning: {
    title: 'أذكار الصباح',
    icon: '🌅',
    items: [
      { text: 'اللهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ، لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ، لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ، مَن ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ، يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ، وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ، وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ، وَلَا يَئُودُهُ حِفْظُهُمَا، وَهُوَ الْعَلِيُّ الْعَظِيمُ', title: 'آية الكرسي', count: 1, ref: 'البقرة: 255' },
      { text: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ', title: 'ذكر الصباح', count: 1, ref: 'صحيح مسلم' },
      { text: 'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ', title: 'دعاء الصباح', count: 1, ref: 'الترمذي' },
      { text: 'سُبْحَانَ اللهِ وَبِحَمْدِهِ', title: 'تسبيح الصباح', count: 100, ref: 'صحيح مسلم' },
      { text: 'لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ', title: 'لا إله إلا الله', count: 10, ref: 'صحيح البخاري' },
      { text: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ', title: 'سيد الاستغفار', count: 1, ref: 'صحيح البخاري' },
    ]
  },
  evening: {
    title: 'أذكار المساء',
    icon: '🌙',
    items: [
      { text: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ', title: 'ذكر المساء', count: 1, ref: 'أبو داود' },
      { text: 'اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ', title: 'دعاء المساء', count: 1, ref: 'الترمذي' },
      { text: 'أَعُوذُ بِكَلِمَاتِ اللهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ', title: 'الاستعاذة', count: 3, ref: 'صحيح مسلم' },
      { text: 'اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي', title: 'دعاء العافية', count: 3, ref: 'أبو داود' },
      { text: 'سُبْحَانَ اللهِ وَبِحَمْدِهِ', title: 'تسبيح المساء', count: 100, ref: 'صحيح مسلم' },
    ]
  },
  sleep: {
    title: 'أذكار النوم',
    icon: '😴',
    items: [
      { text: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا', title: 'دعاء النوم', count: 1, ref: 'البخاري' },
      { text: 'اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ', title: 'دعاء قبل النوم', count: 3, ref: 'أبو داود' },
      { text: 'سُبْحَانَ اللهِ — الحمد لله — الله أكبر', title: 'تسبيح النوم', count: 33, ref: 'البخاري ومسلم' },
    ]
  },
  prayer: {
    title: 'أذكار الصلاة',
    icon: '🕌',
    items: [
      { text: 'سُبْحَانَ اللهِ', title: 'التسبيح', count: 33, ref: 'صحيح مسلم' },
      { text: 'الْحَمْدُ لِلَّهِ', title: 'التحميد', count: 33, ref: 'صحيح مسلم' },
      { text: 'اللهُ أَكْبَرُ', title: 'التكبير', count: 33, ref: 'صحيح مسلم' },
      { text: 'لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ', title: 'ختام الأذكار', count: 1, ref: 'صحيح مسلم' },
    ]
  },
  quran: {
    title: 'أدعية قرآنية',
    icon: '📖',
    items: [
      { text: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ', title: 'دعاء الدنيا والآخرة', count: 1, ref: 'البقرة: 201' },
      { text: 'رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِن لَّدُنكَ رَحْمَةً', title: 'دعاء ثبات القلب', count: 1, ref: 'آل عمران: 8' },
      { text: 'رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي وَاحْلُلْ عُقْدَةً مِّن لِّسَانِي يَفْقَهُوا قَوْلِي', title: 'دعاء موسى', count: 1, ref: 'طه: 25-28' },
      { text: 'رَبِّ إِنِّي لِمَا أَنزَلْتَ إِلَيَّ مِنْ خَيْرٍ فَقِيرٌ', title: 'دعاء موسى للرزق', count: 1, ref: 'القصص: 24' },
      { text: 'رَبَّنَا اغْفِرْ لَنَا وَلِإِخْوَانِنَا الَّذِينَ سَبَقُونَا بِالْإِيمَانِ', title: 'دعاء المؤمنين', count: 1, ref: 'الحشر: 10' },
      { text: 'حَسْبُنَا اللهُ وَنِعْمَ الْوَكِيلُ', title: 'حسبنا الله', count: 1, ref: 'آل عمران: 173' },
    ]
  },
};

export default function AthkarPage({ toggleDark, dark, showToast, onAuth }) {
  const [activeTab, setActiveTab] = useState('morning');
  const [done, setDone] = useState({});

  const cat = ATHKAR[activeTab];

  function markDone(i) {
    setDone(prev => ({ ...prev, [`${activeTab}-${i}`]: true }));
    showToast('✅ بارك الله فيك');
  }

  function copyText(text) {
    navigator.clipboard.writeText(text);
    showToast('📋 تم النسخ');
  }

  const doneCount = cat.items.filter((_, i) => done[`${activeTab}-${i}`]).length;
  const pct = Math.round((doneCount / cat.items.length) * 100);

  return (
    <>
      <Head><title>الأذكار والأدعية - القرآن الكريم</title></Head>
      <Navbar toggleDark={toggleDark} dark={dark} showToast={showToast} onAuth={onAuth} />

      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>الأذكار والأدعية</h1>
          <p className={styles.sub}>حصن المسلم اليومي</p>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          {Object.entries(ATHKAR).map(([key, cat]) => (
            <button key={key}
              className={`${styles.tab} ${activeTab === key ? styles.tabActive : ''}`}
              onClick={() => { setActiveTab(key); }}>
              {cat.icon} {cat.title}
            </button>
          ))}
        </div>

        {/* Progress */}
        {doneCount > 0 && (
          <div className={styles.progressWrap}>
            <div className={styles.progressBar} style={{ width: `${pct}%` }} />
            <span className={styles.progressText}>{doneCount}/{cat.items.length}</span>
          </div>
        )}

        {/* Items */}
        <div className={styles.list}>
          {cat.items.map((item, i) => {
            const isDone = done[`${activeTab}-${i}`];
            return (
              <div key={i} className={`${styles.card} ${isDone ? styles.cardDone : ''}`}>
                <div className={styles.cardHeader}>
                  <span className={styles.cardTitle}>{item.title}</span>
                  <span className={styles.cardRef}>{item.ref}</span>
                  {item.count > 1 && (
                    <span className={styles.cardCount}>{item.count}×</span>
                  )}
                </div>
                <div className={styles.cardText}>{item.text}</div>
                <div className={styles.cardActions}>
                  <button className={styles.copyBtn} onClick={() => copyText(item.text)}>📋 نسخ</button>
                  <button
                    className={`${styles.doneBtn} ${isDone ? styles.doneBtnActive : ''}`}
                    onClick={() => markDone(i)}
                    disabled={isDone}>
                    {isDone ? '✅ تم' : '○ إتمام'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Reset */}
        {doneCount > 0 && (
          <button className={styles.resetBtn} onClick={() => setDone({})}>
            🔄 إعادة تعيين
          </button>
        )}
      </div>
    </>
  );
}
