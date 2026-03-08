'use client';

import { useEffect, useState, useCallback } from 'react';
import { authFetch } from '../../../../lib/authFetch';
import PageHeader from '../../../../components/layout/PageHeader';
import InboxTable, {
  InboxRow,
} from '../../../../components/denim/InboxTable';
import { Button } from '../../../../components/ui/button';
import { RefreshCw } from 'lucide-react';

export default function WarpingInboxPage() {
  const [rows, setRows] = useState<InboxRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInbox = useCallback(async () => {
    setLoading(true);
    try {
      const data = await authFetch(
        '/denim/sales-contracts' +
        '?pipeline_status=WARPING&limit=100'
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
        title="Warping Inbox"
        subtitle={
          loading
            ? 'Loading...'
            : `${rows.length} order${rows.length !== 1
                ? 's' : ''} ready for warping`
        }
        actions={
          <Button variant="outline" size="sm"
            onClick={fetchInbox} className="h-8 w-8 p-0">
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        }
      />
      <div className="px-8 pb-8">
        <InboxTable
          rows={rows}
          loading={loading}
          formBasePath="/denim/inbox/warping"
          emptyMessage="No orders in the warping queue."
        />
      </div>
    </div>
  );
}
