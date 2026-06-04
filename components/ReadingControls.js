import styles from '../styles/Surah.module.css';

/**
 * ReadingControls — شريط تحكم القراءة (حجم الخط، نوعه، التفسير، الترجمة...)
 * مُستخرج من surah/[id].js لتخفيف حجمه
 */
export default function ReadingControls({
  readingMode, setReadingMode,
  fontSize, setFontSize,
  fontFamily, setFontFamily,
  showTrans, setShowTrans,
  showTranslation, setShowTranslation,
  translationLang, setTranslationLang,
  showTajweed, setShowTajweed,
  focusMode, setFocusMode,
  onResetTranslation,
}) {
  function save(key, val) {
    localStorage.setItem(key, String(val));
  }

  return (
    <div className={styles.fontControls}>
      {/* وضع القراءة */}
      <div className={styles.readingModeRow}>
        {[['verse','📖 آية بآية'],['page','📄 صفحة كاملة']].map(([v,l]) => (
          <button key={v}
            className={`${styles.modeBtn} ${readingMode === v ? styles.modeBtnActive : ''}`}
            onClick={() => { setReadingMode(v); save('q_reading_mode', v); }}>
            {l}
          </button>
        ))}
      </div>

      {/* حجم الخط */}
      <div className={styles.fontSizeRow}>
        <button className={styles.fontIconBtn}
          onClick={() => { const v = parseFloat((Math.max(1.1, fontSize - 0.2)).toFixed(2)); setFontSize(v); save('q_font_size', v); }}>
          أ−
        </button>
        <div className={styles.fontSteps}>
          {[[1.0,'صغير'],[1.4,'وسط'],[1.8,'كبير'],[2.2,'أكبر']].map(([v,l]) => (
            <button key={v}
              className={`${styles.fontStep} ${Math.abs(fontSize - v) < 0.1 ? styles.fontStepActive : ''}`}
              onClick={() => { setFontSize(v); save('q_font_size', v); }}>
              {l}
            </button>
          ))}
        </div>
        <button className={styles.fontIconBtn}
          onClick={() => { const v = parseFloat((Math.min(2.5, fontSize + 0.2)).toFixed(2)); setFontSize(v); save('q_font_size', v); }}>
          أ+
        </button>
      </div>

      {/* الخط والخيارات */}
      <div className={styles.fontRow}>
        <select className={styles.fontSelect} value={fontFamily}
          onChange={e => { setFontFamily(e.target.value); save('q_font_family', e.target.value); }}>
          <option value="amiri-quran">Amiri Quran</option>
          <option value="noto-naskh">Noto Naskh</option>
          <option value="amiri">Amiri Classic</option>
        </select>

        <button className={`${styles.transBtn} ${showTrans ? styles.transBtnOn : ''}`}
          onClick={() => setShowTrans(v => !v)}>
          {showTrans ? '📖 إخفاء التفسير' : '📖 التفسير'}
        </button>

        <button className={`${styles.transBtn} ${showTranslation ? styles.transBtnOn : ''}`}
          onClick={() => setShowTranslation(v => !v)}>
          {showTranslation ? '🌐 إخفاء الترجمة' : '🌐 ترجمة'}
        </button>

        <button className={`${styles.transBtn} ${showTajweed ? styles.transBtnOn : ''}`}
          onClick={() => setShowTajweed(v => !v)}
          style={{ background: showTajweed ? '#9333ea' : undefined, color: showTajweed ? 'white' : undefined, borderColor: showTajweed ? '#9333ea' : undefined }}>
          🎨 {showTajweed ? 'إخفاء التجويد' : 'تجويد ملون'}
        </button>

        <button className={`${styles.transBtn} ${focusMode ? styles.transBtnOn : ''}`}
          onClick={() => setFocusMode(v => !v)}>
          {focusMode ? '👁 إخفاء وضع التركيز' : '🎯 وضع التركيز'}
        </button>

        {showTranslation && (
          <select className={styles.fontSelect} value={translationLang}
            onChange={e => { setTranslationLang(e.target.value); onResetTranslation?.(); }}>
            <option value="en.sahih">English - Sahih</option>
            <option value="en.pickthall">English - Pickthall</option>
            <option value="fr.hamidullah">Français</option>
            <option value="tr.diyanet">Türkçe</option>
            <option value="ur.jalandhry">اردو</option>
          </select>
        )}
      </div>
    </div>
  );
}
