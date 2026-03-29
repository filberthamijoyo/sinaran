import FabricSpecsPage from '@/components/denim/admin/FabricSpecsPage'

export const dynamic = 'force-dynamic'

export default async function Page() {
  let initialData = null
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/denim/fabric-specs?limit=100`,
      { next: { revalidate: 60 }, headers: { 'x-internal': '1' } }
    )
    if (res.ok) initialData = await res.json()
  } catch {}
  return <FabricSpecsPage initialData={initialData} />
}
