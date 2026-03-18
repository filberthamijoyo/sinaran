import BBSFFormPage from '../../../../../components/denim/BBSFFormPage';

export default async function Page({ params, searchParams }: { params: Promise<{ kp: string }>; searchParams: Promise<{ edit?: string }> }) {
  const { kp } = await params;
  const { edit } = await searchParams;
  return <BBSFFormPage kp={kp} editMode={edit === '1'} />;
}
