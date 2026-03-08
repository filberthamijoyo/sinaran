import type { Metadata } from 'next';
import WeavingListPage from '../../components/WeavingListPage';

export const metadata: Metadata = {
  title: 'Weaving',
  description: 'Weaving database',
};

export default function WeavingPage() {
  return <WeavingListPage />;
}
