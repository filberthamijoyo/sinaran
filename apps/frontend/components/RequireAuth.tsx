'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/AuthContext';

interface Props {
  children: React.ReactNode;
  roles?: string[];
}

export default function RequireAuth({ children, roles }: Props) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Do nothing while context is still reading localStorage or not mounted
    if (!mounted || isLoading) return;

    if (!user) {
      router.replace('/login');
      return;
    }

    if (roles && !roles.includes(user.role)) {
      router.replace('/denim/sales-contract');
    }
  }, [mounted, isLoading, user, roles]);

  // While loading or not mounted: show consistent loading state
  if (!mounted || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="flex items-center gap-2 text-zinc-400 text-sm">
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </div>
      </div>
    );
  }

  // Not logged in: show nothing while redirect fires
  if (!user) return null;

  // Wrong role: show nothing while redirect fires
  if (roles && !roles.includes(user.role)) return null;

  return <>{children}</>;
}
