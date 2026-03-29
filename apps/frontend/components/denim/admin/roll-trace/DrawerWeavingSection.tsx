'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../ui/table';
import type { PipelineData } from '../order-detail/types';
import { DrawerProps, decodeSN, normalizeMachine, fmtDate } from './utils';

export function DrawerWeavingSection({ selectedSN, kp, data }: DrawerProps & { data: PipelineData }) {
  const decoded = decodeSN(selectedSN);
  const weavingOnMachine = decoded
    ? data.weaving.filter(w => normalizeMachine(w.machine ?? '') === normalizeMachine(decoded.machine))
    : [];
  const totalShifts = weavingOnMachine.length;
  const effArr = weavingOnMachine.map(w => parseFloat(String(w.a_pct ?? ''))).filter(v => !isNaN(v));
  const avgEfficiency = effArr.length > 0 ? (effArr.reduce((a, b) => a + b, 0) / effArr.length) : null;
  const meterArr = weavingOnMachine.map(w => parseFloat(String(w.meters ?? ''))).filter(v => !isNaN(v));
  const totalMeters = meterArr.reduce((a, b) => a + b, 0);
  const firstRecord = weavingOnMachine[0] ?? null;
  const lastRecord = weavingOnMachine[weavingOnMachine.length - 1] ?? null;

  const pills = [
    { label: 'Shifts',     value: totalShifts },
    { label: 'Avg Eff%',   value: avgEfficiency != null ? avgEfficiency.toFixed(1) + '%' : '—' },
    { label: 'Total m',    value: totalMeters > 0 ? totalMeters.toLocaleString() : '—' },
    { label: 'Date range', value:
        firstRecord && lastRecord && firstRecord.tanggal !== lastRecord.tanggal
        ? `${fmtDate(firstRecord.tanggal)} – ${fmtDate(lastRecord.tanggal)}`
        : (firstRecord ? fmtDate(firstRecord.tanggal) : '—') },
  ];

  return (
    <section>
      <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#71787E' }}>
        Weaving — Machine {decoded?.machine ?? '—'}
      </h3>
      {decoded ? (
        <p className="text-[10px] mb-3 italic" style={{ color: '#71787E' }}>
          All shifts this machine ran KP {kp}
        </p>
      ) : null}

      <div className="grid grid-cols-4 gap-2 mb-3">
        {pills.map(({ label, value }) => (
          <div
            key={label}
            className="rounded-[10px] p-2 text-center"
            style={{}}
          >
            <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: '#71787E' }}>{label}</p>
            <p className="text-sm font-semibold mt-0.5" style={{ color: '#181C20' }}>{value}</p>
          </div>
        ))}
      </div>

      {weavingOnMachine.length > 0 ? (
        <div className="rounded-[12px] overflow-hidden" style={{}}>
          <Table>
            <TableHeader>
              <TableRow style={{ background: 'transparent', borderBottom: '1px solid #C1C7CE' }}>
                {['Date', 'Shift', 'Eff%', 'Meters'].map(h => (
                  <TableHead key={h} className="text-[9px] font-bold uppercase" style={{ color: '#71787E' }}>{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {weavingOnMachine.map((w, i) => (
                <TableRow key={i} style={{ background: 'transparent', borderBottom: i < weavingOnMachine.length - 1 ? '1px solid #C1C7CE' : 'none' }}>
                  <TableCell className="text-xs py-1.5" style={{ color: '#181C20' }}>{fmtDate(w.tanggal)}</TableCell>
                  <TableCell className="text-xs py-1.5" style={{ color: '#41474D' }}>{w.shift || '—'}</TableCell>
                  <TableCell className="text-xs py-1.5" style={{ color: '#181C20' }}>{w.a_pct != null ? parseFloat(String(w.a_pct)).toFixed(1) + '%' : '—'}</TableCell>
                  <TableCell className="text-xs py-1.5" style={{ color: '#181C20' }}>{w.meters != null ? parseFloat(String(w.meters)).toLocaleString() : '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <p className="text-xs italic" style={{ color: '#71787E' }}>
          No weaving records for machine {decoded?.machine ?? '—'}
        </p>
      )}
    </section>
  );
}
