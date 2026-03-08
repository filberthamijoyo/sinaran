import type { Metadata } from 'next';
import IndigoListPage from '../../components/IndigoListPage';

export const metadata: Metadata = {
  title: 'Indigo',
  description: 'Indigo database',
};

export default function IndigoPage() {
  return <IndigoListPage />;
}
