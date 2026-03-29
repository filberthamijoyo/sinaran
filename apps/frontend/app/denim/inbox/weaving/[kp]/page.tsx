import WeavingDetailPage from '@/components/denim/WeavingDetailPage';

interface Props {
  params: Promise<{ kp: string }>;
}

export default async function WeavingPage({ params }: Props) {
  const { kp } = await params;
  return <WeavingDetailPage kp={kp} />;
}
