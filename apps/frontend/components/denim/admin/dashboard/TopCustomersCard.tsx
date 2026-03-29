'use client';

interface Props {
  customers: Array<{ customer: string; count: number }>;
}

export function TopCustomersCard({ customers }: Props) {
  const items = customers.slice(0, 5);

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0D1B2E 0%, #111F35 100%)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 'var(--r4)',
      padding: '20px 22px',
      minHeight: 200,
    }}>
      <p style={{
        fontSize: 11,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 16,
      }}>
        Top Customers
      </p>

      {items.length === 0 ? (
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', textAlign: 'center', paddingTop: 24 }}>
          No customer data
        </p>
      ) : (
        <div>
          {items.map((c, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 0',
                borderBottom: i < items.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                cursor: 'default',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  fontSize: 11,
                  fontFamily: "'IBM Plex Mono', monospace",
                  color: 'rgba(255,255,255,0.2)',
                  width: 20,
                }}>
                  {i + 1}
                </span>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>
                  {c.customer}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{
                  fontSize: 12,
                  fontFamily: "'IBM Plex Mono', monospace",
                  color: '#60A5FA',
                  fontWeight: 600,
                }}>
                  {c.count}
                </span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>
                  orders
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
