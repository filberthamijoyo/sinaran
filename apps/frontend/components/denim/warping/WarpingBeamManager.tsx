'use client';

import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Plus, Trash2 } from 'lucide-react';
import {
  BeamRow,
  WarpingFormState,
} from './types';

interface Props {
  beams: BeamRow[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onSetBeamField: (index: number, key: keyof BeamRow, value: string) => void;
}

export default function WarpingBeamManager({ beams, onAdd, onRemove, onSetBeamField }: Props) {
  return (
    <div
      className="rounded-[32px] p-6"
      style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.08)' }}
    >
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-semibold" style={{ color: '#181C20' }}>
          Beams
          <span className="ml-1 text-xs font-normal" style={{ color: '#41474D' }}>
            ({beams.length})
          </span>
        </h2>
        <Button type="button" variant="outline" size="sm"
          onClick={onAdd} className="h-7 text-xs gap-1">
          <Plus className="w-3 h-3" /> Add Beam
        </Button>
      </div>

      <div className="space-y-2">
        <div className="grid grid-cols-12 gap-3 px-1">
          <p className="col-span-1 text-xs" style={{ color: '#41474D' }}>#</p>
          <p className="col-span-2 text-xs font-medium" style={{ color: '#71787E' }}>Beam No.</p>
          <p className="col-span-3 text-xs font-medium" style={{ color: '#71787E' }}>Panjang (m)</p>
          <p className="col-span-2 text-xs font-medium" style={{ color: '#71787E' }}>Jumlah Ends</p>
          <p className="col-span-2 text-xs font-medium" style={{ color: '#71787E' }}>Putusan</p>
          <p className="col-span-2" />
        </div>

        {beams.map((beam, i) => (
          <div key={i} className="grid grid-cols-12 gap-3 items-center">
            <span className="col-span-1 text-xs" style={{ color: '#41474D' }}>{i + 1}</span>
            <div className="col-span-2">
              <Input type="number" value={beam.beam_number}
                onChange={e => onSetBeamField(i, 'beam_number', e.target.value)}
                placeholder="e.g. 68" className="h-8 text-sm font-mono" />
            </div>
            <div className="col-span-3">
              <Input type="number" step="0.1" value={beam.panjang_beam}
                onChange={e => onSetBeamField(i, 'panjang_beam', e.target.value)}
                placeholder="e.g. 1200" className="h-8 text-sm font-mono" />
            </div>
            <div className="col-span-2">
              <Input type="number" value={beam.jumlah_ends}
                onChange={e => onSetBeamField(i, 'jumlah_ends', e.target.value)}
                placeholder="e.g. 4760" className="h-8 text-sm font-mono" />
            </div>
            <div className="col-span-2">
              <Input type="number" placeholder="Breaks" value={beam.putusan}
                onChange={e => onSetBeamField(i, 'putusan', e.target.value)}
                className="h-8 text-sm w-20 font-mono" />
            </div>
            <div className="col-span-2 flex justify-center">
              {beams.length > 1 && (
                <button type="button"
                  onClick={() => onRemove(i)}
                  onMouseEnter={e => (e.currentTarget.style.color = '#BA1A1A')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#41474D')}
                  style={{ color: '#41474D' }}>
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
