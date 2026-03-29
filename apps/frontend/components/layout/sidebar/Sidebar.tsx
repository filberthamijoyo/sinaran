'use client';

import React, {
  createContext, useContext, useEffect, useRef, useState,
} from 'react';
import Link from 'next/link';
import { useAuth } from '../../../lib/AuthContext';
import { authFetch } from '../../../lib/authFetch';
import {
  LayoutDashboard, List, Archive, Layers, BarChart2,
  Wind, Droplets, Grid2x2, ScanLine, Waves, BadgeCheck,
  Clock, ClipboardCheck, Package, ChevronLeft, ChevronRight,
  Search, LogOut, Settings, User, Building2,
} from 'lucide-react';
import { usePathname } from 'next/navigation';

/* ─────────────────────────────────────────────────────────
   Sidebar Context
   ───────────────────────────────────────────────────────── */
interface SidebarContextValue {
  isOpen: boolean;
  collapsed: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  toggleCollapse: () => void;
}

const SidebarContext = createContext<SidebarContextValue>({
  isOpen: false, collapsed: false,
  open: () => {}, close: () => {}, toggle: () => {}, toggleCollapse: () => {},
});

export const useSidebar = () => useContext(SidebarContext);
export { SidebarContext };

/* ─────────────────────────────────────────────────────────
   Types
   ───────────────────────────────────────────────────────── */
type UserRole = 'admin' | 'factory' | 'jakarta';

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  badgeKey?: string;
};

type NavSection = { label: string; items: NavItem[]; };

interface AdminSummary {
  stageCounts?: Record<string, number>;
  [key: string]: unknown;
}

/* ─────────────────────────────────────────────────────────
   Design tokens — simple, high contrast
   ───────────────────────────────────────────────────────── */
const C = {
  sidebarBg:       '#1E3A52',
  sidebarTexture:   "url('/denim_bg.jpg')",
  sidebarBlend:     'multiply',
  sidebarWidth:     220,
  sidebarCollapsed:  56,
  headerH:         56,

  border:         'rgba(255,255,255,0.15)',

  textWhite:      '#FFFFFF',
  textMuted:      'rgba(255,255,255,0.85)',
  textDim:        'rgba(255,255,255,0.60)',

  hover:          'rgba(0,0,0,0.12)',
  active:         'rgba(0,0,0,0.20)',
  activeBorder:   'rgba(255,255,255,0.90)',

  searchBg:       'rgba(0,0,0,0.15)',
  searchBorder:   'rgba(255,255,255,0.20)',
  searchPlaceholder: 'rgba(255,255,255,0.50)',

  badgeBg:        'rgba(0,0,0,0.25)',
  badgeText:      '#FFFFFF',

  avatarBg:       'rgba(0,0,0,0.25)',
  avatarText:     '#FFFFFF',

  popupBg:        '#0A1628',
  popupBorder:    'rgba(255,255,255,0.10)',

  shadowText:     '0 1px 3px rgba(0,0,0,0.60)',
  shadowLabel:    '0 1px 2px rgba(0,0,0,0.50)',
  shadowIcon:     'drop-shadow(0 1px 2px rgba(0,0,0,0.50))',

  radiusSm:       6,
  radiusMd:       8,
  radiusLg:       10,
} as const;

/* ─────────────────────────────────────────────────────────
   Nav config
   ───────────────────────────────────────────────────────── */
const ADMIN_NAV: NavSection[] = [
  {
    label: 'OVERVIEW',
    items: [
      { href: '/denim/admin/dashboard',   label: 'Dashboard',      icon: <LayoutDashboard size={16} /> },
      { href: '/denim/admin/orders',     label: 'Sales Contract',  icon: <List            size={16} /> },
      { href: '/denim/admin/kp-archive',  label: 'KP Archive',      icon: <Archive         size={16} /> },
      { href: '/denim/admin/fabric-specs', label: 'Fabric Specs',   icon: <Layers          size={16} /> },
      { href: '/denim/admin/analytics',   label: 'Analytics',       icon: <BarChart2       size={16} /> },
      { href: '/denim/admin/users',       label: 'Users',           icon: <User            size={16} /> },
    ],
  },
  {
    label: 'PIPELINE',
    items: [
      { href: '/denim/inbox/warping',        label: 'Warping',        icon: <Wind       size={16} />, badgeKey: 'WARPING'        },
      { href: '/denim/inbox/indigo',          label: 'Indigo',          icon: <Droplets   size={16} />, badgeKey: 'INDIGO'         },
      { href: '/denim/inbox/weaving',          label: 'Weaving',         icon: <Grid2x2    size={16} />, badgeKey: 'WEAVING'        },
      { href: '/denim/inbox/inspect-gray',    label: 'Inspect Gray',    icon: <ScanLine   size={16} />, badgeKey: 'INSPECT_GRAY'  },
      { href: '/denim/inbox/bbsf',           label: 'BBSF',            icon: <Waves      size={16} />, badgeKey: 'BBSF'           },
      { href: '/denim/inbox/inspect-finish',  label: 'Inspect Finish',   icon: <BadgeCheck size={16} />, badgeKey: 'INSPECT_FINISH'},
    ],
  },
  {
    label: 'APPROVALS',
    items: [
      { href: '/denim/approvals/pending', label: 'Pending',  icon: <Clock   size={16} />, badgeKey: 'PENDING_APPROVAL' },
      { href: '/denim/approvals/sacon',   label: 'Sacon',   icon: <Package size={16} />, badgeKey: 'SACON'           },
    ],
  },
];

const JAKARTA_NAV: NavSection[] = [
  {
    label: 'OVERVIEW',
    items: [
      { href: '/denim/jakarta/dashboard', label: 'Dashboard',      icon: <Building2   size={16} /> },
      { href: '/denim/admin/orders',      label: 'Sales Contract',  icon: <List       size={16} /> },
      { href: '/denim/admin/analytics',   label: 'Analytics',       icon: <BarChart2   size={16} /> },
    ],
  },
  {
    label: 'APPROVALS',
    items: [
      { href: '/denim/approvals/pending', label: 'Pending Approvals', icon: <Clock   size={16} />, badgeKey: 'PENDING_APPROVAL' },
    ],
  },
  {
    label: '',
    items: [
      { href: '/denim/approvals/history', label: 'History', icon: <Clock size={16} /> },
    ],
  },
];

const FACTORY_NAV: NavSection[] = [
  {
    label: 'PIPELINE',
    items: [
      { href: '/denim/inbox/sacon',    label: 'Sales Contract', icon: <ClipboardCheck size={16} />, badgeKey: 'SACON' },
      { href: '/denim/inbox/warping', label: 'Warping',        icon: <Wind           size={16} />, badgeKey: 'WARPING'        },
      { href: '/denim/inbox/indigo',  label: 'Indigo',         icon: <Droplets       size={16} />, badgeKey: 'INDIGO'         },
      { href: '/denim/inbox/weaving', label: 'Weaving',        icon: <Grid2x2        size={16} />, badgeKey: 'WEAVING'        },
      { href: '/denim/inbox/inspect-gray', label: 'Inspect Gray', icon: <ScanLine     size={16} />, badgeKey: 'INSPECT_GRAY'  },
      { href: '/denim/inbox/bbsf',    label: 'BBSF',           icon: <Waves          size={16} />, badgeKey: 'BBSF'           },
      { href: '/denim/inbox/inspect-finish', label: 'Inspect Finish', icon: <BadgeCheck size={16} />, badgeKey: 'INSPECT_FINISH'},
    ],
  },
];

function buildFactoryNav(): NavSection[] {
  return [...FACTORY_NAV];
}

/* ─────────────────────────────────────────────────────────
   Helpers
   ───────────────────────────────────────────────────────── */
function isActivePath(pathname: string, href: string): boolean {
  if (href === '/denim' || href === '/') return pathname === href;
  return pathname === href || pathname.startsWith(href + '/');
}

function initials(name: string): string {
  return name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('');
}

const ROLE_LABEL: Record<UserRole, string> = {
  admin:   'Administrator',
  factory: 'Factory Floor',
  jakarta: 'Jakarta HQ',
};

/* ─────────────────────────────────────────────────────────
   Logo / Header
   ───────────────────────────────────────────────────────── */
function LogoHeader({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div style={{
      display: 'flex', alignItems: 'center', height: C.headerH,
      padding: collapsed ? '0 14px' : '0 14px',
      borderBottom: `1px solid ${C.border}`,
      flexShrink: 0, gap: 10,
      justifyContent: collapsed ? 'center' : 'flex-start',
    }}>
      {/* S monogram */}
      <div style={{
        width: 28, height: 28, borderRadius: C.radiusSm + 1,
        background: C.avatarBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 13, fontWeight: 700,
        color: C.avatarText,
        letterSpacing: '0.02em',
      }}>
        S
      </div>

      {!collapsed && (
        <>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.textWhite, lineHeight: 1.2, textShadow: '0 1px 4px rgba(0,0,0,0.60)' }}>
              Sinaran
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.80)', lineHeight: 1.2, marginTop: 2, textShadow: '0 1px 2px rgba(0,0,0,0.50)' }}>
              Triputra Textile
            </div>
          </div>
          {/* Collapse toggle */}
          <button
            title={collapsed ? 'Expand' : 'Collapse'}
            onClick={onToggle}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 28, height: 28, borderRadius: C.radiusSm,
              background: hovered ? C.hover : 'transparent',
              border: 'none', cursor: 'pointer',
              color: hovered ? C.textWhite : C.textMuted,
              transition: 'background 150ms, color 150ms',
              flexShrink: 0,
              filter: hovered ? C.shadowIcon : 'none',
            }}
          >
            <ChevronLeft size={14} />
          </button>
        </>
      )}

      {collapsed && (
        <button
          title="Expand"
          onClick={onToggle}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            position: 'absolute', bottom: -14, left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 22, height: 22, borderRadius: C.radiusSm,
            background: C.hover,
            border: `1px solid ${C.border}`,
            cursor: 'pointer',
            color: hovered ? C.textWhite : C.textMuted,
            transition: 'background 150ms, color 150ms',
          }}
        >
          <ChevronRight size={12} />
        </button>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Search bar
   ───────────────────────────────────────────────────────── */
function SearchBar({ collapsed }: { collapsed: boolean }) {
  if (collapsed) return null;
  return (
    <div style={{
      margin: '12px 10px 4px', height: 32,
      background: C.searchBg,
      border: `1px solid ${C.searchBorder}`,
      borderRadius: C.radiusMd,
      padding: '0 10px',
      display: 'flex', alignItems: 'center', gap: 6,
    }}>
      <Search size={12} style={{ color: C.textDim, flexShrink: 0, filter: C.shadowIcon }} />
      <span style={{ fontSize: 12, color: C.searchPlaceholder, flex: 1, lineHeight: 1, textShadow: C.shadowLabel }}>
        Search…
      </span>
      <span style={{
        fontSize: 10, background: 'rgba(255,255,255,0.08)', borderRadius: 4,
        padding: '1px 5px', color: C.textDim, flexShrink: 0,
      }}>
        ⌘K
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Nav section label
   ───────────────────────────────────────────────────────── */
function SectionLabel({ label }: { label: string }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 600,
      textTransform: 'uppercase', letterSpacing: '0.08em',
      color: C.textMuted,
      padding: '16px 10px 4px',
      textShadow: C.shadowLabel,
    }}>
      {label}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Nav item
   ───────────────────────────────────────────────────────── */
function NavItemEl({
  item, active, collapsed, badgeCount, onClick,
}: {
  item: NavItem; active: boolean; collapsed: boolean;
  badgeCount?: number; onClick?: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const showBadge = badgeCount != null && badgeCount > 0;

  if (collapsed) {
    return (
      <div style={{ position: 'relative', marginBottom: 2 }}>
        <Link
          href={item.href}
          onClick={onClick}
          title={item.label}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 40, height: 34, borderRadius: C.radiusMd,
            background: active ? C.active : hovered ? C.hover : 'transparent',
            color: C.textWhite,
            textDecoration: 'none',
            transition: 'background 150ms',
            flexShrink: 0,
            filter: C.shadowIcon,
          }}
        >
          <span style={{ color: 'inherit' }}>{item.icon}</span>
        </Link>
        {/* Tooltip */}
        {hovered && (
          <div style={{
            position: 'fixed', left: 64,
            background: C.popupBg, color: C.textWhite,
            fontSize: 12, padding: '4px 8px',
            borderRadius: C.radiusSm,
            pointerEvents: 'none', whiteSpace: 'nowrap',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          }}>
            {item.label}
          </div>
        )}
        {/* Badge */}
        {showBadge && (
          <div style={{
            position: 'absolute', top: 2, right: 2,
            background: C.badgeBg, color: C.badgeText,
            borderRadius: 10, fontSize: 9, fontWeight: 600,
            minWidth: 14, height: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '0 3px',
          }}>
            {badgeCount > 99 ? '99+' : badgeCount}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 8, height: 34,
        padding: '0 10px', borderRadius: C.radiusMd,
        background: active ? C.active : hovered ? C.hover : 'transparent',
        textDecoration: 'none',
        transition: 'background 150ms',
        borderLeft: active ? `2px solid ${C.activeBorder}` : '2px solid transparent',
        borderTopRightRadius: '8px',
        borderBottomRightRadius: '8px',
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0, color: C.textWhite, filter: C.shadowIcon }}>
        {item.icon}
      </span>
      <span style={{
        flex: 1, minWidth: 0, overflow: 'hidden',
        textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        fontWeight: active ? 700 : 600,
        fontSize: 13,
        color: C.textWhite,
        textShadow: C.shadowText,
      }}>
        {item.label}
      </span>
      {showBadge && (
        <span style={{
          marginLeft: 'auto',
          background: C.badgeBg, color: C.badgeText,
          borderRadius: 10, padding: '1px 6px',
          fontSize: 10, fontWeight: 600, flexShrink: 0,
        }}>
          {badgeCount > 99 ? '99+' : badgeCount}
        </span>
      )}
    </Link>
  );
}

/* ─────────────────────────────────────────────────────────
   Profile area + popup
   ───────────────────────────────────────────────────────── */
function ProfileArea({
  collapsed, userName, role, onLogout,
}: {
  collapsed: boolean; userName: string; role: UserRole; onLogout: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const avatarInitials = initials(userName || 'User');

  if (collapsed) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 6px', borderTop: `1px solid ${C.border}` }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          background: C.avatarBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 600, color: C.avatarText, cursor: 'pointer',
        }}
          title={userName}
          onClick={() => setMenuOpen(o => !o)}
        >
          {avatarInitials}
        </div>
      </div>
    );
  }

  return (
    <div ref={menuRef} style={{ position: 'relative', padding: '10px', borderTop: `1px solid ${C.border}` }}>
      <div
        onClick={() => setMenuOpen(o => !o)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          cursor: 'pointer', padding: '6px 4px',
          borderRadius: C.radiusMd,
          background: hovered ? C.hover : 'transparent',
          transition: 'background 150ms',
        }}
      >
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          background: C.avatarBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 600, color: C.avatarText, flexShrink: 0,
        }}>
          {avatarInitials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.textWhite, lineHeight: 1.2, textShadow: C.shadowText }}>
            {userName || 'User'}
          </div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.75)', lineHeight: 1.2, marginTop: 2, textShadow: C.shadowLabel }}>
            {ROLE_LABEL[role]}
          </div>
        </div>
      </div>

      {/* Popup menu */}
      {menuOpen && (
        <div style={{
          position: 'absolute', bottom: 'calc(100% + 8px)', left: 10,
          width: 180,
          background: C.popupBg,
          border: `1px solid ${C.popupBorder}`,
          borderRadius: C.radiusMd, padding: 4,
          boxShadow: '0 -4px 24px rgba(0,0,0,0.4)',
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px 8px' }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: C.avatarBg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 600, color: C.avatarText, flexShrink: 0,
            }}>
              {avatarInitials}
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 500, color: C.textWhite, lineHeight: 1.2 }}>
                {userName || 'User'}
              </div>
              <span style={{
                fontSize: 10, color: C.textMuted, fontWeight: 600,
                letterSpacing: '0.04em', textTransform: 'uppercase',
              }}>
                {role}
              </span>
            </div>
          </div>
          <div style={{ height: 1, background: C.popupBorder, margin: '0 4px' }} />
          <MenuItem icon={<User size={13} />}      label="Profile"         onClick={() => setMenuOpen(false)} />
          <MenuItem icon={<Settings size={13} />}  label="Change Password" onClick={() => setMenuOpen(false)} />
          <div style={{ height: 1, background: C.popupBorder, margin: '0 4px' }} />
          <MenuItem icon={<LogOut size={13} />}    label="Sign Out"        onClick={() => { setMenuOpen(false); onLogout(); }} danger />
        </div>
      )}
    </div>
  );
}

function MenuItem({ icon, label, onClick, danger = false }: {
  icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        width: '100%', padding: '7px 8px',
        border: 'none',
        background: hovered ? danger ? 'rgba(220,38,38,0.15)' : C.hover : 'transparent',
        color: danger ? '#FCA5A5' : C.textMuted,
        fontSize: 12, cursor: 'pointer',
        borderRadius: C.radiusSm,
        transition: 'background 150ms, color 150ms',
        textAlign: 'left',
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', opacity: 0.8 }}>{icon}</span>
      {label}
    </button>
  );
}

/* ─────────────────────────────────────────────────────────
   Mobile Overlay
   ───────────────────────────────────────────────────────── */
function MobileOverlay({ onClose }: { onClose: () => void }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)' }} />
  );
}

/* ─────────────────────────────────────────────────────────
   Main Sidebar wrapper — provides SidebarContext
   ───────────────────────────────────────────────────────── */
export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const stored = localStorage.getItem('sidebar_collapsed');
    if (stored === 'true') setCollapsed(true);
  }, []);

  if (!user) return null;

  return (
    <SidebarContext.Provider
      value={{
        isOpen, collapsed,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
        toggle: () => setIsOpen(o => !o),
        toggleCollapse: () => setCollapsed(c => {
          const next = !c;
          localStorage.setItem('sidebar_collapsed', String(next));
          return next;
        }),
      }}
    >
      {/* Mobile overlay backdrop */}
      {isOpen && typeof window !== 'undefined' && window.innerWidth < 768 && (
        <MobileOverlay onClose={() => setIsOpen(false)} />
      )}
      {/* Mobile drawer */}
      {typeof window !== 'undefined' && window.innerWidth < 768 && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0,
            width: C.sidebarWidth, height: '100vh',
            zIndex: 40,
            backgroundColor: C.sidebarBg,
            backgroundImage: C.sidebarTexture,
            backgroundSize: 'cover',
            backgroundBlendMode: C.sidebarBlend,
            backgroundPosition: 'center',
            borderRight: `1px solid ${C.border}`,
            overflow: 'hidden',
            transform: isOpen ? 'translateX(0)' : `translateX(-${C.sidebarWidth}px)`,
            transition: 'transform 200ms ease',
          }}
        >
          {/* Gradient overlay */}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
            background: 'linear-gradient(to bottom, rgba(15,25,40,0.30) 0%, rgba(8,16,28,0.55) 100%)',
          }} />
          {/* All content: above the gradient */}
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
            <LogoHeader collapsed={false} onToggle={() => setIsOpen(false)} />
            <SearchBar collapsed={false} />
            <MobileDrawerNav onClose={() => setIsOpen(false)} />
            <ProfileArea collapsed={false} userName={user.name} role={user.role as UserRole} onLogout={() => useAuth().logout()} />
          </div>
        </div>
      )}
      {/* Desktop sidebar */}
      {typeof window !== 'undefined' && window.innerWidth >= 768 && (
        <DesktopSidebar />
      )}
    </SidebarContext.Provider>
  );
}

/* ─────────────────────────────────────────────────────────
   Desktop sidebar
   ───────────────────────────────────────────────────────── */
function DesktopSidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const { collapsed, toggleCollapse } = useSidebar();
  const [summaryCounts, setSummaryCounts] = useState<Record<string, number>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!user) return;
    if (user.role !== 'admin' && user.role !== 'jakarta') return;
    authFetch<AdminSummary>('/denim/admin/summary')
      .then(data => setSummaryCounts(data.stageCounts ?? {}))
      .catch(() => {});
  }, [user]);

  if (!user || !mounted) return null;

  const width = collapsed ? C.sidebarCollapsed : C.sidebarWidth;
  const role = user.role as UserRole;
  const stage = (user as { stage?: string }).stage ?? 'warping';

  const navSections: NavSection[] =
    role === 'admin'   ? ADMIN_NAV
    : role === 'jakarta' ? JAKARTA_NAV
    : buildFactoryNav();

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0,
      width, height: '100vh',
      backgroundColor: C.sidebarBg,
      backgroundImage: C.sidebarTexture,
      backgroundSize: 'cover',
      backgroundBlendMode: C.sidebarBlend,
      backgroundPosition: 'center',
      borderRight: `1px solid ${C.border}`,
      overflow: 'hidden',
      zIndex: 40,
      transition: 'width 200ms ease',
    }}>
      {/* Gradient overlay — darkens top-to-bottom, never blocks clicks */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
        background: 'linear-gradient(to bottom, rgba(15,25,40,0.30) 0%, rgba(8,16,28,0.55) 100%)',
      }} />

      {/* All content: above the gradient */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <LogoHeader collapsed={collapsed} onToggle={toggleCollapse} />
        <SearchBar collapsed={collapsed} />
        <nav style={{
          flex: 1, overflowY: 'auto', overflowX: 'hidden',
          padding: collapsed ? '12px 8px' : '4px 10px 20px',
          display: 'flex', flexDirection: 'column',
          gap: collapsed ? 8 : 0,
        }}>
          {navSections.map(section => (
            <div key={section.label}>
              {!collapsed && <SectionLabel label={section.label} />}
              {section.items.map(item => (
                <NavItemEl
                  key={item.href}
                  item={item}
                  active={isActivePath(pathname, item.href)}
                  collapsed={collapsed}
                  badgeCount={item.badgeKey ? summaryCounts[item.badgeKey] : undefined}
                />
              ))}
            </div>
          ))}
        </nav>

        {/* Expand toggle (collapsed mode) */}
        {collapsed && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '4px 0 2px', borderTop: `1px solid ${C.border}` }}>
            <button
              title="Expand sidebar"
              onClick={toggleCollapse}
              style={{
                width: 32, height: 32, borderRadius: 8,
                background: C.hover,
                border: `1px solid ${C.border}`,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto',
                color: C.textWhite,
                transition: 'background 150ms',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.18)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = C.hover; }}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}

        <ProfileArea collapsed={collapsed} userName={user.name} role={role} onLogout={logout} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Mobile drawer nav
   ───────────────────────────────────────────────────────── */
function MobileDrawerNav({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const [summaryCounts, setSummaryCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!user) return;
    if (user.role !== 'admin' && user.role !== 'jakarta') return;
    authFetch<AdminSummary>('/denim/admin/summary')
      .then(data => setSummaryCounts(data.stageCounts ?? {}))
      .catch(() => {});
  }, [user]);

  if (!user) return null;

  const role = user.role as UserRole;
  const stage = (user as { stage?: string }).stage ?? 'warping';

  const navSections: NavSection[] =
    role === 'admin'   ? ADMIN_NAV
    : role === 'jakarta' ? JAKARTA_NAV
    : buildFactoryNav();

  return (
    <nav style={{ flex: 1, overflowY: 'auto', padding: '4px 10px 20px' }}>
      {navSections.map(section => (
        <div key={section.label}>
          <SectionLabel label={section.label} />
          {section.items.map(item => (
            <NavItemEl
              key={item.href}
              item={item}
              active={isActivePath(pathname, item.href)}
              collapsed={false}
              badgeCount={item.badgeKey ? summaryCounts[item.badgeKey] : undefined}
              onClick={onClose}
            />
          ))}
        </div>
      ))}
    </nav>
  );
}
