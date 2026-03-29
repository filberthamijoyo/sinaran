'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import type { PipelineData } from './order-detail/types';
import { decodeSN } from './roll-trace/utils';
import { DrawerWeavingSection } from './roll-trace/DrawerWeavingSection';
import { DrawerInspectGraySection } from './roll-trace/DrawerInspectGraySection';
import { DrawerBBSFSection } from './roll-trace/DrawerBBSFSection';
import { DrawerInspectFinishSection } from './roll-trace/DrawerInspectFinishSection';

type Props = {
  selectedSN: string;
  data: PipelineData;
  kp: string;
  onClose: () => void;
};

export default function RollTraceDrawer({ selectedSN, data, kp, onClose }: Props) {
  const decoded = decodeSN(selectedSN);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(0,0,0,0.3)' }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="fixed top-0 right-0 z-50 h-full w-[480px] flex flex-col"
        style={{}}
      >
        {/* Header */}
        <div
          className="sticky top-0 z-10 px-5 py-4 flex items-center justify-between shrink-0"
          style={{ borderBottom: '1px solid #C1C7CE' }}
        >
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#71787E' }}>
              Roll Trace
            </p>
            <h2 className="text-base font-mono font-semibold mt-0.5" style={{ color: '#181C20' }}>
              {selectedSN}
            </h2>
            {decoded ? (
              <p className="text-xs mt-0.5" style={{ color: '#41474D' }}>
                Machine <span className="font-semibold">{decoded.machine}</span>
                {' · '}Beam <span className="font-semibold">{decoded.beam}</span>
                {' · '}Lot <span className="font-semibold">{decoded.lot}</span>
              </p>
            ) : (
              <p className="text-xs mt-0.5" style={{ color: '#41474D' }}>
                (SN format not recognised — beam/machine could not be decoded)
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center rounded-lg shrink-0"
            style={{ height: '32px', width: '32px', padding: 0, background: 'transparent', border: 'none', color: '#41474D' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#C1C7CE')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <DrawerWeavingSection selectedSN={selectedSN} kp={kp} data={data} />
          <DrawerInspectGraySection selectedSN={selectedSN} data={data} />
          <DrawerBBSFSection selectedSN={selectedSN} kp={kp} data={data} />
          <DrawerInspectFinishSection selectedSN={selectedSN} data={data} />
        </div>
      </div>
    </>
  );
}
