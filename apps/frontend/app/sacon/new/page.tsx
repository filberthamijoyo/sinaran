import type { Metadata } from 'next';
import SaconFormPage from '../../../components/SaconFormPage';

export const metadata: Metadata = {
  title: 'New Sacon Record',
  description: 'Create a new Sacon division record',
};

export default function SaconNewPage() {
  return <SaconFormPage />;
}

