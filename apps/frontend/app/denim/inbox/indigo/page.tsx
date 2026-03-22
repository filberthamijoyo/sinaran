'use client';

import { useEffect, useState, useCallback } from 'react';
import { authFetch } from '../../../../lib/authFetch';
import PageHeader from '../../../../components/layout/PageHeader';
import InboxTable, {
  InboxRow,
} from '../../../../components/denim/InboxTable';
import { Button } from '../../../../components/ui/button';
import { RefreshCw } from 'lucide-react';

export default function IndigoInboxPage() {
  const [rows, setRows] = useState<InboxRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInbox = useCallback(async () => {
    setLoading(true);
    try {
      const data = await authFetch(
        '/denim/sales-contracts' +
        '?pipeline_status=INDIGO&limit=100'
      ) as any;
      setRows(data?.items || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchInbox(); }, [fetchInbox]);

  return (
    <div>
      <PageHeader
        title="Indigo Inbox"
        subtitle={
          loading
            ? 'Loading...'
            : `${rows.length} order${rows.length !== 1
                ? 's' : ''} ready for indigo dyeing`
        }
        actions={
          <div className="flex items-center gap-2">
            {rows.length > 0 ? (
              <span style={{ background: '#E0E5EC', borderRadius: '9999px', boxShadow: '3px 3px 6px rgb(163 177 198 / 0.5), -3px -3px 6px rgba(255,255,255,0.5)', padding: '2px 10px', fontSize: '11px', fontWeight: 600, color: '#6B7280' }}>
                {rows.length} order{rows.length !== 1 ? 's' : ''}
              </span>
            ) : null}
            <Button variant="outline" size="sm"
              onClick={fetchInbox} className="h-8 w-8 p-0">
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
          </div>
        }
      />
      <div className="px-4 sm:px-8 pb-8">
        <InboxTable
          rows={rows}
          loading={loading}
          formBasePath="/denim/inbox/indigo"
          emptyMessage="No orders in the indigo queue."
        />
      </div>
    </div>
  );
}
