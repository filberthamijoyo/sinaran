import InboxPageClient from '@/components/denim/InboxPageClient'

export const dynamic = 'force-dynamic'

const STAGE_CONFIG = {
  warping: {
    title: 'Warping Inbox',
    pipelineStatus: 'WARPING',
    formBasePath: '/denim/inbox/warping',
    emptyMessage: 'No orders pending warping.',
  },
  indigo: {
    title: 'Indigo Inbox',
    pipelineStatus: 'INDIGO',
    formBasePath: '/denim/inbox/indigo',
    emptyMessage: 'No orders pending indigo dyeing.',
  },
  weaving: {
    title: 'Weaving Inbox',
    pipelineStatus: 'WEAVING',
    formBasePath: '/denim/inbox/weaving',
    emptyMessage: 'No orders pending weaving.',
  },
  'inspect-gray': {
    title: 'Inspect Gray Inbox',
    pipelineStatus: 'INSPECT_GRAY',
    formBasePath: '/denim/inbox/inspect-gray',
    emptyMessage: 'No orders pending gray inspection.',
  },
  bbsf: {
    title: 'BBSF Inbox',
    pipelineStatus: 'BBSF',
    formBasePath: '/denim/inbox/bbsf',
    emptyMessage: 'No orders pending BBSF processing.',
  },
  'inspect-finish': {
    title: 'Inspect Finish Inbox',
    pipelineStatus: 'INSPECT_FINISH',
    formBasePath: '/denim/inbox/inspect-finish',
    emptyMessage: 'No orders pending finish inspection.',
  },
} as const;

type Stage = keyof typeof STAGE_CONFIG;

interface Props {
  params: Promise<{ stage: string }>
}

export default async function InboxStagePage({ params }: Props) {
  const { stage } = await params;
  const config = STAGE_CONFIG[stage as Stage];

  if (!config) {
    return (
      <div style={{ padding: '48px 32px' }}>
        <p style={{ fontSize: 15, color: 'var(--danger-text)' }}>
          Inbox stage &quot;{stage}&quot; not found.
        </p>
      </div>
    );
  }

  let initialData = null;
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost';
    const port = process.env.NEXT_PUBLIC_API_PORT;
    const isProduction =
      baseUrl.startsWith('https://') ||
      (baseUrl.startsWith('http://') && !baseUrl.includes('localhost'));
    const effectivePort = port || (isProduction ? '' : '3001');
    const apiBase = effectivePort
      ? `${baseUrl.replace(/\/$/, '')}:${effectivePort}/api`
      : `${baseUrl.replace(/\/$/, '')}/api`;

    const res = await fetch(
      `${apiBase}/denim/sales-contracts?pipeline_status=${config.pipelineStatus}&limit=100`,
      { next: { revalidate: 30 }, headers: { 'x-internal': '1' } }
    );
    if (res.ok) initialData = await res.json();
  } catch {}

  return (
    <InboxPageClient
      initialData={initialData}
      title={config.title}
      subtitle="pending"
      pipelineStatus={config.pipelineStatus}
      formBasePath={config.formBasePath}
      emptyMessage={config.emptyMessage}
      stage={stage}
    />
  );
}
