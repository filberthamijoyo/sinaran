import InspectFinishFormPage from '../../../../../components/denim/InspectFinishFormPage';

export default async function Page({ params, searchParams }: { params: Promise<{ kp: string }>; searchParams: Promise<{ edit?: string }> }) {
  const { kp } = await params;
  const { edit } = await searchParams;
  return <InspectFinishFormPage kp={kp} editMode={edit === '1'} />;
}
