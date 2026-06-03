import { useState } from 'react';
import styles from './TajweedText.module.css';

const RULES = {
  ghunnah:               { color: '#9333ea', label: 'غنة',           desc: 'صوت يخرج من الخيشوم عند النون أو الميم المشددة' },
  idghaam_ghunnah:       { color: '#16a34a', label: 'إدغام بغنة',    desc: 'إدخال النون الساكنة أو التنوين في حرف مع غنة' },
  idghaam_no_ghunnah:    { color: '#15803d', label: 'إدغام بلا غنة', desc: 'إدخال النون الساكنة في اللام أو الراء بلا غنة' },
  idghaam_mutajaanisain: { color: '#166534', label: 'إدغام متجانسين',desc: 'إدغام حرفين متحدي المخرج مختلفي الصفة' },
  idghaam_mutaqaaribain: { color: '#14532d', label: 'إدغام متقاربين',desc: 'إدغام حرفين متقاربي المخرج' },
  idghaam_shafawi:       { color: '#16a34a', label: 'إدغام شفوي',    desc: 'إدغام الميم الساكنة في الميم' },
  ikhfa:                 { color: '#d97706', label: 'إخفاء',         desc: 'النطق بين الإظهار والإدغام مع بقاء الغنة' },
  ikhfa_shafawi:         { color: '#b45309', label: 'إخفاء شفوي',   desc: 'إخفاء الميم الساكنة عند الباء' },
  iqlab:                 { color: '#dc2626', label: 'إقلاب',         desc: 'قلب النون الساكنة ميماً مخفاة عند الباء' },
  idhaar:                { color: '#0891b2', label: 'إظهار حلقي',    desc: 'إظهار النون الساكنة واضحة عند حروف الحلق' },
  idhaar_shafawi:        { color: '#0e7490', label: 'إظهار شفوي',   desc: 'إظهار الميم الساكنة عند غير الميم والباء' },
  madd_2:                { color: '#2563eb', label: 'مد طبيعي',      desc: 'مد حرف العلة بمقدار حركتين' },
  madd_246:              { color: '#1d4ed8', label: 'مد فرعي',       desc: 'مد بمقدار 4 أو 6 حركات عند الهمز أو السكون' },
  madd_6:                { color: '#1e40af', label: 'مد لازم',       desc: 'مد واجب بمقدار 6 حركات' },
  qalaqah:               { color: '#be185d', label: 'قلقلة',         desc: 'اضطراب مخرج الحرف الساكن من حروف قطب جد' },
  hamzat_wasl:           { color: '#9ca3af', label: 'همزة وصل',      desc: 'همزة تُنطق ابتداءً وتسقط وصلاً' },
  lam_shamsiyyah:        { color: '#6b7280', label: 'لام شمسية',     desc: 'لام التعريف المدغمة في الحرف الشمسي بعدها' },
};

export default function TajweedText({ text, annotations, fontSize, fontFamily, dark }) {
  const [tooltip, setTooltip] = useState(null);

  if (!annotations || annotations.length === 0) {
    return (
      <span style={{ fontSize: `${fontSize}rem`, fontFamily }}>
        {text}
      </span>
    );
  }

  // بناء مصفوفة الأجزاء الملونة
  const parts = [];
  let last = 0;
  const sorted = [...annotations].sort((a, b) => a.start - b.start);

  for (const ann of sorted) {
    if (ann.start > last) {
      parts.push({ text: text.slice(last, ann.start), rule: null });
    }
    if (ann.end > ann.start) {
      parts.push({ text: text.slice(ann.start, ann.end), rule: ann.rule });
    }
    last = ann.end;
  }
  if (last < text.length) {
    parts.push({ text: text.slice(last), rule: null });
  }

  return (
    <span style={{ fontSize: `${fontSize}rem`, fontFamily, position: 'relative' }}>
      {parts.map((part, i) => {
        const ruleInfo = part.rule ? RULES[part.rule] : null;
        if (!ruleInfo) return <span key={i}>{part.text}</span>;

        const bg = dark
          ? `${ruleInfo.color}22`
          : `${ruleInfo.color}18`;

        return (
          <span key={i}
            style={{
              color: ruleInfo.color,
              background: bg,
              borderRadius: '3px',
              padding: '0 2px',
              cursor: 'pointer',
              position: 'relative',
              transition: 'background .15s',
            }}
            onClick={() => setTooltip(tooltip?.idx === i ? null : { idx: i, rule: part.rule })}
          >
            {part.text}
            {tooltip?.idx === i && (
              <span className={styles.tooltip}>
                <span className={styles.tooltipDot} style={{ background: ruleInfo.color }}/>
                <span className={styles.tooltipContent}>
                  <strong>{ruleInfo.label}</strong>
                  <small>{ruleInfo.desc}</small>
                </span>
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
}
