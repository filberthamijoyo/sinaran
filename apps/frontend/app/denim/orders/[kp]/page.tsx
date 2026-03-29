import OrderDetailPage from '../../../../components/denim/admin/OrderDetailPage';

export const dynamic = 'force-dynamic'

export default async function Page({
  params,
}: { params: Promise<{ kp: string }> }) {
  const { kp } = await params;
  return <OrderDetailPage kp={kp} />;
}
