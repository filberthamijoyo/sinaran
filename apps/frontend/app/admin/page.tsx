import type { Metadata, Viewport } from 'next';
import AdminPanelClient from '../../components/AdminPanelClient';

export const metadata: Metadata = {
  title: 'Quality Settings - ERP',
  description: 'Manage dimension tables and lookup data for the Quality module',
};

export const viewport: Viewport = {
  themeColor: '#000000',
};

export default function AdminPage() {
  return <AdminPanelClient />;
}
