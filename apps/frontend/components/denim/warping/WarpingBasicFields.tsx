'use client';

import { Clock } from 'lucide-react';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import {
  WarpingFormState,
} from './types';

interface Props {
  form: WarpingFormState;
  setField: (key: keyof Omit<WarpingFormState, 'beams'>, value: string) => void;
}

export default function WarpingBasicFields({ form, setField }: Props) {
  return (
    <div
      className="rounded-[32px] p-6"
      style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.08)' }}
    >
      <h2 className="text-sm font-semibold mb-1" style={{ color: '#181C20' }}>
        Run Details
      </h2>
      <p className="text-xs mb-5" style={{ color: '#41474D' }}>
        <Clock className="w-3 h-3 inline" />
        Enter date and time for this production run
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium" style={{ color: '#41474D' }}>Date</Label>
          <Input type="date" value={form.tgl}
            onChange={e => setField('tgl', e.target.value)}
            className="h-9 text-sm" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium" style={{ color: '#41474D' }}>Start Time</Label>
          <Input type="time" value={form.start}
            onChange={e => setField('start', e.target.value)}
            className="h-9 text-sm" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium" style={{ color: '#41474D' }}>Stop Time</Label>
          <Input type="time" value={form.stop}
            onChange={e => setField('stop', e.target.value)}
            className="h-9 text-sm" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium" style={{ color: '#41474D' }}>RPM</Label>
          <Input type="number" step="0.1" value={form.rpm}
            onChange={e => setField('rpm', e.target.value)}
            placeholder="e.g. 650" className="h-9 text-sm font-mono" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium" style={{ color: '#41474D' }}>Mtr / Min</Label>
          <Input type="number" step="0.01" value={form.mtr_per_min}
            onChange={e => setField('mtr_per_min', e.target.value)}
            placeholder="e.g. 45.5" className="h-9 text-sm font-mono" />
        </div>
      </div>
      {(() => {
        const totalPutusan = form.beams
          .filter(b => b.putusan)
          .reduce((s, b) => s + parseInt(b.putusan || '0'), 0);
        return (
          <div className="flex items-center gap-2 text-sm mt-4">
            <span style={{ color: '#71787E' }}>Total Putusan:</span>
            <span className="font-mono font-semibold" style={{ color: '#181C20' }}>{totalPutusan}</span>
          </div>
        );
      })()}
    </div>
  );
}
