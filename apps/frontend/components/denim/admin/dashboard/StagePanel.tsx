'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Factory, TrendingUp, AlertTriangle } from 'lucide-react';
import { NmKpiCard, NmChartCard, NmStatusPill } from './shared';
import { SummaryData } from './types';

interface StagePanelProps {
  data: SummaryData | null;
}

export default function StagePanel({ data }: StagePanelProps) {
  const router = useRouter();

  const machineStatus = (data?.machineEfficiencyToday ?? []).map(m => ({
    ...m,
    status: m.avg_efficiency >= 80 ? 'good' : m.avg_efficiency >= 70 ? 'average' : 'low',
  })).sort((a, b) => a.avg_efficiency - b.avg_efficiency);

  const avgEfficiencyToday = machineStatus.length > 0
    ? (machineStatus.reduce((s, m) => s + m.avg_efficiency, 0) / machineStatus.length).toFixed(1)
    : '—';

  const activeLooms = machineStatus.length;
  const lowEffCount = data?.lowEfficiencyMachines.length ?? 0;

  return (
    <div style={{ padding: 24, background: 'var(--bg)', minHeight: '100vh' }}>
      {/* KPI Row */}
      <div className="ob-dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 12 }}>
        <NmKpiCard label="Active Looms Today"    value={activeLooms.toString()}   sub="machines running"    icon="Factory"        accent="#2563EB" />
        <NmKpiCard label="Avg Efficiency Today" value={`${avgEfficiencyToday}%`}  sub="all machines"        icon="TrendingUp"     accent="#059669" />
        <NmKpiCard label="Low Efficiency Alerts" value={lowEffCount.toString()}  sub="machines below 70%"  icon="AlertTriangle" accent="#DC2626" />
      </div>

      {/* Machine Status Table */}
      <NmChartCard title="Machine Status Today">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Machine', 'Shifts', 'Avg Efficiency', 'Status'].map((h, i) => (
                <th
                  key={h}
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.07em',
                    color: 'var(--t3)',
                    paddingBottom: 10,
                    textAlign: i === 0 ? 'left' : 'right',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {machineStatus.map((m, i) => (
              <tr key={m.machine}
                style={{ borderBottom: i < machineStatus.length - 1 ? '1px solid var(--bg)' : 'none' }}>
                <td style={{ paddingTop: 12, paddingBottom: 12, fontSize: 13, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, color: 'var(--t1)' }}>{m.machine}</td>
                <td style={{ paddingTop: 12, paddingBottom: 12, fontSize: 13, color: 'var(--t2)', textAlign: 'right' }}>{m.record_count}</td>
                <td style={{ paddingTop: 12, paddingBottom: 12, fontSize: 13, fontWeight: 600, color: 'var(--t1)', textAlign: 'right' }}>{m.avg_efficiency}%</td>
                <td style={{ paddingTop: 12, paddingBottom: 12, textAlign: 'center' }}>
                  <NmStatusPill status={m.status} />
                </td>
              </tr>
            ))}
            {machineStatus.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  style={{
                    textAlign: 'center',
                    paddingTop: 32,
                    paddingBottom: 32,
                    fontSize: 13,
                    color: 'var(--t3)',
                  }}
                >
                  No machine data for today
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </NmChartCard>

      {/* Warping Queue Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0D1B2E 0%, #0A1628 100%)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 'var(--r4)',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 12,
        }}
      >
        <div>
          <p style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>
            Awaiting Warping
          </p>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>orders in queue</p>
          <button
            onClick={() => router.push('/denim/admin/orders?status=PENDING_APPROVAL')}
            style={{
              marginTop: 8,
              background: 'none',
              border: 'none',
              padding: 0,
              fontSize: 12,
              fontWeight: 500,
              color: '#60A5FA',
              cursor: 'pointer',
            }}
          >
            View pending orders →
          </button>
        </div>
        <p style={{ fontSize: 40, fontWeight: 700, color: '#FFFFFF', lineHeight: 1, fontFamily: "'IBM Plex Mono', monospace" }}>
          {data?.warpingQueue ?? 0}
        </p>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .ob-dashboard-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
