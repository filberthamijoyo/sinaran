import RequireAuth from '@/components/RequireAuth';
import YarnQualityFormPage from '@/components/YarnQualityFormPage';

export default function Page() {
  return (
    <RequireAuth>
      <YarnQualityFormPage />
    </RequireAuth>
  );
}
