import type { Metadata } from 'next';
import ProductionForm from '../../../../components/ProductionForm';

export const metadata: Metadata = {
  title: 'Edit Production Row',
  description: 'Edit an existing production record',
};

export default function ProductionEditPage() {
  return <ProductionForm />;
}

