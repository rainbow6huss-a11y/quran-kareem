import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import { supabase } from '../lib/supabase';
import styles from '../styles/Bookmarks.module.css';

export default function BookmarksPage({ toggleDark, dark, showToast, user, onAuth }) {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookmarks();
  }, [user]);

  async function loadBookmarks() {
    setLoading(true);
    if (user) {
      const { data } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setBookmarks(data || []);
    } else {
      const saved = JSON.parse(localStorage.getItem('q_bookmarks') || '[]');
      setBookmarks(saved.map((b, i) => ({ id: i, surah_num: b.s, verse_num: b.v, surah_name: b.sName, verse_text: '' })));
    }
    setLoading(false);
  }

  async function deleteBookmark(id, surahNum, verseNum) {
    if (user) {
      await supabase.from('bookmarks').delete().eq('id', id);
    } else {
      let saved = JSON.parse(localStorage.getItem('q_bookmarks') || '[]');
      saved = saved.filter(b => !(b.s === surahNum && b.v === verseNum));
      localStorage.setItem('q_bookmarks', JSON.stringify(saved));
    }
    setBookmarks(prev => prev.filter(b => b.id !== id));
    showToast('🗑️ تم حذف العلامة');
  }

  async function clearAll() {
    if (!window.confirm('هل تريد حذف جميع العلامات؟')) return;
    if (user) {
      await supabase.from('bookmarks').delete().eq('user_id', user.id);
    } else {
      localStorage.setItem('q_bookmarks', '[]');
    }
    setBookmarks([]);
    showToast('🗑️ تم حذف جميع العلامات');
  }

  return (
    <>
      <Head><title>علاماتي - القرآن الكريم</title></Head>
      <Navbar toggleDark={toggleDark} dark={dark} showToast={showToast} onAuth={onAuth} />

      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>🔖 علاماتي المحفوظة</h1>
          <p className={styles.sub}>
            {user ? `محفوظة في حسابك ☁️` : 'سجّل دخولك لحفظها على جميع أجهزتك'}
          </p>
          {bookmarks.length > 0 && (
            <button className={styles.clearBtn} onClick={clearAll}>🗑️ حذف الكل</button>
          )}
        </div>

        {loading ? (
          <div className="loading"><div className="loader" /><div>جارٍ التحميل...</div></div>
        ) : bookmarks.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>🔖</div>
            <h3>لا توجد علامات محفوظة</h3>
            <p>اضغط على زر 🔖 في أي آية لحفظها هنا</p>
            <Link href="/" className={styles.browseBtn}>تصفح القرآن</Link>
          </div>
        ) : (
          <div className={styles.list}>
            {bookmarks.map(bm => (
              <div key={bm.id} className={styles.item}>
                <Link href={`/surah/${bm.surah_num}#v${bm.verse_num}`} className={styles.itemContent}>
                  <div className={styles.itemHeader}>
                    <span className={styles.surahName}>سورة {bm.surah_name || bm.surah_num}</span>
                    <span className={styles.verseNum}>آية {bm.verse_num}</span>
                  </div>
                  {bm.verse_text && (
                    <div className={styles.versePreview}>{bm.verse_text.substring(0, 100)}...</div>
                  )}
                  <div className={styles.itemFooter}>
                    <span className={styles.goRead}>اقرأ ←</span>
                  </div>
                </Link>
                <button className={styles.deleteBtn} onClick={() => deleteBookmark(bm.id, bm.surah_num, bm.verse_num)}>✕</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
