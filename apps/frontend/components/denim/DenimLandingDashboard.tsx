'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/AuthContext';
import PageHeader from '../layout/PageHeader';
import {
  FileText, Clock, CheckCircle, XCircle,
  ArrowRight, Activity, type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { StaggerContainer, StaggerChild, InViewFade, ScaleIn } from '../ui/motion';

interface ActivityItem {
  id: string; icon: string; message: string; time: string; color: string; bgColor: string;
}

const MOCK_ACTIVITY: ActivityItem[] = [
  { id: '1', icon: '📦', message: 'WO-WARP-0001 entered Warping stage',    time: '2 min ago',  color: '#1D4ED8', bgColor: '#EFF6FF' },
  { id: '2', icon: '✓',  message: 'WO-INDG-0042 completed Indigo dyeing',   time: '8 min ago',  color: '#059669', bgColor: '#ECFDF5' },
  { id: '3', icon: '🧵', message: 'WO-WEAV-0088 marked Inspect Gray pass', time: '15 min ago', color: '#D97706', bgColor: '#FFFBEB' },
  { id: '4', icon: '✓',  message: 'WO-BBSF-0112 finished BBSF sanforizing', time: '22 min ago', color: '#7C3AED', bgColor: '#F5F3FF' },
  { id: '5', icon: '📋', message: 'WO-SCON-0099 pending Jakarta approval',  time: '31 min ago', color: '#D97706', bgColor: '#FFFBEB' },
];

function ActivityFeed() {
  return (
    <div className="rounded-xl overflow-hidden bg-white border border-[#E5E7EB]">
      <div className="px-5 py-4 flex items-center gap-3 border-b border-[#E5E7EB]">
        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-50">
          <Activity className="w-4 h-4 text-blue-700" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">Activity Feed</p>
          <p className="text-[11px] text-slate-500">Live pipeline updates</p>
        </div>
        <span className="ml-auto flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-semibold text-green-700">LIVE</span>
        </span>
      </div>
      <div className="divide-y divide-slate-100">
        {MOCK_ACTIVITY.map(item => (
          <div key={item.id} className="px-5 py-3.5 flex items-start gap-3 hover:bg-slate-50 transition-colors cursor-pointer">
            <div className="w-7 h-7 rounded-full flex items-center justify-center mt-0.5" style={{ background: item.bgColor }}>
              <span className="text-[12px] leading-none">{item.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs leading-snug text-slate-900">{item.message}</p>
              <p className="text-[10px] mt-0.5 text-slate-500">{item.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, color, hero = false, accentIcon: Icon }: {
  label: string; value: string; sub: string; color: string; hero?: boolean; accentIcon?: LucideIcon;
}) {
  return (
    <div className={`rounded-xl p-6 transition-all duration-200 cursor-default ${hero ? 'bg-blue-50 border border-blue-200' : 'bg-white border border-slate-200'}`}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">{label}</p>
        {Icon && <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: hero ? 'rgba(29,78,216,0.12)' : 'rgba(29,78,216,0.08)' }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>}
      </div>
      <p className="font-bold leading-none" style={{ color, fontSize: hero ? '2.5rem' : '2rem', lineHeight: 1.1 }}>{value}</p>
      <p className="text-xs mt-2 text-slate-500">{sub}</p>
    </div>
  );
}

function QuickActionCard({ label, desc, href, icon: Icon, color, bgColor }: {
  label: string; desc: string; href: string; icon: LucideIcon; color: string; bgColor: string;
}) {
  return (
    <Link href={href} className="flex items-center gap-4 rounded-xl p-4 transition-all duration-200 block no-underline bg-white border border-[#E5E7EB] hover:border-slate-300 hover:shadow-sm"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: bgColor }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate text-slate-900">{label}</p>
        <p className="text-[11px] mt-0.5 text-slate-500">{desc}</p>
      </div>
      <ArrowRight className="w-4 h-4 flex-shrink-0 text-slate-400" />
    </Link>
  );
}

function HeroSection({ role, userName }: { role: string; userName: string }) {
  const cfg: Record<string, { badge: string; badgeColor: string; badgeBg: string; subtitle: string }> = {
    factory: { badge: 'Factory', badgeColor: '#059669', badgeBg: '#ECFDF5', subtitle: 'Production pipeline — live status' },
    jakarta: { badge: 'Jakarta HQ', badgeColor: '#1D4ED8', badgeBg: '#EFF6FF', subtitle: 'Approval center' },
    admin:   { badge: 'Administrator', badgeColor: '#D97706', badgeBg: '#FFFBEB', subtitle: 'Full pipeline overview' },
  };
  const c = cfg[role] ?? cfg.factory;
  return (
    <div className="relative rounded-xl overflow-hidden px-8 py-8 mb-6 bg-blue-50 border border-blue-100">
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold mb-4" style={{ background: c.badgeBg, color: c.badgeColor }}>
            <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-green-500 animate-pulse" />
            {c.badge}
          </span>
          <h1 className="text-3xl font-bold leading-tight mb-1.5 text-slate-900">Welcome back, {userName}</h1>
          <p className="text-sm text-slate-600">{c.subtitle}</p>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Today</p>
          <p className="text-4xl font-bold text-blue-700" style={{ lineHeight: 1 }}>{(Math.random() * 20 + 5).toFixed(0)}</p>
          <p className="text-[11px] mt-1 text-slate-400">active orders</p>
        </div>
      </div>
    </div>
  );
}

export default function DenimLandingDashboard({ role, userName }: { role: string; userName?: string }) {
  return (
    <div className="page-layout">
      <div className="px-4 sm:px-0 pt-2 pb-2">
        <HeroSection role={role} userName="" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="lg:col-span-1">
            <StatCard label="Total Orders" value="1,878" sub="all time" color="#1D4ED8" hero accentIcon={FileText} />
          </div>
          <div className="grid grid-cols-3 lg:grid-cols-3 gap-4 lg:col-span-3">
            <StatCard label="Pending" value="—" sub="awaiting Jakarta" color="#D97706" />
            <StatCard label="In Production" value="—" sub="active pipeline" color="#059669" />
            <StatCard label="Completed" value="—" sub="this month" color="#7C3AED" />
          </div>
        </div>
        {role === 'factory' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
            <div className="lg:col-span-5 flex flex-col gap-3">
              <p className="text-[10px] font-bold uppercase tracking-widest px-1 text-slate-400">Quick Actions</p>
              <QuickActionCard label="Create New Order" href="/denim/new-order" icon={FileText} color="#1D4ED8" bgColor="#EFF6FF" desc="Start a new sales contract" />
              <QuickActionCard label="Warping Inbox" href="/denim/inbox/warping" icon={Clock} color="#1D4ED8" bgColor="#EFF6FF" desc="Orders ready for warping" />
              <QuickActionCard label="Indigo Inbox" href="/denim/inbox/indigo" icon={Clock} color="#059669" bgColor="#ECFDF5" desc="Orders ready for indigo" />
              <QuickActionCard label="Weaving Inbox" href="/denim/inbox/weaving" icon={Clock} color="#059669" bgColor="#ECFDF5" desc="Orders ready for weaving" />
            </div>
            <div className="lg:col-span-7"><ActivityFeed /></div>
          </div>
        )}
        {role === 'jakarta' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
            <div className="lg:col-span-5 flex flex-col gap-3">
              <p className="text-[10px] font-bold uppercase tracking-widest px-1 text-slate-400">Approval Queue</p>
              <QuickActionCard label="Pending Approval" href="/denim/approvals/pending" icon={Clock} color="#D97706" bgColor="#FFFBEB" desc="Awaiting your review" />
              <QuickActionCard label="Approved" href="/denim/approvals/approved" icon={CheckCircle} color="#059669" bgColor="#ECFDF5" desc="Sent to production" />
              <QuickActionCard label="Rejected" href="/denim/approvals/rejected" icon={XCircle} color="#DC2626" bgColor="#FEE2E2" desc="Sent back to Bandung" />
            </div>
            <div className="lg:col-span-7"><ActivityFeed /></div>
          </div>
        )}
      </div>
    </div>
  );
}
