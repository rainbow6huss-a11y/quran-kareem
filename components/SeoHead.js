import Head from 'next/head';
import { SITE_NAME, SITE_DESC, SITE_URL } from '../lib/constants';

/**
 * SeoHead — مكوّن موحد للـ SEO في كل الصفحات
 * الاستخدام: <SeoHead title="..." description="..." />
 */
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
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="ar_SA" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />

      {/* Arabic / RTL */}
      <meta httpEquiv="content-language" content="ar" />
    </Head>
  );
}
