import AdminDashboardPage from '@/components/denim/admin/AdminDashboardPage'

export const dynamic = 'force-dynamic'

export default async function Page() {
  let initialData = null
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/denim/admin/summary`,
      { next: { revalidate: 30 }, headers: { 'x-internal': '1' } }
    )
    if (res.ok) initialData = await res.json()
  } catch {}
  return <AdminDashboardPage initialData={initialData} />
}
