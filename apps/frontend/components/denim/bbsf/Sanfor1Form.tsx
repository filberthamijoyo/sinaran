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

export function Sanfor1Form({ form, setField }: Props) {
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
              value={form.sf1_shift}
              onChange={e => setField('sf1_shift', e.target.value)}
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
            <Label className="text-xs font-medium" style={{ color: '#41474D' }}>Machine No</Label>
            <Input type="text" value={form.sf1_mc}
              onChange={e => setField('sf1_mc', e.target.value)}
              placeholder="e.g. 1" className="h-9 text-sm" style={inputStyle} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium" style={{ color: '#41474D' }}>Jam</Label>
            <Input type="text" value={form.sf1_jam}
              onChange={e => setField('sf1_jam', e.target.value)}
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
            { key: 'sf1_speed', label: 'Speed', placeholder: 'e.g. 39-40' },
            { key: 'sf1_damping', label: 'Damping (%)', placeholder: 'e.g. -8.5' },
            { key: 'sf1_press', label: 'Press', placeholder: 'e.g. 1.3' },
            { key: 'sf1_tension', label: 'Tension', placeholder: 'e.g. 6' },
            { key: 'sf1_tension_limit', label: 'Tension Limit', placeholder: 'Limit value' },
            { key: 'sf1_temperatur', label: 'Temperature (°C)', placeholder: 'e.g. 80' },
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
          <div className="space-y-1.5">
            <Label className="text-xs font-medium" style={{ color: '#41474D' }}>Susut (%)</Label>
            <Input type="text" value={form.sf1_susut}
              onChange={e => setField('sf1_susut', e.target.value)}
              placeholder="e.g. 120" className="h-9 text-sm" style={inputStyle} />
          </div>
        </div>
      </div>

      {/* Problems & Operator */}
      <div>
        <h3 className="text-xs font-semibold mb-3" style={{ color: '#41474D' }}>Problems & Operator</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium" style={{ color: '#41474D' }}>Permasalahan (Problems)</Label>
            <Input type="text" value={form.sf1_permasalahan}
              onChange={e => setField('sf1_permasalahan', e.target.value)}
              placeholder="Any issues noted..." className="h-9 text-sm" style={inputStyle} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium" style={{ color: '#41474D' }}>Pelaksana (Operator)</Label>
            <Input type="text" value={form.sf1_pelaksana}
              onChange={e => setField('sf1_pelaksana', e.target.value)}
              placeholder="Operator name" className="h-9 text-sm" style={inputStyle} />
          </div>
        </div>
      </div>
    </div>
  );
}
