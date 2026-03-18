import { Suspense } from 'react';
import AdminDashboardPage from '../../../../components/denim/admin/AdminDashboardPage';
import { KPICardSkeleton, ChartSkeleton, ListSkeleton } from '../../../../components/denim/Skeletons';

export const metadata = { title: 'Admin Dashboard — Sinaran ERP' };

export default function Page() {
  return (
    <Suspense fallback={
      <div className="p-8 space-y-6">
        {/* KPI Row Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICardSkeleton />
          <KPICardSkeleton />
          <KPICardSkeleton />
          <KPICardSkeleton />
        </div>
        {/* Charts Row Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
        {/* Bottom Panels Row Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ListSkeleton items={5} />
          <ListSkeleton items={3} />
        </div>
      </div>
    }>
      <AdminDashboardPage />
    </Suspense>
  );
}
