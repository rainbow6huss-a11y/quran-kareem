import TajweedText from './TajweedText';
import styles from '../styles/Surah.module.css';
import { SAJDA_VERSES } from '../lib/constants';

/**
 * VerseCard — بطاقة آية واحدة
 * مُستخرجة من surah/[id].js
 */
export default function VerseCard({
  verse,
  surahNum,
  prevVerse,
  playingVerse,
  fontSize,
  fontFamily,
  showTrans,
  showTranslation,
  showTajweed,
  focusMode,
  tajweedData,
  translation,
  showAsbab,
  isBookmarked,
  dark,
  onPlay,
  onToggleBookmark,
  onCopy,
  onShare,
  onToggleAsbab,
}) {
  const fontStyle = {
    fontSize: `${fontSize}rem`,
    fontFamily:
      fontFamily === 'noto-naskh' ? "'Noto Naskh Arabic', serif"
      : fontFamily === 'amiri' ? "'Amiri', serif"
      : "'Amiri Quran', serif",
  };

  const isSajda = SAJDA_VERSES[surahNum] === verse.number;
  const pageChanged = verse.page && (!prevVerse || prevVerse.page !== verse.page);

  return (
    <div>
      {/* فاصل الصفحة */}
      {pageChanged && (
        <div className={styles.pageMarker}>
          <div className={styles.pageMarkerLine} />
          <div className={styles.pageMarkerInfo}>
            <span>صفحة {verse.page}</span>
            <span>•</span>
            <span>جزء {verse.juz}</span>
            {verse.hizb && <span>• حزب {Math.ceil(verse.hizb / 2)}</span>}
          </div>
          <div className={styles.pageMarkerLine} />
        </div>
      )}

      <div
        id={`v${verse.number}`}
        data-verse={verse.number}
        className={`${styles.verse} ${playingVerse === verse.number ? styles.playing : ''}`}
      >
        <div className={styles.verseTop}>
          <div className={styles.verseNum}>{verse.number}</div>
          <div className={styles.verseBody}>
            <div className={styles.verseText}>
              {showTajweed && tajweedData[verse.number] ? (
                <TajweedText
                  text={verse.text}
                  annotations={tajweedData[verse.number]}
                  fontSize={fontSize}
                  fontFamily={fontStyle.fontFamily}
                  dark={dark}
                />
              ) : (
                <span style={fontStyle}>{verse.text}</span>
              )}
            </div>
            {showTrans && verse.tafsir && !focusMode && (
              <div className={styles.verseTrans}>{verse.tafsir}</div>
            )}
            {showTranslation && translation[verse.number] && !focusMode && (
              <div className={styles.verseTranslation}>{translation[verse.number]}</div>
            )}
          </div>
          <button
            className={`${styles.playBtn} ${playingVerse === verse.number ? styles.playBtnActive : ''}`}
            onClick={() => onPlay(verse.number)}
          >
            {playingVerse === verse.number ? '🔊' : '▶'}
          </button>
        </div>

        {/* سبب النزول */}
        {showAsbab === verse.number && (
          <div className={styles.asbabBox}>
            <div className={styles.asbabTitle}>📜 سبب النزول</div>
            <div className={styles.asbabText}>
              لمعرفة سبب نزول هذه الآية، يمكنك الرجوع إلى كتب أسباب النزول
              مثل كتاب &quot;أسباب النزول&quot; للإمام الواحدي أو تفسير ابن كثير.
            </div>
            <a href={`https://quran.com/ar/${surahNum}/${verse.number}`}
              target="_blank" rel="noreferrer" className={styles.asbabLink}>
              🔗 اقرأ في Quran.com
            </a>
          </div>
        )}

        {/* علامة السجدة */}
        {isSajda && (
          <div className={styles.sajdaAlert}>
            ⬇️ آية سجدة — السجود سنة عند التلاوة
          </div>
        )}

        {/* أزرار الآية */}
        <div className={styles.verseActions}>
          <button className={`${styles.actionBtn} ${isBookmarked ? styles.bmActive : ''}`}
            onClick={() => onToggleBookmark(verse.number)}>
            {isBookmarked ? '🔖 محفوظ' : '🔖 حفظ'}
          </button>
          <button className={styles.actionBtn} onClick={() => onCopy(verse.number)}>📋 نسخ</button>
          <button className={styles.actionBtn} onClick={() => onShare(verse.number)}>🔗 مشاركة</button>
          <button className={styles.actionBtn} onClick={() => onToggleAsbab(verse.number)}>📜 سبب النزول</button>
        </div>
      </div>
    </div>
  );
}
