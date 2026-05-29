import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function AyahRedirect() {
  const router = useRouter();
  const { id, verse } = router.query;
  useEffect(() => {
    if (id && verse) router.replace(`/surah/${id}#v${verse}`);
  }, [id, verse]);
  return <div style={{padding:'40px',textAlign:'center',fontFamily:'Tajawal,sans-serif'}}>جارٍ التوجيه...</div>;
}
