import { useState } from 'react';
import Head from 'next/head';
import Navbar from '../components/Navbar';
import styles from '../styles/Contact.module.css';

export default function ContactPage({ toggleDark, dark, showToast, onAuth }) {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  function handleSubmit() {
    if (!form.name || !form.message) {
      showToast('⚠️ يرجى ملء الاسم والرسالة');
      return;
    }
    const subject = encodeURIComponent(`رسالة من ${form.name} - موقع القرآن الكريم`);
    const body = encodeURIComponent(`الاسم: ${form.name}\nالبريد: ${form.email}\n\nالرسالة:\n${form.message}`);
    window.open(`mailto:rainbow6huss@gmail.com?subject=${subject}&body=${body}`);
    setSent(true);
    showToast('✅ شكراً! جارٍ فتح البريد الإلكتروني');
  }

  return (
    <>
      <Head><title>اتصل بنا - القرآن الكريم</title></Head>
      <Navbar toggleDark={toggleDark} dark={dark} showToast={showToast} onAuth={onAuth} />

      <div className={styles.page}>
        <div className={styles.header}>
          <div className={styles.ornament}>❧ ✦ ❧</div>
          <h1 className={styles.title}>اتصل بنا</h1>
          <p className={styles.sub}>نسعد بتواصلك معنا لأي اقتراح أو ملاحظة</p>
        </div>

        {/* Info Cards */}
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>📧</div>
            <div className={styles.infoTitle}>البريد الإلكتروني</div>
            <div className={styles.infoValue}>rainbow6huss@gmail.com</div>
          </div>
          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>🌐</div>
            <div className={styles.infoTitle}>الموقع</div>
            <div className={styles.infoValue}>quran-kareem-pi.vercel.app</div>
          </div>
          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>⏰</div>
            <div className={styles.infoTitle}>وقت الرد</div>
            <div className={styles.infoValue}>خلال 24-48 ساعة</div>
          </div>
        </div>

        {/* Form */}
        {!sent ? (
          <div className={styles.formCard}>
            <h2 className={styles.formTitle}>أرسل رسالة</h2>
            <div className={styles.field}>
              <label className={styles.label}>الاسم *</label>
              <input className={styles.input} type="text" placeholder="اسمك الكريم"
                value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>البريد الإلكتروني</label>
              <input className={styles.input} type="email" placeholder="بريدك (اختياري)"
                value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>الرسالة *</label>
              <textarea className={styles.textarea} rows={5} placeholder="اكتب رسالتك هنا..."
                value={form.message} onChange={e => setForm(f => ({...f, message: e.target.value}))} />
            </div>
            <button className={styles.submitBtn} onClick={handleSubmit}>
              📨 إرسال الرسالة
            </button>
          </div>
        ) : (
          <div className={styles.successCard}>
            <div className={styles.successIcon}>✅</div>
            <h2 className={styles.successTitle}>شكراً لتواصلك!</h2>
            <p className={styles.successText}>تم فتح تطبيق البريد لإرسال رسالتك. سنرد عليك في أقرب وقت.</p>
            <button className={styles.resetBtn} onClick={() => { setSent(false); setForm({ name:'', email:'', message:'' }); }}>
              إرسال رسالة أخرى
            </button>
          </div>
        )}

        <div className={styles.footer}>
          <div className={styles.footerText}>جزاك الله خيراً على تواصلك معنا 🤲</div>
        </div>
      </div>
    </>
  );
}
