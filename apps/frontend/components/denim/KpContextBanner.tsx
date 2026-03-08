interface Props {
  kp: string;
  codename: string | null;
  customer: string | null;
  kat_kode: string | null;
  te: number | null;
  color: string | null;
  currentStage: string;
}

const STAGE_COLORS: Record<string, string> = {
  WARPING:      'bg-violet-50 border-violet-200 text-violet-700',
  INDIGO:       'bg-cyan-50 border-cyan-200 text-cyan-700',
  WEAVING:      'bg-teal-50 border-teal-200 text-teal-700',
  INSPECT_GRAY: 'bg-yellow-50 border-yellow-200 text-yellow-700',
};

const STAGE_LABELS: Record<string, string> = {
  WARPING: 'Warping',
  INDIGO: 'Indigo',
  WEAVING: 'Weaving',
  INSPECT_GRAY: 'Inspect Gray',
};

export default function KpContextBanner({
  kp, codename, customer, kat_kode, te, color, currentStage,
}: Props) {
  const stageColor = STAGE_COLORS[currentStage]
    ?? 'bg-zinc-50 border-zinc-200 text-zinc-700';

  return (
    <div className="mx-8 mb-6 rounded-xl border bg-white
      shadow-sm overflow-hidden">
      <div className={`px-5 py-2 border-b text-xs font-semibold
        uppercase tracking-wider ${stageColor}`}>
        {STAGE_LABELS[currentStage] ?? currentStage} Stage
      </div>
      <div className="px-5 py-4 flex flex-wrap gap-x-8 gap-y-3">
        <div>
          <p className="text-xs text-zinc-400 mb-0.5">KP</p>
          <p className="text-base font-mono font-bold text-zinc-900">
            {kp}
          </p>
        </div>
        <div>
          <p className="text-xs text-zinc-400 mb-0.5">
            Construction
          </p>
          <p className="text-sm font-semibold text-zinc-800">
            {codename || '—'}
          </p>
        </div>
        {customer && (
          <div>
            <p className="text-xs text-zinc-400 mb-0.5">Customer</p>
            <p className="text-sm font-medium text-zinc-700">
              {customer}
            </p>
          </div>
        )}
        {kat_kode && (
          <div>
            <p className="text-xs text-zinc-400 mb-0.5">Type</p>
            <p className="text-sm font-medium text-zinc-700">
              {kat_kode}
            </p>
          </div>
        )}
        {te && (
          <div>
            <p className="text-xs text-zinc-400 mb-0.5">TE</p>
            <p className="text-sm font-mono font-semibold
              text-zinc-800">
              {te.toLocaleString()}
            </p>
          </div>
        )}
        {color && (
          <div>
            <p className="text-xs text-zinc-400 mb-0.5">Color</p>
            <p className="text-sm font-medium text-zinc-700">
              {color}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
