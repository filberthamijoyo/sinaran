import InspectGrayFormPage from '../../../../../components/denim/InspectGrayFormPage';

export default async function Page({ params, searchParams }: { params: Promise<{ kp: string }>; searchParams: Promise<{ edit?: string }> }) {
  const { kp } = await params;
  const { edit } = await searchParams;
  return <InspectGrayFormPage kp={kp} editMode={edit === '1'} />;
}
