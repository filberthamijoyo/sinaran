'use client';

import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter, DialogDescription,
} from '../../ui/dialog';
import { Button } from '@/components/ui/button';
import { XCircle, CheckCircle2, Loader2, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

type SC = {
  kp: string;
  codename: string | null;
  permintaan: string | null;
  kat_kode: string | null;
  status: string | null;
  te: number | null;
  ket_warna: string | null;
  tgl: string;
};

const formatDate = (iso: string) => {
  try { return format(new Date(iso), 'd MMM yyyy'); }
  catch { return '—'; }
};

interface SingleRejectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sc: SC | null;
  rejectionReason: string;
  onReasonChange: (v: string) => void;
  actioning: 'approve' | 'reject' | null;
  onApprove: () => void;
  onReject: () => void;
}

export default function SingleRejectModal({
  open, onOpenChange, sc, rejectionReason, onReasonChange, actioning, onApprove, onReject,
}: SingleRejectModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{ border: '1px solid #C1C7CE' }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="font-mono" style={{ color: '#0061A4' }}>{sc?.kp}</span>
            <span className="font-normal text-sm" style={{ color: '#41474D' }}>— Review Order</span>
          </DialogTitle>
          <a
            href={sc ? `/denim/admin/orders/${sc.kp}` : '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs hover:underline flex items-center gap-1"
            style={{ color: '#0061A4' }}
          >
            View full order <ExternalLink className="w-3 h-3" />
          </a>
        </DialogHeader>

        {sc && (
          <div className="space-y-4">
            <div className="rounded-xl p-4 grid grid-cols-2 gap-3 text-sm"
              style={{}}>
              <div>
                <p className="text-xs mb-0.5" style={{ color: '#41474D' }}>Construction</p>
                <p className="font-medium" style={{ color: '#181C20' }}>{sc.codename || '—'}</p>
              </div>
              <div>
                <p className="text-xs mb-0.5" style={{ color: '#41474D' }}>Type</p>
                <p className="font-medium" style={{ color: '#181C20' }}>{sc.status || '—'}</p>
              </div>
              <div>
                <p className="text-xs mb-0.5" style={{ color: '#41474D' }}>Customer</p>
                <p className="font-medium" style={{ color: '#181C20' }}>{sc.permintaan || '—'}</p>
              </div>
              <div>
                <p className="text-xs mb-0.5" style={{ color: '#41474D' }}>TE</p>
                <p className="font-mono font-medium" style={{ color: '#181C20' }}>{sc.te?.toLocaleString() || '—'}</p>
              </div>
              <div>
                <p className="text-xs mb-0.5" style={{ color: '#41474D' }}>Color</p>
                <p className="font-medium" style={{ color: '#181C20' }}>{sc.ket_warna || '—'}</p>
              </div>
              <div>
                <p className="text-xs mb-0.5" style={{ color: '#41474D' }}>Date</p>
                <p className="font-medium" style={{ color: '#181C20' }}>{formatDate(sc.tgl)}</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium" style={{ color: '#41474D' }}>
                Rejection Reason <span style={{ color: '#71787E' }}>(optional)</span>
              </label>
              <textarea
                value={rejectionReason}
                onChange={e => onReasonChange(e.target.value)}
                placeholder="e.g. Construction spec needs revision, wrong TE value..."
                rows={3}
                className="w-full text-sm rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-[#0061A4]"
                style={{ color: '#181C20', border: 'none' }}
              />
            </div>

            <DialogDescription className="text-xs" style={{ color: '#41474D' }}>
              Your decision will be immediately sent to the Bandung team. If approved, the order moves to the warping queue.
            </DialogDescription>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" disabled={!!actioning} onClick={onReject}
            style={{ color: '#BA1A1A', borderColor: '#BA1A1A' }}>
            {actioning === 'reject' ? <Loader2 className="w-4 h-4 animate-spin" /> : <><XCircle className="w-4 h-4 mr-1.5" />Reject</>}
          </Button>
          <Button disabled={!!actioning} onClick={onApprove}
            style={{ background: '#006E1C', color: '#FFFFFF', border: 'none' }}>
            {actioning === 'approve' ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle2 className="w-4 h-4 mr-1.5" />Approve</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
