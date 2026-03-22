'use client';

import { useEffect, useRef, useState } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import type { PipelineData, InspectFinishRecord } from './OrderDetailPage';

function normalizeMachine(m: string) {
  return m?.replace(/-/g, '').toUpperCase().trim();
}

function fmtDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

type Props = {
  selectedSN: string;
  data: PipelineData;
  kp: string;
  onClose: () => void;
};

function decodeSN(sn: string): { machine: string; beam: number; lot: string } | null {
  const m = sn?.trim().match(/^([A-Z]{1,3}\d{2})(\d+)([A-Z]\d+[A-Z N])$/);
  if (!m) return null;
  return { machine: m[1], beam: parseInt(m[2]), lot: m[3] };
}

const DEFECT_COLUMNS: { key: keyof import('./OrderDetailPage').InspectFinishRecord; label: string }[] = [
  { key: 'btl', label: 'BTL' },
  { key: 'bts', label: 'BTS' },
  { key: 'slub', label: 'Slub' },
  { key: 'snl', label: 'SNL' },
  { key: 'losp', label: 'LOSP' },
  { key: 'lb', label: 'LB' },
  { key: 'ptr', label: 'PTR' },
  { key: 'p_slub', label: 'P-Slub' },
  { key: 'pb', label: 'PB' },
  { key: 'lm', label: 'LM' },
  { key: 'aw', label: 'AW' },
  { key: 'ptm', label: 'PTM' },
  { key: 'j', label: 'J' },
  { key: 'bta', label: 'BTA' },
  { key: 'pts', label: 'PTS' },
  { key: 'pd', label: 'PD' },
  { key: 'pp', label: 'PP' },
  { key: 'pks', label: 'PKS' },
  { key: 'pss', label: 'PSS' },
  { key: 'pkl', label: 'PKL' },
  { key: 'pk', label: 'PK' },
  { key: 'plc', label: 'PLC' },
  { key: 'lp', label: 'LP' },
  { key: 'lks', label: 'LKS' },
  { key: 'lkc', label: 'LKC' },
  { key: 'ld', label: 'LD' },
  { key: 'lkt', label: 'LKT' },
  { key: 'lki', label: 'LKI' },
  { key: 'lptd', label: 'LPTD' },
  { key: 'bmc', label: 'BMC' },
  { key: 'exst', label: 'ExST' },
  { key: 'smg', label: 'SMG' },
];

function pointColor(point: number | null) {
  if (point == null) return { color: '#3D4852' };
  if (point > 4.0) return { color: '#DC2626' };
  if (point > 2.0) return { color: '#D97706' };
  return { color: '#3D4852' };
}

function gradeColor(grade: string | null) {
  const colors: Record<string, string> = { A: '#16A34A', B: '#D97706', C: '#EA580C', R: '#DC2626' };
  return { color: colors[grade || ''] || '#6B7280' };
}

export default function RollTraceDrawer({ selectedSN, data, kp, onClose }: Props) {
  const decoded = decodeSN(selectedSN);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Section 1 — Weaving on this machine
  const weavingOnMachine = decoded
    ? data.weaving.filter(w => normalizeMachine(w.machine) === normalizeMachine(decoded.machine))
    : [];
  const totalShifts = weavingOnMachine.length;
  const effArr = weavingOnMachine
    .map(w => parseFloat(String(w.a_pct ?? '')))
    .filter(v => !isNaN(v));
  const avgEfficiency = effArr.length > 0 ? (effArr.reduce((a, b) => a + b, 0) / effArr.length) : null;
  const meterArr = weavingOnMachine
    .map(w => parseFloat(String(w.meters ?? '')))
    .filter(v => !isNaN(v));
  const totalMeters = meterArr.reduce((a, b) => a + b, 0);
  const firstRecord = weavingOnMachine.length > 0 ? weavingOnMachine[0] : null;
  const lastRecord = weavingOnMachine.length > 0 ? weavingOnMachine[weavingOnMachine.length - 1] : null;

  // Section 2 — Inspect Gray for this beam
  const grayForBeam = decoded
    ? data.inspectGray.filter(g => g.bm === decoded.beam)
    : [];

  // Section 3 — BBSF
  const bbsfWashing = data.bbsfWashing || [];
  const bbsfSanfor = data.bbsfSanfor || [];
  const sanforByType: Record<string, { count: number; totalSusut: number; nullSusut: number }> = {};
  bbsfSanfor.forEach(s => {
    if (s.sanfor_type) {
      if (!sanforByType[s.sanfor_type]) sanforByType[s.sanfor_type] = { count: 0, totalSusut: 0, nullSusut: 0 };
      sanforByType[s.sanfor_type]!.count += 1;
      if (s.susut != null) {
        sanforByType[s.sanfor_type]!.totalSusut += s.susut;
      } else {
        sanforByType[s.sanfor_type]!.nullSusut += 1;
      }
    }
  });

  // Section 4 — Inspect Finish for this SN
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

  // Defects from first matching record
  const firstDefectRecord = finishForSN[0] || null;
  const activeDefects = firstDefectRecord
    ? DEFECT_COLUMNS.filter(({ key }) => {
        const val = firstDefectRecord[key];
        return typeof val === 'number' && val > 0;
      })
    : [];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(0,0,0,0.3)' }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="fixed top-0 right-0 z-50 h-full w-[480px] flex flex-col"
        style={{
          background: '#E0E5EC',
          boxShadow: '-9px 0 16px rgb(163 177 198 / 0.4)',
          width: '480px',
        }}
      >
        {/* Header */}
        <div
          className="sticky top-0 z-10 px-5 py-4 flex items-center justify-between shrink-0"
          style={{
            background: '#E0E5EC',
            borderBottom: '1px solid rgb(163 177 198 / 0.3)',
          }}
        >
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>
              Roll Trace
            </p>
            <h2 className="text-base font-mono font-semibold mt-0.5" style={{ color: '#3D4852' }}>
              {selectedSN}
            </h2>
            {decoded ? (
              <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>
                Machine <span className="font-semibold">{decoded.machine}</span>
                {' · '}Beam <span className="font-semibold">{decoded.beam}</span>
                {' · '}Lot <span className="font-semibold">{decoded.lot}</span>
              </p>
            ) : (
              <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>
                (SN format not recognised — beam/machine could not be decoded)
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center rounded-lg shrink-0 transition-colors"
            style={{
              height: '32px', width: '32px', padding: 0,
              background: 'transparent', border: 'none',
              color: '#6B7280',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgb(163 177 198 / 0.3)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">

          {/* ── Section 1: Weaving ── */}
          <section>
            <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#9CA3AF' }}>
              Weaving — Machine {decoded?.machine ?? '—'}
            </h3>
            {decoded ? (
              <p className="text-[10px] mb-3 italic" style={{ color: '#9CA3AF' }}>
                All shifts this machine ran KP {kp}
              </p>
            ) : null}

            {/* Summary pills */}
            <div className="grid grid-cols-4 gap-2 mb-3">
              {[
                { label: 'Shifts', value: totalShifts },
                { label: 'Avg Eff%', value: avgEfficiency != null ? avgEfficiency.toFixed(1) + '%' : '—' },
                { label: 'Total m', value: totalMeters > 0 ? totalMeters.toLocaleString() : '—' },
                { label: 'Date range', value:
                    firstRecord && lastRecord && firstRecord.tanggal !== lastRecord.tanggal
                    ? `${fmtDate(firstRecord.tanggal)} – ${fmtDate(lastRecord.tanggal)}`
                    : (firstRecord ? fmtDate(firstRecord.tanggal) : '—') },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="rounded-[10px] p-2 text-center"
                  style={{
                    background: '#E0E5EC',
                    boxShadow: 'inset 3px 3px 6px rgb(163 177 198 / 0.6), inset -3px -3px 6px rgba(255,255,255,0.5)',
                  }}
                >
                  <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: '#9CA3AF' }}>{label}</p>
                  <p className="text-sm font-semibold mt-0.5" style={{ color: '#3D4852' }}>{value}</p>
                </div>
              ))}
            </div>

            {weavingOnMachine.length > 0 ? (
              <div className="rounded-[12px] overflow-hidden" style={{ background: '#E0E5EC', boxShadow: 'inset 3px 3px 6px rgb(163 177 198 / 0.6), inset -3px -3px 6px rgba(255,255,255,0.5)' }}>
                <Table>
                  <TableHeader>
                    <TableRow style={{ background: 'transparent', borderBottom: '1px solid rgb(163 177 198 / 0.3)' }}>
                      <TableHead className="text-[9px] font-bold uppercase" style={{ color: '#9CA3AF' }}>Date</TableHead>
                      <TableHead className="text-[9px] font-bold uppercase" style={{ color: '#9CA3AF' }}>Shift</TableHead>
                      <TableHead className="text-[9px] font-bold uppercase" style={{ color: '#9CA3AF' }}>Eff%</TableHead>
                      <TableHead className="text-[9px] font-bold uppercase" style={{ color: '#9CA3AF' }}>Meters</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {weavingOnMachine.map((w, i) => (
                      <TableRow key={i} style={{ background: 'transparent', borderBottom: i < weavingOnMachine.length - 1 ? '1px solid rgb(163 177 198 / 0.2)' : 'none' }}>
                        <TableCell className="text-xs py-1.5" style={{ color: '#3D4852' }}>{fmtDate(w.tanggal)}</TableCell>
                        <TableCell className="text-xs py-1.5" style={{ color: '#6B7280' }}>{w.shift || '—'}</TableCell>
                        <TableCell className="text-xs py-1.5" style={{ color: '#3D4852' }}>{w.a_pct != null ? parseFloat(String(w.a_pct)).toFixed(1) + '%' : '—'}</TableCell>
                        <TableCell className="text-xs py-1.5" style={{ color: '#3D4852' }}>{w.meters != null ? parseFloat(String(w.meters)).toLocaleString() : '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-xs italic" style={{ color: '#9CA3AF' }}>
                No weaving records for machine {decoded?.machine ?? '—'}
              </p>
            )}
          </section>

          {/* ── Section 2: Inspect Gray ── */}
          <section>
            <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#9CA3AF' }}>
              Inspect Gray — Beam {decoded?.beam ?? '—'}
            </h3>
            {grayForBeam.length > 0 ? (
              <div className="rounded-[12px] overflow-hidden" style={{ background: '#E0E5EC', boxShadow: 'inset 3px 3px 6px rgb(163 177 198 / 0.6), inset -3px -3px 6px rgba(255,255,255,0.5)' }}>
                <Table>
                  <TableHeader>
                    <TableRow style={{ background: 'transparent', borderBottom: '1px solid rgb(163 177 198 / 0.3)' }}>
                      <TableHead className="text-[9px] font-bold uppercase" style={{ color: '#9CA3AF' }}>Date</TableHead>
                      <TableHead className="text-[9px] font-bold uppercase" style={{ color: '#9CA3AF' }}>MC</TableHead>
                      <TableHead className="text-[9px] font-bold uppercase" style={{ color: '#9CA3AF' }}>Grade</TableHead>
                      <TableHead className="text-[9px] font-bold uppercase" style={{ color: '#9CA3AF' }}>W</TableHead>
                      <TableHead className="text-[9px] font-bold uppercase" style={{ color: '#9CA3AF' }}>BME</TableHead>
                      <TableHead className="text-[9px] font-bold uppercase" style={{ color: '#9CA3AF' }}>BMC</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {grayForBeam.map((g) => (
                      <TableRow key={g.id} style={{ background: 'transparent', borderBottom: '1px solid rgb(163 177 198 / 0.2)' }}>
                        <TableCell className="text-xs py-1.5" style={{ color: '#3D4852' }}>{g.tg ? g.tg.split('T')[0] : '—'}</TableCell>
                        <TableCell className="text-xs py-1.5" style={{ color: '#3D4852' }}>{g.mc || '—'}</TableCell>
                        <TableCell className="text-xs py-1.5 font-semibold" style={gradeColor(g.gd)}>{g.gd || '—'}</TableCell>
                        <TableCell className="text-xs py-1.5" style={{ color: '#3D4852' }}>{g.w || '—'}</TableCell>
                        <TableCell className="text-xs py-1.5" style={{ color: '#3D4852' }}>{g.bme != null ? String(g.bme) : '—'}</TableCell>
                        <TableCell className="text-xs py-1.5" style={{ color: '#3D4852' }}>{g.bmc ?? '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-xs italic" style={{ color: '#9CA3AF' }}>
                No gray inspection record found for beam {decoded?.beam ?? '—'}
              </p>
            )}
          </section>

          {/* ── Section 3: BBSF ── */}
          <section>
            <h3 className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#9CA3AF' }}>
              BBSF
            </h3>
            <p className="text-[10px] italic mb-3" style={{ color: '#9CA3AF' }}>
              Order-level data — no beam tracking in BBSF
            </p>

            {/* Washing */}
            <div className="mb-3">
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: '#9CA3AF' }}>Washing</p>
              <div className="rounded-[10px] p-3" style={{ background: '#E0E5EC', boxShadow: 'inset 3px 3px 6px rgb(163 177 198 / 0.6), inset -3px -3px 6px rgba(255,255,255,0.5)' }}>
                <p className="text-sm font-semibold" style={{ color: '#3D4852' }}>
                  {bbsfWashing.length} record{bbsfWashing.length !== 1 ? 's' : ''}
                </p>
                {bbsfWashing.length > 0 && (
                  <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>
                  {bbsfWashing[0] ? fmtDate(bbsfWashing[0].tgl) : null}
                  {bbsfWashing.length > 1 ? ` – ${fmtDate(bbsfWashing[bbsfWashing.length - 1].tgl)}` : ''}
                  </p>
                )}
              </div>
            </div>

            {/* Sanfor by type */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: '#9CA3AF' }}>Sanfor</p>
              {Object.keys(sanforByType).length > 0 ? (
                <div className="space-y-1.5">
                  {Object.entries(sanforByType).sort().map(([type, info]) => {
                    const avg = info.nullSusut === 0
                      ? (info.totalSusut / info.count).toFixed(2)
                      : null;
                    return (
                      <div key={type} className="rounded-[10px] p-3 flex items-center justify-between" style={{ background: '#E0E5EC', boxShadow: 'inset 3px 3px 6px rgb(163 177 198 / 0.6), inset -3px -3px 6px rgba(255,255,255,0.5)' }}>
                        <span className="text-sm font-semibold" style={{ color: '#3D4852' }}>{type}</span>
                        <span className="text-xs" style={{ color: '#6B7280' }}>
                          {info.count} record{info.count !== 1 ? 's' : ''}
                          {avg != null
                            ? ` · avg susut ${avg}%`
                            : ` · ${info.nullSusut} with missing susut`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-[10px] p-3" style={{ background: '#E0E5EC', boxShadow: 'inset 3px 3px 6px rgb(163 177 198 / 0.6), inset -3px -3px 6px rgba(255,255,255,0.5)' }}>
                  <p className="text-sm" style={{ color: '#9CA3AF' }}>No sanfor records</p>
                </div>
              )}
            </div>
          </section>

          {/* ── Section 4: Inspect Finish — this SN ── */}
          <section>
            <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#9CA3AF' }}>
              Inspect Finish — {selectedSN}
            </h3>

            {/* Summary pills */}
            <div className="grid grid-cols-4 gap-2 mb-3">
              {[
                { label: 'Rolls', value: totalRolls },
                { label: 'Top Grade', value: mostCommonGrade || '—' },
                { label: 'Avg Point', value: avgPoint != null ? avgPoint.toFixed(2) : '—' },
                { label: 'Total KG', value: totalKg > 0 ? totalKg.toLocaleString() : '—' },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="rounded-[10px] p-2 text-center"
                  style={{
                    background: '#E0E5EC',
                    boxShadow: 'inset 3px 3px 6px rgb(163 177 198 / 0.6), inset -3px -3px 6px rgba(255,255,255,0.5)',
                  }}
                >
                  <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: '#9CA3AF' }}>{label}</p>
                  <p className="text-sm font-semibold mt-0.5" style={{ color: '#3D4852' }}>{value}</p>
                </div>
              ))}
            </div>

            {finishForSN.length > 0 ? (
              <div className="rounded-[12px] overflow-hidden mb-3" style={{ background: '#E0E5EC', boxShadow: 'inset 3px 3px 6px rgb(163 177 198 / 0.6), inset -3px -3px 6px rgba(255,255,255,0.5)' }}>
                <Table>
                  <TableHeader>
                    <TableRow style={{ background: 'transparent', borderBottom: '1px solid rgb(163 177 198 / 0.3)' }}>
                      <TableHead className="text-[9px] font-bold uppercase" style={{ color: '#9CA3AF' }}>Shift</TableHead>
                      <TableHead className="text-[9px] font-bold uppercase" style={{ color: '#9CA3AF' }}>Op</TableHead>
                      <TableHead className="text-[9px] font-bold uppercase" style={{ color: '#9CA3AF' }}>L</TableHead>
                      <TableHead className="text-[9px] font-bold uppercase" style={{ color: '#9CA3AF' }}>KG</TableHead>
                      <TableHead className="text-[9px] font-bold uppercase" style={{ color: '#9CA3AF' }}>Susut</TableHead>
                      <TableHead className="text-[9px] font-bold uppercase" style={{ color: '#9CA3AF' }}>Gr</TableHead>
                      <TableHead className="text-[9px] font-bold uppercase" style={{ color: '#9CA3AF' }}>Pt</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {finishForSN.map((f, i) => (
                      <TableRow key={f.id ?? i} style={{ background: 'transparent', borderBottom: i < finishForSN.length - 1 ? '1px solid rgb(163 177 198 / 0.2)' : 'none' }}>
                        <TableCell className="text-xs py-1.5" style={{ color: '#6B7280' }}>{f.shift || '—'}</TableCell>
                        <TableCell className="text-xs py-1.5" style={{ color: '#6B7280' }}>{f.operator?.slice(0, 4) || '—'}</TableCell>
                        <TableCell className="text-xs py-1.5" style={{ color: '#3D4852' }}>{f.lebar != null ? f.lebar.toLocaleString() : '—'}</TableCell>
                        <TableCell className="text-xs py-1.5" style={{ color: '#3D4852' }}>{f.kg != null ? f.kg.toLocaleString() : '—'}</TableCell>
                        <TableCell className="text-xs py-1.5" style={{ color: '#3D4852' }}>{f.susut_lusi != null ? f.susut_lusi + '%' : '—'}</TableCell>
                        <TableCell className="text-xs py-1.5 font-semibold" style={gradeColor(f.grade)}>{f.grade || '—'}</TableCell>
                        <TableCell className="text-xs py-1.5 font-semibold" style={pointColor(f.point)}>
                          {f.point != null ? (
                            <span className="inline-flex items-center gap-1">
                              {f.point > 4.0 && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#DC2626' }} />}
                              {f.point > 2.0 && f.point <= 4.0 && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#D97706' }} />}
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
              <p className="text-xs italic mb-3" style={{ color: '#9CA3AF' }}>No inspect finish records for {selectedSN}</p>
            )}

            {/* Defect Detail — collapsible */}
            {activeDefects.length > 0 && (
              <DefectDetail defects={activeDefects} record={firstDefectRecord!} />
            )}
          </section>

        </div>
      </div>
    </>
  );
}

type Defect = { key: keyof import('./OrderDetailPage').InspectFinishRecord; label: string };

function DefectDetail({ defects, record }: { defects: Defect[]; record: import('./OrderDetailPage').InspectFinishRecord }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="rounded-[12px] overflow-hidden"
      style={{ background: '#E0E5EC', boxShadow: 'inset 3px 3px 6px rgb(163 177 198 / 0.6), inset -3px -3px 6px rgba(255,255,255,0.5)' }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full px-4 py-2.5 flex items-center justify-between text-left"
        style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
      >
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>
          Defect Detail ({defects.length})
        </span>
        {open
          ? <ChevronUp className="w-3.5 h-3.5" style={{ color: '#9CA3AF' }} />
          : <ChevronDown className="w-3.5 h-3.5" style={{ color: '#9CA3AF' }} />}
      </button>
      {open && (
        <div className="px-4 pb-3 grid grid-cols-6 gap-1.5">
          {defects.map(({ key, label }) => {
            const val = record[key] as number;
            return (
              <div key={key} className="rounded-[8px] p-1.5 text-center" style={{ background: 'rgba(255,255,255,0.5)', boxShadow: '2px 2px 4px rgb(163 177 198 / 0.4), -2px -2px 4px rgba(255,255,255,0.3)' }}>
                <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: '#9CA3AF' }}>{label}</p>
                <p className="text-sm font-semibold" style={{ color: '#DC2626' }}>{val}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
