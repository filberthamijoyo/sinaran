import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * DenimRoot — /denim landing page.
 *
 * Runs entirely on the server. Reads the auth cookie directly from the
 * incoming request via Next.js 15's cookies() API (no client JavaScript).
 *
 * Role routing:
 *   admin    → /denim/admin/dashboard
 *   jakarta  → /denim/approvals/pending
 *   factory  → /denim/inbox/{stage}  (defaults to warping)
 *
 * Unauthenticated or corrupt cookie → /login.
 */
export default async function DenimRoot() {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get('erp_token')?.value;
  const userCookie = cookieStore.get('erp_user')?.value;

  if (!tokenCookie || !userCookie) {
    redirect('/login');
  }

  try {
    const user = JSON.parse(decodeURIComponent(userCookie as string));
    const role = user?.role;
    const stage = user?.stage;

    if (role === 'admin') redirect('/denim/admin/dashboard');
    if (role === 'jakarta') redirect('/denim/approvals/pending');
    if (role === 'factory') {
      const safeStage =
        stage && stage !== 'undefined' && stage !== 'null' && stage.length > 0
          ? stage
          : 'warping';
      redirect(`/denim/inbox/${safeStage}`);
    }

    // Unknown role or missing role → /login
    redirect('/login');
  } catch {
    // Corrupt cookie → /login
    redirect('/login');
  }
}
