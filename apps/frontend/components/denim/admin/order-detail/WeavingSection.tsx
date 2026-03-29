import { SectionCard } from '../../../ui/erp/SectionCard';
import { WeavingRecord } from './types';
import { format } from 'date-fns';
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '../../../ui/table';

interface WeavingSectionProps {
  weaving: WeavingRecord[];
}

const formatDate = (iso: string | null) => {
  if (!iso) return '—';
  try { return format(new Date(iso), 'd MMM yyyy'); }
  catch { return '—'; }
};

export function WeavingSection({ weaving }: WeavingSectionProps) {
  const hasData = weaving.length > 0;

  return (
    <SectionCard
      title="Weaving"
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
            borderRadius:  6,
            padding:     '2px 8px',
            fontSize:     11,
            fontWeight:   500,
          }}>Weaving</span>
        </>
      ) : (
        <>
          {(() => {
            const totalRecords = weaving.length;
            const efficiencies = weaving.filter(r => r.a_pct != null).map(r => Number(r.a_pct));
            const avgEfficiency = efficiencies.length > 0
              ? (efficiencies.reduce((a, b) => a + b, 0) / efficiencies.length).toFixed(1) + '%'
              : '—';
            const totalMeters = weaving.filter(r => r.meters != null)
              .reduce((sum, r) => sum + Number(r.meters || 0), 0);
            const dates = weaving.filter(r => r.tanggal != null).map(r => new Date(r.tanggal!));
            const minDate = dates.length > 0 ? new Date(Math.min(...dates.map(d => d.getTime()))) : null;
            const maxDate = dates.length > 0 ? new Date(Math.max(...dates.map(d => d.getTime()))) : null;
            const formatDateRange = () => {
              if (!minDate || !maxDate) return '—';
              const fmt = (d: Date) => d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
              return minDate.getFullYear() === maxDate.getFullYear()
                ? `${fmt(minDate)} – ${fmt(maxDate)} ${maxDate.getFullYear()}`
                : `${fmt(minDate)} ${minDate.getFullYear()} – ${fmt(maxDate)} ${maxDate.getFullYear()}`;
            };

            const machineStats: Record<string, { count: number; effs: number[] }> = {};
            weaving.forEach(r => {
              if (r.machine) {
                if (!machineStats[r.machine]) machineStats[r.machine] = { count: 0, effs: [] };
                machineStats[r.machine].count++;
                if (r.a_pct != null) machineStats[r.machine].effs.push(Number(r.a_pct));
              }
            });
            const machineBreakdown = Object.entries(machineStats)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([machine, stats]) => ({
                machine,
                count: stats.count,
                avg: stats.effs.length > 0
                  ? (stats.effs.reduce((a, b) => a + b, 0) / stats.effs.length).toFixed(1)
                  : null,
              }));

            return (
              <>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 16,
                  marginBottom: 16,
                }}>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9CA3AF', marginBottom: 4 }}>Records</p>
                    <p style={{ fontSize: 14, fontWeight: 500, color: '#0F1E2E' }}>{totalRecords}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9CA3AF', marginBottom: 4 }}>Avg Efficiency</p>
                    <p style={{ fontSize: 14, fontWeight: 500, color: '#0F1E2E' }}>{avgEfficiency}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9CA3AF', marginBottom: 4 }}>Total Meters</p>
                    <p style={{ fontSize: 14, fontWeight: 500, color: '#0F1E2E' }}>{totalMeters.toLocaleString()}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9CA3AF', marginBottom: 4 }}>Period</p>
                    <p style={{ fontSize: 14, fontWeight: 500, color: '#0F1E2E' }}>{formatDateRange()}</p>
                  </div>
                </div>
                {machineBreakdown.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                    {machineBreakdown.map(m => (
                      <span key={m.machine} style={{
                        background: '#F3F4F6', borderRadius: 6,
                        padding: '4px 10px', fontSize: 12, color: '#374151',
                      }}>
                        {m.machine} · {m.count} shifts · Avg {m.avg ? m.avg + '%' : '—'}
                      </span>
                    ))}
                  </div>
                )}
              </>
            );
          })()}

          <Table>
            <TableHeader>
              <TableRow>
                {['Date', 'Shift', 'Machine', 'Beam', 'Picks', 'Meters', 'Efficiency %'].map(h => (
                  <TableHead key={h}>{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {weaving.slice(0, 50).map(record => (
                <TableRow key={record.id}>
                  <TableCell>{formatDate(record.tanggal)}</TableCell>
                  <TableCell>{record.shift || '—'}</TableCell>
                  <TableCell>{record.machine || '—'}</TableCell>
                  <TableCell>{record.beam || '—'}</TableCell>
                  <TableCell>{record.kpicks?.toLocaleString() || '—'}</TableCell>
                  <TableCell>{record.meters?.toLocaleString() || '—'}</TableCell>
                  <TableCell>{record.a_pct != null ? Number(record.a_pct).toFixed(1) + '%' : '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      )}
    </SectionCard>
  );
}
