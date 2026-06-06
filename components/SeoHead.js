import Head from 'next/head';
import { SITE_NAME, SITE_DESC, SITE_URL } from '../lib/constants';

export default function SeoHead({
  title,
  description,
  path = '',
  type = 'website',
}) {
  const fullTitle = title ? `${title} — ${SITE_NAME}` : SITE_NAME;
  const desc = description || SITE_DESC;
  const url = `${SITE_URL}${path}`;

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="قرآن فرح" />
      <meta property="og:locale" content="ar_SA" />
      <meta property="og:image" content={`${SITE_URL}/og-image.png`} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={`${SITE_URL}/og-image.png`} />

      {/* SEO إضافي */}
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      <meta httpEquiv="content-language" content="ar" />
      <meta name="language" content="Arabic" />
      <meta name="author" content="قرآن فرح" />
      <meta name="keywords" content="القرآن الكريم, قراءة القرآن, تفسير القرآن, استماع القرآن, قرآن فرح, مصحف, آيات قرآنية" />
    </Head>
  );
}
