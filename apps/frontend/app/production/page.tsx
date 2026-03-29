import RequireAuth from '@/components/RequireAuth';
import ProductionList from '@/components/ProductionList';

export default function Page() {
  return (
    <RequireAuth>
      <ProductionList />
    </RequireAuth>
  );
}
