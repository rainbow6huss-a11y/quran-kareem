import { useEffect, useState } from 'react';
import styles from './Splash.module.css';

export default function Splash() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Check if shown before in this session
    if (sessionStorage.getItem('splashShown')) {
      setVisible(false);
      return;
    }
    const timer = setTimeout(() => close(), 5000);
    return () => clearTimeout(timer);
  }, []);

  function close() {
    setFading(true);
    setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem('splashShown', 'true');
    }, 600);
  }

  if (!visible) return null;

  return (
    <div className={`${styles.splash} ${fading ? styles.fadeOut : ''}`} onClick={close}>
      {/* Stars */}
      {[...Array(10)].map((_, i) => (
        <div key={i} className={styles.star} style={{
          top: `${[8,20,60,75,40,85,15,50,30,65][i]}%`,
          left: `${[15,70,10,80,88,45,40,55,25,92][i]}%`,
          animationDelay: `${i * 0.3}s`
        }} />
      ))}

      <div className={styles.content}>
        <div className={styles.ornament}>❧ ✦ ❧</div>

        <div className={styles.bismillah}>
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </div>

        <div className={styles.title}>القرآن الكريم</div>

        <div className={styles.divider} />

        <div className={styles.dedication}>
          <div className={styles.dedLabel}>✦ إهداء ✦</div>
          <div className={styles.dedSub}>هذا العمل المتواضع صدقةٌ جارية</div>
          <div className={styles.dedName}>إلى فرح ياسر</div>
          <div className={styles.dedDua}>
            اللهم اجعله في ميزان حسناتها<br />
            ونوراً لها في الدنيا والآخرة
          </div>
        </div>

        <div className={styles.divider} style={{ width: 60 }} />

        <div className={styles.ayah}>
          وَمَن يَعْمَلْ مِثْقَالَ ذَرَّةٍ خَيْرًا يَرَهُ
        </div>
        <div className={styles.ayahRef}>الزلزلة : ٧</div>

        <div className={styles.skip}>اضغط للمتابعة ←</div>
      </div>
    </div>
  );
}
