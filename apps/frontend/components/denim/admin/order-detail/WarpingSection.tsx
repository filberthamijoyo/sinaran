import { SectionCard } from '../../../ui/erp/SectionCard';
import { WarpingRun } from './types';
import { format } from 'date-fns';
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '../../../ui/table';

interface WarpingSectionProps {
  warping: WarpingRun | null;
  kp: string;
  onEdit?: () => void;
}

const formatDate = (iso: string | null) => {
  if (!iso) return '—';
  try { return format(new Date(iso), 'd MMM yyyy'); }
  catch { return '—'; }
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

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p style={FIELD_LABEL}>{label}</p>
      {typeof value === 'string' || typeof value === 'number' ? (
        <p style={FIELD_VALUE}>{value}</p>
      ) : value}
    </div>
  );
}

export function WarpingSection({ warping, onEdit }: WarpingSectionProps) {
  const hasData = warping != null;

  const action = hasData && onEdit ? (
    <button
      onClick={onEdit}
      style={{
        background:    '#FFFFFF',
        border:       '1px solid #E5E7EB',
        borderRadius:  8,
        height:       32,
        padding:      '0 12px',
        fontSize:     12,
        color:        '#374151',
        cursor:      'pointer',
        display:     'flex',
        alignItems:  'center',
        transition:  'background 150ms',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F9FAFB'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#FFFFFF'; }}
    >Edit</button>
  ) : undefined;

  return (
    <SectionCard
      title="Warping"
      action={action}
      variant={hasData ? 'default' : 'dimmed'}
    >
      {!hasData ? (
        <>
          <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 8 }}>
            This stage has not started yet
          </p>
          <span style={{
            background:   '#F3F4F6',
            color:        '#9CA3AF',
            borderRadius: 6,
            padding:     '2px 8px',
            fontSize:     11,
            fontWeight:   500,
          }}>Warping</span>
        </>
      ) : (
        <div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 16,
            marginBottom: 16,
          }}>
            <Field label="Date" value={formatDate(warping.tgl)} />
            <Field label="Start Time" value={warping.start_time || '—'} />
            <Field label="Stop Time" value={warping.stop_time || '—'} />
            <Field label="RPM" value={warping.rpm || '—'} />
            <Field label="Meters/Min" value={warping.mtr_min || '—'} />
            <Field label="Total Putusan" value={warping.total_putusan?.toLocaleString() || '—'} />
            <Field label="Machine No" value={warping.no_mc || '—'} />
            <Field label="Total Beam" value={warping.total_beam || '—'} />
            <Field label="Elongasi" value={warping.elongasi || '—'} />
            <Field label="Strength" value={warping.strength || '—'} />
            <Field label="CV%" value={warping.cv_pct || '—'} />
            <Field label="Tension Badan" value={warping.tension_badan || '—'} />
            <Field label="Tension Pinggir" value={warping.tension_pinggir || '—'} />
            <Field label="Lebar Creel" value={warping.lebar_creel || '—'} />
            <Field label="Jam" value={warping.jam || '—'} />
            <Field label="Eff Warping" value={warping.eff_warping || '—'} />
          </div>

          {warping.beams && warping.beams.length > 0 && (
            <div>
              <p style={{
                fontSize:      11,
                fontWeight:    600,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color:         '#9CA3AF',
                marginBottom:  12,
              }}>Beams</p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Beam No</TableHead>
                    <TableHead>Putusan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {warping.beams.map((beam, idx) => (
                    <TableRow key={beam.id}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>{beam.beam_number}</TableCell>
                      <TableCell>{beam.putusan?.toLocaleString() || '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}
    </SectionCard>
  );
}
