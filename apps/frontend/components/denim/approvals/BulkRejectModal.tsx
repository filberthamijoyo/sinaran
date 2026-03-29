'use client';

import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter, DialogDescription,
} from '../../ui/dialog';
import { Button } from '../../ui/button';
import { XCircle, Loader2 } from 'lucide-react';

interface BulkRejectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  rejectionReason: string;
  onReasonChange: (v: string) => void;
  actioning: 'approve' | 'reject' | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function BulkRejectModal({
  open, onOpenChange, selectedCount, rejectionReason, onReasonChange, actioning, onConfirm, onCancel,
}: BulkRejectModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{ border: '1px solid #C1C7CE' }}>
        <DialogHeader>
          <DialogTitle style={{ color: '#181C20' }}>
            Reject {selectedCount} Order{selectedCount > 1 ? 's' : ''}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium" style={{ color: '#41474D' }}>
              Rejection Reason <span style={{ color: '#71787E' }}>(optional — applies to all selected)</span>
            </label>
            <textarea
              value={rejectionReason}
              onChange={e => onReasonChange(e.target.value)}
              placeholder="e.g. Spec revision required, pending customer confirmation..."
              rows={3}
              className="w-full text-sm rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-[#0061A4]"
              style={{ color: '#181C20', border: 'none' }}
            />
          </div>
          <DialogDescription className="text-xs" style={{ color: '#41474E' }}>
            All {selectedCount} selected order{selectedCount > 1 ? 's' : ''} will be archived and the Bandung team will be notified.
          </DialogDescription>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="ghost" disabled={!!actioning} onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="outline" disabled={!!actioning} onClick={onConfirm}
            style={{ color: '#BA1A1A', borderColor: '#BA1A1A' }}>
            {actioning === 'reject' ? <Loader2 className="w-4 h-4 animate-spin" /> : <><XCircle className="w-4 h-4 mr-1.5" />Confirm Reject</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
