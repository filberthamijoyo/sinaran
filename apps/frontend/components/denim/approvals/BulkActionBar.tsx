'use client';

import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle } from 'lucide-react';

interface BulkActionBarProps {
  selectedCount: number;
  actioning: 'approve' | 'reject' | null;
  onBulkApprove: () => void;
  onBulkReject: () => void;
}

export default function BulkActionBar({
  selectedCount, actioning, onBulkApprove, onBulkReject,
}: BulkActionBarProps) {
  return (
    <div
      className="sticky top-4 z-20 mb-4 flex items-center gap-3 px-5 py-3 rounded-2xl"
      style={{}}
    >
      <span className="text-sm font-semibold" style={{ color: '#181C20' }}>
        {selectedCount} selected
      </span>
      <div className="flex-1" />
      <Button size="sm" variant="outline" disabled={!!actioning}
        onClick={onBulkReject}
        style={{ color: '#BA1A1A', borderColor: '#BA1A1A' }}
      >
        <XCircle className="w-4 h-4 mr-1.5" />
        Reject All
      </Button>
      <Button size="sm" disabled={!!actioning} onClick={onBulkApprove}
        style={{ background: '#006E1C', color: '#FFFFFF', border: 'none' }}
      >
        {actioning === 'approve' ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <><CheckCircle2 className="w-4 h-4 mr-1.5" />Approve All</>
        )}
      </Button>
    </div>
  );
}
