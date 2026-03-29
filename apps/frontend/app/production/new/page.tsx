import RequireAuth from '@/components/RequireAuth';
import ProductionForm from '@/components/ProductionForm';

export default function Page() {
  return (
    <RequireAuth>
      <ProductionForm />
    </RequireAuth>
  );
}
