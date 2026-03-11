'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../lib/AuthContext';
import {
  LayoutDashboard,
  FilePlus,
  FileText,
  Inbox,
  CheckSquare,
  XSquare,
  ClipboardList,
  Settings,
  LogOut,
  ChevronRight,
  Factory,
  BarChart2,
  Archive,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const factoryNav: NavGroup[] = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', href: '/denim', icon: LayoutDashboard },
      { label: 'My Orders', href: '/denim/my-orders', icon: FileText },
      { label: 'New Order', href: '/denim/new-order', icon: FilePlus },
    ],
  },
  {
    title: 'Production Inbox',
    items: [
      { label: 'Warping', href: '/denim/inbox/warping', icon: Inbox },
      { label: 'Indigo', href: '/denim/inbox/indigo', icon: Inbox },
      { label: 'Weaving', href: '/denim/inbox/weaving', icon: Inbox },
      { label: 'Inspect Gray', href: '/denim/inbox/inspect-gray', icon: Inbox },
    ],
  },
];

const jakartaNav: NavGroup[] = [
  {
    title: 'Approvals',
    items: [
      { label: 'Dashboard', href: '/denim', icon: LayoutDashboard },
      { label: 'Pending Approval', href: '/denim/approvals/pending', icon: ClipboardList },
      { label: 'Approved', href: '/denim/approvals/approved', icon: CheckSquare },
      { label: 'Rejected', href: '/denim/approvals/rejected', icon: XSquare },
    ],
  },
];

const adminNav: NavGroup[] = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', href: '/denim/admin/dashboard', icon: LayoutDashboard },
      { label: 'All Orders', href: '/denim/admin/orders', icon: FileText },
      { label: 'KP Archive', href: '/denim/admin/kp-archive', icon: Archive },
      { label: 'Analytics', href: '/denim/admin/analytics', icon: BarChart2 },
    ],
  },
  {
    title: 'Pipeline',
    items: [
      { label: 'Warping', href: '/denim/admin/warping', icon: ClipboardList },
      { label: 'Indigo', href: '/denim/admin/indigo', icon: ClipboardList },
      { label: 'Weaving', href: '/denim/admin/weaving', icon: ClipboardList },
      { label: 'Inspect Gray', href: '/denim/admin/inspect-gray', icon: ClipboardList },
    ],
  },
];

const navByRole: Record<string, NavGroup[]> = {
  factory: factoryNav,
  jakarta: jakartaNav,
  admin: adminNav,
};

const roleLabel: Record<string, string> = {
  factory: 'Factory',
  jakarta: 'Jakarta HQ',
  admin: 'Administrator',
};

const roleBadgeColor: Record<string, string> = {
  factory: 'bg-violet-500/20 text-violet-300',
  jakarta: 'bg-blue-500/20 text-blue-300',
  admin: 'bg-amber-500/20 text-amber-300',
};

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  if (!user) return null;

  const groups = navByRole[user.role] || factoryNav;

  const isActive = (href: string) => {
    if (href === '/denim') return pathname === '/denim';
    return pathname.startsWith(href);
  };

  return (
    <aside
      style={{ backgroundColor: 'var(--sidebar-bg)' }}
      className="fixed left-0 top-0 h-screen w-56 flex flex-col z-40
        border-r border-zinc-800/60"
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-4
        border-b border-zinc-800/60">
        <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center
          justify-center flex-shrink-0">
          <Factory className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-white text-sm font-semibold leading-tight">
            Sinaran ERP
          </p>
          <p className="text-zinc-500 text-[10px] leading-tight">
            PT Triputra Textile
          </p>
        </div>
      </div>

      {/* User badge */}
      <div className="px-3 py-3 border-b border-zinc-800/60">
        <div className={cn(
          'rounded-md px-2.5 py-2 flex flex-col gap-0.5',
          'bg-zinc-800/50'
        )}>
          <p className="text-white text-xs font-medium truncate">
            {user.name}
          </p>
          <span className={cn(
            'text-[10px] font-medium px-1.5 py-0.5 rounded w-fit',
            roleBadgeColor[user.role]
          )}>
            {roleLabel[user.role]}
          </span>
        </div>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-5">
        {groups.map((group) => (
          <div key={group.title}>
            <p className="px-2 mb-1 text-[10px] font-semibold uppercase
              tracking-widest text-zinc-600">
              {group.title}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2.5 px-2.5 py-2 rounded-md',
                      'text-sm transition-colors duration-150 group',
                      active
                        ? 'bg-zinc-700/70 text-white'
                        : 'text-zinc-400 hover:bg-zinc-800/70 hover:text-zinc-200'
                    )}
                  >
                    <Icon className={cn(
                      'w-3.5 h-3.5 flex-shrink-0',
                      active ? 'text-blue-400' : 'text-zinc-500 group-hover:text-zinc-300'
                    )} />
                    <span className="truncate">{item.label}</span>
                    {item.badge && item.badge > 0 && (
                      <span className="ml-auto bg-blue-600 text-white text-[10px]
                        font-bold px-1.5 py-0.5 rounded-full min-w-[18px]
                        text-center leading-none">
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

      {/* Bottom: logout */}
      <div className="px-2 py-3 border-t border-zinc-800/60">
        <button
          onClick={logout}
          className="flex items-center gap-2.5 px-2.5 py-2 rounded-md
            w-full text-sm text-zinc-500 hover:bg-zinc-800/70
            hover:text-zinc-200 transition-colors duration-150"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
