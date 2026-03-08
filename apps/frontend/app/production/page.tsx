import type { Metadata } from 'next';
import ProductionList from '../../components/ProductionList';

export const metadata: Metadata = {
  title: 'Production',
  description: 'Production database',
};

export default function ProductionPage() {
  return <ProductionList />;
}

