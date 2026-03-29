'use client';

export default function OrdersError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh',
        padding: '2rem',
        textAlign: 'center',
        gap: '1rem',
      }}
    >
      <p style={{ fontSize: 14, color: '#6B7280' }}>Orders error</p>
      <p style={{ fontSize: 13, color: '#9CA3AF', maxWidth: 400 }}>{error?.message || 'Failed to load orders.'}</p>
      <button
        onClick={reset}
        style={{
          height: 36,
          padding: '0 1rem',
          background: '#1D4ED8',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          fontSize: 13,
          cursor: 'pointer',
        }}
      >
        Try again
      </button>
    </div>
  );
}
