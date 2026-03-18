import { Suspense } from 'react';
import PendingApprovalsPage from '../../../../components/denim/PendingApprovalsPage';
import { TableSkeleton } from '../../../../components/denim/Skeletons';

export const metadata = { title: 'Pending Approvals — Sinaran ERP' };

export default function Page() {
  return (
    <Suspense fallback={<TableSkeleton rows={8} cols={6} />}>
      <PendingApprovalsPage />
    </Suspense>
  );
}
