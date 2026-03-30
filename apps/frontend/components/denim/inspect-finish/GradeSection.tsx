'use client';

import { InspectFinishSummary } from './types';

interface GradeSectionProps {
  summary: InspectFinishSummary;
}

export default function GradeSection({ summary }: GradeSectionProps) {
  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #E5E7EB',
      borderRadius: 12,
      padding: '16px 20px',
    }}>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 8, padding: '10px 16px', minWidth: 90 }}>
          <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9CA3AF', marginBottom: 4, marginTop: 0, fontWeight: 500 }}>Total Rolls</p>
          <p style={{ fontSize: 20, fontWeight: 700, color: '#0F1E2E', fontFamily: "'IBM Plex Mono', monospace", margin: 0 }}>
            {summary.totalRolls}
          </p>
        </div>
        <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 8, padding: '10px 16px', minWidth: 90 }}>
          <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9CA3AF', marginBottom: 4, marginTop: 0, fontWeight: 500 }}>Total KG</p>
          <p style={{ fontSize: 20, fontWeight: 700, color: '#0F1E2E', fontFamily: "'IBM Plex Mono', monospace", margin: 0 }}>
            {summary.totalKg.toLocaleString(undefined, { maximumFractionDigits: 1 })}
          </p>
          <p style={{ fontSize: 10, color: '#9CA3AF', margin: 0 }}>kg</p>
        </div>
        <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 8, padding: '10px 16px', minWidth: 90 }}>
          <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9CA3AF', marginBottom: 4, marginTop: 0, fontWeight: 500 }}>Total BMC</p>
          <p style={{ fontSize: 20, fontWeight: 700, color: '#D97706', fontFamily: "'IBM Plex Mono', monospace", margin: 0 }}>
            {summary.totalBMC}
          </p>
        </div>
        <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 8, padding: '10px 16px', minWidth: 70 }}>
          <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9CA3AF', marginBottom: 4, marginTop: 0, fontWeight: 500 }}>Grade A</p>
          <p style={{ fontSize: 20, fontWeight: 700, color: '#059669', fontFamily: "'IBM Plex Mono', monospace", margin: 0 }}>
            {summary.gradeACount}
          </p>
        </div>
        <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 8, padding: '10px 16px', minWidth: 70 }}>
          <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9CA3AF', marginBottom: 4, marginTop: 0, fontWeight: 500 }}>Grade B</p>
          <p style={{ fontSize: 20, fontWeight: 700, color: '#D97706', fontFamily: "'IBM Plex Mono', monospace", margin: 0 }}>
            {summary.gradeBCount}
          </p>
        </div>
        <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 8, padding: '10px 16px', minWidth: 70 }}>
          <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9CA3AF', marginBottom: 4, marginTop: 0, fontWeight: 500 }}>Grade C</p>
          <p style={{ fontSize: 20, fontWeight: 700, color: '#D97706', fontFamily: "'IBM Plex Mono', monospace", margin: 0 }}>
            {summary.gradeCCount}
          </p>
        </div>
        <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 8, padding: '10px 16px', minWidth: 70 }}>
          <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9CA3AF', marginBottom: 4, marginTop: 0, fontWeight: 500 }}>Reject</p>
          <p style={{ fontSize: 20, fontWeight: 700, color: '#DC2626', fontFamily: "'IBM Plex Mono', monospace", margin: 0 }}>
            {summary.rejectCount}
          </p>
        </div>
      </div>
    </div>
  );
}
