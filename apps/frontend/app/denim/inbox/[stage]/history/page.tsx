import InboxHistoryPage from '@/components/denim/InboxHistoryPage'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ stage: string }>
}

export default async function HistoryPage({ params }: Props) {
  const { stage } = await params;
  return <InboxHistoryPage stage={stage} />;
}
