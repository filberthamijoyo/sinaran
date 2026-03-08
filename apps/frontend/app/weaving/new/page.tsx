import type { Metadata } from 'next';
import WeavingFormPage from '../../../components/WeavingFormPage';

export const metadata: Metadata = {
  title: 'New Weaving Row',
  description: 'Create a new weaving record',
};

export default function WeavingNewPage() {
  return <WeavingFormPage />;
}

