import type { Metadata } from 'next';
import SaconFormPage from '../../../../components/SaconFormPage';

export const metadata: Metadata = {
  title: 'Edit Sacon Record',
  description: 'Edit an existing Sacon division record',
};

export default function SaconEditPage() {
  return <SaconFormPage />;
}

