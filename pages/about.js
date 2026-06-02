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

        {/* Hero */}
        <div className={styles.hero}>
          <div className={styles.ornament}>❧ ✦ ❧</div>
          <h1 className={styles.title}>عن موقع القرآن الكريم</h1>
          <p className={styles.sub}>نُورٌ عَلَى نُور</p>
        </div>

        {/* الإهداء */}
        <div className={styles.dedicationCard}>
          <div className={styles.dedIcon}>🤲</div>
          <h2 className={styles.dedTitle}>صدقة جارية خالصة</h2>
          <p className={styles.dedText}>هذا العمل المتواضع مُهدى إلى</p>
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
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>الرواية</span>
              <span className={styles.infoValue}>حفص عن عاصم</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>الطريق</span>
              <span className={styles.infoValue}>الشاطبية</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>عدد الآيات</span>
              <span className={styles.infoValue}>٦٢٣٦ آية</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>عدد الصفحات</span>
              <span className={styles.infoValue}>٦٠٤ صفحة</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>عدد السور</span>
              <span className={styles.infoValue}>١١٤ سورة</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>عدد الأجزاء</span>
              <span className={styles.infoValue}>٣٠ جزءًا</span>
            </div>
          </div>
        </div>

        {/* المميزات */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>✨ مميزات الموقع</h2>
          <div className={styles.featuresGrid}>
            {[
              ['📖','قراءة القرآن','114 سورة كاملة بالرسم العثماني'],
              ['🎧','الاستماع','4 قراء مع تزامن الآيات'],
              ['📚','التفسير','تفسير الميسر لكل آية'],
              ['🌐','الترجمة','5 لغات: إنجليزية، فرنسية، تركية، أردو'],
              ['🌙','الختمة','تتبع يومي مع streak وإحصائيات'],
              ['🔖','العلامات','حفظ الآيات المفضلة'],
              ['🔍','البحث','بحث في نصوص القرآن كاملاً'],
              ['📿','الأذكار','أذكار الصباح والمساء والأدعية'],
              ['📊','الإحصائيات','تتبع تقدمك اليومي'],
              ['📱','PWA','تثبيته كتطبيق على هاتفك'],
            ].map(([icon,title,desc],i) => (
              <div key={i} className={styles.featureCard}>
                <div className={styles.featureIcon}>{icon}</div>
                <div className={styles.featureTitle}>{title}</div>
                <div className={styles.featureDesc}>{desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* المصادر */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>🛠 المصادر والتقنيات</h2>
          <div className={styles.techCard}>
            <div className={styles.techItem}>
              <span className={styles.techLabel}>النص القرآني</span>
              <span className={styles.techValue}>مشروع AlQuran Cloud API</span>
            </div>
            <div className={styles.techItem}>
              <span className={styles.techLabel}>التلاوات الصوتية</span>
              <span className={styles.techValue}>Islamic Network CDN</span>
            </div>
            <div className={styles.techItem}>
              <span className={styles.techLabel}>إطار العمل</span>
              <span className={styles.techValue}>Next.js + React</span>
            </div>
            <div className={styles.techItem}>
              <span className={styles.techLabel}>قاعدة البيانات</span>
              <span className={styles.techValue}>Supabase</span>
            </div>
            <div className={styles.techItem}>
              <span className={styles.techLabel}>الاستضافة</span>
              <span className={styles.techValue}>Vercel</span>
            </div>
          </div>
        </div>

        {/* الخصوصية */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>🔒 الخصوصية</h2>
          <div className={styles.privacyCard}>
            <p>لا نجمع أي بيانات شخصية بدون إذنك.</p>
            <p>إحصائياتك تُحفظ في متصفحك فقط، أو في حساب Google إذا اخترت تسجيل الدخول.</p>
            <p>لا يوجد أي إعلانات — هذا الموقع صدقة جارية خالصة.</p>
          </div>
        </div>

        {/* الترخيص */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>📋 الترخيص</h2>
          <div className={styles.licenseCard}>
            يمكنك استخدام الكود لأي غرض خيري.<br/>
            ذكر المصدر غير إلزامي لكنه محبَّب.<br/>
            <span className={styles.licenseNote}>بارك الله في كل من ساهم في نشر القرآن الكريم 🤲</span>
          </div>
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
