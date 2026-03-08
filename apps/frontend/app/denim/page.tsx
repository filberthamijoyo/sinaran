'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/AuthContext';
import PageHeader from '../../components/layout/PageHeader';
import { FileText, Clock, CheckCircle, XCircle,
  ArrowRight } from 'lucide-react';
import Link from 'next/link';

const statCard = (
  label: string,
  value: string,
  sub: string,
  color: string
) => (
  <div className="bg-white rounded-xl border border-zinc-200/80 p-5
    shadow-sm">
    <p className="text-sm text-zinc-500">{label}</p>
    <p className={`text-3xl font-semibold mt-1 ${color}`}>{value}</p>
    <p className="text-xs text-zinc-400 mt-1">{sub}</p>
  </div>
);

export default function DenimDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user?.role === 'admin') {
      router.replace('/denim/admin/dashboard');
    }
  }, [user, router]);

  if (!user) return null;

  return (
    <div>
      <PageHeader
        title={`Welcome, ${user.name.split(' ')[0]}`}
        subtitle={
          user.role === 'bandung'
            ? 'Bandung Factory — Production pipeline'
            : user.role === 'jakarta'
            ? 'Jakarta HQ — Approval center'
            : 'Administrator — Full pipeline overview'
        }
      />

      <div className="px-8 pb-8">

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCard('Total Orders', '1,878', 'all time', 'text-zinc-900')}
          {statCard('Pending Approval', '—', 'awaiting Jakarta', 'text-amber-600')}
          {statCard('In Production', '—', 'active pipeline', 'text-violet-600')}
          {statCard('Completed', '—', 'this month', 'text-green-600')}
        </div>

        {/* Quick actions by role */}
        {user.role === 'bandung' && (
          <div className="bg-white rounded-xl border border-zinc-200/80
            shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-100">
              <h2 className="text-sm font-semibold text-zinc-800">
                Quick Actions
              </h2>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { label: 'Create New Order', href: '/denim/new-order',
                  icon: FileText, desc: 'Start a new sales contract' },
                { label: 'Warping Inbox', href: '/denim/inbox/warping',
                  icon: Clock, desc: 'Orders ready for warping' },
                { label: 'Indigo Inbox', href: '/denim/inbox/indigo',
                  icon: Clock, desc: 'Orders ready for indigo' },
                { label: 'Weaving Inbox', href: '/denim/inbox/weaving',
                  icon: Clock, desc: 'Orders ready for weaving' },
              ].map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg
                    border border-zinc-100 hover:border-zinc-200
                    hover:bg-zinc-50 transition-colors group"
                >
                  <item.icon className="w-4 h-4 text-zinc-400
                    group-hover:text-blue-500 transition-colors" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-800">
                      {item.label}
                    </p>
                    <p className="text-xs text-zinc-500 truncate">
                      {item.desc}
                    </p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-300
                    group-hover:text-zinc-500 transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {user.role === 'jakarta' && (
          <div className="bg-white rounded-xl border border-zinc-200/80
            shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-100">
              <h2 className="text-sm font-semibold text-zinc-800">
                Approval Queue
              </h2>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { label: 'Pending Approval', href: '/denim/approvals/pending',
                  icon: Clock, desc: 'Awaiting your review',
                  color: 'text-amber-500' },
                { label: 'Approved', href: '/denim/approvals/approved',
                  icon: CheckCircle, desc: 'Sent to production',
                  color: 'text-green-500' },
                { label: 'Rejected', href: '/denim/approvals/rejected',
                  icon: XCircle, desc: 'Sent back to Bandung',
                  color: 'text-red-500' },
              ].map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg
                    border border-zinc-100 hover:border-zinc-200
                    hover:bg-zinc-50 transition-colors group"
                >
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-800">
                      {item.label}
                    </p>
                    <p className="text-xs text-zinc-500">{item.desc}</p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-300
                    group-hover:text-zinc-500 transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
