import RequireAuth from '../../components/RequireAuth';
import Sidebar from '../../components/layout/Sidebar';
import { Toaster } from 'sonner';

export default function DenimLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth>
      <div className="flex h-screen bg-zinc-50 overflow-hidden">
        <Sidebar />
        <main className="flex-1 ml-56 overflow-y-auto">
          <div className="min-h-full">
            {children}
          </div>
        </main>
      </div>
      <Toaster
        position="bottom-right"
        toastOptions={{
          classNames: {
            toast: 'bg-zinc-900 border-zinc-700 text-white',
            description: 'text-zinc-400',
            actionButton: 'bg-blue-600',
            cancelButton: 'bg-zinc-700',
            error: 'bg-red-950 border-red-800 text-red-200',
            success: 'bg-green-950 border-green-800 text-green-200',
          },
        }}
      />
    </RequireAuth>
  );
}
