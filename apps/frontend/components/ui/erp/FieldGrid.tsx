interface FieldGridProps {
  children: React.ReactNode;
  cols?: 2 | 3 | 4;
  className?: string;
}

export function FieldGrid({ children, cols = 3, className }: FieldGridProps) {
  return (
    <div
      className={className}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        gap: '16px 24px',
      }}
    >
      {children}
    </div>
  );
}
