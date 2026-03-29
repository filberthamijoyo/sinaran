'use client';

import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { BBSFFormState } from './types';
import { Droplet, Gauge, Ruler, Thermometer } from 'lucide-react';

const inputStyle = {
  color: '#181C20',
  border: '1px solid #C1C7CE',
};

interface Props {
  form: BBSFFormState;
  setField: (key: keyof BBSFFormState, value: string) => void;
}

export function WashingForm({ form, setField }: Props) {
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
              value={form.ws_shift}
              onChange={e => setField('ws_shift', e.target.value)}
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
            <Input type="text" value={form.ws_mc}
              onChange={e => setField('ws_mc', e.target.value)}
              placeholder="e.g. 1" className="h-9 text-sm" style={inputStyle} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium" style={{ color: '#41474D' }}>Jam Proses</Label>
            <Input type="text" value={form.ws_jam_proses}
              onChange={e => setField('ws_jam_proses', e.target.value)}
              placeholder="e.g. 6.5" className="h-9 text-sm" style={inputStyle} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium" style={{ color: '#41474D' }}>Speed</Label>
            <Input type="text" value={form.ws_speed}
              onChange={e => setField('ws_speed', e.target.value)}
              placeholder="e.g. 37" className="h-9 text-sm" style={inputStyle} />
          </div>
        </div>
      </div>

      {/* Chemical Bath 1 */}
      <div>
        <h3 className="text-xs font-semibold mb-3 flex items-center gap-2" style={{ color: '#41474D' }}>
          <Droplet className="w-3 h-3" /> Chemical Bath 1
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium" style={{ color: '#41474D' }}>Larutan</Label>
            <Input type="text" value={form.ws_larutan_1}
              onChange={e => setField('ws_larutan_1', e.target.value)}
              placeholder="Solution type" className="h-9 text-sm" style={inputStyle} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium" style={{ color: '#41474D' }}>Temperature</Label>
            <Input type="text" value={form.ws_temp_1}
              onChange={e => setField('ws_temp_1', e.target.value)}
              placeholder="e.g. 95" className="h-9 text-sm" style={inputStyle} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium" style={{ color: '#41474D' }}>Press Padder (kg/cm²)</Label>
            <Input type="text" value={form.ws_padder_1}
              onChange={e => setField('ws_padder_1', e.target.value)}
              placeholder="e.g. 3" className="h-9 text-sm" style={inputStyle} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium" style={{ color: '#41474D' }}>Dancing Roll</Label>
            <Input type="text" value={form.ws_dancing_1}
              onChange={e => setField('ws_dancing_1', e.target.value)}
              placeholder="e.g. 4" className="h-9 text-sm" style={inputStyle} />
          </div>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-3 gap-4 mt-4">
          {(['ws_press_dancing_1', 'ws_press_dancing_2', 'ws_press_dancing_3'] as const).map(key => (
            <div key={key} className="space-y-1.5">
              <Label className="text-xs font-medium" style={{ color: '#41474D' }}>
                Press Dancing {key.slice(-1)}
              </Label>
              <Input type="text" value={form[key]}
                onChange={e => setField(key, e.target.value)}
                placeholder="e.g. 3" className="h-9 text-sm" style={inputStyle} />
            </div>
          ))}
        </div>
      </div>

      {/* Chemical Bath 2 */}
      <div>
        <h3 className="text-xs font-semibold mb-3 flex items-center gap-2" style={{ color: '#41474D' }}>
          <Droplet className="w-3 h-3" /> Chemical Bath 2
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium" style={{ color: '#41474D' }}>Larutan</Label>
            <Input type="text" value={form.ws_larutan_2}
              onChange={e => setField('ws_larutan_2', e.target.value)}
              placeholder="Solution type" className="h-9 text-sm" style={inputStyle} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium" style={{ color: '#41474D' }}>Temperature</Label>
            <Input type="text" value={form.ws_temp_2}
              onChange={e => setField('ws_temp_2', e.target.value)}
              placeholder="e.g. 100" className="h-9 text-sm" style={inputStyle} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium" style={{ color: '#41474D' }}>Press Padder (kg/cm²)</Label>
            <Input type="text" value={form.ws_padder_2}
              onChange={e => setField('ws_padder_2', e.target.value)}
              placeholder="e.g. 4" className="h-9 text-sm" style={inputStyle} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium" style={{ color: '#41474D' }}>Dancing Roll</Label>
            <Input type="text" value={form.ws_dancing_2}
              onChange={e => setField('ws_dancing_2', e.target.value)}
              placeholder="e.g. 5" className="h-9 text-sm" style={inputStyle} />
          </div>
        </div>
      </div>

      {/* Machine Settings */}
      <div>
        <h3 className="text-xs font-semibold mb-3 flex items-center gap-2" style={{ color: '#41474D' }}>
          <Gauge className="w-3 h-3" /> Machine Settings
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium" style={{ color: '#41474D' }}>Skala Skew</Label>
            <Input type="text" value={form.ws_skala_skew}
              onChange={e => setField('ws_skala_skew', e.target.value)}
              placeholder="e.g. 0" className="h-9 text-sm" style={inputStyle} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium" style={{ color: '#41474D' }}>Tekanan Boiler</Label>
            <Input type="text" value={form.ws_tekanan_boiler}
              onChange={e => setField('ws_tekanan_boiler', e.target.value)}
              placeholder="e.g. 2.5" className="h-9 text-sm" style={inputStyle} />
          </div>
        </div>
      </div>

      {/* Temperature Zones */}
      <div>
        <h3 className="text-xs font-semibold mb-3 flex items-center gap-2" style={{ color: '#41474D' }}>
          <Thermometer className="w-3 h-3" /> Temperature Zones (1-6)
        </h3>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="space-y-1.5">
              <Label className="text-xs font-medium" style={{ color: '#41474D' }}>Temp {i}</Label>
              <Input type="text" value={form[`ws_temp_zone_${i}` as keyof BBSFFormState] as string}
                onChange={e => setField(`ws_temp_zone_${i}` as keyof BBSFFormState, e.target.value)}
                placeholder="°C" className="h-9 text-sm" style={inputStyle} />
            </div>
          ))}
        </div>
      </div>

      {/* Measurements */}
      <div>
        <h3 className="text-xs font-semibold mb-3 flex items-center gap-2" style={{ color: '#41474D' }}>
          <Ruler className="w-3 h-3" /> Measurements
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium" style={{ color: '#41474D' }}>Lebar Awal (cm)</Label>
            <Input type="text" value={form.ws_lebar_awal}
              onChange={e => setField('ws_lebar_awal', e.target.value)}
              placeholder="e.g. 150" className="h-9 text-sm" style={inputStyle} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium" style={{ color: '#41474D' }}>Panjang Awal (m)</Label>
            <Input type="text" value={form.ws_panjang_awal}
              onChange={e => setField('ws_panjang_awal', e.target.value)}
              placeholder="e.g. 500" className="h-9 text-sm" style={inputStyle} />
          </div>
        </div>
      </div>

      {/* Problems & Operator */}
      <div>
        <h3 className="text-xs font-semibold mb-3" style={{ color: '#41474D' }}>Problems & Operator</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium" style={{ color: '#41474D' }}>Permasalahan (Problems)</Label>
            <Input type="text" value={form.ws_permasalahan}
              onChange={e => setField('ws_permasalahan', e.target.value)}
              placeholder="Any issues noted..." className="h-9 text-sm" style={inputStyle} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium" style={{ color: '#41474D' }}>Pelaksana (Operator)</Label>
            <Input type="text" value={form.ws_pelaksana}
              onChange={e => setField('ws_pelaksana', e.target.value)}
              placeholder="Operator name" className="h-9 text-sm" style={inputStyle} />
          </div>
        </div>
      </div>
    </div>
  );
}
