'use client';

import { GitCompare } from 'lucide-react';
import { SalesContract, PipelineData } from './types';
import StatusBadge from '../../../ui/StatusBadge';

interface OrderKPHeaderProps {
  kp: string;
  sc: SalesContract | null;
  pipelineData: PipelineData | null;
  editing: boolean;
  saving: boolean;
  router: ReturnType<typeof import('next/navigation').useRouter>;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}

export function OrderKPHeader({
  kp,
  sc,
  editing,
  saving,
  router,
  onEdit,
  onSave,
  onCancel,
}: OrderKPHeaderProps) {
  return (
    <div style={{
      background:   '#FFFFFF',
      borderBottom: '1px solid #E5E7EB',
      padding:     '14px 0',
      display:     'flex',
      alignItems:  'center',
      justifyContent: 'space-between',
      gap:         12,
      flexWrap:    'wrap',
    }}>
      {/* Left: title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            {sc?.codename || '—'}
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {sc?.permintaan || '—'}
          </p>
        </div>
        <StatusBadge status={sc?.pipeline_status || 'DRAFT'} />
      </div>

      {/* Right: actions */}
      <div style={{ display: 'flex', gap: 8 }}>
        {editing ? (
          <>
            <button
              onClick={onCancel}
              disabled={saving}
              style={{
                height:       36,
                paddingLeft:  14,
                paddingRight: 14,
                borderRadius: 'var(--button-radius)',
                background:   'var(--page-bg)',
                border:      '1px solid var(--border)',
                color:      'var(--text-secondary)',
                cursor:      saving ? 'not-allowed' : 'pointer',
                fontSize:    13,
                fontWeight: 500,
                opacity:    saving ? 0.6 : 1,
              }}
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              disabled={saving}
              style={{
                height:       36,
                paddingLeft:  16,
                paddingRight: 16,
                borderRadius: 'var(--button-radius)',
                background:   'var(--primary)',
                border:      'none',
                color:      '#EEF3F7',
                cursor:      saving ? 'not-allowed' : 'pointer',
                fontSize:    13,
                fontWeight: 500,
                opacity:    saving ? 0.7 : 1,
              }}
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => router.push(`/denim/admin/analytics?tab=comparison&kp=${kp}`)}
              style={{
                height:       36,
                paddingLeft:  14,
                paddingRight: 14,
                borderRadius: 'var(--button-radius)',
                background:   'var(--page-bg)',
                border:      '1px solid var(--border)',
                color:      'var(--text-secondary)',
                cursor:     'pointer',
                fontSize:    13,
                fontWeight: 500,
                display:    'flex',
                alignItems: 'center',
                gap:       6,
              }}
            >
              <GitCompare size={14} />
              Compare KPs
            </button>
            <button
              onClick={onEdit}
              style={{
                height:       36,
                paddingLeft:  14,
                paddingRight: 14,
                borderRadius: 'var(--button-radius)',
                background:   'var(--primary)',
                border:      'none',
                color:      '#EEF3F7',
                cursor:     'pointer',
                fontSize:    13,
                fontWeight: 500,
              }}
            >
              Edit
            </button>
          </>
        )}
      </div>
    </div>
  );
}
