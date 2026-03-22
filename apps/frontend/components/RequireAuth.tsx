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
        <div className="flex items-center gap-2 text-sm" style={{ color: '#9CA3AF' }}>
          <div className="w-4 h-4 rounded-full animate-spin" style={{ border: '2px solid rgb(163 177 198 / 0.4)', borderTopColor: '#6C63FF', background: 'transparent' }} />
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
