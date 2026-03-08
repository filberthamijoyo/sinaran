'use client';

import { useEffect, useState, useCallback } from 'react';
import { authFetch } from '../../../../lib/authFetch';
import PageHeader from '../../../../components/layout/PageHeader';
import InboxTable, {
  InboxRow,
} from '../../../../components/denim/InboxTable';
import { Button } from '../../../../components/ui/button';
import { RefreshCw } from 'lucide-react';

export default function WeavingInboxPage() {
  const [rows, setRows] = useState<InboxRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInbox = useCallback(async () => {
    setLoading(true);
    try {
      const data = await authFetch(
        '/denim/sales-contracts' +
        '?pipeline_status=WEAVING&limit=100'
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
        title="Weaving Inbox"
        subtitle={
          loading
            ? 'Loading...'
            : `${rows.length} order${rows.length !== 1
                ? 's' : ''} ready for weaving`
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
          formBasePath="/denim/inbox/weaving"
          emptyMessage="No orders in the weaving queue."
        />
      </div>
    </div>
  );
}
