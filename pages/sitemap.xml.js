const SURAH_COUNT = 114;
const BASE_URL = 'https://quran-kareem-pi.vercel.app';

function generateSitemap() {
  const staticPages = [
    '', '/khatma', '/juz', '/bookmarks', '/search',
    '/athkar', '/tasbih', '/khatm-dua', '/hadya',
  ];

  const surahPages = Array.from({ length: SURAH_COUNT }, (_, i) => `/surah/${i + 1}`);

  const allPages = [...staticPages, ...surahPages];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${BASE_URL}${page}</loc>
    <changefreq>${page === '' ? 'daily' : 'weekly'}</changefreq>
    <priority>${page === '' ? '1.0' : page.startsWith('/surah') ? '0.8' : '0.6'}</priority>
  </url>`).join('\n')}
</urlset>`;
}

export default function Sitemap() { return null; }

export async function getServerSideProps({ res }) {
  const sitemap = generateSitemap();
  res.setHeader('Content-Type', 'text/xml');
  res.setHeader('Cache-Control', 'public, s-maxage=86400');
  res.write(sitemap);
  res.end();
  return { props: {} };
}
