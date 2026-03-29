'use client';

import React from 'react';
import { Package2, Clock, CheckCircle2, AlertTriangle, ChevronRight } from 'lucide-react';
import { NmKpiCard, NmChartCard } from './shared';
import { SummaryData } from './types';

interface AlertsPanelProps {
  data: SummaryData | null;
}

export default function AlertsPanel({ data }: AlertsPanelProps) {
  const total              = data?.total ?? 0;
  const completedThisMonth = data?.stageCounts?.['COMPLETE'] ?? 0;
  const rejectedCount      = data?.stageCounts?.['REJECTED'] ?? 0;

  return (
    <div style={{ padding: 24, background: 'var(--bg)', minHeight: '100vh' }}>
      {/* KPI Row */}
      <div className="ob-dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 12 }}>
        <NmKpiCard label="Total Contracts"        value={total.toLocaleString()}                          sub="all time"             icon="Package2"     accent="#2563EB" />
        <NmKpiCard label="Active Orders"         value={(data?.inProgress ?? 0).toLocaleString()}         sub="in production"        icon="Clock"        accent="#D97706" />
        <NmKpiCard label="Completed This Month"  value={completedThisMonth.toLocaleString()}                sub="all time total"       icon="CheckCircle2" accent="#059669" />
        <NmKpiCard label="Rejected"              value={rejectedCount.toLocaleString()}                    sub="cancelled orders"     icon="AlertTriangle" accent="#DC2626" />
      </div>

      {/* Customer Overview Table */}
      <NmChartCard title="Customer Overview">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Customer', 'Total Orders', 'Completed', 'In Progress'].map((h, i) => (
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
            {data?.topCustomers.map((c, i) => (
              <tr
                key={i}
                style={{ borderBottom: i < (data.topCustomers.length - 1) ? '1px solid var(--bg)' : 'none' }}
              >
                <td style={{ paddingTop: 12, paddingBottom: 12, fontSize: 13, color: 'var(--t1)' }}>
                  {c.customer}
                </td>
                <td style={{ paddingTop: 12, paddingBottom: 12, fontSize: 13, color: 'var(--t2)', textAlign: 'right' }}>
                  {c.count}
                </td>
                <td style={{ paddingTop: 12, paddingBottom: 12, fontSize: 13, fontWeight: 600, color: 'var(--green)', textAlign: 'right' }}>
                  {c.count}
                </td>
                <td style={{ paddingTop: 12, paddingBottom: 12, fontSize: 13, color: 'var(--blue)', textAlign: 'right' }}>
                  0
                </td>
              </tr>
            ))}
            {(!data?.topCustomers || data.topCustomers.length === 0) && (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', paddingTop: 32, paddingBottom: 32, fontSize: 13, color: 'var(--t3)' }}>
                  No customer data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </NmChartCard>

      {/* Production Cycle Time Flow */}
      <NmChartCard title="Average Cycle Time">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, flexWrap: 'wrap', paddingTop: 8 }}>
          {[
            { label: 'Contract',  sub: 'Received',         color: 'var(--t3)', days: null },
            { label: 'Warping',   sub: 'Beam Prep',        color: '#2563EB', days: data?.avgCycleTime.contract_to_warping },
            { label: 'Indigo',    sub: 'Dyeing',           color: '#0891B2', days: data?.avgCycleTime.warping_to_indigo   },
            { label: 'Weaving',   sub: 'Fabric Production',color: '#059669', days: data?.avgCycleTime.indigo_to_weaving  },
          ].map((stage, i) => (
            <div key={stage.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {i > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--amber)' }}>
                    {stage.days?.toFixed(1) ?? '—'} days
                  </span>
                  <ChevronRight size={16} style={{ color: 'var(--t3)' }} />
                </div>
              )}
              <div
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--r3)',
                  padding: '16px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <p style={{ fontSize: 15, fontWeight: 600, color: stage.color }}>{stage.label}</p>
                <p style={{ fontSize: 11, color: 'var(--t3)' }}>{stage.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </NmChartCard>

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
