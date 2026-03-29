interface FormGridProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function FormGrid({ children, className, style }: FormGridProps) {
  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 gap-4${className ? ` ${className}` : ''}`}
      style={style}
    >
      {children}
    </div>
  );
}

export function FormField({
  label,
  children,
  spanFull = false,
}: {
  label: string;
  children: React.ReactNode;
  spanFull?: boolean;
}) {
  return (
    <div className={spanFull ? 'md:col-span-2' : undefined}>
      <label
        style={{
          display: 'block',
          fontSize: 13,
          fontWeight: 500,
          color: 'var(--text-secondary)',
          marginBottom: 6,
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

export function FormFieldSpan({ children }: { children: React.ReactNode }) {
  return <div className="md:col-span-2">{children}</div>;
}
