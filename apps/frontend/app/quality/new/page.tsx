import type { Metadata } from 'next';
import YarnQualityFormPage from '../../../components/YarnQualityFormPage';

export const metadata: Metadata = {
  title: 'New Yarn Test',
  description: 'Create a new yarn quality test record',
};

export default function QualityNewPage() {
  return <YarnQualityFormPage />;
}

