import PipelineGraphPage from '../../../../components/denim/admin/PipelineGraphPage';

export default async function Page({ searchParams }: { searchParams: Promise<{ kp?: string; sn?: string; beam?: string }> }) {
  const params = await searchParams;
  return <PipelineGraphPage kp={params.kp} sn={params.sn} beam={params.beam} />;
}
