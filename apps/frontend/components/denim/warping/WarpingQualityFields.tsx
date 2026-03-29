'use client';

import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import {
  WarpingFormState,
} from './types';

interface Props {
  form: WarpingFormState;
  setField: (key: keyof Omit<WarpingFormState, 'beams'>, value: string) => void;
}

export default function WarpingQualityFields({ form, setField }: Props) {
  return (
    <div
      className="rounded-[32px] p-6"
      style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.08)' }}
    >
      <h2 className="text-sm font-semibold mb-5" style={{ color: '#181C20' }}>
        Quality &amp; Machine
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium" style={{ color: '#41474D' }}>Machine No.</Label>
          <Input type="number" value={form.no_mc}
            onChange={e => setField('no_mc', e.target.value)}
            placeholder="e.g. 1" className="h-9 text-sm font-mono" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium" style={{ color: '#41474D' }}>Elongasi %</Label>
          <Input type="number" step="0.01" value={form.elongasi}
            onChange={e => setField('elongasi', e.target.value)}
            placeholder="e.g. 1.5" className="h-9 text-sm font-mono" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium" style={{ color: '#41474D' }}>Strength</Label>
          <Input type="number" step="0.01" value={form.strength}
            onChange={e => setField('strength', e.target.value)}
            placeholder="e.g. 3.5" className="h-9 text-sm font-mono" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium" style={{ color: '#41474D' }}>CV%</Label>
          <Input type="number" step="0.01" value={form.cv_pct}
            onChange={e => setField('cv_pct', e.target.value)}
            placeholder="e.g. 2.1" className="h-9 text-sm font-mono" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium" style={{ color: '#41474D' }}>Tension Badan</Label>
          <Input type="number" value={form.tension_badan}
            onChange={e => setField('tension_badan', e.target.value)}
            placeholder="e.g. 45" className="h-9 text-sm font-mono" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium" style={{ color: '#41474D' }}>Tension Pinggir</Label>
          <Input type="number" value={form.tension_pinggir}
            onChange={e => setField('tension_pinggir', e.target.value)}
            placeholder="e.g. 40" className="h-9 text-sm font-mono" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium" style={{ color: '#41474D' }}>Lebar Creel</Label>
          <Input type="number" value={form.lebar_creel}
            onChange={e => setField('lebar_creel', e.target.value)}
            placeholder="e.g. 180" className="h-9 text-sm font-mono" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium" style={{ color: '#41474D' }}>Jam</Label>
          <Input type="number" step="0.1" value={form.jam}
            onChange={e => setField('jam', e.target.value)}
            placeholder="e.g. 8.5" className="h-9 text-sm font-mono" />
        </div>
      </div>
    </div>
  );
}
