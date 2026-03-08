import InspectGrayFormPage from '../../../../../components/denim/InspectGrayFormPage';

export default async function Page({ params }: { params: Promise<{ kp: string }> }) {
  const { kp } = await params;
  return <InspectGrayFormPage kp={kp} />;
}
