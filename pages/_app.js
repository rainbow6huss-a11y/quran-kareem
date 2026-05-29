import '../styles/globals.css';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Splash from '../components/Splash';
import AudioPlayer from '../components/AudioPlayer';
import BackToTop from '../components/BackToTop';

export default function App({ Component, pageProps }) {
  const [dark, setDark]           = useState(false);
  const [toast, setToast]         = useState('');
  const [toastVisible, setTV]     = useState(false);
  const [user, setUser]           = useState(null);

  // Audio state lifted to _app so player persists across pages
  const [audioSurah,  setAudioSurah]  = useState(null);
  const [audioName,   setAudioName]   = useState('');
  const [audioVerses, setAudioVerses] = useState([]);
  const [playingVerse,setPlayingVerse]= useState(null);

  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem('q_dark') === 'true';
    setDark(saved);
    if (saved) document.body.classList.add('dark');
  }, []);

  // Stop audio when navigating away from surah page
  useEffect(() => {
    const handleRouteChange = (url) => {
      if (!url.startsWith('/surah/')) {
        setPlayingVerse(null);
        setAudioSurah(null);
      }
    };
    router.events.on('routeChangeStart', handleRouteChange);
    return () => router.events.off('routeChangeStart', handleRouteChange);
  }, [router]);

  function toggleDark() {
    const next = !dark;
    setDark(next);
    document.body.classList.toggle('dark', next);
    localStorage.setItem('q_dark', next);
  }

  function showToast(msg) {
    setToast(msg); setTV(true);
    setTimeout(() => setTV(false), 2500);
  }

  // Props passed to every page
  const sharedProps = {
    toggleDark, dark, showToast, user, onAuth: setUser,
    // Audio controls passed down to surah page
    setAudioSurah, setAudioName, setAudioVerses,
    playingVerse, setPlayingVerse,
  };

  const showPlayer = audioSurah && router.pathname.startsWith('/surah/');

  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#2d5a3d" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Amiri+Quran&family=Amiri:wght@400;700&family=Tajawal:wght@300;400;500;700&family=Noto+Naskh+Arabic:wght@400;700&display=swap" rel="stylesheet" />
      </Head>

      <Splash />

      <Component {...pageProps} {...sharedProps} />

      {/* Global audio player — persists across navigation */}
      {showPlayer && (
        <AudioPlayer
          surahNum={audioSurah}
          surahName={audioName}
          verses={audioVerses}
          playingVerse={playingVerse}
          onVerseChange={setPlayingVerse}
        />
      )}

      <BackToTop />
      <div className={`toast ${toastVisible ? 'show' : ''}`}>{toast}</div>
    </>
  );
}
