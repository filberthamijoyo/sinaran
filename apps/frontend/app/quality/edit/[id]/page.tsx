import type { Metadata } from 'next';
import YarnQualityFormPage from '../../../../components/YarnQualityFormPage';

export const metadata: Metadata = {
  title: 'Edit Yarn Test',
  description: 'Edit an existing yarn quality test record',
};

export default function QualityEditPage() {
  return <YarnQualityFormPage />;
}

