'use client';

import dynamic from 'next/dynamic';

const AdminPanel = dynamic(
  () => import('./AdminPanel'),
  { ssr: false },
);

export default function AdminPanelClient() {
  return <AdminPanel />;
}
