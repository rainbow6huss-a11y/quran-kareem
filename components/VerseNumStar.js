/**
 * VerseNumStar — رقم الآية داخل نجمة ذهبية احترافية
 */
export default function VerseNumStar({ num, size = 28 }) {
  const r = size / 2;
  // نقاط النجمة الثمانية
  const points = Array.from({ length: 8 }, (_, i) => {
    const angle = (i * 45 - 90) * (Math.PI / 180);
    const radius = i % 2 === 0 ? r - 2 : r - 7;
    return `${r + radius * Math.cos(angle)},${r + radius * Math.sin(angle)}`;
  }).join(' ');

  return (
    <span style={{
      display: 'inline-block',
      position: 'relative',
      width: size, height: size,
      textAlign: 'center',
      verticalAlign: 'middle',
      margin: '0 3px',
    }}>
      <svg
        width={size} height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <circle
          cx={r} cy={r} r={r - 2}
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          style={{ color: 'rgba(184,151,58,0.55)' }}
        />
        <polygon
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="0.7"
          style={{ color: 'rgba(184,151,58,0.45)' }}
        />
      </svg>
      <span style={{
        position: 'relative',
        fontFamily: "'Tajawal', sans-serif",
        fontSize: size <= 26 ? '8px' : '9px',
        fontWeight: 700,
        lineHeight: `${size}px`,
        display: 'block',
        color: 'inherit',
      }}>
        {num}
      </span>
    </span>
  );
}
