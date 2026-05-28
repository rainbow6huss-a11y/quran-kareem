import styles from './Skeleton.module.css';

export function SurahSkeleton() {
  return (
    <div className={styles.wrap}>
      {/* Surah header skeleton */}
      <div className={styles.header}>
        <div className={`${styles.block} ${styles.title}`} />
        <div className={`${styles.block} ${styles.meta}`} />
        <div className={`${styles.block} ${styles.bismillah}`} />
      </div>
      {/* Verse skeletons */}
      {Array.from({length: 6}).map((_,i) => (
        <div key={i} className={styles.verse}>
          <div className={`${styles.block} ${styles.num}`} />
          <div className={styles.verseBody}>
            <div className={`${styles.block} ${styles.line} ${styles.long}`} />
            <div className={`${styles.block} ${styles.line} ${styles.medium}`} />
            <div className={`${styles.block} ${styles.line} ${styles.short}`} />
            <div className={`${styles.block} ${styles.tafsir}`} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SurahListSkeleton() {
  return (
    <div className={styles.grid}>
      {Array.from({length: 12}).map((_,i) => (
        <div key={i} className={styles.card}>
          <div className={`${styles.block} ${styles.cardNum}`} />
          <div className={styles.cardInfo}>
            <div className={`${styles.block} ${styles.cardName}`} />
            <div className={`${styles.block} ${styles.cardMeta}`} />
          </div>
        </div>
      ))}
    </div>
  );
}
