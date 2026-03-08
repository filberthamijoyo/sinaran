'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authFetch } from '../../../lib/authFetch';
import PageHeader from '../../layout/PageHeader';
import { Button } from '../../ui/button';
import { Skeleton } from '../../ui/skeleton';
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '../../ui/table';
import { ArrowLeft, Check, Circle, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

type SalesContract = {
  kp: string;
  tgl: string;
  codename: string | null;
  permintaan: string | null;
  kat_kode: string | null;
  ket_warna: string | null;
  status: string | null;
  te: number | null;
  acc: string | null;
  pipeline_status: string;
};

type WarpingRun = {
  id: number;
  kp: string;
  tgl: string;
  start_time: string | null;
  stop_time: string | null;
  rpm: number | null;
  mtr_min: number | null;
  total_putusan: number | null;
  beams: WarpingBeam[];
};

type WarpingBeam = {
  id: number;
  beam_number: number;
  panjang_beam: number | null;
  jumlah_ends: number | null;
};

type IndigoRun = {
  id: number;
  kp: string;
  tanggal: string;
  start: string | null;
  stop: string | null;
  jumlah_rope: number | null;
  panjang_rope: number | null;
  total_meters: number | null;
};

type WeavingRecord = {
  id: number;
  kp: string;
  tanggal: string;
  shift: string | null;
  machine: string | null;
  beam: number | null;
  kpicks: number | null;
  meters: number | null;
  a_pct: number | null;
};

type InspectGrayRecord = {
  id: number;
  kp: string;
  tg: string;
  mc: string | null;
  no_roll: number | null;
  panjang: number | null;
  lebar: number | null;
  berat: number | null;
  gd: string | null;
};

// API response shape from /api/denim/pipeline/:kp
type PipelineApiResponse = {
  salesContract: SalesContract | null;
  warping_run: WarpingRun | null;
  indigo_run: IndigoRun | null;
  weaving_records: WeavingRecord[];
  inspection?: InspectGrayRecord[];
};

// Internal shape used throughout the component
type PipelineData = {
  sc: SalesContract | null;
  warping: WarpingRun | null;
  indigo: IndigoRun | null;
  weaving: WeavingRecord[];
  inspection: InspectGrayRecord[];
};

// Determine pipeline stages based on actual data presence, not just approval status
function getPipelineStages(data: PipelineData) {
  const hasApproval = !!data.sc;
  const hasWarping = !!data.warping;
  const hasIndigo = !!data.indigo;
  const hasWeaving = data.weaving && data.weaving.length > 0;
  const hasInspect = data.inspection && data.inspection.length > 0;
  const isComplete = hasWarping && hasIndigo && hasWeaving;

  return {
    approval: hasApproval,
    warping: hasWarping,
    indigo: hasIndigo,
    weaving: hasWeaving,
    inspect: hasInspect,
    complete: isComplete,
  };
}

const STAGES = [
  { key: 'PENDING_APPROVAL', label: 'Approval' },
  { key: 'WARPING', label: 'Warping' },
  { key: 'INDIGO', label: 'Indigo' },
  { key: 'WEAVING', label: 'Weaving' },
  { key: 'INSPECT_GRAY', label: 'Inspect' },
  { key: 'COMPLETE', label: 'Complete' },
];

function PipelineProgressBar({ pipelineData }: { pipelineData: PipelineData }) {
  const stages = getPipelineStages(pipelineData);
  
  // Determine the current stage based on what has data
  // Priority: complete > inspect > weaving > indigo > warping > approval
  let currentStage = 'PENDING_APPROVAL';
  if (stages.complete) {
    currentStage = 'COMPLETE';
  } else if (stages.inspect) {
    currentStage = 'INSPECT_GRAY';
  } else if (stages.weaving) {
    currentStage = 'WEAVING';
  } else if (stages.indigo) {
    currentStage = 'INDIGO';
  } else if (stages.warping) {
    currentStage = 'WARPING';
  } else if (stages.approval) {
    currentStage = 'PENDING_APPROVAL';
  }

  const currentIdx = STAGES.findIndex(s => s.key === currentStage);

  return (
    <div className="bg-white rounded-xl border border-zinc-200/80 shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between">
        {STAGES.map((stage, idx) => {
          // Determine stage completion based on actual data presence
          let isComplete = false;
          if (stage.key === 'PENDING_APPROVAL') isComplete = stages.approval;
          else if (stage.key === 'WARPING') isComplete = stages.warping;
          else if (stage.key === 'INDIGO') isComplete = stages.indigo;
          else if (stage.key === 'WEAVING') isComplete = stages.weaving;
          else if (stage.key === 'INSPECT_GRAY') isComplete = stages.inspect;
          else if (stage.key === 'COMPLETE') isComplete = stages.complete;

          const isCurrent = idx === currentIdx;

          return (
            <div key={stage.key} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    transition-all
                    ${isComplete && !isCurrent ? 'bg-green-500 text-white' : ''}
                    ${isCurrent ? 'bg-blue-500 text-white ring-4 ring-blue-100' : ''}
                    ${!isComplete && !isCurrent ? 'bg-zinc-200 text-zinc-400' : ''}
                  `}
                >
                  {isComplete && !isCurrent ? (
                    <Check className="w-5 h-5" />
                  ) : isCurrent ? (
                    <Circle className="w-4 h-4" />
                  ) : (
                    <Circle className="w-4 h-4" />
                  )}
                </div>
                <span
                  className={`
                    text-xs mt-2 font-medium
                    ${isComplete && !isCurrent ? 'text-green-600' : ''}
                    ${isCurrent ? 'text-blue-600' : ''}
                    ${!isComplete && !isCurrent ? 'text-zinc-400' : ''}
                  `}
                >
                  {stage.label}
                </span>
              </div>
              {idx < STAGES.length - 1 && (
                <div
                  className={`
                    w-16 md:w-24 h-0.5 mx-2
                    ${isComplete && !isCurrent ? 'bg-green-500' : 'bg-zinc-200'}
                  `}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SectionIcon({ hasData }: { hasData: boolean }) {
  return hasData ? (
    <CheckCircle2 className="w-5 h-5 text-green-500" />
  ) : (
    <Circle className="w-5 h-5 text-zinc-300" />
  );
}

function SectionCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-zinc-200/80 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3 border-b border-zinc-100 bg-zinc-50/50">
        {icon}
        <h3 className="text-sm font-semibold text-zinc-800">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

const formatDate = (iso: string | null) => {
  if (!iso) return '—';
  try { return format(new Date(iso), 'd MMM yyyy'); }
  catch { return '—'; }
};

const formatDateTime = (iso: string | null) => {
  if (!iso) return '—';
  try { return format(new Date(iso), 'd MMM yyyy HH:mm'); }
  catch { return '—'; }
};

export default function OrderDetailPage({ kp }: { kp: string }) {
  const router = useRouter();
  const [data, setData] = useState<PipelineApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('erp_token');
        const hasToken = !!token;
        
        const result = await authFetch(
          `/denim/pipeline/${kp}`
        );
        
        if (!result) {
          setError('No data returned from API');
        } else if (!result.salesContract) {
          setError('Sales contract not found. Result keys: ' + Object.keys(result).join(', '));
        } else {
          setData(result);
        }
      } catch (e: any) {
        setError('Error: ' + (e.message || e.toString()));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [kp]);

  if (loading) {
    return (
      <div className="px-8 pb-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-32 rounded-xl mb-6" />
        <div className="space-y-4">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !data?.salesContract) {
    return (
      <div className="px-8 pb-8">
        <div className="text-center py-16">
          <p className="text-red-500 font-mono text-sm mb-2">ERROR: {error || 'Order not found'}</p>
          <p className="text-zinc-400 text-xs">data exists: {!!data}, keys: {data ? Object.keys(data).join(', ') : 'none'}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
      </div>
    );
  }

  // API returns: salesContract, warping_run, indigo_run, weaving_records
  const { salesContract: sc, warping_run: warping, indigo_run: indigo, weaving_records: weaving, inspection = [] } = data;

  return (
    <div>
      <PageHeader
        title={`Order ${kp}`}
        subtitle="Pipeline details"
        actions={
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        }
      />

      <div className="px-8 pb-8 space-y-6">
        <PipelineProgressBar pipelineData={{ sc, warping, indigo, weaving, inspection }} />

        {/* Sales Contract Section */}
        <SectionCard
          title="Sales Contract"
          icon={<SectionIcon hasData={!!sc} />}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-zinc-500">KP</p>
              <p className="text-sm font-mono font-semibold text-zinc-900">{sc.kp}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">Date</p>
              <p className="text-sm text-zinc-900">{formatDate(sc.tgl)}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">Construction</p>
              <p className="text-sm text-zinc-900">{sc.codename || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">Type</p>
              <p className="text-sm text-zinc-900">{sc.kat_kode || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">Customer</p>
              <p className="text-sm text-zinc-900">{sc.permintaan || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">TE</p>
              <p className="text-sm font-mono text-zinc-900">{sc.te?.toLocaleString() || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">Color</p>
              <p className="text-sm text-zinc-900">{sc.ket_warna || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">ACC</p>
              <p className="text-sm text-zinc-900">{sc.acc || '—'}</p>
            </div>
          </div>
        </SectionCard>

        {/* Warping Section */}
        <SectionCard
          title="Warping"
          icon={<SectionIcon hasData={!!warping} />}
        >
          {warping ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-zinc-500">Date</p>
                  <p className="text-sm text-zinc-900">{formatDate(warping.tgl)}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Start Time</p>
                  <p className="text-sm text-zinc-900">{warping.start_time || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Stop Time</p>
                  <p className="text-sm text-zinc-900">{warping.stop_time || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">RPM</p>
                  <p className="text-sm text-zinc-900">{warping.rpm || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Meters/Min</p>
                  <p className="text-sm text-zinc-900">{warping.mtr_min || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Total Putusan</p>
                  <p className="text-sm text-zinc-900">{warping.total_putusan?.toLocaleString() || '—'}</p>
                </div>
              </div>
              {warping.beams && warping.beams.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs text-zinc-500 mb-2">Beams</p>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-zinc-50">
                          <TableHead className="text-xs">#</TableHead>
                          <TableHead className="text-xs">Beam No</TableHead>
                          <TableHead className="text-xs">Length</TableHead>
                          <TableHead className="text-xs">Ends</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {warping.beams.map((beam, idx) => (
                          <TableRow key={beam.id}>
                            <TableCell className="text-xs">{idx + 1}</TableCell>
                            <TableCell className="text-sm font-mono">{beam.beam_number}</TableCell>
                            <TableCell className="text-sm">{beam.panjang_beam?.toLocaleString() || '—'}</TableCell>
                            <TableCell className="text-sm">{beam.jumlah_ends?.toLocaleString() || '—'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-zinc-400">No warping data yet</p>
          )}
        </SectionCard>

        {/* Indigo Section */}
        <SectionCard
          title="Indigo"
          icon={<SectionIcon hasData={!!indigo} />}
        >
          {indigo ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-zinc-500">Date</p>
                <p className="text-sm text-zinc-900">{formatDate(indigo.tanggal)}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Start</p>
                <p className="text-sm text-zinc-900">{indigo.start || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Stop</p>
                <p className="text-sm text-zinc-900">{indigo.stop || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Rope Count</p>
                <p className="text-sm text-zinc-900">{indigo.jumlah_rope || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Rope Length</p>
                <p className="text-sm text-zinc-900">{indigo.panjang_rope || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Total Meters</p>
                <p className="text-sm text-zinc-900">{indigo.total_meters?.toLocaleString() || '—'}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-zinc-400">No indigo data yet</p>
          )}
        </SectionCard>

        {/* Weaving Section */}
        <SectionCard
          title="Weaving"
          icon={<SectionIcon hasData={weaving.length > 0} />}
        >
          {weaving.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-zinc-50">
                    <TableHead className="text-xs">Date</TableHead>
                    <TableHead className="text-xs">Shift</TableHead>
                    <TableHead className="text-xs">Machine</TableHead>
                    <TableHead className="text-xs">Beam</TableHead>
                    <TableHead className="text-xs">Picks</TableHead>
                    <TableHead className="text-xs">Meters</TableHead>
                    <TableHead className="text-xs">Efficiency %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {weaving.slice(0, 50).map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="text-sm">{formatDate(record.tanggal)}</TableCell>
                      <TableCell className="text-sm">{record.shift || '—'}</TableCell>
                      <TableCell className="text-sm font-mono">{record.machine || '—'}</TableCell>
                      <TableCell className="text-sm">{record.beam || '—'}</TableCell>
                      <TableCell className="text-sm">{record.kpicks?.toLocaleString() || '—'}</TableCell>
                      <TableCell className="text-sm">{record.meters?.toLocaleString() || '—'}</TableCell>
                      <TableCell className="text-sm">{record.a_pct != null ? Number(record.a_pct).toFixed(1) + '%' : '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-sm text-zinc-400">No weaving data yet</p>
          )}
        </SectionCard>

        {/* Inspect Gray Section */}
        <SectionCard
          title="Inspect Gray"
          icon={<SectionIcon hasData={inspection.length > 0} />}
        >
          {inspection.length > 0 ? (
            <div className="space-y-4">
              {/* Summary stats */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-zinc-50 rounded-lg p-3">
                  <p className="text-xs text-zinc-500">Total Rolls</p>
                  <p className="text-xl font-semibold text-zinc-900">{inspection.length}</p>
                </div>
                <div className="bg-zinc-50 rounded-lg p-3">
                  <p className="text-xs text-zinc-500">Total Length</p>
                  <p className="text-xl font-semibold text-zinc-900">
                    {inspection.reduce((sum, r) => sum + (r.panjang || 0), 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-zinc-50 rounded-lg p-3">
                  <p className="text-xs text-zinc-500">Total Weight</p>
                  <p className="text-xl font-semibold text-zinc-900">
                    {inspection.reduce((sum, r) => sum + (r.berat || 0), 0).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Rolls table */}
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-zinc-50">
                      <TableHead className="text-xs">Roll No</TableHead>
                      <TableHead className="text-xs">Length</TableHead>
                      <TableHead className="text-xs">Width</TableHead>
                      <TableHead className="text-xs">Weight</TableHead>
                      <TableHead className="text-xs">Grade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inspection.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="text-sm font-mono">{record.no_roll || '—'}</TableCell>
                        <TableCell className="text-sm">{record.panjang?.toLocaleString() || '—'}</TableCell>
                        <TableCell className="text-sm">{record.lebar?.toLocaleString() || '—'}</TableCell>
                        <TableCell className="text-sm">{record.berat?.toLocaleString() || '—'}</TableCell>
                        <TableCell className="text-sm">{record.gd || '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <p className="text-sm text-zinc-400">No inspection data yet</p>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
