'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { authFetch } from '../../../lib/authFetch';
import { Skeleton } from '../../ui/skeleton';
import { SummaryData } from './dashboard/types';
import OverviewPanel from './dashboard/OverviewPanel';
import StagePanel from './dashboard/StagePanel';
import AlertsPanel from './dashboard/AlertsPanel';

interface Props {
  initialData?: SummaryData | null;
}

type DashboardTab = 'admin' | 'factory' | 'jakarta';

function DashboardContent({ initialData }: Props) {
  const searchParams = useSearchParams();
  const urlTab = searchParams.get('tab');
  const validTabs: DashboardTab[] = ['admin', 'factory', 'jakarta'];
  const activeTab: DashboardTab = validTabs.includes(urlTab as DashboardTab)
    ? (urlTab as DashboardTab)
    : 'admin';

  const [data, setData] = useState<SummaryData | null>(initialData ?? null);
  const [loading, setLoading] = useState(!initialData);

  useEffect(() => {
    if (initialData) return;
    authFetch('/denim/admin/summary')
      .then(r => setData(r as SummaryData))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [initialData]);

  const total = data?.total ?? 0;

  return (
    <div>
      <div style={{
        height: 52,
        background: 'rgba(246,248,251,0.85)',
        backdropFilter: 'blur(12px) saturate(180%)',
        WebkitBackdropFilter: 'blur(12px) saturate(180%)',
        borderBottom: '1px solid rgba(227,232,239,0.8)',
        padding: '0 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 30,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <h1 style={{ fontSize: 15, fontWeight: 600, color: 'var(--t1)', lineHeight: 1 }}>
            Dashboard
          </h1>
          <span style={{ width: 1, height: 16, background: 'var(--border-2)', margin: '0 0' }} />
          <p style={{ fontSize: 13, color: 'var(--t3)' }}>
            {loading ? 'Loading…' : `${total.toLocaleString()} total orders`}
          </p>
        </div>
      </div>

      <div>
        {loading ? (
          <div style={{ padding: 24 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '7fr 5fr', gap: 12, marginBottom: 12 }}>
              <Skeleton style={{ height: 160, borderRadius: 16 }} />
              <Skeleton style={{ height: 160, borderRadius: 16 }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 12 }}>
              {[1,2,3].map(i => <Skeleton key={i} style={{ height: 120, borderRadius: 16 }} />)}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[1,2].map(i => <Skeleton key={i} style={{ height: 300, borderRadius: 16 }} />)}
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'admin'   && <OverviewPanel data={data} />}
            {activeTab === 'factory' && <StagePanel data={data} />}
            {activeTab === 'jakarta' && <AlertsPanel data={data} />}
          </>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboardPage(props: Props) {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '7fr 5fr', gap: 12, marginBottom: 12 }}>
        <Skeleton style={{ height: 160, borderRadius: 16 }} />
        <Skeleton style={{ height: 160, borderRadius: 16 }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 12 }}>
        {[1,2,3].map(i => <Skeleton key={i} style={{ height: 120, borderRadius: 16 }} />)}
      </div>
    </div>}>
      <DashboardContent {...props} />
    </Suspense>
  );
}
