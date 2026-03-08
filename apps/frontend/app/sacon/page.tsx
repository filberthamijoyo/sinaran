import type { Metadata } from 'next';
import SaconListPage from '../../components/SaconListPage';

export const metadata: Metadata = {
  title: 'Sacon',
  description: 'Sacon division records',
};

export default function SaconPage() {
  return <SaconListPage />;
}
