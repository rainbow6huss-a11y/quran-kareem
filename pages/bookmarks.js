import { useState, useEffect } from 'react';
import SeoHead from '../components/SeoHead';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import { supabase } from '../lib/supabase';
import { fetchSurahWithCache } from '../lib/apiCache';
import styles from '../styles/Bookmarks.module.css';

export default function BookmarksPage({ toggleDark, dark, showToast, user, onAuth }) {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [filter,    setFilter]    = useState('all');
  const [shareMode, setShareMode] = useState(false);

  useEffect(() => { loadBookmarks(); }, [user]);

  async function loadBookmarks() {
    setLoading(true);
    if (user) {
      const { data } = await supabase
        .from('bookmarks').select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setBookmarks(data || []);
    } else {
      const saved = JSON.parse(localStorage.getItem('q_bookmarks') || '[]');
      // جلب نص الآية من cache
      const enriched = await Promise.all(saved.map(async b => {
        try {
          const { verses } = await fetchSurahWithCache(b.s);
          const verse = verses.find(v => v.number === b.v);
          return {
            id: `${b.s}_${b.v}`,
            surah_num: b.s, verse_num: b.v,
            surah_name: b.sName,
            verse_text: verse?.text || b.t || '',
          };
        } catch {
          return { id: `${b.s}_${b.v}`, surah_num: b.s, verse_num: b.v, surah_name: b.sName, verse_text: b.t || '' };
        }
      }));
      setBookmarks(enriched);
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

  function shareAll() {
    const text = bookmarks
      .map(bm => `📖 ${bm.surah_name} — آية ${bm.verse_num}\n${bm.verse_text}`)
      .join('\n\n---\n\n');
    if (navigator.share) {
      navigator.share({ title: 'علاماتي في القرآن الكريم', text });
    } else {
      navigator.clipboard.writeText(text);
      showToast('📋 تم نسخ العلامات');
    }
  }

  // تجميع حسب السورة
  const grouped = bookmarks.reduce((acc, bm) => {
    const key = bm.surah_name || bm.surah_num;
    if (!acc[key]) acc[key] = [];
    acc[key].push(bm);
    return acc;
  }, {});

  const surahNames = Object.keys(grouped);

  return (
    <>
      <SeoHead title="علاماتي المحفوظة" description="الآيات الكريمة التي حفظتها للرجوع إليها" path="/bookmarks" />
      <Navbar toggleDark={toggleDark} dark={dark} showToast={showToast} onAuth={onAuth} />

      <div className={styles.page}>
        <div className={styles.header}>
          <div className={styles.headerTop}>
            <h1 className={styles.title}>🔖 علاماتي المحفوظة</h1>
            <div className={styles.headerActions}>
              {bookmarks.length > 0 && (
                <>
                  <button className={styles.shareBtn} onClick={shareAll}>📤 مشاركة</button>
                  <button className={styles.clearBtn} onClick={clearAll}>🗑️ حذف الكل</button>
                </>
              )}
            </div>
          </div>
          <p className={styles.sub}>
            {user ? `${bookmarks.length} علامة محفوظة في حسابك ☁️` : 'سجّل دخولك لحفظها على جميع أجهزتك'}
          </p>

          {/* فلتر حسب السورة */}
          {surahNames.length > 1 && (
            <div className={styles.filterRow}>
              <button className={`${styles.filterBtn} ${filter === 'all' ? styles.filterActive : ''}`} onClick={() => setFilter('all')}>الكل ({bookmarks.length})</button>
              {surahNames.map(name => (
                <button key={name} className={`${styles.filterBtn} ${filter === name ? styles.filterActive : ''}`} onClick={() => setFilter(name)}>
                  {name} ({grouped[name].length})
                </button>
              ))}
            </div>
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
            {bookmarks
              .filter(bm => filter === 'all' || (bm.surah_name || bm.surah_num) === filter)
              .map(bm => (
              <div key={bm.id} className={styles.item}>
                <Link href={`/surah/${bm.surah_num}#v${bm.verse_num}`} className={styles.itemContent}>
                  <div className={styles.itemHeader}>
                    <span className={styles.surahName}>سورة {bm.surah_name || bm.surah_num}</span>
                    <span className={styles.verseNum}>آية {bm.verse_num}</span>
                  </div>
                  {bm.verse_text ? (
                    <div className={styles.versePreview}>{bm.verse_text.substring(0, 120)}{bm.verse_text.length > 120 ? '...' : ''}</div>
                  ) : (
                    <div className={styles.verseLoading}>جارٍ تحميل النص...</div>
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
