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
   Design tokens — premium dark, steel-blue accents
   ───────────────────────────────────────────────────────── */
const C = {
  sidebarBg:        '#0D1B3E',
  sidebarTexture:    "url('/denim_bg.jpg')",
  sidebarBlend:      'multiply',
  sidebarWidth:      226,
  sidebarCollapsed:  64,
  headerH:           60,

  textWhite:        '#FFFFFF',
  textMuted:        'rgba(255,255,255,0.65)',
  textDim:          'rgba(255,255,255,0.45)',

  border:           'rgba(255,255,255,0.12)',
  borderHover:      'rgba(255,255,255,0.20)',

  hover:            'rgba(255,255,255,0.08)',
  active:           'rgba(255,255,255,0.15)',
  activeBar:        '#FFFFFF',

  searchBg:         'rgba(0,0,0,0.18)',
  searchBorder:     'rgba(255,255,255,0.10)',
  searchPlaceholder:'rgba(255,255,255,0.45)',

  badgeBg:          'rgba(255,255,255,0.15)',
  badgeText:        '#FFFFFF',

  avatarBg:         'rgba(255,255,255,0.12)',
  avatarText:       '#FFFFFF',

  popupBg:          'rgba(8,13,26,0.92)',
  popupBorder:      'rgba(148,163,184,0.10)',

  shadowIcon:       'drop-shadow(0 1px 1px rgba(0,0,0,0.40))',
  shadowGlow:       '0 0 14px rgba(139,169,196,0.20)',

  radiusSm:          5,
  radiusMd:          7,
  radiusLg:         10,
} as const;

/* ─────────────────────────────────────────────────────────
   Nav config
   ───────────────────────────────────────────────────────── */
const ADMIN_NAV: NavSection[] = [
  {
    label: 'OVERVIEW',
    items: [
      { href: '/denim/admin/dashboard',  label: 'Dashboard',     icon: <LayoutDashboard size={16} /> },
      { href: '/denim/admin/orders',     label: 'Sales Contract', icon: <List            size={16} /> },
      { href: '/denim/admin/kp-archive', label: 'KP Archive',   icon: <Archive         size={16} /> },
      { href: '/denim/admin/fabric-specs', label: 'Fabric Specs', icon: <Layers        size={16} /> },
      { href: '/denim/admin/analytics',  label: 'Analytics',    icon: <BarChart2       size={16} /> },
      { href: '/denim/admin/users',      label: 'Users',        icon: <User            size={16} /> },
    ],
  },
  {
    label: 'PIPELINE',
    items: [
      { href: '/denim/inbox/warping',         label: 'Warping',        icon: <Wind       size={16} />, badgeKey: 'WARPING'        },
      { href: '/denim/inbox/indigo',           label: 'Indigo',          icon: <Droplets   size={16} />, badgeKey: 'INDIGO'         },
      { href: '/denim/inbox/weaving',           label: 'Weaving',         icon: <Grid2x2    size={16} />, badgeKey: 'WEAVING'        },
      { href: '/denim/inbox/inspect-gray',     label: 'Inspect Gray',    icon: <ScanLine   size={16} />, badgeKey: 'INSPECT_GRAY'  },
      { href: '/denim/inbox/bbsf',            label: 'BBSF',            icon: <Waves      size={16} />, badgeKey: 'BBSF'           },
      { href: '/denim/inbox/inspect-finish',   label: 'Inspect Finish',   icon: <BadgeCheck size={16} />, badgeKey: 'INSPECT_FINISH'},
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
      { href: '/denim/jakarta/dashboard', label: 'Dashboard',    icon: <Building2  size={16} /> },
      { href: '/denim/admin/orders',     label: 'Sales Contract', icon: <List      size={16} /> },
      { href: '/denim/admin/analytics',   label: 'Analytics',    icon: <BarChart2  size={16} /> },
    ],
  },
  {
    label: 'APPROVALS',
    items: [
      { href: '/denim/approvals/pending', label: 'Pending Approvals', icon: <Clock size={16} />, badgeKey: 'PENDING_APPROVAL' },
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
      { href: '/denim/inbox/sacon',         label: 'Sales Contract', icon: <ClipboardCheck size={16} />, badgeKey: 'SACON' },
      { href: '/denim/inbox/warping',        label: 'Warping',        icon: <Wind           size={16} />, badgeKey: 'WARPING'        },
      { href: '/denim/inbox/indigo',          label: 'Indigo',         icon: <Droplets       size={16} />, badgeKey: 'INDIGO'         },
      { href: '/denim/inbox/weaving',          label: 'Weaving',        icon: <Grid2x2        size={16} />, badgeKey: 'WEAVING'        },
      { href: '/denim/inbox/inspect-gray',    label: 'Inspect Gray',    icon: <ScanLine       size={16} />, badgeKey: 'INSPECT_GRAY'  },
      { href: '/denim/inbox/bbsf',           label: 'BBSF',            icon: <Waves          size={16} />, badgeKey: 'BBSF'           },
      { href: '/denim/inbox/inspect-finish',  label: 'Inspect Finish',  icon: <BadgeCheck     size={16} />, badgeKey: 'INSPECT_FINISH'},
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
      padding: collapsed ? '0 18px' : '0 16px',
      borderBottom: `1px solid ${C.border}`,
      borderTop: '1px solid rgba(255,255,255,0.18)',
      flexShrink: 0, gap: 10,
      justifyContent: collapsed ? 'center' : 'flex-start',
    }}>
      {!collapsed && (
        <>
          {/* Brand text */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 14, fontWeight: 700,
              color: C.textWhite,
              letterSpacing: '-0.01em',
              lineHeight: 1.2,
              fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
              textShadow: '0 1px 3px rgba(0,0,0,0.60)',
            }}>
              Sinaran
            </div>
            <div style={{
              fontSize: 9, color: C.textMuted,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              lineHeight: 1.2, marginTop: 3,
              fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
              textShadow: '0 1px 3px rgba(0,0,0,0.60)',
            }}>
              Triputra Textile
            </div>
          </div>
          {/* Collapse toggle */}
          <button
            title="Collapse"
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
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 28, height: 28, borderRadius: C.radiusSm,
            background: hovered ? C.hover : 'transparent',
            border: 'none', cursor: 'pointer',
            color: hovered ? C.textWhite : C.textMuted,
            transition: 'background 150ms, color 150ms',
            filter: hovered ? C.shadowIcon : 'none',
          }}
        >
          <ChevronRight size={14} />
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
      margin: '14px 12px 6px',
      height: 34,
      background: C.searchBg,
      border: `1px solid ${C.searchBorder}`,
      borderRadius: C.radiusMd,
      padding: '0 12px',
      display: 'flex', alignItems: 'center', gap: 8,
    }}>
      <Search size={12} style={{ color: C.textDim, flexShrink: 0, filter: C.shadowIcon }} />
      <span style={{
        fontSize: 11.5, color: C.searchPlaceholder,
        flex: 1, lineHeight: 1,
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      }}>
        Search…
      </span>
      <span style={{
        fontSize: 10,
        background: 'rgba(255,255,255,0.06)',
        borderRadius: 4,
        padding: '1px 5px',
        color: C.textDim,
        flexShrink: 0,
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        letterSpacing: '0.02em',
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
      fontSize: 9,
      fontWeight: 500,
      textTransform: 'uppercase',
      letterSpacing: '0.18em',
      color: C.textMuted,
      padding: '20px 12px 6px',
      borderBottom: `1px solid ${C.border}`,
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      textShadow: '0 1px 3px rgba(0,0,0,0.60)',
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
      <div style={{ position: 'relative', marginBottom: 3 }}>
        <Link
          href={item.href}
          onClick={onClick}
          title={item.label}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 44, height: 36, borderRadius: C.radiusMd,
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
            position: 'fixed', left: 72,
            background: C.popupBg,
            color: C.textWhite,
            fontSize: 12,
            padding: '5px 10px',
            borderRadius: C.radiusSm,
            border: `1px solid ${C.border}`,
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
          }}>
            {item.label}
          </div>
        )}
        {/* Badge */}
        {showBadge && (
          <div style={{
            position: 'absolute', top: 3, right: 3,
            background: C.badgeBg,
            color: C.badgeText,
            borderRadius: 10,
            fontSize: 9,
            fontWeight: 600,
            minWidth: 15, height: 15,
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
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        height: 36,
        padding: '0 12px',
        borderRadius: C.radiusMd,
        background: active ? C.active : hovered ? C.hover : 'transparent',
        backdropFilter: (active || hovered) ? 'blur(8px)' : 'none',
        WebkitBackdropFilter: (active || hovered) ? 'blur(8px)' : 'none',
        textDecoration: 'none',
        transition: 'background 150ms, backdrop-filter 150ms',
        borderLeft: active ? `2px solid ${C.activeBar}` : '2px solid transparent',
      }}
    >
      <span style={{
        display: 'flex', alignItems: 'center', flexShrink: 0,
        color: active || hovered ? C.textWhite : C.textMuted,
        filter: C.shadowIcon,
        transition: 'color 150ms',
      }}>
        {item.icon}
      </span>
      <span style={{
        flex: 1, minWidth: 0, overflow: 'hidden',
        textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        fontWeight: active ? 500 : 400,
        fontSize: 12.5,
        color: active ? C.textWhite : C.textMuted,
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        transition: 'color 150ms',
        textShadow: '0 1px 3px rgba(0,0,0,0.60)',
      }}>
        {item.label}
      </span>
      {showBadge && (
        <span style={{
          marginLeft: 'auto',
          background: C.badgeBg,
          color: C.badgeText,
          borderRadius: 10,
          padding: '1px 7px',
          fontSize: 10,
          fontWeight: 600,
          flexShrink: 0,
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
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
      <div style={{
        display: 'flex', justifyContent: 'center',
        padding: '12px 0 10px',
        borderTop: `1px solid ${C.border}`,
      }}>
        <div style={{
          width: 30, height: 30, borderRadius: '50%',
          background: C.avatarBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 600,
          color: C.avatarText,
          cursor: 'pointer',
          boxShadow: '0 0 10px rgba(139,169,196,0.15)',
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
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
          display: 'flex', alignItems: 'center', gap: 10,
          cursor: 'pointer',
          padding: '7px 6px',
          borderRadius: C.radiusMd,
          background: hovered ? C.hover : 'transparent',
          backdropFilter: hovered ? 'blur(8px)' : 'none',
          WebkitBackdropFilter: hovered ? 'blur(8px)' : 'none',
          transition: 'background 150ms, backdrop-filter 150ms',
        }}
      >
        <div style={{
          width: 30, height: 30, borderRadius: '50%',
          background: C.avatarBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 600,
          color: C.avatarText,
          flexShrink: 0,
          boxShadow: '0 0 10px rgba(139,169,196,0.15)',
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        }}>
          {avatarInitials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 12, fontWeight: 500,
            color: C.textWhite, lineHeight: 1.2,
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
            textShadow: '0 1px 3px rgba(0,0,0,0.60)',
          }}>
            {userName || 'User'}
          </div>
          <div style={{
            fontSize: 9, color: C.textMuted,
            letterSpacing: '0.12em', textTransform: 'uppercase',
            lineHeight: 1.2, marginTop: 2,
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
            textShadow: '0 1px 3px rgba(0,0,0,0.60)',
          }}>
            {ROLE_LABEL[role]}
          </div>
        </div>
        {/* Chevron indicator */}
        <svg
          width="12" height="12" viewBox="0 0 12 12"
          style={{
            color: C.textMuted,
            transition: 'transform 200ms',
            transform: menuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        >
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      </div>

      {/* Popup menu */}
      {menuOpen && (
        <div style={{
          position: 'absolute', bottom: 'calc(100% + 8px)', left: 10, width: 192,
          background: C.popupBg,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: `1px solid ${C.popupBorder}`,
          borderRadius: C.radiusMd,
          padding: 4,
          boxShadow: '0 -4px 28px rgba(0,0,0,0.5)',
          zIndex: 100,
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px 10px' }}>
            <div style={{
              width: 30, height: 30, borderRadius: '50%',
              background: C.avatarBg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 600,
              color: C.avatarText,
              flexShrink: 0,
              boxShadow: '0 0 10px rgba(139,169,196,0.15)',
              fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
            }}>
              {avatarInitials}
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 500, color: C.textWhite, lineHeight: 1.2 }}>
                {userName || 'User'}
              </div>
              <span style={{
                fontSize: 9, color: C.textMuted,
                fontWeight: 500, letterSpacing: '0.10em',
                textTransform: 'uppercase',
                fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
              }}>
                {role}
              </span>
            </div>
          </div>
          <div style={{ height: 1, background: C.popupBorder, margin: '0 4px 4px' }} />
          <MenuItem icon={<User size={13} />}      label="Profile"         onClick={() => setMenuOpen(false)} />
          <MenuItem icon={<Settings size={13} />} label="Change Password"  onClick={() => setMenuOpen(false)} />
          <div style={{ height: 1, background: C.popupBorder, margin: '4px 4px' }} />
          <MenuItem icon={<LogOut size={13} />}   label="Sign Out"         onClick={() => { setMenuOpen(false); onLogout(); }} danger />
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
        display: 'flex', alignItems: 'center', gap: 9,
        width: '100%', padding: '8px 10px',
        border: 'none',
        background: hovered ? (danger ? 'rgba(220,38,38,0.15)' : C.hover) : 'transparent',
        color: danger ? '#FCA5A5' : C.textMuted,
        fontSize: 12,
        cursor: 'pointer',
        borderRadius: C.radiusSm,
        transition: 'background 150ms, color 150ms',
        textAlign: 'left',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
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
    const isCollapsed = stored === 'true';
    setCollapsed(isCollapsed);
    document.documentElement.style.setProperty(
      '--sidebar-w', isCollapsed ? `${C.sidebarCollapsed}px` : `${C.sidebarWidth}px`
    );
  }, []);

  const handleToggleCollapse = (next: boolean) => {
    setCollapsed(next);
    localStorage.setItem('sidebar_collapsed', String(next));
    document.documentElement.style.setProperty(
      '--sidebar-w', next ? `${C.sidebarCollapsed}px` : `${C.sidebarWidth}px`
    );
  };

  if (!user) return null;

  return (
    <SidebarContext.Provider
      value={{
        isOpen, collapsed,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
        toggle: () => setIsOpen(o => !o),
        toggleCollapse: () => handleToggleCollapse(!collapsed),
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
            background: 'linear-gradient(to bottom, rgba(8,13,26,0.10) 0%, rgba(8,13,26,0.28) 100%)',
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
      {/* Gradient overlay — lighter, lets denim texture breathe */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
        background: 'linear-gradient(to bottom, rgba(8,13,26,0.10) 0%, rgba(8,13,26,0.28) 100%)',
      }} />

      {/* All content: above the gradient */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <LogoHeader collapsed={collapsed} onToggle={toggleCollapse} />
        <SearchBar collapsed={collapsed} />
        <nav style={{
          flex: 1, overflowY: 'auto', overflowX: 'hidden',
          padding: '4px 12px 24px',
          display: 'flex', flexDirection: 'column',
          gap: collapsed ? 6 : 0,
        }}>
          {navSections.map(section => (
            <div key={section.label}>
              {!collapsed && section.label && <SectionLabel label={section.label} />}
              {!collapsed && !section.label && <div style={{ height: 12 }} />}
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

  const navSections: NavSection[] =
    role === 'admin'   ? ADMIN_NAV
    : role === 'jakarta' ? JAKARTA_NAV
    : buildFactoryNav();

  return (
    <nav style={{ flex: 1, overflowY: 'auto', padding: '4px 12px 24px' }}>
      {navSections.map(section => (
        <div key={section.label}>
          {section.label && <SectionLabel label={section.label} />}
          {!section.label && <div style={{ height: 12 }} />}
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
