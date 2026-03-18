'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../lib/AuthContext';
import {
  LayoutDashboard, FilePlus, FileText, Inbox, CheckSquare,
  XSquare, ClipboardList, LogOut, BarChart2, Archive,
  FlaskConical, X, Search,
} from 'lucide-react';

interface NavItem { label: string; href: string; icon: React.ElementType; badge?: number; }
interface NavGroup { title: string; items: NavItem[]; }

const factoryNav: NavGroup[] = [
  { title: 'Overview', items: [
    { label: 'Dashboard', href: '/denim', icon: LayoutDashboard },
    { label: 'My Orders', href: '/denim/my-orders', icon: FileText },
    { label: 'New Order', href: '/denim/new-order', icon: FilePlus },
    { label: 'Roll Trace', href: '/denim/roll-trace', icon: Search },
  ]},
  { title: 'Production Inbox', items: [
    { label: 'Warping', href: '/denim/inbox/warping', icon: Inbox },
    { label: 'Indigo', href: '/denim/inbox/indigo', icon: Inbox },
    { label: 'Weaving', href: '/denim/inbox/weaving', icon: Inbox },
    { label: 'Inspect Gray', href: '/denim/inbox/inspect-gray', icon: Inbox },
    { label: 'BBSF', href: '/denim/inbox/bbsf', icon: Inbox },
    { label: 'Inspect Finish', href: '/denim/inbox/inspect-finish', icon: Inbox },
  ]},
];

const jakartaNav: NavGroup[] = [
  { title: 'Overview', items: [
    { label: 'Dashboard', href: '/denim', icon: LayoutDashboard },
    { label: 'Pending Approval', href: '/denim/approvals/pending', icon: ClipboardList },
    { label: 'Approved', href: '/denim/approvals/approved', icon: CheckSquare },
    { label: 'Rejected', href: '/denim/approvals/rejected', icon: XSquare },
    { label: 'Roll Trace', href: '/denim/roll-trace', icon: Search },
  ]},
];

const adminNav: NavGroup[] = [
  { title: 'Overview', items: [
    { label: 'Dashboard', href: '/denim/admin/dashboard', icon: LayoutDashboard },
    { label: 'All Orders', href: '/denim/admin/orders', icon: FileText },
    { label: 'KP Archive', href: '/denim/admin/kp-archive', icon: Archive },
    { label: 'Fabric Specs', href: '/denim/admin/fabric-specs', icon: FlaskConical },
    { label: 'Analytics', href: '/denim/admin/analytics', icon: BarChart2 },
    { label: 'Roll Trace', href: '/denim/roll-trace', icon: Search },
  ]},
  { title: 'Pipeline', items: [
    { label: 'Warping', href: '/denim/admin/warping', icon: ClipboardList },
    { label: 'Indigo', href: '/denim/admin/indigo', icon: ClipboardList },
    { label: 'Weaving', href: '/denim/admin/weaving', icon: ClipboardList },
    { label: 'Inspect Gray', href: '/denim/admin/inspect-gray', icon: ClipboardList },
    { label: 'BBSF', href: '/denim/admin/bbsf', icon: ClipboardList },
    { label: 'Inspect Finish', href: '/denim/admin/inspect-finish', icon: ClipboardList },
  ]},
  { title: 'Approvals', items: [
    { label: 'Pending', href: '/denim/approvals/pending', icon: ClipboardList },
    { label: 'Approved', href: '/denim/approvals/approved', icon: CheckSquare },
    { label: 'Rejected', href: '/denim/approvals/rejected', icon: XSquare },
  ]},
];

const navByRole: Record<string, NavGroup[]> = { factory: factoryNav, jakarta: jakartaNav, admin: adminNav };
const roleLabel: Record<string, string> = { factory: 'Factory', jakarta: 'Jakarta HQ', admin: 'Administrator' };
const roleAccent: Record<string, string> = { factory: '#7C3AED', jakarta: '#6C63FF', admin: '#D97706' };

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  if (!user) return null;

  const groups = navByRole[user.role] || factoryNav;
  const accent = roleAccent[user.role] || '#6C63FF';

  const isActive = (href: string) => {
    if (href === '/denim') return pathname === '/denim';
    return pathname.startsWith(href);
  };

  return (
    <aside
      className="h-screen w-64 flex flex-col"
      style={{ background: '#E0E5EC' }}
    >
      {/* Logo */}
      <div className="px-4 py-5 mx-3 mt-3 rounded-[24px]"
        style={{ boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)' }}>
        <div className="flex items-center gap-3">
          {/* Mobile close */}
          {onClose && (
            <button onClick={onClose}
              className="lg:hidden absolute top-4 right-4 w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ boxShadow: '3px 3px 6px rgb(163 177 198 / 0.6), -3px -3px 6px rgba(255,255,255,0.5)', background: '#E0E5EC' }}>
              <X className="w-4 h-4 text-[#6B7280]" />
            </button>
          )}
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ boxShadow: 'inset 6px 6px 10px rgb(163 177 198 / 0.6), inset -6px -6px 10px rgba(255,255,255,0.5)', background: '#E0E5EC' }}>
            <span className="font-display text-base font-bold" style={{ color: '#6C63FF' }}>S</span>
          </div>
          <div>
            <p className="font-display text-sm font-bold text-[#3D4852] tracking-wide">Sinaran</p>
            <p className="text-[9px] text-[#9CA3AF] tracking-[0.2em] uppercase">PT Triputra Textile</p>
          </div>
        </div>
      </div>

      {/* User badge */}
      <div className="px-3 py-3">
        <div className="rounded-2xl px-4 py-3"
          style={{ boxShadow: 'inset 6px 6px 10px rgb(163 177 198 / 0.6), inset -6px -6px 10px rgba(255,255,255,0.5)', background: '#E0E5EC' }}>
          <p className="text-sm font-medium text-[#3D4852] truncate mb-2">{user.name}</p>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
            style={{ background: '#E0E5EC', color: accent, boxShadow: '3px 3px 6px rgb(163 177 198 / 0.5), -3px -3px 6px rgba(255,255,255,0.5)' }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: accent }} />
            {roleLabel[user.role]}
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-5">
        {groups.map((group, gi) => (
          <div key={group.title}>
            <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#9CA3AF]">
              {group.title}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm transition-all duration-300 relative"
                    style={active ? {
                      boxShadow: 'inset 6px 6px 10px rgb(163 177 198 / 0.6), inset -6px -6px 10px rgba(255,255,255,0.5)',
                      background: '#E0E5EC',
                      color: '#3D4852',
                    } : {
                      color: '#6B7280',
                    }}
                    onMouseEnter={e => {
                      if (!active) {
                        (e.currentTarget as HTMLElement).style.boxShadow = '5px 5px 10px rgb(163 177 198 / 0.6), -5px -5px 10px rgba(255,255,255,0.5)';
                        (e.currentTarget as HTMLElement).style.color = '#3D4852';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!active) {
                        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                        (e.currentTarget as HTMLElement).style.color = '#6B7280';
                      }
                    }}
                  >
                    {/* Active left bar */}
                    {active && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full"
                        style={{ background: accent }} />
                    )}

                    {/* Icon well */}
                    <span className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={active ? {
                        boxShadow: '3px 3px 6px rgb(163 177 198 / 0.5), -3px -3px 6px rgba(255,255,255,0.5)',
                        background: '#E0E5EC',
                        color: accent,
                      } : { color: '#9CA3AF' }}>
                      <Icon className="w-3.5 h-3.5" />
                    </span>

                    <span className={`truncate text-sm ${active ? 'font-semibold' : 'font-normal'}`}>
                      {item.label}
                    </span>

                    {item.badge && item.badge > 0 && (
                      <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                        style={{ background: accent }}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Sign out */}
      <div className="p-3">
        <button onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-2xl w-full text-sm text-[#6B7280] transition-all duration-300"
          style={{ background: '#E0E5EC' }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.boxShadow = '5px 5px 10px rgb(163 177 198 / 0.6), -5px -5px 10px rgba(255,255,255,0.5)';
            (e.currentTarget as HTMLElement).style.color = '#3D4852';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.boxShadow = 'none';
            (e.currentTarget as HTMLElement).style.color = '#6B7280';
          }}
        >
          <span className="w-7 h-7 rounded-xl flex items-center justify-center"
            style={{ boxShadow: 'inset 3px 3px 6px rgb(163 177 198 / 0.6), inset -3px -3px 6px rgba(255,255,255,0.5)', background: '#E0E5EC' }}>
            <LogOut className="w-3.5 h-3.5" />
          </span>
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}