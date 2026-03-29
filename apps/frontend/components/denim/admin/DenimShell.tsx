'use client';
import { useState, useEffect } from 'react';
import Sidebar from '../../layout/sidebar/Sidebar';
import NotificationToast from '../../NotificationToast';
import { Toaster } from 'sonner';
import { Menu } from 'lucide-react';

interface DenimShellProps {
  children: React.ReactNode;
}

export default function DenimShell({ children }: DenimShellProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!mounted) {
    return (
      <div
        className="app-bg flex h-screen items-center justify-center"
        style={{ background: '#F2F6FA' }}
      >
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-16 h-16 rounded-[20px] flex items-center justify-center"
            style={{ background: '#4A7A9B', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}
          >
            <span className="font-display text-xl font-bold text-white">S</span>
          </div>
          <p className="text-sm font-medium" style={{ color: '#4B5563' }}>Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Glass overlay for mobile menu */}
      {open && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{
            background: 'rgba(74,122,155,0.25)',
            backdropFilter: 'blur(4px)',
          }}
          onClick={() => setOpen(false)}
        />
      )}

      <div className="app-bg flex h-screen overflow-hidden relative">
        {/* Sidebar */}
        <div className={`
          fixed left-0 top-0 h-screen z-50 transition-transform duration-300 ease-out
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
        `}>
          <Sidebar />
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto min-w-0 flex flex-col relative z-10">

          {/* Mobile top bar */}
          <header
            className="lg:hidden flex items-center justify-between px-4 py-3 sticky top-0 z-30"
            style={{
              background: 'rgba(242,246,250,0.85)',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
            }}
          >
            <button
              onClick={() => setOpen(true)}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200"
              style={{ background: '#EDF3F9', boxShadow: '0 1px 2px rgba(0,0,0,0.08)' }}
            >
              <Menu className="w-5 h-5" style={{ color: '#0F1E2E' }} />
            </button>

            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: '#4A7A9B' }}
              >
                <span className="font-display text-sm font-bold text-white">S</span>
              </div>
              <span className="text-sm font-semibold font-display" style={{ color: '#111827' }}>Sinaran</span>
            </div>

            <div className="w-10" />
          </header>

          {/* Page content */}
          <div className="flex-1 min-h-full">
            {children}
          </div>
        </main>
      </div>

      <NotificationToast />
      <Toaster
        position="bottom-right"
        toastOptions={{
          classNames: {
            toast: 'rounded-2xl border-none font-sans',
            description: 'text-sm',
            actionButton: 'bg-[#4A7A9B] text-white rounded-full',
            cancelButton: 'rounded-full',
          },
          style: {
            background: '#EDF3F9',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            border: '1px solid rgba(255,255,255,0.6)',
            color: '#111827',
          },
        }}
      />
    </>
  );
}
