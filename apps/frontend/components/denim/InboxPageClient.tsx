'use client';

import { useEffect, useState, useCallback } from 'react';
import { authFetch } from '../../lib/authFetch';
import { PageShell } from '../ui/erp/PageShell';
import { Button } from '../ui/button';
import { RefreshCw } from 'lucide-react';
import InboxTable, { InboxRow } from './InboxTable';

type InboxPaginated = { items: InboxRow[] };

interface InboxPageClientProps {
  title: string;
  subtitle: string;
  pipelineStatus: string;
  formBasePath: string;
  emptyMessage: string;
  stage: string;
  initialData?: InboxPaginated;
}

const STAGE_DISPLAY: Record<string, string> = {
  warping:        'Warping',
  indigo:         'Indigo',
  weaving:        'Weaving',
  'inspect-gray': 'Inspect Gray',
  bbsf:          'BBSF',
  'inspect-finish': 'Inspect Finish',
  sacon:         'Sacon',
};

export default function InboxPageClient({
  title,
  subtitle,
  pipelineStatus,
  formBasePath,
  emptyMessage,
  stage,
  initialData,
}: InboxPageClientProps) {
  const [rows,   setRows]   = useState<InboxRow[]>(initialData?.items ?? []);
  const [loading, setLoading] = useState(!!initialData);

  const fetchInbox = useCallback(async () => {
    setLoading(true);
    try {
      const data = await authFetch<InboxPaginated>(
        `/denim/sales-contracts?pipeline_status=${pipelineStatus}&limit=100`
      );
      setRows(data?.items ?? []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [pipelineStatus]);

  useEffect(() => { fetchInbox(); }, [fetchInbox]);

  const stageDisplay = STAGE_DISPLAY[stage] ?? stage;

  const actions = (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <Button
        variant="ghost"
        size="sm"
        onClick={fetchInbox}
        loading={loading}
        leftIcon={<RefreshCw size={13} />}
      >
        Refresh
      </Button>
      <a
        href={`/denim/inbox/${stage}/history`}
        style={{
          display:       'inline-flex',
          alignItems:   'center',
          gap:          6,
          padding:      '0 12px',
          height:       32,
          borderRadius: 'var(--button-radius)',
          fontSize:     12,
          fontWeight:   500,
          color:       'var(--primary)',
          textDecoration: 'none',
        }}
      >
        View History &rarr;
      </a>
    </div>
  );

  return (
    <PageShell
      title={title}
      subtitle={
        loading ? 'Loading…' : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
            <span style={{ color: 'rgba(255,255,255,0.60)' }}>
              {rows.length} order{rows.length !== 1 ? 's' : ''} pending
            </span>
            <span style={{
              backgroundColor: '#EFF6FF',
              color: '#1D4ED8',
              borderRadius: 20,
              padding: '2px 10px',
              fontSize: 12,
              fontWeight: 600,
            }}>
              {rows.length}
            </span>
          </div>
        )
      }
      actions={actions}
      noPadding
    >
      <div style={{ backgroundColor: '#F0F4F8', minHeight: '100vh', padding: '24px 32px' }}>
        <InboxTable
          rows={rows}
          loading={loading}
          formBasePath={formBasePath}
          emptyMessage={emptyMessage}
          stage={pipelineStatus}
        />
      </div>
    </PageShell>
  );
}
