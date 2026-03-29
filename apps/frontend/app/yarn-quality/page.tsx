import RequireAuth from '@/components/RequireAuth';
import YarnQualityListPage from '@/components/YarnQualityListPage';

export default function Page() {
  return (
    <RequireAuth>
      <YarnQualityListPage />
    </RequireAuth>
  );
}
