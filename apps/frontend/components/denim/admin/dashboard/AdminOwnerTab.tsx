'use client';

import React from 'react';
import { DashboardSummary } from './types';
import OverviewPanel from './OverviewPanel';

interface Props {
  data: DashboardSummary;
  loading?: boolean;
}

export default function AdminOwnerTab({ data, loading = false }: Props) {
  if (loading) {
    return (
      <div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} />
        ))}
      </div>
    );
  }

  return (
    <div>
      <OverviewPanel data={data} />
    </div>
  );
}
