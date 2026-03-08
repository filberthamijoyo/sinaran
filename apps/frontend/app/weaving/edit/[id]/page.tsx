import type { Metadata } from 'next';
import WeavingFormPage from '../../../../components/WeavingFormPage';

export const metadata: Metadata = {
  title: 'Edit Weaving Row',
  description: 'Edit an existing weaving record',
};

export default function WeavingEditPage() {
  return <WeavingFormPage />;
}

