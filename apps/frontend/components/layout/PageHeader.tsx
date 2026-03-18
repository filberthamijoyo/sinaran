import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  backHref?: string;
}

export default function PageHeader({ title, subtitle, actions, backHref }: PageHeaderProps) {
  return (
    <div
      className="flex items-start justify-between px-4 sm:px-6 lg:px-8 pt-6 pb-5 sticky top-0 z-10"
      style={{
        background: '#E0E5EC',
        boxShadow: '0 4px 12px rgb(163 177 198 / 0.4)',
      }}
    >
      <div className="flex-1 min-w-0">
        {backHref && (
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 text-xs font-medium mb-3 group transition-all duration-200"
            style={{ color: '#6B7280' }}
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            Back
          </Link>
        )}
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight truncate font-display" style={{ color: '#3D4852' }}>
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm mt-1.5 truncate" style={{ color: '#6B7280' }}>{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 flex-shrink-0 ml-4">
          {actions}
        </div>
      )}
    </div>
  );
}