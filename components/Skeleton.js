import styles from './Skeleton.module.css';

// ── Skeleton خاص بصفحة السورة ──
export function SurahSkeleton() {
  return (
    <div className={styles.wrap}>
      {/* رأس السورة */}
      <div className={styles.header}>
        <div className={`${styles.bone} ${styles.navBtn}`} />
        <div className={`${styles.bone} ${styles.title}`} />
        <div className={`${styles.bone} ${styles.navBtn}`} />
      </div>
      <div className={styles.metaRow}>
        {[80, 60, 70, 100].map((w, i) => (
          <div key={i} className={styles.bone} style={{ width: w, height: 18, borderRadius: 20 }} />
        ))}
      </div>

      {/* البسملة */}
      <div className={styles.bismillahSk}>
        <div className={`${styles.bone} ${styles.bismillahLine}`} />
      </div>

      {/* التبويبات */}
      <div className={styles.tabs}>
        {[1,2,3].map(i => (
          <div key={i} className={`${styles.bone} ${styles.tab}`} />
        ))}
      </div>

      {/* الأزرار */}
      <div className={styles.controls}>
        {[1,2,3,4,5].map(i => (
          <div key={i} className={`${styles.bone} ${styles.btn}`} />
        ))}
      </div>

      {/* نص الآيات */}
      <div className={styles.verses}>
        {[90, 75, 85, 60, 80, 70, 55].map((w, i) => (
          <div key={i} className={styles.verseLine}>
            <div className={`${styles.bone} ${styles.verseNum}`} />
            <div className={styles.bone} style={{ flex: 1, height: 28, borderRadius: 6 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Skeleton للصفحة الرئيسية ──
export function HomeSkeleton() {
  return (
    <div className={styles.homeWrap}>
      {[...Array(8)].map((_, i) => (
        <div key={i} className={`${styles.bone} ${styles.surahCard}`} />
      ))}
    </div>
  );
}
