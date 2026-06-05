import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="ar" dir="rtl">
      <Head>
        <meta charSet="UTF-8" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <link rel="manifest" href="/manifest.json" />
        {/* Preconnect للخدمات الخارجية */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://api.alquran.cloud" />
        <link rel="dns-prefetch" href="https://cdn.islamic.network" />
        <link rel="dns-prefetch" href="https://api.alquran.cloud" />
        {/* Preload الخط الرئيسي */}
        <link rel="preload" href="https://fonts.gstatic.com/s/amiriquran/v14/x3dkckHVYrCU5BU15c4BfA.woff2"
          as="font" type="font/woff2" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Amiri+Quran&family=Amiri:wght@400;700&family=Tajawal:wght@300;400;500;600;700&family=Noto+Naskh+Arabic:wght@400;700&display=swap" rel="stylesheet" />
        <style>{`
          @font-face {
            font-family: 'KFGQPC';
            src: url('https://cdn.jsdelivr.net/gh/mohamedbassem/quran-fonts@main/fonts/UthmanicHafs_V22.woff2') format('woff2');
            font-display: swap;
          }
        `}</style>
        <link href="https://cdn.jsdelivr.net/npm/quran-fonts@1.0.0/dist/UthmanicHafs.css" rel="stylesheet" onerror="this.remove()"/>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
