import type { Metadata } from 'next';
import IndigoFormPage from '../../../../components/IndigoFormPage';

export const metadata: Metadata = {
  title: 'Edit Indigo Row',
  description: 'Edit an existing indigo record',
};

export default function IndigoEditPage() {
  return <IndigoFormPage />;
}

