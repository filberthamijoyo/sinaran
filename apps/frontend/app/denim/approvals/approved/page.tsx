import { redirect } from 'next/navigation';

export default function Page() {
  redirect('/denim/admin/orders?acc=ACC');
}
