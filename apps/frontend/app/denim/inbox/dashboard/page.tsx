import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function Page() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get('erp_user')?.value;
  try {
    const user = JSON.parse(decodeURIComponent(userCookie ?? ''));
    const stage = user?.stage ?? 'warping';
    redirect(`/denim/inbox/${stage}`);
  } catch {
    redirect('/denim/inbox/warping');
  }
}
