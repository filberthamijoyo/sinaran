'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/AuthContext';

interface Props {
  children: React.ReactNode;
  roles?: string[];
}

export default function RequireAuth({ children, roles }: Props) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Don't do anything while auth is still loading
    if (isLoading) return;
    // Already redirected once — don't loop
    if (hasRedirected.current) return;

    if (!user) {
      hasRedirected.current = true;
      router.replace('/login');
      return;
    }

    if (roles && !roles.includes(user.role)) {
      hasRedirected.current = true;
      const fallback =
        user.role === 'jakarta' ? '/denim/approvals/pending' :
        user.role === 'factory' ? `/denim/inbox/${user.stage ?? 'warping'}` :
        '/denim/admin/dashboard';
      router.replace(fallback);
    }
  }, [user, isLoading, roles, router]);

  // While loading: show nothing (avoids flash)
  if (isLoading) return null;
  // Not logged in: show nothing (redirect fires in useEffect)
  if (!user) return null;
  // Wrong role: show nothing
  if (roles && !roles.includes(user.role)) return null;

  return <>{children}</>;
}
