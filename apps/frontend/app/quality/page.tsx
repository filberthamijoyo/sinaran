import type { Metadata } from 'next';
import YarnQualityListPage from '../../components/YarnQualityListPage';

export const metadata: Metadata = {
  title: 'Quality',
  description: 'Yarn quality database',
};

export default function QualityPage() {
  return <YarnQualityListPage />;
}

