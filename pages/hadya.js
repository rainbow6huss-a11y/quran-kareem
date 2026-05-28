import Head from 'next/head';
import Navbar from '../components/Navbar';
import styles from '../styles/Hadya.module.css';

export default function HadyaPage({ toggleDark, dark, showToast }) {
  function share() {
    const url = window.location.origin;
    if (navigator.share) navigator.share({ title: 'القرآن الكريم', url });
    else { navigator.clipboard.writeText(url); showToast('📋 تم نسخ الرابط'); }
  }

  return (
    <>
      <Head><title>إهداء الأجر - القرآن الكريم</title></Head>
      <Navbar toggleDark={toggleDark} dark={dark} showToast={showToast} />
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.topLine} />
          <div className={styles.icon}>🤲</div>

          <div className={styles.dedication}>
            <div className={styles.dedLabel}>✦ إهداء خاص ✦</div>
            <div className={styles.dedSub}>هذا العمل المتواضع صدقةٌ جارية</div>
            <div className={styles.dedName}>إلى فرح ياسر</div>
            <div className={styles.dedDua}>اللهم اجعله في ميزان حسناتها<br />ونوراً لها في الدنيا والآخرة</div>
          </div>

          <h2 className={styles.title}>إهداء الأجر</h2>
          <p className={styles.desc}>هذا الموقع صدقة جارية، كل قراءة فيه نية خير وهداية للناس أجمعين</p>

          <div className={styles.dua}>
            اللهم اجعل ثواب هذا العمل<br />
            صدقةً جاريةً ونوراً لفرح ياسر<br />
            في الدنيا والآخرة
          </div>

          <div className={styles.hadith}>
            قال النبي ﷺ: <em>"إذا مات الإنسان انقطع عنه عمله إلا من ثلاثة: إلا من صدقة جارية، أو علم ينتفع به، أو ولد صالح يدعو له"</em>
          </div>

          <div className={styles.ayah}>
            وَمَن يَعْمَلْ مِثْقَالَ ذَرَّةٍ خَيْرًا يَرَهُ
            <div className={styles.ayahRef}>الزلزلة : ٧</div>
          </div>

          <div className={styles.stats}>
            <div className={styles.stat}><span>١١٤</span>سورة</div>
            <div className={styles.stat}><span>٦٢٣٦</span>آية</div>
            <div className={styles.stat}><span>٣٠</span>جزءًا</div>
          </div>

          <button className={styles.shareBtn} onClick={share}>
            📤 شارك الموقع مع من تحب
          </button>
        </div>
      </div>
    </>
  );
}
