import type { Metadata } from 'next';
import IndigoFormPage from '../../../components/IndigoFormPage';

export const metadata: Metadata = {
  title: 'New Indigo Row',
  description: 'Create a new indigo record',
};

export default function IndigoNewPage() {
  return <IndigoFormPage />;
}

