'use client';

import { useEffect, useState } from 'react';
import { authFetch } from '../../../lib/authFetch';
import PageHeader from '../../layout/PageHeader';
import { Skeleton } from '../../ui/skeleton';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';

interface AnalyticsData {
  totalSC: number;
  totalWarping: number;
  totalIndigo: number;
  avgEffWarping: number;
  avgPutusanPerBeam: number;
  topFabricCodes: { codename: string; count: number }[];
  monthlyVolume: { month: string; count: number }[];
  stageDistribution: Record<string, number>;
}

const STAGE_CONFIG: Record<string, { label: string; short: string; color: string }> = {
  PENDING_APPROVAL: { label: 'Pending Approval', short: 'Pending', color: 'bg-amber-500' },
  WARPING: { label: 'In Warping', short: 'Warping', color: 'bg-violet-500' },
  INDIGO: { label: 'In Indigo', short: 'Indigo', color: 'bg-cyan-500' },
  WEAVING: { label: 'In Weaving', short: 'Weaving', color: 'bg-teal-500' },
  INSPECT_GRAY: { label: 'Inspect Gray', short: 'Inspect', color: 'bg-yellow-400' },
  COMPLETE: { label: 'Complete', short: 'Done', color: 'bg-green-500' },
  REJECTED: { label: 'Rejected', short: 'Rejected', color: 'bg-red-500' },
  DRAFT: { label: 'Draft', short: 'Draft', color: 'bg-zinc-400' },
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch('/denim/analytics/overview')
      .then(r => setData(r as AnalyticsData))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getStageCount = (stage: string) => data?.stageDistribution?.[stage] ?? 0;
  const totalInPipeline = Object.keys(STAGE_CONFIG)
    .reduce((s, k) => s + getStageCount(k), 0);

  return (
    <div>
      <PageHeader
        title="Analytics"
        subtitle="Production insights and statistics"
      />

      <div className="px-8 pb-8 space-y-6">

        {/* Row 1: 4 stat tiles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total SCs', value: data?.totalSC ?? 0, loading },
            { label: 'Warping Runs', value: data?.totalWarping ?? 0, loading },
            { label: 'Indigo Runs', value: data?.totalIndigo ?? 0, loading },
            { 
              label: 'Avg Warping Eff %', 
              value: loading ? '—' : `${(data?.avgEffWarping ?? 0).toFixed(1)}%`, 
              loading 
            },
          ].map(k => (
            <div key={k.label}
              className="bg-white rounded-xl border border-zinc-200/80
                shadow-sm p-5">
              <p className="text-xs text-zinc-500">{k.label}</p>
              <p className="text-2xl font-bold text-zinc-900 mt-1">
                {loading ? <Skeleton className="h-8 w-20" /> : k.value}
              </p>
            </div>
          ))}
        </div>

        {/* Row 2: two panels side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          
          {/* Left (60%): Monthly SC Volume - Bar Chart */}
          <div className="lg:col-span-3 bg-white rounded-xl border
            border-zinc-200/80 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-zinc-800 mb-4">
              Monthly SC Volume
            </h3>
            {loading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data?.monthlyVolume ?? []}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 11, fill: '#71717a' }}
                    tickFormatter={(v) => v.slice(5)} // Show MM only
                  />
                  <YAxis 
                    tick={{ fontSize: 11, fill: '#71717a' }}
                    width={30}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: 8, 
                      border: '1px solid #e4e4e7',
                      fontSize: 12,
                    }}
                    formatter={(value: number) => [value, 'Orders']}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="#3b82f6" 
                    radius={[4, 4, 0, 0]}
                    name="Orders"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Right (40%): Pipeline Distribution */}
          <div className="lg:col-span-2 bg-white rounded-xl border
            border-zinc-200/80 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-zinc-800 mb-4">
              Pipeline Distribution
            </h3>
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {Object.entries(STAGE_CONFIG).map(([key, config]) => {
                  const count = getStageCount(key);
                  if (count === 0) return null;
                  const maxCount = Math.max(...Object.values(data?.stageDistribution ?? {}), 1);
                  const barPct = Math.max((count / maxCount) * 100, 2);
                  
                  return (
                    <div key={key} className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full ${config.color}`} />
                      <span className="w-24 text-xs text-zinc-600 truncate">
                        {config.short}
                      </span>
                      <div className="flex-1 h-4 bg-zinc-100 rounded-md overflow-hidden">
                        <div
                          className={`h-full rounded-md ${config.color} opacity-80`}
                          style={{ width: `${barPct}%` }}
                        />
                      </div>
                      <span className="w-8 text-xs font-medium text-zinc-700 text-right">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Row 3: Top 10 Fabric Codes Table */}
        <div className="bg-white rounded-xl border border-zinc-200/80 shadow-sm">
          <div className="px-6 py-4 border-b border-zinc-100">
            <h3 className="text-sm font-semibold text-zinc-800">
              Top 10 Fabric Codes
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Most frequently produced fabric codes
            </p>
          </div>
          
          {loading ? (
            <div className="p-6">
              <Skeleton className="h-64 w-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Rank</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead className="text-right">Count</TableHead>
                  <TableHead className="text-right">% of Total</TableHead>
                  <TableHead className="w-48">Bar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data?.topFabricCodes ?? []).map((item, i) => {
                  const pct = data?.totalSC ? (item.count / data.totalSC) * 100 : 0;
                  const maxCount = data?.topFabricCodes?.[0]?.count ?? 1;
                  const barWidth = (item.count / maxCount) * 100;
                  
                  return (
                    <TableRow key={item.codename}>
                      <TableCell className="font-mono text-zinc-500">
                        {i + 1}
                      </TableCell>
                      <TableCell className="font-medium">
                        {item.codename}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {item.count}
                      </TableCell>
                      <TableCell className="text-right text-zinc-500">
                        {pct.toFixed(1)}%
                      </TableCell>
                      <TableCell>
                        <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {(data?.topFabricCodes?.length ?? 0) === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-zinc-400 py-8">
                      No data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>

      </div>
    </div>
  );
}
