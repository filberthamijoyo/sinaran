import WarpingFormPage from '../../../../../components/denim/WarpingFormPage';

export default async function Page({
  params,
}: {
  params: Promise<{ kp: string }>;
}) {
  const { kp } = await params;
  return <WarpingFormPage kp={kp} />;
}
