import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import styles from '../styles/About.module.css';

export default function AboutPage({ toggleDark, dark, showToast, onAuth }) {
  return (
    <>
      <Head><title>عن الموقع - القرآن الكريم</title></Head>
      <Navbar toggleDark={toggleDark} dark={dark} showToast={showToast} onAuth={onAuth} />

      <div className={styles.page}>

        {/* Hero مختصر */}
        <div className={styles.hero}>
          <div className={styles.ornament}>❧ ✦ ❧</div>
          <h1 className={styles.title}>عن الموقع</h1>
          <p className={styles.sub}>
            موقع قرآن كامل، صدقة جارية إلى <strong>فرح ياسر</strong>
          </p>
        </div>

        {/* الإهداء */}
        <div className={styles.dedicationCard}>
          <div className={styles.dedIcon}>🤲</div>
          <div className={styles.dedName}>فرح ياسر</div>
          <p className={styles.dedDua}>
            اللهم اجعله في ميزان حسناتها<br/>
            ونوراً لها في الدنيا والآخرة<br/>
            وكل من قرأ القرآن من خلاله فأجره لها
          </p>
          <div className={styles.dedAyah}>وَمَن يَعْمَلْ مِثْقَالَ ذَرَّةٍ خَيْرًا يَرَهُ</div>
          <div className={styles.dedRef}>الزلزلة: ٧</div>
        </div>

        {/* الرواية المعتمدة */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>📜 الرواية المعتمدة</h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}><span className={styles.infoLabel}>الرواية</span><span className={styles.infoValue}>حفص عن عاصم</span></div>
            <div className={styles.infoItem}><span className={styles.infoLabel}>الطريق</span><span className={styles.infoValue}>الشاطبية</span></div>
            <div className={styles.infoItem}><span className={styles.infoLabel}>عدد الآيات</span><span className={styles.infoValue}>٦٢٣٦ آية</span></div>
            <div className={styles.infoItem}><span className={styles.infoLabel}>عدد الصفحات</span><span className={styles.infoValue}>٦٠٤ صفحة</span></div>
            <div className={styles.infoItem}><span className={styles.infoLabel}>عدد السور</span><span className={styles.infoValue}>١١٤ سورة</span></div>
            <div className={styles.infoItem}><span className={styles.infoLabel}>عدد الأجزاء</span><span className={styles.infoValue}>٣٠ جزءًا</span></div>
          </div>
        </div>

        {/* المميزات */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>✨ مميزات الموقع</h2>
          <div className={styles.featuresGrid}>
            {[
              ['📖','قراءة القرآن','114 سورة كاملة'],
              ['🎧','الاستماع','4 قراء مع تزامن'],
              ['📚','التفسير','تفسير الميسر'],
              ['🌐','الترجمة','5 لغات'],
              ['🌙','الختمة','تتبع يومي وstreak'],
              ['🔖','العلامات','حفظ الآيات المفضلة'],
              ['🔍','البحث','في نصوص القرآن'],
              ['📿','الأذكار','صباح ومساء وأدعية'],
              ['📊','الإحصائيات','تقدمك اليومي'],
              ['📱','PWA','تطبيق على هاتفك'],
              ['🔒','الخصوصية','لا إعلانات ولا تتبع'],
              ['🤲','صدقة جارية','خالصة لوجه الله'],
            ].map(([icon,title,desc],i) => (
              <div key={i} className={styles.featureCard}>
                <div className={styles.featureIcon}>{icon}</div>
                <div className={styles.featureTitle}>{title}</div>
                <div className={styles.featureDesc}>{desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* الخصوصية */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>🔒 الخصوصية</h2>
          <div className={styles.privacyCard}>
            <p>لا نجمع أي بيانات شخصية بدون إذنك.</p>
            <p>إحصائياتك تُحفظ في متصفحك فقط، أو في حساب Google إذا اخترت تسجيل الدخول.</p>
            <p>لا يوجد أي إعلانات — هذا الموقع صدقة جارية خالصة لوجه الله.</p>
          </div>
        </div>

        {/* الترخيص */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>📋 الترخيص</h2>
          <div className={styles.licenseCard}>
            <p>يمكنك استخدام هذا العمل لأي غرض خيري.</p>
            <a href="https://github.com/rainbow6huss-a11y/quran-kareem"
              target="_blank" rel="noreferrer"
              className={styles.githubBtn}>
              👨‍💻 قارئ الكود على GitHub
            </a>
          </div>
        </div>

        {/* دعاء ختامي */}
        <div className={styles.finalDua}>
          <div className={styles.finalDuaText}>
            اللهم اجعل هذا العمل خالصًا لوجهك<br/>
            وتقبّله منا، واغفر لنا ولوالدينا وللمسلمين أجمعين
          </div>
          <div className={styles.finalDuaAmen}>آمين 🤲</div>
        </div>

        {/* روابط */}
        <div className={styles.links}>
          <Link href="/" className={styles.linkBtn}>🏠 الرئيسية</Link>
          <Link href="/contact" className={styles.linkBtn}>✉️ تواصل معنا</Link>
          <Link href="/hadya" className={styles.linkBtn}>🤲 الإهداء</Link>
        </div>

      </div>
    </>
  );
}
