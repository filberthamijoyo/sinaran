export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3" style={{ color: '#9CA3AF' }}>
        <div className="w-6 h-6 rounded-full animate-spin" style={{ border: '2px solid rgb(163 177 198 / 0.4)', borderTopColor: '#6C63FF', background: 'transparent' }} />
        <p className="text-sm" style={{ color: '#9CA3AF' }}>Loading…</p>
      </div>
    </div>
  );
}
