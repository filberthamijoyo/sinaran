'use client';
import { useEffect, useState } from 'react';
import { Sidebar, useSidebar } from '@/components/layout/sidebar';
import RequireAuth from '@/components/RequireAuth';
import { Toaster } from 'sonner';

const SIDEBAR_EXPANDED = 220;
const SIDEBAR_COLLAPSED = 56;

export default function DenimLayout({ children }: { children: React.ReactNode }) {
  const { isOpen: sidebarOpen, close: closeSidebar, collapsed } = useSidebar();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  const marginLeft = isMobile ? 0 : collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED;

  return (
    <RequireAuth>
      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', backgroundColor: 'var(--page-bg)' }}>

        {/* Mobile overlay */}
        {sidebarOpen && isMobile && (
          <div
            style={{
              position: 'fixed', inset: 0, zIndex: 39,
              background: 'rgba(13,17,23,0.7)', backdropFilter: 'blur(4px)',
            }}
            onClick={closeSidebar}
          />
        )}

        {/* Sidebar */}
        <Sidebar />

        {/* Main content */}
        <main
          style={{
            marginLeft,
            flex: 1,
            minWidth: 0,
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            backgroundColor: '#F0F4F8',
          }}
        >
          {/* Page content — PageShell owns the sticky header */}
          <div style={{ flex: 1, minHeight: '100%' }}>
            {children}
          </div>
        </main>
      </div>

      <Toaster
        position="bottom-right"
        toastOptions={{
          classNames: {
            toast: 'rounded-lg border-[var(--border)] border text-[var(--text-1)]',
            description: 'text-[var(--text-2)]',
            actionButton: 'bg-[var(--blue)] text-white rounded-lg',
            cancelButton: 'rounded-lg border border-[var(--border)]',
            error: 'text-[var(--red)]',
            success: 'text-[var(--green)]',
          },
          style: {
            background: '#FFFFFF',
            boxShadow: 'var(--shadow-md)',
            border: '1px solid var(--border)',
          },
        }}
      />
    </RequireAuth>
  );
}
