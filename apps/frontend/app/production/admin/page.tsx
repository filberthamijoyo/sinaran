import type { Metadata } from 'next';
import ProductionAdminPanel from '../../../components/ProductionAdminPanel';

export const metadata: Metadata = {
  title: 'Production Admin',
  description: 'Manage production dimensions and master data',
};

export default function ProductionAdminPage() {
  return <ProductionAdminPanel />;
}

