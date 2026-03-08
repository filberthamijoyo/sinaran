'use client';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import AdminOrdersPage from '../../../../components/denim/admin/AdminOrdersPage';

function PipelinePageInner() {
  const params = useSearchParams();
  const stage = params.get('stage') || 'ALL';
  return <AdminOrdersPage defaultStage={stage} />;
}

export default function PipelinePage() {
  return (
    <Suspense fallback={null}>
      <PipelinePageInner />
    </Suspense>
  );
}
