'use client';

import { Suspense as ReactSuspense, ReactNode } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

type SuspenseProps = {
  children: ReactNode;
  fallback?: ReactNode;
  variant?: 'table' | 'list' | 'form' | 'detail' | 'kpi' | 'chart' | 'auto';
};

const skeletonVariants = {
  table: (
    <div className="rounded-2xl overflow-hidden bg-[#F7F8FA] border border-[#E5E7EB]">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E5E7EB]">
              {Array.from({ length: 6 }).map((_, i) => (
                <th key={i} className="text-left px-4 py-3">
                  <Skeleton className="h-4 w-20" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 8 }).map((_, i) => (
              <tr key={i} className="border-b border-[#E5E7EB]">
                {Array.from({ length: 6 }).map((_, j) => (
                  <td key={j} className="px-4 py-4">
                    <Skeleton className="h-4 w-full" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  ),
  list: (
    <div className="rounded-2xl overflow-hidden bg-[#F7F8FA] border border-[#E5E7EB]">
      <div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-4 flex items-center gap-4 border-b border-[#E5E7EB]">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/4" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  ),
  form: (
    <div className="rounded-2xl p-6 bg-[#F7F8FA] border border-[#E5E7EB]">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
      <div className="flex gap-4 pt-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  ),
  detail: (
    <div className="space-y-6">
      <div className="rounded-2xl p-6 bg-[#F7F8FA] border border-[#E5E7EB]">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="h-3 w-20 mb-2" />
              <Skeleton className="h-5 w-32" />
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
  kpi: (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-2xl p-6 bg-[#F7F8FA] border border-[#E5E7EB]">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
          <Skeleton className="h-8 w-16 mb-2" />
          <Skeleton className="h-3 w-20" />
        </div>
      ))}
    </div>
  ),
  chart: (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="rounded-2xl p-6 bg-[#F7F8FA] border border-[#E5E7EB]">
          <Skeleton className="h-5 w-32 mb-4" />
          <div className="h-[300px] flex items-end gap-2">
            {Array.from({ length: 12 }).map((_, j) => (
              <Skeleton key={j} className="flex-1 rounded-t" style={{ height: `${20 + Math.random() * 60}%` }} />
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
  auto: null,
};

export function SuspenseLoader({ children, fallback, variant = 'auto' }: SuspenseProps) {
  const skeletonFallback = variant !== 'auto' && skeletonVariants[variant];

  return (
    <ReactSuspense fallback={fallback ?? skeletonFallback ?? <Skeleton className="h-64 w-full" />}>
      {children}
    </ReactSuspense>
  );
}
