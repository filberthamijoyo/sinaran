import React from 'react';
import {
  LayoutDashboard, List, Archive, Layers, BarChart2,
  Wind, Droplets, Grid2x2, ScanLine, Waves, BadgeCheck,
  Clock, CheckCircle, XCircle,
  Factory, FlaskConical,
  TrendingUp, Cpu, GitCompare, Activity,
  Building2, HardHat,
  FileText,
  Package, ClipboardCheck,
} from 'lucide-react';

export type NavItemDef = {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
};

export type NavSection = {
  label: string;
  items: NavItemDef[];
  /** Section starts open (default: true) */
  defaultOpen?: boolean;
};

export const ADMIN_NAV: NavSection[] = [
  {
    label: 'Dashboard',
    items: [
      { href: '/denim/admin/dashboard?tab=admin',   label: 'Admin / Owner', icon: <LayoutDashboard size={18} strokeWidth={2} /> },
      { href: '/denim/admin/dashboard?tab=factory',  label: 'Factory',        icon: <HardHat        size={18} strokeWidth={2} /> },
      { href: '/denim/admin/dashboard?tab=jakarta',  label: 'Jakarta HQ',    icon: <Building2      size={18} strokeWidth={2} /> },
    ],
  },
  {
    label: 'Analytics',
    items: [
      { href: '/denim/admin/analytics?tab=overview',    label: 'Overview',      icon: <TrendingUp  size={18} strokeWidth={2} /> },
      { href: '/denim/admin/analytics?tab=weaving',    label: 'Weaving',       icon: <BarChart2    size={18} strokeWidth={2} /> },
      { href: '/denim/admin/analytics?tab=machines',    label: 'Machines',      icon: <Cpu         size={18} strokeWidth={2} /> },
      { href: '/denim/admin/analytics?tab=comparison',   label: 'KP Comparison', icon: <GitCompare  size={18} strokeWidth={2} /> },
      { href: '/denim/admin/analytics?tab=production',  label: 'Production',    icon: <Activity    size={18} strokeWidth={2} /> },
    ],
  },
  {
    label: 'Orders',
    items: [
      { href: '/denim/admin/orders',       label: 'All Orders',    icon: <List      size={18} strokeWidth={2} /> },
      { href: '/denim/admin/kp-archive',  label: 'KP Archive',    icon: <Archive   size={18} strokeWidth={2} /> },
      { href: '/denim/admin/fabric-specs', label: 'Fabric Specs',  icon: <Layers    size={18} strokeWidth={2} /> },
      { href: '/denim/sales-contract',     label: 'Sales Contract',icon: <FileText  size={18} strokeWidth={2} /> },
    ],
  },
  {
    label: 'Pipeline',
    items: [
      { href: '/denim/inbox/warping',       label: 'Warping',        icon: <Wind       size={18} strokeWidth={2} /> },
      { href: '/denim/inbox/indigo',         label: 'Indigo',         icon: <Droplets   size={18} strokeWidth={2} /> },
      { href: '/denim/inbox/weaving',         label: 'Weaving',        icon: <Grid2x2    size={18} strokeWidth={2} /> },
      { href: '/denim/inbox/inspect-gray',   label: 'Inspect Gray',   icon: <ScanLine   size={18} strokeWidth={2} /> },
      { href: '/denim/inbox/bbsf',           label: 'BBSF',           icon: <Waves      size={18} strokeWidth={2} /> },
      { href: '/denim/inbox/inspect-finish', label: 'Inspect Finish', icon: <BadgeCheck size={18} strokeWidth={2} /> },
    ],
  },
  {
    label: 'Approvals',
    items: [
      { href: '/denim/approvals/pending',  label: 'Pending',       icon: <Clock         size={18} strokeWidth={2} />, badge: 0 },
      { href: '/denim/inbox/sacon',        label: 'Sacon Inbox',   icon: <Package       size={18} strokeWidth={2} /> },
      { href: '/denim/approvals/sacon',    label: 'Sacon Approval',icon: <ClipboardCheck size={18} strokeWidth={2} /> },
      { href: '/denim/approvals/approved', label: 'Approved',     icon: <CheckCircle   size={18} strokeWidth={2} /> },
      { href: '/denim/approvals/rejected', label: 'Rejected',     icon: <XCircle       size={18} strokeWidth={2} /> },
    ],
  },
  {
    label: 'Spinning',
    items: [
      { href: '/production',   label: 'Production',   icon: <Factory      size={18} strokeWidth={2} /> },
      { href: '/yarn-quality', label: 'Yarn Quality',  icon: <FlaskConical size={18} strokeWidth={2} /> },
    ],
  },
];

export const FACTORY_NAV: NavSection[] = [
  {
    label: 'Dashboard',
    items: [
      { href: '/denim/admin/dashboard?tab=factory', label: 'Factory', icon: <HardHat size={18} strokeWidth={2} /> },
    ],
  },
  {
    label: 'Orders',
    items: [
      { href: '/denim/admin/orders',      label: 'All Orders',    icon: <List      size={18} strokeWidth={2} /> },
      { href: '/denim/sales-contract',    label: 'Sales Contract',icon: <FileText  size={18} strokeWidth={2} /> },
    ],
  },
  {
    label: 'Pipeline',
    items: [
      { href: '/denim/inbox/warping',       label: 'Warping',        icon: <Wind       size={18} strokeWidth={2} /> },
      { href: '/denim/inbox/indigo',         label: 'Indigo',         icon: <Droplets   size={18} strokeWidth={2} /> },
      { href: '/denim/inbox/weaving',         label: 'Weaving',        icon: <Grid2x2    size={18} strokeWidth={2} /> },
      { href: '/denim/inbox/inspect-gray',   label: 'Inspect Gray',   icon: <ScanLine   size={18} strokeWidth={2} /> },
      { href: '/denim/inbox/bbsf',           label: 'BBSF',           icon: <Waves      size={18} strokeWidth={2} /> },
      { href: '/denim/inbox/inspect-finish', label: 'Inspect Finish', icon: <BadgeCheck size={18} strokeWidth={2} /> },
    ],
  },
  {
    label: 'Spinning',
    items: [
      { href: '/production',   label: 'Production',   icon: <Factory      size={18} strokeWidth={2} /> },
      { href: '/yarn-quality', label: 'Yarn Quality',  icon: <FlaskConical size={18} strokeWidth={2} /> },
    ],
  },
];

export const JAKARTA_NAV: NavSection[] = [
  {
    label: 'Dashboard',
    items: [
      { href: '/denim/admin/dashboard?tab=jakarta', label: 'Jakarta HQ', icon: <Building2 size={18} strokeWidth={2} /> },
    ],
  },
  {
    label: 'Orders',
    items: [
      { href: '/denim/admin/orders',       label: 'All Orders',     icon: <List      size={18} strokeWidth={2} /> },
      { href: '/denim/admin/kp-archive',  label: 'KP Archive',     icon: <Archive   size={18} strokeWidth={2} /> },
      { href: '/denim/admin/fabric-specs', label: 'Fabric Specs',   icon: <Layers    size={18} strokeWidth={2} /> },
      { href: '/denim/sales-contract',     label: 'Sales Contract', icon: <FileText  size={18} strokeWidth={2} /> },
    ],
  },
  {
    label: 'Pipeline',
    items: [
      { href: '/denim/inbox/warping',       label: 'Warping',        icon: <Wind       size={18} strokeWidth={2} /> },
      { href: '/denim/inbox/indigo',         label: 'Indigo',         icon: <Droplets   size={18} strokeWidth={2} /> },
      { href: '/denim/inbox/weaving',         label: 'Weaving',        icon: <Grid2x2    size={18} strokeWidth={2} /> },
      { href: '/denim/inbox/inspect-gray',   label: 'Inspect Gray',   icon: <ScanLine   size={18} strokeWidth={2} /> },
      { href: '/denim/inbox/bbsf',           label: 'BBSF',           icon: <Waves      size={18} strokeWidth={2} /> },
      { href: '/denim/inbox/inspect-finish', label: 'Inspect Finish', icon: <BadgeCheck size={18} strokeWidth={2} /> },
    ],
  },
  {
    label: 'Approvals',
    items: [
      { href: '/denim/approvals/pending',  label: 'Pending',       icon: <Clock         size={18} strokeWidth={2} />, badge: 0 },
      { href: '/denim/inbox/sacon',        label: 'Sacon Inbox',   icon: <Package       size={18} strokeWidth={2} /> },
      { href: '/denim/approvals/sacon',    label: 'Sacon Approval',icon: <ClipboardCheck size={18} strokeWidth={2} /> },
      { href: '/denim/approvals/approved', label: 'Approved',     icon: <CheckCircle   size={18} strokeWidth={2} /> },
      { href: '/denim/approvals/rejected', label: 'Rejected',     icon: <XCircle       size={18} strokeWidth={2} /> },
    ],
  },
  {
    label: 'Spinning',
    items: [
      { href: '/production',   label: 'Production',   icon: <Factory      size={18} strokeWidth={2} /> },
      { href: '/yarn-quality', label: 'Yarn Quality',  icon: <FlaskConical size={18} strokeWidth={2} /> },
    ],
  },
];
