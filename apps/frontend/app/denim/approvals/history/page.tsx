import ApprovalsHistoryPage from '@/components/denim/ApprovalsHistoryPage';

export const dynamic = 'force-dynamic';

export default async function Page() {
  let initialTotal = 0;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/denim/sales-contracts?decided=true&limit=1`,
      { cache: 'no-store', headers: { 'x-internal': '1' } }
    );
    if (res.ok) {
      const json = await res.json() as { pagination?: { total?: number } };
      initialTotal = json?.pagination?.total ?? 0;
    }
  } catch {}

  return <ApprovalsHistoryPage initialTotal={initialTotal} />;
}
