'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../ui/table';
import type { PipelineData } from '../order-detail/types';
import { DrawerProps, decodeSN, gradeColor } from './utils';

export function DrawerInspectGraySection({ selectedSN, data }: DrawerProps & { data: PipelineData }) {
  const decoded = decodeSN(selectedSN);
  const grayForBeam = decoded
    ? data.inspectGray.filter(g => g.bm === decoded.beam)
    : [];

  return (
    <section>
      <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#71787E' }}>
        Inspect Gray — Beam {decoded?.beam ?? '—'}
      </h3>

      {grayForBeam.length > 0 ? (
        <div className="rounded-[12px] overflow-hidden" style={{}}>
          <Table>
            <TableHeader>
              <TableRow style={{ background: 'transparent', borderBottom: '1px solid #C1C7CE' }}>
                {['Date', 'MC', 'Grade', 'W', 'BME', 'BMC'].map(h => (
                  <TableHead key={h} className="text-[9px] font-bold uppercase" style={{ color: '#71787E' }}>{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {grayForBeam.map(g => (
                <TableRow key={g.id} style={{ background: 'transparent', borderBottom: '1px solid #C1C7CE' }}>
                  <TableCell className="text-xs py-1.5" style={{ color: '#181C20' }}>{g.tg ? g.tg.split('T')[0] : '—'}</TableCell>
                  <TableCell className="text-xs py-1.5" style={{ color: '#181C20' }}>{g.mc || '—'}</TableCell>
                  <TableCell className="text-xs py-1.5 font-semibold" style={gradeColor(g.gd)}>{g.gd || '—'}</TableCell>
                  <TableCell className="text-xs py-1.5" style={{ color: '#181C20' }}>{g.w || '—'}</TableCell>
                  <TableCell className="text-xs py-1.5" style={{ color: '#181C20' }}>{g.bmc != null ? String(g.bmc) : '—'}</TableCell>
                  <TableCell className="text-xs py-1.5" style={{ color: '#181C20' }}>{g.bmc ?? '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <p className="text-xs italic" style={{ color: '#71787E' }}>
          No gray inspection record found for beam {decoded?.beam ?? '—'}
        </p>
      )}
    </section>
  );
}
