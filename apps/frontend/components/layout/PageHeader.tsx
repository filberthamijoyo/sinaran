interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function PageHeader({
  title,
  subtitle,
  actions,
}: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between px-8 pt-8 pb-6">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900 tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 flex-shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
