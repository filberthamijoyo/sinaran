import IndigoFormPage from '../../../../../components/denim/IndigoFormPage';

export default async function Page({ params }: { params: Promise<{ kp: string }> }) {
  const { kp } = await params;
  return <IndigoFormPage kp={kp} />;
}
