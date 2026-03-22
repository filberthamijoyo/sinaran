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
  <div 
    className="rounded-[32px] p-5"
    style={{
      background: '#E0E5EC',
      boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)',
    }}
  >
    <p className="text-sm" style={{ color: '#6B7280' }}>{label}</p>
    <p className="text-3xl font-semibold mt-1" style={{ color: '#3D4852' }}>{value}</p>
    <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>{sub}</p>
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
          user.role === 'factory'
            ? 'Factory — Production pipeline'
            : user.role === 'jakarta'
            ? 'Jakarta HQ — Approval center'
            : 'Administrator — Full pipeline overview'
        }
      />

      <div className="px-4 sm:px-8 pb-8">

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCard('Total Orders', '1,878', 'all time', '#3D4852')}
          {statCard('Pending Approval', '—', 'awaiting Jakarta', '#3D4852')}
          {statCard('In Production', '—', 'active pipeline', '#3D4852')}
          {statCard('Completed', '—', 'this month', '#3D4852')}
        </div>

        {/* Quick actions by role */}
        {user.role === 'factory' && (
          <div 
            className="rounded-[32px] overflow-hidden"
            style={{
              background: '#E0E5EC',
              boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)',
            }}
          >
            <div className="px-5 py-4" style={{ borderBottom: '1px solid rgb(163 177 198 / 0.3)' }}>
              <h2 className="text-sm font-semibold" style={{ color: '#3D4852' }}>
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
                  className="flex items-center gap-3 px-4 py-3 rounded-[16px] transition-all"
                  style={{
                    background: '#E0E5EC',
                    boxShadow: '5px 5px 10px rgb(163 177 198 / 0.6), -5px -5px 10px rgba(255,255,255,0.5)',
                    color: '#3D4852',
                  }}
                >
                  <item.icon className="w-4 h-4" style={{ color: '#6B7280' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium" style={{ color: '#3D4852' }}>
                      {item.label}
                    </p>
                    <p className="text-xs truncate" style={{ color: '#9CA3AF' }}>
                      {item.desc}
                    </p>
                  </div>
                  <ArrowRight className="w-3.5 h-4" style={{ color: '#9CA3AF' }} />
                </Link>
              ))}
            </div>
          </div>
        )}

        {user.role === 'jakarta' && (
          <div 
            className="rounded-[32px] overflow-hidden"
            style={{
              background: '#E0E5EC',
              boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)',
            }}
          >
            <div className="px-5 py-4" style={{ borderBottom: '1px solid rgb(163 177 198 / 0.3)' }}>
              <h2 className="text-sm font-semibold" style={{ color: '#3D4852' }}>
                Approval Queue
              </h2>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { label: 'Pending Approval', href: '/denim/approvals/pending',
                  icon: Clock, desc: 'Awaiting your review',
                  color: '#D97706' },
                { label: 'Approved', href: '/denim/approvals/approved',
                  icon: CheckCircle, desc: 'Sent to production',
                  color: '#16A34A' },
                { label: 'Rejected', href: '/denim/approvals/rejected',
                  icon: XCircle, desc: 'Sent back to Bandung',
                  color: '#DC2626' },
              ].map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-[16px] transition-all"
                  style={{
                    background: '#E0E5EC',
                    boxShadow: '5px 5px 10px rgb(163 177 198 / 0.6), -5px -5px 10px rgba(255,255,255,0.5)',
                    color: '#3D4852',
                  }}
                >
                  <item.icon className={`w-4 h-4`} style={{ color: item.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium" style={{ color: '#3D4852' }}>
                      {item.label}
                    </p>
                    <p className="text-xs" style={{ color: '#9CA3AF' }}>{item.desc}</p>
                  </div>
                  <ArrowRight className="w-3.5 h-4" style={{ color: '#9CA3AF' }} />
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
