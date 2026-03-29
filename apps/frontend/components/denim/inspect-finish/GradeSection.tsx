'use client';

import { InspectFinishSummary } from './types';

interface GradeSectionProps {
  summary: InspectFinishSummary;
}

export default function GradeSection({ summary }: GradeSectionProps) {
  return (
    <div style={{
      background: 'var(--content-bg)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--card-radius)',
      padding: '16px 20px',
    }}>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ background: 'var(--page-bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 16px', minWidth: 90 }}>
          <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 4 }}>Total Rolls</p>
          <p style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)' }}>
            {summary.totalRolls}
          </p>
        </div>
        <div style={{ background: 'var(--page-bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 16px', minWidth: 90 }}>
          <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 4 }}>Total KG</p>
          <p style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)' }}>
            {summary.totalKg.toLocaleString(undefined, { maximumFractionDigits: 1 })}
          </p>
        </div>
        <div style={{ background: 'var(--page-bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 16px', minWidth: 90 }}>
          <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 4 }}>Total BMC</p>
          <p style={{ fontSize: 18, fontWeight: 600, color: 'var(--warning)' }}>
            {summary.totalBMC}
          </p>
        </div>
        <div style={{ background: 'var(--page-bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 16px', minWidth: 70 }}>
          <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 4 }}>Grade A</p>
          <p style={{ fontSize: 18, fontWeight: 600, color: 'var(--success)' }}>
            {summary.gradeACount}
          </p>
        </div>
        <div style={{ background: 'var(--page-bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 16px', minWidth: 70 }}>
          <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 4 }}>Grade B</p>
          <p style={{ fontSize: 18, fontWeight: 600, color: 'var(--warning)' }}>
            {summary.gradeBCount}
          </p>
        </div>
        <div style={{ background: 'var(--page-bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 16px', minWidth: 70 }}>
          <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 4 }}>Grade C</p>
          <p style={{ fontSize: 18, fontWeight: 600, color: 'var(--warning)' }}>
            {summary.gradeCCount}
          </p>
        </div>
        <div style={{ background: 'var(--page-bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 16px', minWidth: 70 }}>
          <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 4 }}>Reject</p>
          <p style={{ fontSize: 18, fontWeight: 600, color: 'var(--danger)' }}>
            {summary.rejectCount}
          </p>
        </div>
      </div>
    </div>
  );
}
