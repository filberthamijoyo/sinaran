'use client';

import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { BBSFFormState } from './types';
import { Gauge, Ruler } from 'lucide-react';

const inputStyle = {
  color: '#181C20',
  border: '1px solid #C1C7CE',
};

interface Props {
  form: BBSFFormState;
  setField: (key: keyof BBSFFormState, value: string) => void;
}

export function Sanfor2Form({ form, setField }: Props) {
  return (
    <div className="space-y-6">
      {/* Identity */}
      <div>
        <h3 className="text-xs font-semibold mb-3 flex items-center gap-2" style={{ color: '#41474D' }}>
          <Ruler className="w-3 h-3" /> Identity
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium" style={{ color: '#41474D' }}>Shift</Label>
            <select
              value={form.sf2_shift}
              onChange={e => setField('sf2_shift', e.target.value)}
              className="w-full h-9 px-2 text-sm rounded-[12px]"
              style={{ ...inputStyle, border: 'none' }}
            >
              <option value="">Select...</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium" style={{ color: '#41474D' }}>Jam</Label>
            <Input type="text" value={form.sf2_jam}
              onChange={e => setField('sf2_jam', e.target.value)}
              placeholder="Time" className="h-9 text-sm" style={inputStyle} />
          </div>
        </div>
      </div>

      {/* Settings */}
      <div>
        <h3 className="text-xs font-semibold mb-3 flex items-center gap-2" style={{ color: '#41474D' }}>
          <Gauge className="w-3 h-3" /> Settings
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { key: 'sf2_speed', label: 'Speed', placeholder: 'e.g. 20-21' },
            { key: 'sf2_damping', label: 'Damping (%)', placeholder: 'e.g. -130' },
            { key: 'sf2_press', label: 'Press', placeholder: 'e.g. 1.2' },
            { key: 'sf2_tension', label: 'Tension', placeholder: 'e.g. 5' },
            { key: 'sf2_temperatur', label: 'Temperature (°C)', placeholder: 'e.g. 70' },
          ].map(({ key, label, placeholder }) => (
            <div key={key} className="space-y-1.5">
              <Label className="text-xs font-medium" style={{ color: '#41474D' }}>{label}</Label>
              <Input type="text" value={form[key as keyof BBSFFormState] as string}
                onChange={e => setField(key as keyof BBSFFormState, e.target.value)}
                placeholder={placeholder} className="h-9 text-sm" style={inputStyle} />
            </div>
          ))}
        </div>
      </div>

      {/* Output */}
      <div>
        <h3 className="text-xs font-semibold mb-3 flex items-center gap-2" style={{ color: '#41474D' }}>
          <Gauge className="w-3 h-3" /> Output
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { key: 'sf2_susut', label: 'Susut (%)', placeholder: 'e.g. 20-21' },
            { key: 'sf2_awal', label: 'Awal', placeholder: 'Initial' },
            { key: 'sf2_akhir', label: 'Akhir', placeholder: 'Final' },
            { key: 'sf2_panjang', label: 'Panjang', placeholder: 'Length' },
          ].map(({ key, label, placeholder }) => (
            <div key={key} className="space-y-1.5">
              <Label className="text-xs font-medium" style={{ color: '#41474D' }}>{label}</Label>
              <Input type="text" value={form[key as keyof BBSFFormState] as string}
                onChange={e => setField(key as keyof BBSFFormState, e.target.value)}
                placeholder={placeholder} className="h-9 text-sm" style={inputStyle} />
            </div>
          ))}
        </div>
      </div>

      {/* Problems & Operator */}
      <div>
        <h3 className="text-xs font-semibold mb-3" style={{ color: '#41474D' }}>Problems & Operator</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium" style={{ color: '#41474D' }}>Permasalahan (Problems)</Label>
            <Input type="text" value={form.sf2_permasalahan}
              onChange={e => setField('sf2_permasalahan', e.target.value)}
              placeholder="Any issues noted..." className="h-9 text-sm" style={inputStyle} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium" style={{ color: '#41474D' }}>Pelaksana (Operator)</Label>
            <Input type="text" value={form.sf2_pelaksana}
              onChange={e => setField('sf2_pelaksana', e.target.value)}
              placeholder="Operator name" className="h-9 text-sm" style={inputStyle} />
          </div>
        </div>
      </div>
    </div>
  );
}
