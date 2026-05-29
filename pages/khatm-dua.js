import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import styles from '../styles/KhatmDua.module.css';

const DUA = [
  { text: 'اللَّهُمَّ ارْحَمْنِي بِالْقُرْآنِ، وَاجْعَلْهُ لِي إِمَامًا وَنُورًا وَهُدىً وَرَحْمَةً', ref: '' },
  { text: 'اللَّهُمَّ ذَكِّرْنِي مِنْهُ مَا نُسِّيتُ، وَعَلِّمْنِي مِنْهُ مَا جَهِلتُ', ref: '' },
  { text: 'وَارْزُقْنِي تِلاَوَتَهُ آنَاءَ اللَّيْلِ وَأَطْرَافَ النَّهَارِ', ref: '' },
  { text: 'وَاجْعَلْهُ لِي حُجَّةً يَا رَبَّ الْعَالَمِينَ', ref: '' },
];

export default function KhatmDuaPage({ toggleDark, dark, showToast, onAuth }) {
  return (
    <>
      <Head><title>دعاء ختم القرآن الكريم</title></Head>
      <Navbar toggleDark={toggleDark} dark={dark} showToast={showToast} onAuth={onAuth} />

      <div className={styles.page}>
        <div className={styles.header}>
          <div className={styles.ornament}>❧ ✦ ❧</div>
          <h1 className={styles.title}>دعاء ختم القرآن الكريم</h1>
          <p className={styles.sub}>اللهم تقبّل منا واجعله شفيعاً لنا يوم القيامة</p>
        </div>

        <div className={styles.duaCard}>
          {DUA.map((d, i) => (
            <div key={i} className={styles.duaLine}>
              <div className={styles.duaText}>{d.text}</div>
            </div>
          ))}
          <div className={styles.ameen}>آمين</div>
        </div>

        <div className={styles.actions}>
          <button className={styles.copyBtn} onClick={() => {
            const text = DUA.map(d => d.text).join('\n') + '\nآمين';
            navigator.clipboard.writeText(text);
            showToast('📋 تم نسخ الدعاء');
          }}>📋 نسخ الدعاء</button>

          <button className={styles.shareBtn} onClick={() => {
            const text = DUA.map(d => d.text).join('\n') + '\nآمين';
            if (navigator.share) navigator.share({ title: 'دعاء ختم القرآن', text });
            else { navigator.clipboard.writeText(text); showToast('📋 تم النسخ'); }
          }}>🔗 مشاركة</button>
        </div>

        <div className={styles.backWrap}>
          <Link href="/khatma" className={styles.backBtn}>← العودة للختمة</Link>
        </div>

        <div className={styles.footer}>
          <div className={styles.footerAyah}>
            إِنَّ هَٰذَا الْقُرْآنَ يَهْدِي لِلَّتِي هِيَ أَقْوَمُ
          </div>
          <div className={styles.footerRef}>الإسراء: ٩</div>
        </div>
      </div>
    </>
  );
}
