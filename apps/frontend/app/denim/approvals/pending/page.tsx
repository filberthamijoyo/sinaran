import PendingApprovalsPage from '@/components/denim/PendingApprovalsPage'

export const dynamic = 'force-dynamic'

export default async function Page() {
  let initialData = null
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/denim/sales-contracts?status=PENDING&limit=100`,
      { next: { revalidate: 0 }, headers: { 'x-internal': '1' } }
    )
    if (res.ok) initialData = await res.json()
  } catch {}
  return <PendingApprovalsPage initialData={initialData} />
}
