import { SectionCard } from '../../../ui/erp/SectionCard';
import { InspectFinishRecord } from './types';
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '../../../ui/table';

interface InspectFinishSectionProps {
  inspectFinish: InspectFinishRecord[];
  kp: string;
  onEdit?: () => void;
}

export function InspectFinishSection({ inspectFinish, onEdit }: InspectFinishSectionProps) {
  const hasData = inspectFinish.length > 0;

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
        transition:  'background 150ms',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F9FAFB'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#FFFFFF'; }}
    >Edit</button>
  ) : undefined;

  return (
    <SectionCard
      title="Inspect Finish"
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
          }}>Inspect Finish</span>
        </>
      ) : (
        <div>
          {(() => {
            const totalRolls = inspectFinish.length;
            const gradeBreakdown = inspectFinish.reduce((acc, r) => {
              const g = r.grade || 'Unknown';
              acc[g] = (acc[g] || 0) + 1;
              return acc;
            }, {} as Record<string, number>);
            const lebarArr = inspectFinish.filter(r => r.lebar != null).map(r => r.lebar!);
            const avgLebar = lebarArr.length > 0
              ? (lebarArr.reduce((a, b) => a + b, 0) / lebarArr.length).toFixed(1)
              : null;
            const kgArr = inspectFinish.filter(r => r.kg != null).map(r => r.kg!);
            const avgKg = kgArr.length > 0
              ? (kgArr.reduce((a, b) => a + b, 0) / kgArr.length).toFixed(1)
              : null;
            const susutArr = inspectFinish.filter(r => r.susut_lusi != null).map(r => r.susut_lusi!);
            const avgSusut = susutArr.length > 0
              ? (susutArr.reduce((a, b) => a + b, 0) / susutArr.length).toFixed(1)
              : null;
            const pointArr = inspectFinish.filter(r => r.point != null).map(r => r.point!);
            const avgPoint = pointArr.length > 0
              ? (pointArr.reduce((a, b) => a + b, 0) / pointArr.length).toFixed(2)
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
                    <p style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9CA3AF', marginBottom: 4 }}>Avg Lebar</p>
                    <p style={{ fontSize: 14, fontWeight: 500, color: '#0F1E2E' }}>{avgLebar ? avgLebar + ' cm' : '—'}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9CA3AF', marginBottom: 4 }}>Avg KG</p>
                    <p style={{ fontSize: 14, fontWeight: 500, color: '#0F1E2E' }}>{avgKg || '—'}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9CA3AF', marginBottom: 4 }}>Avg Susut</p>
                    <p style={{ fontSize: 14, fontWeight: 500, color: '#0F1E2E' }}>{avgSusut ? avgSusut + '%' : '—'}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9CA3AF', marginBottom: 4 }}>Avg Point</p>
                    <p style={{ fontSize: 14, fontWeight: 500, color: '#0F1E2E' }}>{avgPoint || '—'}</p>
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
                {['SN', 'Shift', 'Operator', 'Lebar', 'KG', 'Susut', 'Grade', 'Point'].map(h => (
                  <TableHead key={h}>{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {inspectFinish.slice(0, 50).map(record => (
                <TableRow key={record.id}>
                  <TableCell>{record.sn || '—'}</TableCell>
                  <TableCell>{record.shift || '—'}</TableCell>
                  <TableCell>{record.operator || '—'}</TableCell>
                  <TableCell>{record.lebar?.toLocaleString() || '—'}</TableCell>
                  <TableCell>{record.kg?.toLocaleString() || '—'}</TableCell>
                  <TableCell>{record.susut_lusi != null ? record.susut_lusi + '%' : '—'}</TableCell>
                  <TableCell>{record.grade || '—'}</TableCell>
                  <TableCell>{record.point != null ? record.point : '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </SectionCard>
  );
}
