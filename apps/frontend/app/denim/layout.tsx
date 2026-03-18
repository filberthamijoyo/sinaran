'use client';
import { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import RequireAuth from '../../components/RequireAuth';
import { Toaster } from 'sonner';
import { Menu } from 'lucide-react';

export default function DenimLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ background: '#E0E5EC' }}>
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-16 h-16 rounded-[20px] flex items-center justify-center"
            style={{ boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)', background: '#E0E5EC' }}
          >
            <span className="font-display text-xl font-bold text-[#6C63FF]">S</span>
          </div>
          <p className="text-sm font-medium text-[#6B7280]">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <RequireAuth>
      <div className="flex h-screen overflow-hidden" style={{ background: '#E0E5EC' }}>

        {/* Mobile overlay */}
        {open && (
          <div
            className="fixed inset-0 z-40 lg:hidden"
            style={{ background: 'rgba(61,72,82,0.4)', backdropFilter: 'blur(4px)' }}
            onClick={() => setOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`
          fixed left-0 top-0 h-screen z-50 transition-transform duration-300 ease-out
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
        `}>
          <Sidebar onClose={() => setOpen(false)} />
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto min-w-0 flex flex-col">

          {/* Mobile top bar */}
          <header
            className="lg:hidden flex items-center justify-between px-4 py-3 sticky top-0 z-30"
            style={{
              background: '#E0E5EC',
              boxShadow: '0 4px 12px rgb(163 177 198 / 0.5)',
            }}
          >
            <button
              onClick={() => setOpen(true)}
              className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300"
              style={{ boxShadow: '5px 5px 10px rgb(163 177 198 / 0.6), -5px -5px 10px rgba(255,255,255,0.5)', background: '#E0E5EC' }}
            >
              <Menu className="w-5 h-5 text-[#3D4852]" />
            </button>

            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ boxShadow: '4px 4px 8px rgb(163 177 198 / 0.6), -4px -4px 8px rgba(255,255,255,0.5)', background: '#E0E5EC' }}
              >
                <span className="font-display text-sm font-bold text-[#6C63FF]">S</span>
              </div>
              <span className="text-sm font-semibold text-[#3D4852] font-display">Sinaran</span>
            </div>

            <div className="w-10" />
          </header>

          {/* Page content */}
          <div className="flex-1 min-h-full page-content">
            {children}
          </div>
        </main>
      </div>

      <Toaster
        position="bottom-right"
        toastOptions={{
          classNames: {
            toast: 'rounded-2xl border-none text-[#3D4852] font-sans',
            description: 'text-[#6B7280]',
            actionButton: 'bg-[#6C63FF] text-white rounded-xl',
            cancelButton: 'rounded-xl',
            error: 'text-[#DC2626]',
            success: 'text-[#16A34A]',
          },
          style: {
            background: '#E0E5EC',
            boxShadow: '12px 12px 20px rgb(163 177 198 / 0.7), -12px -12px 20px rgba(255,255,255,0.6)',
            border: 'none',
          },
        }}
      />
    </RequireAuth>
  );
}