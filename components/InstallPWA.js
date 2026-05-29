import { useState, useEffect } from 'react';
import styles from './InstallPWA.module.css';

export default function InstallPWA() {
  const [prompt, setPrompt] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = e => {
      e.preventDefault();
      setPrompt(e);
      setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  async function install() {
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') setVisible(false);
    setPrompt(null);
  }

  if (!visible) return null;

  return (
    <div className={styles.banner}>
      <div className={styles.content}>
        <span className={styles.icon}>📱</span>
        <div className={styles.text}>
          <div className={styles.title}>ثبّت التطبيق</div>
          <div className={styles.sub}>استخدم القرآن كتطبيق على هاتفك</div>
        </div>
      </div>
      <div className={styles.actions}>
        <button className={styles.installBtn} onClick={install}>تثبيت</button>
        <button className={styles.closeBtn} onClick={() => setVisible(false)}>✕</button>
      </div>
    </div>
  );
}
