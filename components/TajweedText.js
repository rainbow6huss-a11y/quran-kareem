import { useState } from 'react';
import styles from './TajweedText.module.css';

const RULES = {
  ghunnah:               { color: '#9333ea', label: 'غنة',           desc: 'صوت يخرج من الخيشوم' },
  idghaam_ghunnah:       { color: '#16a34a', label: 'إدغام بغنة',    desc: 'إدخال النون في حرف مع غنة' },
  idghaam_no_ghunnah:    { color: '#15803d', label: 'إدغام بلا غنة', desc: 'إدخال النون في اللام أو الراء' },
  idghaam_mutajaanisain: { color: '#166534', label: 'إدغام متجانسين',desc: 'إدغام حرفين متجانسين' },
  idghaam_mutaqaaribain: { color: '#14532d', label: 'إدغام متقاربين',desc: 'إدغام حرفين متقاربين' },
  idghaam_shafawi:       { color: '#16a34a', label: 'إدغام شفوي',    desc: 'إدغام الميم الساكنة' },
  ikhfa:                 { color: '#d97706', label: 'إخفاء',         desc: 'النطق بين الإظهار والإدغام' },
  ikhfa_shafawi:         { color: '#b45309', label: 'إخفاء شفوي',   desc: 'إخفاء الميم الساكنة عند الباء' },
  iqlab:                 { color: '#dc2626', label: 'إقلاب',         desc: 'قلب النون الساكنة ميماً' },
  idhaar:                { color: '#0891b2', label: 'إظهار حلقي',    desc: 'إظهار النون الساكنة واضحة' },
  idhaar_shafawi:        { color: '#0e7490', label: 'إظهار شفوي',   desc: 'إظهار الميم الساكنة' },
  madd_2:                { color: '#2563eb', label: 'مد طبيعي',      desc: 'مد حرف العلة بحركتين' },
  madd_246:              { color: '#1d4ed8', label: 'مد فرعي',       desc: 'مد بمقدار 4 أو 6 حركات' },
  madd_6:                { color: '#1e40af', label: 'مد لازم',       desc: 'مد واجب بمقدار 6 حركات' },
  qalaqah:               { color: '#be185d', label: 'قلقلة',         desc: 'اضطراب الحرف الساكن' },
  hamzat_wasl:           { color: '#9ca3af', label: 'همزة وصل',      desc: 'همزة تسقط وصلاً' },
  lam_shamsiyyah:        { color: '#6b7280', label: 'لام شمسية',     desc: 'لام التعريف المدغمة' },
};

export default function TajweedText({ text, annotations, fontSize, fontFamily, dark }) {
  const [activeIdx, setActiveIdx] = useState(null);

  const style = { fontSize: `${fontSize}rem`, fontFamily, direction: 'rtl' };

  if (!annotations || annotations.length === 0) {
    return <span style={style}>{text}</span>;
  }

  // بناء الأجزاء
  const parts = [];
  let last = 0;
  const sorted = [...annotations]
    .filter(a => a.end > a.start && a.start >= 0 && a.end <= text.length)
    .sort((a, b) => a.start - b.start);

  for (const ann of sorted) {
    if (ann.start > last) {
      parts.push({ text: text.slice(last, ann.start), rule: null });
    }
    if (ann.end > ann.start) {
      parts.push({ text: text.slice(ann.start, ann.end), rule: ann.rule });
    }
    last = Math.max(last, ann.end);
  }
  if (last < text.length) {
    parts.push({ text: text.slice(last), rule: null });
  }

  return (
    <span style={style}>
      {parts.map((part, i) => {
        const info = part.rule ? RULES[part.rule] : null;
        if (!info) return <span key={i}>{part.text}</span>;

        return (
          <span key={i} style={{ position: 'relative', display: 'inline' }}>
            <span
              style={{
                color: info.color,
                borderBottom: `2px solid ${info.color}`,
                cursor: 'pointer',
                paddingBottom: '1px',
              }}
              onClick={() => setActiveIdx(activeIdx === i ? null : i)}
            >
              {part.text}
            </span>
            {activeIdx === i && (
              <span className={styles.tooltip}>
                <span className={styles.dot} style={{ background: info.color }}/>
                <span>
                  <span className={styles.label}>{info.label}</span>
                  <span className={styles.desc}>{info.desc}</span>
                </span>
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
}
