import RequireAuth from '../../../components/RequireAuth';
import DenimSalesContractPage from '../../../components/DenimSalesContractPage';

export const metadata = { title: 'Sales Contract — Denim' };

export default function Page() {
  return (
    <RequireAuth>
      <DenimSalesContractPage />
    </RequireAuth>
  );
}
