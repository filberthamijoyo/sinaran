import WeavingFormPage from '../../../../../components/denim/WeavingFormPage';

export default async function Page({ params }: { params: Promise<{ kp: string }> }) {
  const { kp } = await params;
  return <WeavingFormPage kp={kp} />;
}
