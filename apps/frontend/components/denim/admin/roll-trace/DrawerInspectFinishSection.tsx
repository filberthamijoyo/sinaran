'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../ui/table';
import type { PipelineData, InspectFinishRecord } from '../order-detail/types';
import { DrawerProps, fmtDate, gradeColor, pointColor } from './utils';

export function DrawerInspectFinishSection({ selectedSN, data }: DrawerProps & { data: PipelineData }) {
  const finishForSN = data.inspectFinish.filter(f => f.sn === selectedSN);
  const totalRolls = finishForSN.length;
  const gradeCounts: Record<string, number> = {};
  finishForSN.forEach(f => {
    const g = f.grade || 'Unknown';
    gradeCounts[g] = (gradeCounts[g] || 0) + 1;
  });
  const mostCommonGrade = Object.entries(gradeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  const pointArr = finishForSN.filter(f => f.point != null).map(f => f.point!);
  const avgPoint = pointArr.length > 0 ? (pointArr.reduce((a, b) => a + b, 0) / pointArr.length) : null;
  const totalKg = finishForSN.filter(f => f.kg != null).reduce((a, f) => a + (f.kg || 0), 0);

  const DEFECT_COLUMNS: { key: keyof InspectFinishRecord; label: string }[] = [
    { key: 'btl', label: 'BTL' }, { key: 'bts', label: 'BTS' }, { key: 'slub', label: 'Slub' },
    { key: 'snl', label: 'SNL' }, { key: 'losp', label: 'LOSP' }, { key: 'lb', label: 'LB' },
    { key: 'ptr', label: 'PTR' }, { key: 'p_slub', label: 'P-Slub' }, { key: 'pb', label: 'PB' },
    { key: 'lm', label: 'LM' }, { key: 'aw', label: 'AW' }, { key: 'ptm', label: 'PTM' },
    { key: 'j', label: 'J' }, { key: 'bta', label: 'BTA' }, { key: 'pts', label: 'PTS' },
    { key: 'pd', label: 'PD' }, { key: 'pp', label: 'PP' }, { key: 'pks', label: 'PKS' },
    { key: 'pss', label: 'PSS' }, { key: 'pkl', label: 'PKL' }, { key: 'pk', label: 'PK' },
    { key: 'plc', label: 'PLC' }, { key: 'lp', label: 'LP' }, { key: 'lks', label: 'LKS' },
    { key: 'lkc', label: 'LKC' }, { key: 'ld', label: 'LD' }, { key: 'lkt', label: 'LKT' },
    { key: 'lki', label: 'LKI' }, { key: 'lptd', label: 'LPTD' }, { key: 'bmc', label: 'BMC' },
    { key: 'exst', label: 'ExST' }, { key: 'smg', label: 'SMG' },
  ];

  const firstRecord = finishForSN[0] ?? null;
  const activeDefects = firstRecord
    ? DEFECT_COLUMNS.filter(({ key }) => {
        const val = firstRecord[key];
        return typeof val === 'number' && val > 0;
      })
    : [];

  const pills = [
    { label: 'Rolls',     value: totalRolls },
    { label: 'Top Grade', value: mostCommonGrade || '—' },
    { label: 'Avg Point', value: avgPoint != null ? avgPoint.toFixed(2) : '—' },
    { label: 'Total KG',  value: totalKg > 0 ? totalKg.toLocaleString() : '—' },
  ];

  return (
    <section>
      <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#71787E' }}>
        Inspect Finish — {selectedSN}
      </h3>

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

      {finishForSN.length > 0 ? (
        <div className="rounded-[12px] overflow-hidden mb-3" style={{}}>
          <Table>
            <TableHeader>
              <TableRow style={{ background: 'transparent', borderBottom: '1px solid #C1C7CE' }}>
                {['Shift', 'Op', 'L', 'KG', 'Susut', 'Gr', 'Pt'].map(h => (
                  <TableHead key={h} className="text-[9px] font-bold uppercase" style={{ color: '#71787E' }}>{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {finishForSN.map((f, i) => (
                <TableRow key={f.id != null ? f.id : i} style={{ background: 'transparent', borderBottom: i < finishForSN.length - 1 ? '1px solid #C1C7CE' : 'none' }}>
                  <TableCell className="text-xs py-1.5" style={{ color: '#41474D' }}>{f.shift || '—'}</TableCell>
                  <TableCell className="text-xs py-1.5" style={{ color: '#41474D' }}>{f.operator?.slice(0, 4) || '—'}</TableCell>
                  <TableCell className="text-xs py-1.5" style={{ color: '#181C20' }}>{f.lebar != null ? f.lebar.toLocaleString() : '—'}</TableCell>
                  <TableCell className="text-xs py-1.5" style={{ color: '#181C20' }}>{f.kg != null ? f.kg.toLocaleString() : '—'}</TableCell>
                  <TableCell className="text-xs py-1.5" style={{ color: '#181C20' }}>{f.susut_lusi != null ? f.susut_lusi + '%' : '—'}</TableCell>
                  <TableCell className="text-xs py-1.5 font-semibold" style={gradeColor(f.grade)}>{f.grade || '—'}</TableCell>
                  <TableCell className="text-xs py-1.5 font-semibold" style={pointColor(f.point)}>
                    {f.point != null ? (
                      <span className="inline-flex items-center gap-1">
                        {f.point > 4.0 && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#BA1A1A' }} />}
                        {f.point > 2.0 && f.point <= 4.0 && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#7D5700' }} />}
                        {f.point}
                      </span>
                    ) : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <p className="text-xs italic mb-3" style={{ color: '#71787E' }}>No inspect finish records for {selectedSN}</p>
      )}

      {activeDefects.length > 0 && firstRecord && (
        <DefectDetail defects={activeDefects} record={firstRecord} />
      )}
    </section>
  );
}

type Defect = { key: keyof InspectFinishRecord; label: string };

function DefectDetail({ defects, record }: { defects: Defect[]; record: InspectFinishRecord }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-[12px] overflow-hidden" style={{}}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full px-4 py-2.5 flex items-center justify-between text-left"
        style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
      >
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#71787E' }}>
          Defect Detail ({defects.length})
        </span>
        {open
          ? <ChevronUp className="w-3.5 h-3.5" style={{ color: '#71787E' }} />
          : <ChevronDown className="w-3.5 h-3.5" style={{ color: '#71787E' }} />}
      </button>
      {open && (
        <div className="px-4 pb-3 grid grid-cols-6 gap-1.5">
          {defects.map(({ key, label }) => {
            const val = record[key] as number;
            return (
              <div key={key} className="rounded-[8px] p-1.5 text-center" style={{ background: 'rgba(255,255,255,0.5)' }}>
                <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: '#71787E' }}>{label}</p>
                <p className="text-sm font-semibold" style={{ color: '#BA1A1A' }}>{val}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
