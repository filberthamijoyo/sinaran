import AdminOrdersPage from '@/components/denim/admin/AdminOrdersPage';

export const dynamic = 'force-dynamic';

export default async function Page() {
  let initialData = null;
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost';
    const port = process.env.NEXT_PUBLIC_API_PORT;
    const isProduction =
      baseUrl.startsWith('https://') ||
      (baseUrl.startsWith('http://') && !baseUrl.includes('localhost'));
    const effectivePort = port || (isProduction ? '' : '3001');
    const apiBase = effectivePort
      ? `${baseUrl.replace(/\/$/, '')}:${effectivePort}/api`
      : `${baseUrl.replace(/\/$/, '')}/api`;

    const res = await fetch(
      `${apiBase}/denim/sales-contracts?limit=50&page=1`,
      { next: { revalidate: 30 }, headers: { 'x-internal': '1' } }
    );
    if (res.ok) initialData = await res.json();
  } catch {}
  return <AdminOrdersPage initialData={initialData} />;
}
