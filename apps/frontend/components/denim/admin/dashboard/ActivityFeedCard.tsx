'use client';

import { Inbox } from 'lucide-react';
import { STAGE_COLORS } from './types';

interface ActivityItem {
  kp: string;
  pipeline_status: string;
  updatedAt: string;
}

const STAGE_LABELS: Record<string, string> = {
  PENDING_APPROVAL: 'Awaiting Approval',
  WARPING:          'In Warping',
  INDIGO:           'In Indigo',
  WEAVING:          'In Weaving',
  INSPECT_GRAY:     'Inspect Gray',
  BBSF:             'In BBSF',
  INSPECT_FINISH:   'Inspect Finish',
  COMPLETE:         'Complete',
  REJECTED:         'Rejected',
};

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1)  return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24)   return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7)     return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

interface Props {
  recentActivity?: Array<ActivityItem>;
}

export function ActivityFeedCard({ recentActivity }: Props) {
  const items = recentActivity && recentActivity.length > 0 ? recentActivity : null;

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--r4)',
      padding: '20px 22px',
      boxShadow: 'var(--shadow-sm)',
      minHeight: 200,
    }}>
      <p style={{
        fontSize: 11,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        color: 'var(--t3)',
        marginBottom: 14,
      }}>
        Recent Activity
      </p>

      {!items ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 32, gap: 8 }}>
          <Inbox size={20} style={{ color: 'var(--t3)' }} />
          <p style={{ fontSize: 13, color: 'var(--t3)' }}>No recent activity</p>
        </div>
      ) : (
        <div>
          {items.slice(0, 8).map((item, idx) => {
            const stageColor = STAGE_COLORS[item.pipeline_status] ?? '#6B7280';
            const stageLabel = STAGE_LABELS[item.pipeline_status] ?? item.pipeline_status;
            return (
              <div
                key={`${item.kp}-${idx}`}
                style={{
                  display: 'flex',
                  gap: 10,
                  paddingBottom: 12,
                  borderBottom: idx < Math.min(items.length, 8) - 1 ? '1px solid var(--bg)' : 'none',
                }}
              >
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: stageColor,
                    marginTop: 5,
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, color: 'var(--t2)', lineHeight: 1.4 }}>
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, color: 'var(--blue)' }}>
                      {item.kp}
                    </span>
                    {' — '}
                    {stageLabel}
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--t3)', marginTop: 2 }}>
                    {formatRelativeTime(item.updatedAt)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
