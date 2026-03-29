'use client';

interface Props {
  count: number;
  dark?: boolean;
}

export function InProgressCard({ count, dark = false }: Props) {
  const bg     = dark ? '#111318' : '#FFFFFF';
  const border = dark ? '#2A2F3E' : '#E5E7EB';
  const labelColor = '#9CA3AF';
  const valueColor = dark ? '#F3F4F6' : '#0F1117';

  return (
    <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 12, padding: '20px 24px' }}>
      <p style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: labelColor, marginBottom: 8 }}>
        In Progress
      </p>
      <p style={{ fontSize: 36, fontWeight: 700, color: '#1D4ED8', lineHeight: 1 }}>
        {count > 0 ? count.toLocaleString() : '—'}
      </p>
      <p style={{ fontSize: 12, color: labelColor, marginTop: 4 }}>active in pipeline</p>
    </div>
  );
}
