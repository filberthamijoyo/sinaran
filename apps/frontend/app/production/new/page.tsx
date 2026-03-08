import type { Metadata } from 'next';
import ProductionForm from '../../../components/ProductionForm';

export const metadata: Metadata = {
  title: 'New Production Row',
  description: 'Create a new production record',
};

export default function ProductionNewPage() {
  return <ProductionForm />;
}

