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
  WARPING:      'text-[#6C63FF]',
  INDIGO:       'text-[#6C63FF]',
  WEAVING:      'text-[#16A34A]',
  INSPECT_GRAY: 'text-[#D97706]',
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
    ?? 'text-[#6B7280]';

  return (
    <div className="mx-8 mb-6 rounded-xl overflow-hidden bg-[#F7F8FA] border border-[#E5E7EB]">
      <div className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-[#6B7280] border-b border-[#E5E7EB]">
        {STAGE_LABELS[currentStage] ?? currentStage} Stage
      </div>
      <div className="px-5 py-4 flex flex-wrap gap-x-8 gap-y-3">
        <div>
          <p className="text-xs mb-0.5 text-[#6B7280]">KP</p>
          <p className="text-base font-mono font-bold text-[#0F1117]">
            {kp}
          </p>
        </div>
        <div>
          <p className="text-xs mb-0.5 text-[#6B7280]">
            Construction
          </p>
          <p className="text-sm font-semibold text-[#0F1117]">
            {codename || '—'}
          </p>
        </div>
        {customer && (
          <div>
            <p className="text-xs mb-0.5 text-[#6B7280]">Customer</p>
            <p className="text-sm font-medium text-[#0F1117]">
              {customer}
            </p>
          </div>
        )}
        {kat_kode && (
          <div>
            <p className="text-xs mb-0.5 text-[#6B7280]">Type</p>
            <p className="text-sm font-medium text-[#0F1117]">
              {kat_kode}
            </p>
          </div>
        )}
        {te && (
          <div>
            <p className="text-xs mb-0.5 text-[#6B7280]">TE</p>
            <p className="text-sm font-mono font-semibold text-[#0F1117]">
              {te.toLocaleString()}
            </p>
          </div>
        )}
        {color && (
          <div>
            <p className="text-xs mb-0.5 text-[#6B7280]">Color</p>
            <p className="text-sm font-medium text-[#0F1117]">
              {color}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
