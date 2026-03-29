import { SectionCard } from '../../../ui/erp/SectionCard';
import { InspectGrayRecordFull } from './types';
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '../../../ui/table';

interface InspectGraySectionProps {
  inspectGray: InspectGrayRecordFull[];
  kp: string;
  onEdit?: () => void;
}

export function InspectGraySection({ inspectGray, onEdit }: InspectGraySectionProps) {
  const hasData = inspectGray.length > 0;

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
        cursor:       'pointer',
        display:      'flex',
        alignItems:   'center',
        transition:   'background 150ms',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F9FAFB'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#FFFFFF'; }}
    >Edit</button>
  ) : undefined;

  return (
    <SectionCard
      title="Inspect Gray"
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
            borderRadius:  6,
            padding:     '2px 8px',
            fontSize:     11,
            fontWeight:   500,
          }}>Inspect Gray</span>
        </>
      ) : (
        <div>
          {(() => {
            const totalRolls = inspectGray.length;
            const gradeBreakdown = inspectGray.reduce((acc, r) => {
              const g = r.gd || 'Unknown';
              acc[g] = (acc[g] || 0) + 1;
              return acc;
            }, {} as Record<string, number>);
            const widths = inspectGray.filter(r => r.w != null).map(r => parseFloat(r.w!));
            const avgWidth = widths.length > 0
              ? (widths.reduce((a, b) => a + b, 0) / widths.length).toFixed(1)
              : null;

            return (
              <>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 16,
                  marginBottom: 16,
                }}>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9CA3AF', marginBottom: 4 }}>Total Rolls</p>
                    <p style={{ fontSize: 14, fontWeight: 500, color: '#0F1E2E' }}>{totalRolls}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9CA3AF', marginBottom: 4 }}>Avg Width</p>
                    <p style={{ fontSize: 14, fontWeight: 500, color: '#0F1E2E' }}>{avgWidth ? avgWidth + '"' : '—'}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                  {Object.entries(gradeBreakdown).sort((a, b) => b[1] - a[1]).map(([grade, count]) => (
                    <span key={grade} style={{
                      background: '#F3F4F6', borderRadius: 6,
                      padding: '4px 10px', fontSize: 12, color: '#374151',
                    }}>
                      {grade}: {count}
                    </span>
                  ))}
                </div>
              </>
            );
          })()}

          <Table>
            <TableHeader>
              <TableRow>
                {['Date', 'Machine', 'Beam', 'Grade', 'Width', 'BMC'].map(h => (
                  <TableHead key={h}>{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {inspectGray.map(record => (
                <TableRow key={record.id}>
                  <TableCell>{record.tg ? new Date(record.tg).toLocaleDateString('en-GB') : '—'}</TableCell>
                  <TableCell>{record.mc || '—'}</TableCell>
                  <TableCell>{record.bm ?? '—'}</TableCell>
                  <TableCell>{record.gd || '—'}</TableCell>
                  <TableCell>{record.w || '—'}</TableCell>
                  <TableCell>{record.bmc != null ? record.bmc : '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </SectionCard>
  );
}
