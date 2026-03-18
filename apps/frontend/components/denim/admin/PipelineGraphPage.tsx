'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authFetch } from '../../../lib/authFetch';
import {
  FileText, Compass, Wind, Layers, ScanSearch, Droplet, ScanLine,
  ChevronRight, Circle, CheckCircle2,
} from 'lucide-react';
import { Skeleton } from '../../ui/skeleton';
import { format } from 'date-fns';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────

type SalesContract = {
  kp: string; tgl: string; codename: string | null; permintaan: string | null;
  kat_kode: string | null; ket_warna: string | null; status: string | null;
  te: number | null; acc: string | null; pipeline_status: string;
};

type WarpingRun = {
  id: number; kp: string; tgl: string; no_mc: number | null;
  rpm: number | null; total_beam: number | null; total_putusan: number | null;
  total_meters: number | null; eff_warping: number | null;
  beams: WarpingBeam[];
};

type WarpingBeam = {
  id: number; warping_run_id: number; kp: string; position: number;
  beam_number: number; putusan: number | null; jumlah_ends: number | null;
  panjang_beam: number | null;
};

type IndigoRun = {
  id: number; kp: string; tanggal: string; mc: number | null;
  speed: number | null; indigo: number | null; caustic: number | null;
};

type WeavingRecord = {
  id: number; kp: string; tanggal: string; shift: string | null;
  machine: string | null; beam: number | null; kpicks: number | null;
  meters: number | null; a_pct: number | null;
};

type InspectGrayRecord = {
  id: number; kp: string; tg: string; mc: string | null;
  no_roll: number | null; panjang: number | null; lebar: number | null;
  berat: number | null; gd: string | null;
};

type InspectGrayRecordFull = {
  id: number; kp: string; tg: string; mc: string | null; bm: number | null;
  sn: string | null; sn_combined: string | null; gd: string | null; w: string | null;
};

type BBSFWashingRun = {
  id: number; kp: string; tgl: string; shift: string | null; mc: string | null;
};

type BBSFSanforRun = {
  id: number; kp: string; tgl: string; shift: string | null;
  sanfor_type: string | null;
};

type InspectFinishRecord = {
  id: number; kp: string; tgl: string; shift: string | null; sn: string | null;
  sn_combined: string | null; sn_machine: string | null; sn_beam: number | null;
  lebar: number | null; kg: number | null; grade: string | null;
  point: number | null;
};

type BeamTrace = {
  beam_number: number;
  machine: string | null;
  warpingBeam: WarpingBeam | null;
  weavingRecords: WeavingRecord[];
  inspectGrayRecords: InspectGrayRecordFull[];
  bbsfNote: string;
  inspectFinishRecords: InspectFinishRecord[];
};

type GraphResponse = {
  anchor: { type: string; value: string };
  kp: string;
  salesContract: SalesContract | null;
  warpingRun: WarpingRun | null;
  indigoRun: IndigoRun | null;
  allBeams: WarpingBeam[];
  allWeavingRecords: WeavingRecord[];
  allInspectGray: InspectGrayRecordFull[];
  bbsfWashing: BBSFWashingRun[];
  bbsfSanfor: BBSFSanforRun[];
  allInspectFinish: InspectFinishRecord[];
  beamTrace: BeamTrace | null;
};

// ─── Stage config ─────────────────────────────────────────────────────────────

const STAGES = [
  { key: 'sc',           label: 'Sales Contract',   Icon: FileText,   color: '#6366F1' },
  { key: 'warping',      label: 'Warping',          Icon: Compass,     color: '#F59E0B' },
  { key: 'indigo',       label: 'Indigo',           Icon: Wind,       color: '#3B82F6' },
  { key: 'weaving',      label: 'Weaving',          Icon: Layers,     color: '#10B981' },
  { key: 'inspectGray',  label: 'Inspect Gray',     Icon: ScanSearch, color: '#8B5CF6' },
  { key: 'bbsf',         label: 'BBSF',             Icon: Droplet,    color: '#14B8A6' },
  { key: 'inspectFinish',label: 'Inspect Finish',   Icon: ScanLine,   color: '#EF4444' },
] as const;

type StageKey = typeof STAGES[number]['key'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function hasData(data: GraphResponse, key: StageKey): boolean {
  switch (key) {
    case 'sc':           return !!data.salesContract;
    case 'warping':      return !!data.warpingRun;
    case 'indigo':       return !!data.indigoRun;
    case 'weaving':      return data.allWeavingRecords.length > 0;
    case 'inspectGray':  return data.allInspectGray.length > 0;
    case 'bbsf':         return data.bbsfWashing.length > 0 || data.bbsfSanfor.length > 0;
    case 'inspectFinish':return data.allInspectFinish.length > 0;
  }
}

function recordCount(data: GraphResponse, key: StageKey): number {
  switch (key) {
    case 'sc':           return data.salesContract ? 1 : 0;
    case 'warping':      return data.warpingRun?.beams?.length ?? 0;
    case 'indigo':       return data.indigoRun ? 1 : 0;
    case 'weaving':      return data.allWeavingRecords.length;
    case 'inspectGray':  return data.allInspectGray.length;
    case 'bbsf':         return data.bbsfWashing.length + data.bbsfSanfor.length;
    case 'inspectFinish':return data.allInspectFinish.length;
  }
}

// ─── Stage card content components ────────────────────────────────────────────

function SCCard({ data, beamMode }: { data: GraphResponse; beamMode: boolean }) {
  const sc = data.salesContract;
  if (!sc) return null;
  return (
    <div className="space-y-1">
      <div className="flex gap-3 text-xs">
        <span><span className="font-medium text-gray-500">KP:</span> <span className="font-mono font-semibold">{sc.kp}</span></span>
        {sc.codename && <span><span className="font-medium text-gray-500">Name:</span> {sc.codename}</span>}
      </div>
      <div className="flex gap-3 text-xs">
        {sc.tgl && <span><span className="font-medium text-gray-500">Date:</span> {format(new Date(sc.tgl), 'd MMM yyyy')}</span>}
        {sc.kat_kode && <span><span className="font-medium text-gray-500">Type:</span> {sc.kat_kode}</span>}
      </div>
      <div className="mt-1.5">
        <span className={`inline-flex items-center rounded-full px-2 py-px text-[10px] font-semibold ${sc.pipeline_status === 'COMPLETE' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
          {sc.pipeline_status}
        </span>
      </div>
    </div>
  );
}

function WarpingCard({ data, beamMode }: { data: GraphResponse; beamMode: boolean }) {
  const wr = data.warpingRun;
  const beams = data.allBeams;
  if (!wr) return null;
  return (
    <div className="space-y-1.5">
      <div className="flex gap-3 text-xs">
        {wr.tgl && <span><span className="font-medium text-gray-500">Date:</span> {format(new Date(wr.tgl), 'd MMM')}</span>}
        {wr.no_mc && <span><span className="font-medium text-gray-500">MC:</span> {wr.no_mc}</span>}
        {wr.rpm && <span><span className="font-medium text-gray-500">RPM:</span> {wr.rpm}</span>}
        {wr.total_beam != null && <span><span className="font-medium text-gray-500">Beams:</span> {wr.total_beam}</span>}
      </div>
      {beamMode && beams.length > 0 && (
        <div className="mt-1 space-y-0.5">
          {beams.map(b => {
            const active = data.beamTrace?.beam_number === b.beam_number;
            return (
              <div key={b.id} className={`flex items-center gap-2 rounded px-2 py-0.5 text-xs ${active ? 'bg-amber-50 border border-amber-300' : 'opacity-40'}`}>
                <span className={`font-mono font-semibold w-8 ${active ? 'text-amber-700' : 'text-gray-500'}`}>#{b.beam_number}</span>
                <span className="text-gray-500">putusan: <span className="font-medium text-gray-700">{b.putusan ?? '—'}</span></span>
                {b.jumlah_ends != null && <span className="text-gray-500">ends: <span className="font-medium text-gray-700">{b.jumlah_ends}</span></span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function IndigoCard({ data, beamMode }: { data: GraphResponse; beamMode: boolean }) {
  const ir = data.indigoRun;
  if (!ir) return null;
  return (
    <div className="flex gap-3 text-xs">
      {ir.tanggal && <span><span className="font-medium text-gray-500">Date:</span> {format(new Date(ir.tanggal), 'd MMM')}</span>}
      {ir.mc && <span><span className="font-medium text-gray-500">MC:</span> {ir.mc}</span>}
      {ir.speed && <span><span className="font-medium text-gray-500">Speed:</span> {ir.speed}</span>}
      {ir.indigo != null && <span><span className="font-medium text-gray-500">Indigo g/L:</span> {ir.indigo}</span>}
      {ir.caustic != null && <span><span className="font-medium text-gray-500">Caustic g/L:</span> {ir.caustic}</span>}
    </div>
  );
}

function WeavingCard({ data, beamMode }: { data: GraphResponse; beamMode: boolean }) {
  const records = beamMode && data.beamTrace
    ? data.beamTrace.weavingRecords
    : data.allWeavingRecords;

  if (records.length === 0) return null;

  // Group by machine
  const byMachine: Record<string, WeavingRecord[]> = {};
  for (const r of records) {
    const m = r.machine || 'Unknown';
    if (!byMachine[m]) byMachine[m] = [];
    byMachine[m].push(r);
  }

  return (
    <div className="space-y-2">
      {Object.entries(byMachine).map(([machine, recs]) => {
        const avgEff = recs.reduce((s, r) => s + (r.a_pct ?? 0), 0) / (recs.filter(r => r.a_pct != null).length || 1);
        const totalM = recs.reduce((s, r) => s + (r.meters ?? 0), 0);
        return (
          <div key={machine}>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs font-semibold font-mono text-indigo-600">{machine}</span>
              <span className="text-[10px] text-gray-400">({recs.length} shifts)</span>
            </div>
            <div className="flex gap-3 text-[10px] text-gray-500 pl-1">
              <span>Avg Eff: <span className="font-medium text-gray-700">{avgEff.toFixed(1)}%</span></span>
              <span>Total m: <span className="font-medium text-gray-700">{totalM.toLocaleString()}</span></span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function InspectGrayCard({ data, beamMode }: { data: GraphResponse; beamMode: boolean }) {
  const records = beamMode && data.beamTrace
    ? data.beamTrace.inspectGrayRecords
    : data.allInspectGray;

  if (records.length === 0) return null;

  const gradeDist: Record<string, number> = {};
  for (const r of records) {
    const g = r.gd || '?';
    gradeDist[g] = (gradeDist[g] || 0) + 1;
  }

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap gap-1">
        {Object.entries(gradeDist).map(([grade, count]) => (
          <span key={grade} className="inline-flex items-center rounded-full bg-purple-50 border border-purple-200 px-1.5 py-px text-[10px] font-medium text-purple-700">
            {grade}: {count}
          </span>
        ))}
      </div>
      {beamMode && data.beamTrace && (
        <p className="text-[10px] text-gray-400">bm = #{data.beamTrace.beam_number}</p>
      )}
    </div>
  );
}

function BbsfCard({ data, beamMode }: { data: GraphResponse; beamMode: boolean }) {
  const washing = data.bbsfWashing.length;
  const sanfor = data.bbsfSanfor.length;
  if (washing === 0 && sanfor === 0) return null;
  return (
    <div className="space-y-1.5">
      <div className="flex gap-3 text-xs">
        {washing > 0 && <span><span className="font-medium text-gray-500">Washing:</span> {washing} runs</span>}
        {sanfor > 0 && <span><span className="font-medium text-gray-500">Sanfor:</span> {sanfor} runs</span>}
      </div>
      <div className="flex items-start gap-1.5 rounded bg-blue-50 border border-blue-100 px-2 py-1">
        <span className="text-[10px] text-blue-600 mt-0.5">ℹ</span>
        <p className="text-[10px] text-blue-600 leading-relaxed">
          Order-level data only — no beam tracking in BBSF
        </p>
      </div>
    </div>
  );
}

function InspectFinishCard({ data, beamMode }: { data: GraphResponse; beamMode: boolean }) {
  const records = beamMode && data.beamTrace
    ? data.beamTrace.inspectFinishRecords
    : data.allInspectFinish;

  if (records.length === 0) return null;

  const grades = records.map(r => r.grade).filter(Boolean);
  const avgGrade = grades.length > 0
    ? Object.entries(grades.reduce((acc, g) => { acc[g!] = (acc[g!] || 0) + 1; return acc; }, {} as Record<string, number>))
        .sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—'
    : '—';
  const avgPoint = records.reduce((s, r) => s + (r.point ?? 0), 0) / records.filter(r => r.point != null).length;
  const avgLebar = records.reduce((s, r) => s + (r.lebar ?? 0), 0) / records.filter(r => r.lebar != null).length;

  return (
    <div className="space-y-1.5">
      <div className="flex gap-3 text-xs">
        <span><span className="font-medium text-gray-500">Total rolls:</span> <span className="font-semibold">{records.length}</span></span>
        <span><span className="font-medium text-gray-500">Top grade:</span> {avgGrade}</span>
        {avgPoint > 0 && <span><span className="font-medium text-gray-500">Avg pt:</span> {avgPoint.toFixed(1)}</span>}
        {avgLebar > 0 && <span><span className="font-medium text-gray-500">Avg W:</span> {avgLebar.toFixed(1)}</span>}
      </div>
      {beamMode && data.beamTrace && (
        <p className="text-[10px] text-gray-400">Showing rolls where sn_beam = #{data.beamTrace.beam_number}</p>
      )}
    </div>
  );
}

// ─── Stage card renderer ──────────────────────────────────────────────────────

function StageCardInner({ key, data, beamMode }: { key: StageKey; data: GraphResponse; beamMode: boolean }) {
  switch (key) {
    case 'sc':           return <SCCard data={data} beamMode={beamMode} />;
    case 'warping':      return <WarpingCard data={data} beamMode={beamMode} />;
    case 'indigo':       return <IndigoCard data={data} beamMode={beamMode} />;
    case 'weaving':      return <WeavingCard data={data} beamMode={beamMode} />;
    case 'inspectGray':  return <InspectGrayCard data={data} beamMode={beamMode} />;
    case 'bbsf':         return <BbsfCard data={data} beamMode={beamMode} />;
    case 'inspectFinish':return <InspectFinishCard data={data} beamMode={beamMode} />;
  }
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function PipelineGraphPage({
  kp: initialKp, sn: initialSn, beam: initialBeam,
}: {
  kp?: string; sn?: string; beam?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [kpInput, setKpInput] = useState(initialKp || '');
  const [snInput, setSnInput] = useState(initialSn || '');
  const [activeKp, setActiveKp] = useState(initialKp || '');
  const [activeBeam, setActiveBeam] = useState<number | null>(initialBeam ? parseInt(initialBeam) : null);
  const [data, setData] = useState<GraphResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const beamMode = activeBeam !== null;

  const fetchGraph = useCallback(async (kp: string, beam?: number) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ kp });
      if (beam != null) params.set('beam', String(beam));
      const res = await authFetch(`/denim/pipeline-graph?${params}`);
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to load');
      const json: GraphResponse = await res.json();
      setData(json);
      // Sync beam state from response if not set
      if (beam != null) {
        setActiveBeam(beam);
      } else {
        setActiveBeam(null);
      }
    } catch (err: any) {
      setError(err.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load on mount if kp provided via URL
  useEffect(() => {
    if (initialKp) fetchGraph(initialKp, initialBeam ? parseInt(initialBeam) : undefined);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleKpSearch = () => {
    const kp = kpInput.trim().toUpperCase();
    if (!kp) return;
    setActiveKp(kp);
    setActiveBeam(null);
    setSnInput('');
    router.push(`/denim/admin/pipeline-graph?kp=${kp}`, { scroll: false });
    fetchGraph(kp);
  };

  const handleSnSearch = async () => {
    const sn = snInput.trim().toUpperCase();
    if (!sn) return;
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch(`/denim/pipeline-graph?sn=${encodeURIComponent(sn)}`);
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to load');
      const json: GraphResponse = await res.json();
      setData(json);
      setActiveKp(json.kp);
      setKpInput(json.kp);
      setActiveBeam(json.beamTrace?.beam_number ?? null);
      setSnInput(sn);
      router.push(`/denim/admin/pipeline-graph?kp=${json.kp}${json.beamTrace ? `&beam=${json.beamTrace.beam_number}` : ''}`, { scroll: false });
    } catch (err: any) {
      setError(err.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleBeamSelect = (beamNumber: number) => {
    const newBeam = beamNumber === activeBeam ? null : beamNumber;
    setActiveBeam(newBeam);
    if (activeKp) {
      if (newBeam != null) {
        router.push(`/denim/admin/pipeline-graph?kp=${activeKp}&beam=${newBeam}`, { scroll: false });
        fetchGraph(activeKp, newBeam);
      } else {
        router.push(`/denim/admin/pipeline-graph?kp=${activeKp}`, { scroll: false });
        fetchGraph(activeKp);
      }
    }
  };

  const beams = data?.allBeams ?? [];

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#E8EDF2' }}>
      {/* ── Left panel ────────────────────────────────────────────────────── */}
      <div
        className="flex-shrink-0 overflow-y-auto border-r"
        style={{
          width: 300,
          background: '#EEF1F6',
          borderColor: 'rgb(163 177 198 / 0.4)',
        }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 px-4 pt-6 pb-4" style={{ background: '#EEF1F6' }}>
          <h1 className="text-base font-bold mb-4" style={{ color: '#3D4852' }}>Pipeline Graph</h1>

          {/* KP search */}
          <div className="mb-3">
            <label className="text-xs font-medium text-gray-500 mb-1 block">Search by KP</label>
            <div className="flex gap-1.5">
              <input
                className="flex-1 rounded-lg px-3 py-2 text-sm border focus:outline-none focus:ring-2"
                style={{
                  background: '#E0E5EC',
                  borderColor: 'rgb(163 177 198 / 0.5)',
                  color: '#3D4852',
                  boxShadow: 'inset 3px 3px 6px rgb(163 177 198 / 0.4), inset -3px -3px 6px rgba(255,255,255,0.5)',
                }}
                placeholder="e.g. BRSE"
                value={kpInput}
                onChange={e => setKpInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleKpSearch()}
              />
              <button
                onClick={handleKpSearch}
                className="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{ background: '#6C63FF', color: '#fff' }}
              >
                Go
              </button>
            </div>
          </div>

          {/* SN search */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Search by Roll SN</label>
            <div className="flex gap-1.5">
              <input
                className="flex-1 rounded-lg px-3 py-2 text-sm border focus:outline-none focus:ring-2"
                style={{
                  background: '#E0E5EC',
                  borderColor: 'rgb(163 177 198 / 0.5)',
                  color: '#3D4852',
                  boxShadow: 'inset 3px 3px 6px rgb(163 177 198 / 0.4), inset -3px -3px 6px rgba(255,255,255,0.5)',
                }}
                placeholder="e.g. AE04182D03L"
                value={snInput}
                onChange={e => setSnInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSnSearch()}
              />
              <button
                onClick={handleSnSearch}
                className="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{ background: '#6C63FF', color: '#fff' }}
              >
                Go
              </button>
            </div>
          </div>
        </div>

        {/* Beam selector */}
        {data && beams.length > 0 && (
          <div className="px-4 pb-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Beams</span>
              <button
                onClick={() => handleBeamSelect(activeBeam ?? beams[0]?.beam_number)}
                className="text-[10px] font-medium text-indigo-500 hover:text-indigo-700 transition-colors"
              >
                {beamMode ? 'All beams' : ''}
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {beams.map(b => {
                const isActive = activeBeam === b.beam_number;
                return (
                  <button
                    key={b.id}
                    onClick={() => handleBeamSelect(b.beam_number)}
                    className="inline-flex items-center justify-center rounded-full w-8 h-8 text-xs font-semibold transition-all border"
                    style={
                      isActive
                        ? { background: '#F59E0B', color: '#fff', borderColor: '#F59E0B', boxShadow: '0 2px 6px rgb(245 158 11 / 0.5)' }
                        : { background: '#E0E5EC', color: '#6B7280', borderColor: 'rgb(163 177 198 / 0.4)', boxShadow: '3px 3px 6px rgb(163 177 198 / 0.5), -3px -3px 6px rgba(255,255,255,0.6)' }
                    }
                  >
                    #{b.beam_number}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Status */}
        {data && (
          <div className="px-4 pb-6">
            <div className="rounded-xl p-3 text-xs space-y-1" style={{ background: '#E0E5EC', boxShadow: 'inset 3px 3px 6px rgb(163 177 198 / 0.4), inset -3px -3px 6px rgba(255,255,255,0.5)' }}>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-600">{data.kp}</span>
                <span className={`rounded-full px-2 py-px text-[10px] font-semibold ${data.anchor.type === 'sn' ? 'bg-blue-100 text-blue-700' : data.anchor.type === 'beam' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                  {data.anchor.type}
                </span>
              </div>
              {beamMode && data.beamTrace && (
                <p className="text-gray-400">
                  Beam #{data.beamTrace.beam_number}{data.beamTrace.machine ? ` · ${data.beamTrace.machine}` : ''}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Right panel ──────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {loading && (
          <div className="space-y-4">
            {[...Array(7)].map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-500 font-medium mb-1">Error</p>
              <p className="text-sm text-gray-500">{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && !data && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center text-gray-400">
              <ScanLine className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Enter a KP or SN to view the pipeline graph</p>
            </div>
          </div>
        )}

        {!loading && !error && data && (
          <div className="space-y-0">
            {STAGES.map(({ key, label, Icon, color }, idx) => {
              const present = hasData(data, key);
              const count = recordCount(data, key);
              const beamRelevant = (() => {
                if (!beamMode || !data.beamTrace) return true;
                switch (key) {
                  case 'warping': return data.beamTrace.warpingBeam != null;
                  case 'weaving': return data.beamTrace.weavingRecords.length > 0;
                  case 'inspectGray': return data.beamTrace.inspectGrayRecords.length > 0;
                  case 'bbsf': return true; // always visible
                  case 'inspectFinish': return data.beamTrace.inspectFinishRecords.length > 0;
                  default: return true;
                }
              })();
              const dimmed = beamMode && !beamRelevant;

              return (
                <div key={key} className="relative">
                  {/* Connector line */}
                  {idx < STAGES.length - 1 && (
                    <div className="absolute left-[22px] top-full z-0" style={{ width: 2, height: 12, background: present ? `${color}33` : '#CBD5E1' }} />
                  )}

                  {/* Amber beam path line */}
                  {beamMode && beamRelevant && (
                    <div
                      className="absolute left-[19px] top-0 bottom-0 z-0 rounded-full"
                      style={{ width: 6, background: 'linear-gradient(180deg, #F59E0B33, #F59E0B88, #F59E0B33)', boxShadow: '0 0 8px #F59E0B44' }}
                    />
                  )}

                  {/* Card */}
                  <div
                    className="relative z-10 mb-3 rounded-2xl overflow-hidden transition-opacity duration-300"
                    style={{
                      opacity: dimmed ? 0.25 : 1,
                      background: '#EEF1F6',
                      boxShadow: beamMode && beamRelevant
                        ? `0 4px 20px rgb(245 158 11 / 0.15), 9px 9px 16px rgb(163 177 198 / 0.5), -9px -9px 16px rgba(255,255,255,0.5)`
                        : `9px 9px 16px rgb(163 177 198 / 0.5), -9px -9px 16px rgba(255,255,255,0.5)`,
                      border: beamMode && beamRelevant ? '1.5px solid rgb(245 158 11 / 0.3)' : '1.5px solid transparent',
                    }}
                  >
                    {/* Top accent bar */}
                    <div style={{ height: 4, background: present ? color : '#CBD5E1' }} />

                    <div className="flex items-start gap-3 px-5 py-4">
                      {/* Icon + status */}
                      <div className="flex-shrink-0 mt-0.5">
                        {present
                          ? <CheckCircle2 className="w-5 h-5" style={{ color }} />
                          : <Circle className="w-5 h-5 text-gray-300" />
                        }
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" style={{ color }} />
                            <span className="text-sm font-semibold" style={{ color: '#3D4852' }}>{label}</span>
                          </div>
                          {present && (
                            <span
                              className="inline-flex items-center rounded-full px-2 py-px text-[10px] font-bold"
                              style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}
                            >
                              {count} {count === 1 ? 'record' : 'records'}
                            </span>
                          )}
                          {!present && (
                            <span className="text-xs text-gray-400">No data</span>
                          )}
                        </div>

                        {present && (
                          <StageCardInner key={key} data={data} beamMode={beamMode} />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
