import '../styles/globals.css';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import Splash from '../components/Splash';

export default function App({ Component, pageProps }) {
  const [dark, setDark] = useState(false);
  const [toast, setToast] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('q_dark') === 'true';
    setDark(saved);
    if (saved) document.body.classList.add('dark');
  }, []);

  function toggleDark() {
    const next = !dark;
    setDark(next);
    document.body.classList.toggle('dark', next);
    localStorage.setItem('q_dark', next);
  }

  function showToast(msg) {
    setToast(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2500);
  }

  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Amiri+Quran&family=Amiri:wght@400;700&family=Tajawal:wght@300;400;500;700&display=swap" rel="stylesheet" />
      </Head>
      <Splash />
      <Component {...pageProps} toggleDark={toggleDark} dark={dark} showToast={showToast} user={user} onAuth={setUser} />
      <div className={`toast ${toastVisible ? 'show' : ''}`}>{toast}</div>
    </>
  );
}
