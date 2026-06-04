import styles from './ErrorRetry.module.css';

/**
 * ErrorRetry — يعرض رسالة خطأ واضحة مع زر إعادة المحاولة
 */
export default function ErrorRetry({ message = 'حدث خطأ في التحميل', onRetry }) {
  return (
    <div className={styles.wrap}>
      <div className={styles.icon}>⚠️</div>
      <p className={styles.msg}>{message}</p>
      {onRetry && (
        <button className={styles.btn} onClick={onRetry}>
          🔄 إعادة المحاولة
        </button>
      )}
    </div>
  );
}
