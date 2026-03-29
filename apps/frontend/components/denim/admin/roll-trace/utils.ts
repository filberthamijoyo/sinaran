'use client';

export type DrawerProps = {
  selectedSN: string;
  kp?: string;
};

export function normalizeMachine(m: string) {
  return m?.replace(/-/g, '').toUpperCase().trim();
}

export function fmtDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function decodeSN(sn: string): { machine: string; beam: number; lot: string } | null {
  const m = sn?.trim().match(/^([A-Z]{1,3}\d{2})(\d+)([A-Z]\d+[A-Z N])$/);
  if (!m) return null;
  return { machine: m[1], beam: parseInt(m[2]), lot: m[3] };
}

export function gradeColor(grade: string | null) {
  const colors: Record<string, string> = { A: '#006E1C', B: '#7D5700', C: '#EA580C', R: '#BA1A1A' };
  return { color: colors[grade || ''] || '#41474D' };
}

export function pointColor(point: number | null) {
  if (point == null) return { color: '#181C20' };
  if (point > 4.0) return { color: '#BA1A1A' };
  if (point > 2.0) return { color: '#7D5700' };
  return { color: '#181C20' };
}
