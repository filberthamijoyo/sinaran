import OrderDetailPage from '@/components/denim/admin/OrderDetailPage';

export const dynamic = 'force-dynamic';

interface Props { params: Promise<{ kp: string }> }

export default async function Page({ params }: Props) {
  const { kp } = await params;
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
      `${apiBase}/denim/admin/pipeline/${encodeURIComponent(kp)}`,
      { next: { revalidate: 0 }, headers: { 'x-internal': '1' } }
    );
    if (res.ok) initialData = await res.json();
  } catch {}
  return <OrderDetailPage kp={kp} initialData={initialData} />;
}
