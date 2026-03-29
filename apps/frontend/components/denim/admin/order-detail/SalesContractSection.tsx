'use client';

import { SalesContract } from './types';
import StatusBadge from '../../../ui/StatusBadge';
import { format } from 'date-fns';

interface SalesContractSectionProps {
  sc: SalesContract;
  editing: boolean;
  editForm: Record<string, unknown>;
  onFieldChange: (field: string, value: unknown) => void;
}

const formatDate = (iso: string | null) => {
  if (!iso) return '—';
  try { return format(new Date(iso), 'd MMM yyyy'); }
  catch { return '—'; }
};

const ACC_STYLES: Record<string, React.CSSProperties> = {
  ACC:       { background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0' },
  'TIDAK ACC': { background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' },
};

const FIELD_LABEL: React.CSSProperties = {
  fontSize:      11,
  fontWeight:    500,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color:         '#9CA3AF',
  marginBottom:  4,
};

const FIELD_VALUE: React.CSSProperties = {
  fontSize:  14,
  fontWeight: 500,
  color:     '#0F1E2E',
};

const MONO: React.CSSProperties = {
  fontFamily: "'IBM Plex Mono', monospace",
  fontSize:   13,
  fontWeight: 600,
  color:      '#1D4ED8',
};

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p style={FIELD_LABEL}>{label}</p>
      {typeof value === 'string' || typeof value === 'number' ? (
        <p style={FIELD_VALUE}>{value}</p>
      ) : (
        value
      )}
    </div>
  );
}

export function SalesContractSection({ sc, editing, editForm, onFieldChange }: SalesContractSectionProps) {
  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        border:         '1px solid #E5E7EB',
        borderRadius:   12,
        overflow:      'hidden',
        marginBottom:  16,
      }}
    >
      {/* Section header */}
      <div style={{
        padding:    '16px 24px',
        borderBottom: '1px solid #F3F4F6',
        display:   'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#0F1E2E' }}>Sales Contract</span>
          <span style={{ fontSize: 12, color: '#9CA3AF', marginLeft: 12 }}>
            {formatDate(sc.tgl)}
          </span>
        </div>
        <StatusBadge status={sc.pipeline_status || 'DRAFT'} />
      </div>

      {/* Section body */}
      <div style={{ padding: '20px 24px' }}>

        {/* KPI row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16,
          marginBottom: 20,
        }}>
          <div>
            <p style={FIELD_LABEL}>KP Code</p>
            <p style={MONO}>{sc.kp}</p>
          </div>
          <div>
            <p style={FIELD_LABEL}>Type</p>
            <p style={FIELD_VALUE}>{sc.kat_kode || '—'}</p>
          </div>
          <div>
            <p style={FIELD_LABEL}>ACC</p>
            {sc.acc ? (
              <span style={{
                display:      'inline-flex',
                alignItems:   'center',
                height:       24,
                padding:      '0 10px',
                borderRadius: 6,
                fontSize:     12,
                fontWeight:   600,
                letterSpacing: '0.02em',
                ...(ACC_STYLES[sc.acc] ?? { background: '#FFFBEB', color: '#D97706', border: '1px solid #FDE68A' }),
              }}>
                {sc.acc}
              </span>
            ) : (
              <p style={{ ...FIELD_VALUE, color: '#D1D5DB' }}>—</p>
            )}
          </div>
        </div>

        {/* Data fields */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16,
        }}>
          <div>
            <p style={FIELD_LABEL}>Date</p>
            {editing ? (
              <input
                type="date"
                value={editForm.tgl ? String(editForm.tgl).split('T')[0] : ''}
                onChange={e => onFieldChange('tgl', e.target.value)}
                style={{
                  height: 34,
                  borderRadius: 8,
                  border: '1px solid #E5E7EB',
                  padding: '0 10px',
                  fontSize: 14,
                  color: '#0F1E2E',
                  outline: 'none',
                  width: '100%',
                  background: '#F0F4F8',
                }}
              />
            ) : (
              <p style={FIELD_VALUE}>{formatDate(sc.tgl)}</p>
            )}
          </div>
          <div>
            <p style={FIELD_LABEL}>Construction</p>
            {editing ? (
              <input
                type="text"
                value={editForm.codename as string || ''}
                onChange={e => onFieldChange('codename', e.target.value)}
                style={{
                  height: 34,
                  borderRadius: 8,
                  border: '1px solid #E5E7EB',
                  padding: '0 10px',
                  fontSize: 14,
                  color: '#0F1E2E',
                  outline: 'none',
                  width: '100%',
                  background: '#F0F4F8',
                }}
              />
            ) : (
              <p style={FIELD_VALUE}>{sc.codename || '—'}</p>
            )}
          </div>
          <div>
            <p style={FIELD_LABEL}>Customer</p>
            {editing ? (
              <input
                type="text"
                value={editForm.permintaan as string || ''}
                onChange={e => onFieldChange('permintaan', e.target.value)}
                style={{
                  height: 34,
                  borderRadius: 8,
                  border: '1px solid #E5E7EB',
                  padding: '0 10px',
                  fontSize: 14,
                  color: '#0F1E2E',
                  outline: 'none',
                  width: '100%',
                  background: '#F0F4F8',
                }}
              />
            ) : (
              <p style={FIELD_VALUE}>{sc.permintaan || '—'}</p>
            )}
          </div>
          <div>
            <p style={FIELD_LABEL}>Color</p>
            {editing ? (
              <input
                type="text"
                value={editForm.ket_warna as string || ''}
                onChange={e => onFieldChange('ket_warna', e.target.value)}
                style={{
                  height: 34,
                  borderRadius: 8,
                  border: '1px solid #E5E7EB',
                  padding: '0 10px',
                  fontSize: 14,
                  color: '#0F1E2E',
                  outline: 'none',
                  width: '100%',
                  background: '#F0F4F8',
                }}
              />
            ) : (
              <p style={FIELD_VALUE}>{sc.ket_warna || '—'}</p>
            )}
          </div>
          <div>
            <p style={FIELD_LABEL}>TE (meters)</p>
            {editing ? (
              <input
                type="number"
                value={editForm.te !== undefined && editForm.te !== null ? String(editForm.te) : ''}
                onChange={e => onFieldChange('te', e.target.value ? parseInt(e.target.value) : null)}
                style={{
                  height: 34,
                  borderRadius: 8,
                  border: '1px solid #E5E7EB',
                  padding: '0 10px',
                  fontSize: 14,
                  color: '#0F1E2E',
                  outline: 'none',
                  width: '100%',
                  background: '#F0F4F8',
                }}
              />
            ) : (
              <p style={FIELD_VALUE}>{sc.te?.toLocaleString() || '—'}</p>
            )}
          </div>
          {sc.ne_lusi && (
            <div>
              <p style={FIELD_LABEL}>NE Lusi</p>
              <p style={FIELD_VALUE}>{sc.ne_lusi}</p>
            </div>
          )}
          {sc.ne_pakan && (
            <div>
              <p style={FIELD_LABEL}>NE Pakan</p>
              <p style={FIELD_VALUE}>{sc.ne_pakan}</p>
            </div>
          )}
          {sc.sisir && (
            <div>
              <p style={FIELD_LABEL}>Sisir</p>
              <p style={FIELD_VALUE}>{sc.sisir}</p>
            </div>
          )}
        </div>

        {/* Sacon sub-section */}
        {(sc.sacon || sc.ts) && (
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #F3F4F6' }}>
            <p style={{
              fontSize:      11,
              fontWeight:    600,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color:         '#9CA3AF',
              marginBottom: 12,
            }}>
              Sacon
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 16,
            }}>
              <Field label="Tanggal Sacon" value={sc.ts ? formatDate(sc.ts) : '—'} />
              <Field
                label="Status"
                value={
                  sc.acc === 'ACC' ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', height: 24, padding: '0 10px', borderRadius: 6, fontSize: 12, fontWeight: 600, background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0' }}>ACC</span>
                  ) : sc.acc === 'TIDAK ACC' ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', height: 24, padding: '0 10px', borderRadius: 6, fontSize: 12, fontWeight: 600, background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}>TIDAK ACC</span>
                  ) : (
                    <span style={{ display: 'inline-flex', alignItems: 'center', height: 24, padding: '0 10px', borderRadius: 6, fontSize: 12, fontWeight: 600, background: '#FFFBEB', color: '#D97706', border: '1px solid #FDE68A' }}>Pending</span>
                  )
                }
              />
              <Field label="J (Panjang Tarikan)" value={sc.j ?? '—'} />
              <Field label="B/C" value={sc.b_c ?? '—'} />
              <Field label="TB Total" value={sc.tb ?? '—'} />
              <Field label="TB Real" value={sc.tb_real ?? '—'} />
              <Field label="Bale Lusi" value={sc.bale_lusi ?? '—'} />
              <Field label="Total Pakan" value={sc.total_pakan ?? '—'} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
