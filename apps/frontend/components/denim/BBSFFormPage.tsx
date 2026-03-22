'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authFetch } from '../../lib/authFetch';
import PageHeader from '../layout/PageHeader';
import KpContextBanner from './KpContextBanner';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Skeleton } from '../ui/skeleton';
import { Clock, Loader2, Droplet, Thermometer, Gauge, Ruler } from 'lucide-react';
import { toast } from 'sonner';

interface SCData {
  kp: string;
  tgl: string;
  codename: string | null;
  permintaan: string | null;
  kat_kode: string | null;
  ket_warna: string | null;
  te: number | null;
}

interface BBSFFormState {
  // Washing
  ws_shift: string;
  ws_mc: string;
  ws_speed: string;
  ws_larutan_1: string;
  ws_temp_1: string;
  ws_padder_1: string;
  ws_dancing_1: string;
  ws_larutan_2: string;
  ws_temp_2: string;
  ws_padder_2: string;
  ws_dancing_2: string;
  ws_skala_skew: string;
  ws_tekanan_boiler: string;
  ws_press_dancing_1: string;
  ws_press_dancing_2: string;
  ws_press_dancing_3: string;
  ws_temp_zone_1: string;
  ws_temp_zone_2: string;
  ws_temp_zone_3: string;
  ws_temp_zone_4: string;
  ws_temp_zone_5: string;
  ws_temp_zone_6: string;
  ws_lebar_awal: string;
  ws_panjang_awal: string;
  ws_permasalahan: string;
  ws_pelaksana: string;
  ws_jam_proses: string;
  // Sanfor 1
  sf1_sanfor_type: string;
  sf1_shift: string;
  sf1_mc: string;
  sf1_jam: string;
  sf1_speed: string;
  sf1_damping: string;
  sf1_press: string;
  sf1_tension: string;
  sf1_tension_limit: string;
  sf1_temperatur: string;
  sf1_susut: string;
  sf1_permasalahan: string;
  sf1_pelaksana: string;
  // Sanfor 2
  sf2_sanfor_type: string;
  sf2_shift: string;
  sf2_mc: string;
  sf2_jam: string;
  sf2_speed: string;
  sf2_damping: string;
  sf2_press: string;
  sf2_tension: string;
  sf2_temperatur: string;
  sf2_susut: string;
  sf2_awal: string;
  sf2_akhir: string;
  sf2_panjang: string;
  sf2_permasalahan: string;
  sf2_pelaksana: string;
}

const emptyForm = (): BBSFFormState => ({
  // Washing
  ws_shift: '',
  ws_mc: '',
  ws_speed: '',
  ws_larutan_1: '',
  ws_temp_1: '',
  ws_padder_1: '',
  ws_dancing_1: '',
  ws_larutan_2: '',
  ws_temp_2: '',
  ws_padder_2: '',
  ws_dancing_2: '',
  ws_skala_skew: '',
  ws_tekanan_boiler: '',
  ws_press_dancing_1: '',
  ws_press_dancing_2: '',
  ws_press_dancing_3: '',
  ws_temp_zone_1: '',
  ws_temp_zone_2: '',
  ws_temp_zone_3: '',
  ws_temp_zone_4: '',
  ws_temp_zone_5: '',
  ws_temp_zone_6: '',
  ws_lebar_awal: '',
  ws_panjang_awal: '',
  ws_permasalahan: '',
  ws_pelaksana: '',
  ws_jam_proses: '',
  // Sanfor 1
  sf1_sanfor_type: 'SF1',
  sf1_shift: '',
  sf1_mc: '',
  sf1_jam: '',
  sf1_speed: '',
  sf1_damping: '',
  sf1_press: '',
  sf1_tension: '',
  sf1_tension_limit: '',
  sf1_temperatur: '',
  sf1_susut: '',
  sf1_permasalahan: '',
  sf1_pelaksana: '',
  // Sanfor 2
  sf2_sanfor_type: 'SF2',
  sf2_shift: '',
  sf2_mc: '',
  sf2_jam: '',
  sf2_speed: '',
  sf2_damping: '',
  sf2_press: '',
  sf2_tension: '',
  sf2_temperatur: '',
  sf2_susut: '',
  sf2_awal: '',
  sf2_akhir: '',
  sf2_panjang: '',
  sf2_permasalahan: '',
  sf2_pelaksana: '',
});

type TabType = 'washing' | 'sanfor1' | 'sanfor2';

export default function BBSFFormPage({ kp, editMode = false }: { kp: string; editMode?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditMode = editMode || searchParams.get('edit') === '1';
  const [sc, setSc] = useState<SCData | null>(null);
  const [loadingSc, setLoadingSc] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('washing');
  const [loadingExisting, setLoadingExisting] = useState(isEditMode);

  const [form, setForm] = useState<BBSFFormState>(emptyForm());

  useEffect(() => {
    const load = async () => {
      try {
        const data = await authFetch(`/denim/sales-contracts/${kp}`) as any;
        setSc(data);
      } catch (e) {
        toast.error('Failed to load order data.');
      } finally {
        setLoadingSc(false);
      }
    };
    load();
  }, [kp]);

  // Load existing BBSF data when in edit mode
  useEffect(() => {
    if (!isEditMode) return;
    
    const loadExisting = async () => {
      try {
        const data = await authFetch(`/denim/admin/pipeline/${kp}`) as any;
        if (data?.bbsfWashing && data.bbsfWashing.length > 0) {
          const w = data.bbsfWashing[0];
          setForm(f => ({
            ...f,
            ws_shift: w.shift || '',
            ws_mc: w.mc || '',
            ws_speed: w.speed?.toString() || '',
            ws_larutan_1: w.larutan_1?.toString() || '',
            ws_temp_1: w.temp_1?.toString() || '',
            ws_padder_1: w.padder_1?.toString() || '',
            ws_dancing_1: w.dancing_1?.toString() || '',
            ws_larutan_2: w.larutan_2?.toString() || '',
            ws_temp_2: w.temp_2?.toString() || '',
            ws_padder_2: w.padder_2?.toString() || '',
            ws_dancing_2: w.dancing_2?.toString() || '',
            ws_skala_skew: w.skala_skew?.toString() || '',
            ws_tekanan_boiler: w.tekanan_boiler?.toString() || '',
            ws_press_dancing_1: w.press_dancing_1?.toString() || '',
            ws_press_dancing_2: w.press_dancing_2?.toString() || '',
            ws_press_dancing_3: w.press_dancing_3?.toString() || '',
            ws_temp_zone_1: w.temp_zone_1?.toString() || '',
            ws_temp_zone_2: w.temp_zone_2?.toString() || '',
            ws_temp_zone_3: w.temp_zone_3?.toString() || '',
            ws_temp_zone_4: w.temp_zone_4?.toString() || '',
            ws_temp_zone_5: w.temp_zone_5?.toString() || '',
            ws_temp_zone_6: w.temp_zone_6?.toString() || '',
            ws_lebar_awal: w.lebar_awal?.toString() || '',
            ws_panjang_awal: w.panjang_awal?.toString() || '',
            ws_permasalahan: w.permasalahan || '',
            ws_pelaksana: w.pelaksana || '',
            ws_jam_proses: w.jam_proses || '',
          }));
        }
        if (data?.bbsfSanfor && data.bbsfSanfor.length > 0) {
          const s = data.bbsfSanfor[0];
          if (s.sanfor_type === 'SF1') {
            setForm(f => ({
              ...f,
              sf1_sanfor_type: s.sanfor_type || 'SF1',
              sf1_shift: s.shift || '',
              sf1_mc: s.mc || '',
              sf1_jam: s.jam?.toString() || '',
              sf1_speed: s.speed?.toString() || '',
              sf1_damping: s.damping?.toString() || '',
              sf1_press: s.press?.toString() || '',
              sf1_tension: s.tension?.toString() || '',
              sf1_tension_limit: s.tension_limit?.toString() || '',
              sf1_temperatur: s.temperatur?.toString() || '',
              sf1_susut: s.susut?.toString() || '',
              sf1_permasalahan: s.permasalahan || '',
              sf1_pelaksana: s.pelaksana || '',
            }));
          } else {
            setForm(f => ({
              ...f,
              sf2_sanfor_type: s.sanfor_type || 'SF2',
              sf2_shift: s.shift || '',
              sf2_mc: s.mc || '',
              sf2_jam: s.jam?.toString() || '',
              sf2_speed: s.speed?.toString() || '',
              sf2_damping: s.damping?.toString() || '',
              sf2_press: s.press?.toString() || '',
              sf2_tension: s.tension?.toString() || '',
              sf2_temperatur: s.temperatur?.toString() || '',
              sf2_susut: s.susut?.toString() || '',
              sf2_awal: s.awal?.toString() || '',
              sf2_akhir: s.akhir?.toString() || '',
              sf2_panjang: s.panjang?.toString() || '',
              sf2_permasalahan: s.permasalahan || '',
              sf2_pelaksana: s.pelaksana || '',
            }));
          }
        }
      } catch (e) {
        console.error('Failed to load existing data:', e);
      } finally {
        setLoadingExisting(false);
      }
    };
    
    loadExisting();
  }, [isEditMode, kp]);

  const setField = (key: keyof BBSFFormState, value: string) =>
    setForm(f => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await authFetch('/denim/bbsf', {
        method: isEditMode ? 'PUT' : 'POST',
        body: JSON.stringify({
          kp,
          tgl: new Date().toISOString(),
          ...form,
          // Ensure sanfor_type is included for whichever sanfor tab was last active
          sf1_sanfor_type: activeTab === 'sanfor1' || activeTab === 'sanfor2' ? 'SF1' : '',
          sf2_sanfor_type: activeTab === 'sanfor2' ? 'SF2' : '',
        }),
      });
      toast.success(isEditMode ? `BBSF updated for KP ${kp}.` : `BBSF complete for KP ${kp}. Order moved to Inspect Finish.`);
      router.push(isEditMode ? `/denim/admin/orders/${kp}` : '/denim/inbox/bbsf');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save BBSF data.');
    } finally {
      setSubmitting(false);
    }
  };

  const tabs: { id: TabType; label: string }[] = [
    { id: 'washing', label: 'Washing' },
    { id: 'sanfor1', label: 'Sanfor 1' },
    { id: 'sanfor2', label: 'Sanfor 2' },
  ];

  const renderWashingTab = () => (
    <div className="space-y-6">
      {/* Identity */}
      <div>
        <h3 className="text-xs font-semibold mb-3 flex items-center gap-2" style={{ color: '#6B7280' }}>
          <Ruler className="w-3 h-3" /> Identity
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium" style={{ color: '#6B7280' }}>Shift</Label>
            <select
              value={form.ws_shift}
              onChange={e => setField('ws_shift', e.target.value)}
              className="w-full h-9 px-2 text-sm rounded-md"
              style={{
                background: '#E0E5EC',
                color: '#3D4852',
                boxShadow: 'inset 4px 4px 8px rgb(163 177 198 / 0.6), inset -4px -4px 8px rgba(255,255,255,0.5)',
                border: 'none',
              }}
            >
              <option value="">Select...</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium" style={{ color: '#6B7280' }}>Machine No</Label>
            <Input type="text" value={form.ws_mc}
              onChange={e => setField('ws_mc', e.target.value)}
              placeholder="e.g. 1"
              className="h-9 text-sm"
              style={{
                background: '#E0E5EC',
                color: '#3D4852',
                boxShadow: 'inset 4px 4px 8px rgb(163 177 198 / 0.6), inset -4px -4px 8px rgba(255,255,255,0.5)',
                border: 'none',
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium" style={{ color: '#6B7280' }}>Jam Proses</Label>
            <Input type="text" value={form.ws_jam_proses}
              onChange={e => setField('ws_jam_proses', e.target.value)}
              placeholder="e.g. 6.5"
              className="h-9 text-sm"
              style={{
                background: '#E0E5EC',
                color: '#3D4852',
                boxShadow: 'inset 4px 4px 8px rgb(163 177 198 / 0.6), inset -4px -4px 8px rgba(255,255,255,0.5)',
                border: 'none',
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium" style={{ color: '#6B7280' }}>Speed</Label>
            <Input type="text" value={form.ws_speed}
              onChange={e => setField('ws_speed', e.target.value)}
              placeholder="e.g. 37"
              className="h-9 text-sm"
              style={{
                background: '#E0E5EC',
                color: '#3D4852',
                boxShadow: 'inset 4px 4px 8px rgb(163 177 198 / 0.6), inset -4px -4px 8px rgba(255,255,255,0.5)',
                border: 'none',
              }}
            />
          </div>
        </div>
      </div>

      {/* Chemical Bath 1 */}
      <div>
        <h3 className="text-xs font-semibold mb-3 flex items-center gap-2" style={{ color: '#6B7280' }}>
          <Droplet className="w-3 h-3" /> Chemical Bath 1
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium" style={{ color: '#6B7280' }}>Larutan</Label>
            <Input type="text" value={form.ws_larutan_1}
              onChange={e => setField('ws_larutan_1', e.target.value)}
              placeholder="Solution type"
              className="h-9 text-sm"
              style={{
                background: '#E0E5EC',
                color: '#3D4852',
                boxShadow: 'inset 4px 4px 8px rgb(163 177 198 / 0.6), inset -4px -4px 8px rgba(255,255,255,0.5)',
                border: 'none',
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium" style={{ color: '#6B7280' }}>Temperature</Label>
            <Input type="text" value={form.ws_temp_1}
              onChange={e => setField('ws_temp_1', e.target.value)}
              placeholder="e.g. 95"
              className="h-9 text-sm"
              style={{
                background: '#E0E5EC',
                color: '#3D4852',
                boxShadow: 'inset 4px 4px 8px rgb(163 177 198 / 0.6), inset -4px -4px 8px rgba(255,255,255,0.5)',
                border: 'none',
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium" style={{ color: '#6B7280' }}>Press Padder (kg/cm²)</Label>
            <Input type="text" value={form.ws_padder_1}
              onChange={e => setField('ws_padder_1', e.target.value)}
              placeholder="e.g. 3"
              className="h-9 text-sm"
              style={{
                background: '#E0E5EC',
                color: '#3D4852',
                boxShadow: 'inset 4px 4px 8px rgb(163 177 198 / 0.6), inset -4px -4px 8px rgba(255,255,255,0.5)',
                border: 'none',
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium" style={{ color: '#6B7280' }}>Dancing Roll</Label>
            <Input type="text" value={form.ws_dancing_1}
              onChange={e => setField('ws_dancing_1', e.target.value)}
              placeholder="e.g. 4"
              className="h-9 text-sm"
              style={{
                background: '#E0E5EC',
                color: '#3D4852',
                boxShadow: 'inset 4px 4px 8px rgb(163 177 198 / 0.6), inset -4px -4px 8px rgba(255,255,255,0.5)',
                border: 'none',
              }}
            />
          </div>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-3 gap-4 mt-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium" style={{ color: '#6B7280' }}>Press Dancing 1</Label>
            <Input type="text" value={form.ws_press_dancing_1}
              onChange={e => setField('ws_press_dancing_1', e.target.value)}
              placeholder="e.g. 3"
              className="h-9 text-sm"
              style={{
                background: '#E0E5EC',
                color: '#3D4852',
                boxShadow: 'inset 4px 4px 8px rgb(163 177 198 / 0.6), inset -4px -4px 8px rgba(255,255,255,0.5)',
                border: 'none',
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium" style={{ color: '#6B7280' }}>Press Dancing 2</Label>
            <Input type="text" value={form.ws_press_dancing_2}
              onChange={e => setField('ws_press_dancing_2', e.target.value)}
              placeholder="e.g. 3"
              className="h-9 text-sm"
              style={{
                background: '#E0E5EC',
                color: '#3D4852',
                boxShadow: 'inset 4px 4px 8px rgb(163 177 198 / 0.6), inset -4px -4px 8px rgba(255,255,255,0.5)',
                border: 'none',
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium" style={{ color: '#6B7280' }}>Press Dancing 3</Label>
            <Input type="text" value={form.ws_press_dancing_3}
              onChange={e => setField('ws_press_dancing_3', e.target.value)}
              placeholder="e.g. 3"
              className="h-9 text-sm"
              style={{
                background: '#E0E5EC',
                color: '#3D4852',
                boxShadow: 'inset 4px 4px 8px rgb(163 177 198 / 0.6), inset -4px -4px 8px rgba(255,255,255,0.5)',
                border: 'none',
              }}
            />
          </div>
        </div>
      </div>

      {/* Chemical Bath 2 */}
      <div>
        <h3 className="text-xs font-semibold mb-3 flex items-center gap-2" style={{ color: '#6B7280' }}>
          <Droplet className="w-3 h-3" /> Chemical Bath 2
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium" style={{ color: '#6B7280' }}>Larutan</Label>
            <Input type="text" value={form.ws_larutan_2}
              onChange={e => setField('ws_larutan_2', e.target.value)}
              placeholder="Solution type"
              className="h-9 text-sm"
              style={{
                background: '#E0E5EC',
                color: '#3D4852',
                boxShadow: 'inset 4px 4px 8px rgb(163 177 198 / 0.6), inset -4px -4px 8px rgba(255,255,255,0.5)',
                border: 'none',
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium" style={{ color: '#6B7280' }}>Temperature</Label>
            <Input type="text" value={form.ws_temp_2}
              onChange={e => setField('ws_temp_2', e.target.value)}
              placeholder="e.g. 100"
              className="h-9 text-sm"
              style={{
                background: '#E0E5EC',
                color: '#3D4852',
                boxShadow: 'inset 4px 4px 8px rgb(163 177 198 / 0.6), inset -4px -4px 8px rgba(255,255,255,0.5)',
                border: 'none',
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium" style={{ color: '#6B7280' }}>Press Padder (kg/cm²)</Label>
            <Input type="text" value={form.ws_padder_2}
              onChange={e => setField('ws_padder_2', e.target.value)}
              placeholder="e.g. 4"
              className="h-9 text-sm"
              style={{
                background: '#E0E5EC',
                color: '#3D4852',
                boxShadow: 'inset 4px 4px 8px rgb(163 177 198 / 0.6), inset -4px -4px 8px rgba(255,255,255,0.5)',
                border: 'none',
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium" style={{ color: '#6B7280' }}>Dancing Roll</Label>
            <Input type="text" value={form.ws_dancing_2}
              onChange={e => setField('ws_dancing_2', e.target.value)}
              placeholder="e.g. 5"
              className="h-9 text-sm"
              style={{
                background: '#E0E5EC',
                color: '#3D4852',
                boxShadow: 'inset 4px 4px 8px rgb(163 177 198 / 0.6), inset -4px -4px 8px rgba(255,255,255,0.5)',
                border: 'none',
              }}
            />
          </div>
        </div>
      </div>

      {/* Machine Settings */}
      <div>
        <h3 className="text-xs font-semibold mb-3 flex items-center gap-2" style={{ color: '#6B7280' }}>
          <Gauge className="w-3 h-3" /> Machine Settings
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium" style={{ color: '#6B7280' }}>Skala Skew</Label>
            <Input type="text" value={form.ws_skala_skew}
              onChange={e => setField('ws_skala_skew', e.target.value)}
              placeholder="e.g. 0"
              className="h-9 text-sm"
              style={{
                background: '#E0E5EC',
                color: '#3D4852',
                boxShadow: 'inset 4px 4px 8px rgb(163 177 198 / 0.6), inset -4px -4px 8px rgba(255,255,255,0.5)',
                border: 'none',
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium" style={{ color: '#6B7280' }}>Tekanan Boiler</Label>
            <Input type="text" value={form.ws_tekanan_boiler}
              onChange={e => setField('ws_tekanan_boiler', e.target.value)}
              placeholder="e.g. 2.5"
              className="h-9 text-sm"
              style={{
                background: '#E0E5EC',
                color: '#3D4852',
                boxShadow: 'inset 4px 4px 8px rgb(163 177 198 / 0.6), inset -4px -4px 8px rgba(255,255,255,0.5)',
                border: 'none',
              }}
            />
          </div>
        </div>
      </div>

      {/* Temperature Zones */}
      <div>
        <h3 className="text-xs font-semibold mb-3 flex items-center gap-2" style={{ color: '#6B7280' }}>
          <Thermometer className="w-3 h-3" /> Temperature Zones (1-6)
        </h3>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="space-y-1.5">
              <Label className="text-xs font-medium" style={{ color: '#6B7280' }}>Temp {i}</Label>
              <Input type="text" value={form[`ws_temp_zone_${i}` as keyof BBSFFormState] as string}
                onChange={e => setField(`ws_temp_zone_${i}` as keyof BBSFFormState, e.target.value)}
                placeholder="°C"
                className="h-9 text-sm"
                style={{
                  background: '#E0E5EC',
                  color: '#3D4852',
                  boxShadow: 'inset 4px 4px 8px rgb(163 177 198 / 0.6), inset -4px -4px 8px rgba(255,255,255,0.5)',
                  border: 'none',
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Measurements */}
      <div>
        <h3 className="text-xs font-semibold mb-3 flex items-center gap-2" style={{ color: '#6B7280' }}>
          <Ruler className="w-3 h-3" /> Measurements
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium" style={{ color: '#6B7280' }}>Lebar Awal (cm)</Label>
            <Input type="text" value={form.ws_lebar_awal}
              onChange={e => setField('ws_lebar_awal', e.target.value)}
              placeholder="e.g. 150"
              className="h-9 text-sm"
              style={{
                background: '#E0E5EC',
                color: '#3D4852',
                boxShadow: 'inset 4px 4px 8px rgb(163 177 198 / 0.6), inset -4px -4px 8px rgba(255,255,255,0.5)',
                border: 'none',
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium" style={{ color: '#6B7280' }}>Panjang Awal (m)</Label>
            <Input type="text" value={form.ws_panjang_awal}
              onChange={e => setField('ws_panjang_awal', e.target.value)}
              placeholder="e.g. 500"
              className="h-9 text-sm"
              style={{
                background: '#E0E5EC',
                color: '#3D4852',
                boxShadow: 'inset 4px 4px 8px rgb(163 177 198 / 0.6), inset -4px -4px 8px rgba(255,255,255,0.5)',
                border: 'none',
              }}
            />
          </div>
        </div>
      </div>

      {/* Problems & Operator */}
      <div>
        <h3 className="text-xs font-semibold mb-3" style={{ color: '#6B7280' }}>Problems & Operator</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium" style={{ color: '#6B7280' }}>Permasalahan (Problems)</Label>
            <Input type="text" value={form.ws_permasalahan}
              onChange={e => setField('ws_permasalahan', e.target.value)}
              placeholder="Any issues noted..."
              className="h-9 text-sm"
              style={{
                background: '#E0E5EC',
                color: '#3D4852',
                boxShadow: 'inset 4px 4px 8px rgb(163 177 198 / 0.6), inset -4px -4px 8px rgba(255,255,255,0.5)',
                border: 'none',
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium" style={{ color: '#6B7280' }}>Pelaksana (Operator)</Label>
            <Input type="text" value={form.ws_pelaksana}
              onChange={e => setField('ws_pelaksana', e.target.value)}
              placeholder="Operator name"
              className="h-9 text-sm"
              style={{
                background: '#E0E5EC',
                color: '#3D4852',
                boxShadow: 'inset 4px 4px 8px rgb(163 177 198 / 0.6), inset -4px -4px 8px rgba(255,255,255,0.5)',
                border: 'none',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderSanfor1Tab = () => (
    <div className="space-y-6">
      {/* Identity */}
      <div>
        <h3 className="text-xs font-semibold mb-3 flex items-center gap-2" style={{ color: '#6B7280' }}>
          <Ruler className="w-3 h-3" /> Identity
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium" style={{ color: '#6B7280' }}>Shift</Label>
            <select
              value={form.sf1_shift}
              onChange={e => setField('sf1_shift', e.target.value)}
              className="w-full h-9 px-2 text-sm rounded-md"
              style={{
                background: '#E0E5EC',
                color: '#3D4852',
                boxShadow: 'inset 4px 4px 8px rgb(163 177 198 / 0.6), inset -4px -4px 8px rgba(255,255,255,0.5)',
                border: 'none',
              }}
            >
              <option value="">Select...</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium" style={{ color: '#6B7280' }}>Machine No</Label>
            <Input type="text" value={form.sf1_mc}
              onChange={e => setField('sf1_mc', e.target.value)}
              placeholder="e.g. 1"
              className="h-9 text-sm"
              style={{
                background: '#E0E5EC',
                color: '#3D4852',
                boxShadow: 'inset 4px 4px 8px rgb(163 177 198 / 0.6), inset -4px -4px 8px rgba(255,255,255,0.5)',
                border: 'none',
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium" style={{ color: '#6B7280' }}>Jam</Label>
            <Input type="text" value={form.sf1_jam}
              onChange={e => setField('sf1_jam', e.target.value)}
              placeholder="Time"
              className="h-9 text-sm"
              style={{
                background: '#E0E5EC',
                color: '#3D4852',
                boxShadow: 'inset 4px 4px 8px rgb(163 177 198 / 0.6), inset -4px -4px 8px rgba(255,255,255,0.5)',
                border: 'none',
              }}
            />
          </div>
        </div>
      </div>

      {/* Settings */}
      <div>
        <h3 className="text-xs font-semibold mb-3 flex items-center gap-2" style={{ color: '#6B7280' }}>
          <Gauge className="w-3 h-3" /> Settings
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium" style={{ color: '#6B7280' }}>Speed</Label>
            <Input type="text" value={form.sf1_speed}
              onChange={e => setField('sf1_speed', e.target.value)}
              placeholder="e.g. 39-40"
              className="h-9 text-sm"
              style={{
                background: '#E0E5EC',
                color: '#3D4852',
                boxShadow: 'inset 4px 4px 8px rgb(163 177 198 / 0.6), inset -4px -4px 8px rgba(255,255,255,0.5)',
                border: 'none',
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium" style={{ color: '#6B7280' }}>Damping (%)</Label>
            <Input type="text" value={form.sf1_damping}
              onChange={e => setField('sf1_damping', e.target.value)}
              placeholder="e.g. -8.5"
              className="h-9 text-sm"
              style={{
                background: '#E0E5EC',
                color: '#3D4852',
                boxShadow: 'inset 4px 4px 8px rgb(163 177 198 / 0.6), inset -4px -4px 8px rgba(255,255,255,0.5)',
                border: 'none',
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium" style={{ color: '#6B7280' }}>Press</Label>
            <Input type="text" value={form.sf1_press}
              onChange={e => setField('sf1_press', e.target.value)}
              placeholder="e.g. 1.3"
              className="h-9 text-sm"
              style={{
                background: '#E0E5EC',
                color: '#3D4852',
                boxShadow: 'inset 4px 4px 8px rgb(163 177 198 / 0.6), inset -4px -4px 8px rgba(255,255,255,0.5)',
                border: 'none',
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium" style={{ color: '#6B7280' }}>Tension</Label>
            <Input type="text" value={form.sf1_tension}
              onChange={e => setField('sf1_tension', e.target.value)}
              placeholder="e.g. 6"
              className="h-9 text-sm"
              style={{
                background: '#E0E5EC',
                color: '#3D4852',
                boxShadow: 'inset 4px 4px 8px rgb(163 177 198 / 0.6), inset -4px -4px 8px rgba(255,255,255,0.5)',
                border: 'none',
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium" style={{ color: '#6B7280' }}>Tension Limit</Label>
            <Input type="text" value={form.sf1_tension_limit}
              onChange={e => setField('sf1_tension_limit', e.target.value)}
              placeholder="Limit value"
              className="h-9 text-sm"
              style={{
                background: '#E0E5EC',
                color: '#3D4852',
                boxShadow: 'inset 4px 4px 8px rgb(163 177 198 / 0.6), inset -4px -4px 8px rgba(255,255,255,0.5)',
                border: 'none',
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium" style={{ color: '#6B7280' }}>Temperature (°C)</Label>
            <Input type="text" value={form.sf1_temperatur}
              onChange={e => setField('sf1_temperatur', e.target.value)}
              placeholder="e.g. 80"
              className="h-9 text-sm"
              style={{
                background: '#E0E5EC',
                color: '#3D4852',
                boxShadow: 'inset 4px 4px 8px rgb(163 177 198 / 0.6), inset -4px -4px 8px rgba(255,255,255,0.5)',
                border: 'none',
              }}
            />
          </div>
        </div>
      </div>

      {/* Output */}
      <div>
        <h3 className="text-xs font-semibold mb-3 flex items-center gap-2" style={{ color: '#6B7280' }}>
          <Gauge className="w-3 h-3" /> Output
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium" style={{ color: '#6B7280' }}>Susut (%)</Label>
            <Input type="text" value={form.sf1_susut}
              onChange={e => setField('sf1_susut', e.target.value)}
              placeholder="e.g. 120"
              className="h-9 text-sm"
              style={{
                background: '#E0E5EC',
                color: '#3D4852',
                boxShadow: 'inset 4px 4px 8px rgb(163 177 198 / 0.6), inset -4px -4px 8px rgba(255,255,255,0.5)',
                border: 'none',
              }}
            />
          </div>
        </div>
      </div>

      {/* Problems & Operator */}
      <div>
        <h3 className="text-xs font-semibold mb-3" style={{ color: '#6B7280' }}>Problems & Operator</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium" style={{ color: '#6B7280' }}>Permasalahan (Problems)</Label>
            <Input type="text" value={form.sf1_permasalahan}
              onChange={e => setField('sf1_permasalahan', e.target.value)}
              placeholder="Any issues noted..."
              className="h-9 text-sm"
              style={{
                background: '#E0E5EC',
                color: '#3D4852',
                boxShadow: 'inset 4px 4px 8px rgb(163 177 198 / 0.6), inset -4px -4px 8px rgba(255,255,255,0.5)',
                border: 'none',
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium" style={{ color: '#6B7280' }}>Pelaksana (Operator)</Label>
            <Input type="text" value={form.sf1_pelaksana}
              onChange={e => setField('sf1_pelaksana', e.target.value)}
              placeholder="Operator name"
              className="h-9 text-sm"
              style={{
                background: '#E0E5EC',
                color: '#3D4852',
                boxShadow: 'inset 4px 4px 8px rgb(163 177 198 / 0.6), inset -4px -4px 8px rgba(255,255,255,0.5)',
                border: 'none',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderSanfor2Tab = () => (
    <div className="space-y-6">
      {/* Identity */}
      <div>
        <h3 className="text-xs font-semibold mb-3 flex items-center gap-2" style={{ color: '#9CA3AF' }}>
          <Ruler className="w-3 h-3" /> Identity
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium" style={{ color: '#9CA3AF' }}>Shift</Label>
            <select
              value={form.sf2_shift}
              onChange={e => setField('sf2_shift', e.target.value)}
              className="w-full h-9 px-2 text-sm rounded-[16px]"
              style={{
                background: '#E0E5EC',
                color: '#3D4852',
                boxShadow: 'inset 6px 6px 10px rgb(163 177 198 / 0.6), inset -6px -6px 10px rgba(255,255,255,0.5)',
                border: 'none',
              }}
            >
              <option value="">Select...</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium" style={{ color: '#9CA3AF' }}>Machine No</Label>
            <Input type="text" value={form.sf2_mc}
              onChange={e => setField('sf2_mc', e.target.value)}
              placeholder="e.g. 1"
              className="h-9 text-sm"
              style={{
                background: '#E0E5EC',
                color: '#3D4852',
                boxShadow: 'inset 4px 4px 8px rgb(163 177 198 / 0.6), inset -4px -4px 8px rgba(255,255,255,0.5)',
                border: 'none',
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium" style={{ color: '#9CA3AF' }}>Jam</Label>
            <Input type="text" value={form.sf2_jam}
              onChange={e => setField('sf2_jam', e.target.value)}
              placeholder="Time"
              className="h-9 text-sm"
              style={{
                background: '#E0E5EC',
                color: '#3D4852',
                boxShadow: 'inset 4px 4px 8px rgb(163 177 198 / 0.6), inset -4px -4px 8px rgba(255,255,255,0.5)',
                border: 'none',
              }}
            />
          </div>
        </div>
      </div>

      {/* Settings */}
      <div>
        <h3 className="text-xs font-semibold mb-3 flex items-center gap-2" style={{ color: '#9CA3AF' }}>
          <Gauge className="w-3 h-3" /> Settings
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium" style={{ color: '#9CA3AF' }}>Speed</Label>
            <Input type="text" value={form.sf2_speed}
              onChange={e => setField('sf2_speed', e.target.value)}
              placeholder="e.g. 20-21"
              className="h-9 text-sm"
              style={{
                background: '#E0E5EC',
                color: '#3D4852',
                boxShadow: 'inset 4px 4px 8px rgb(163 177 198 / 0.6), inset -4px -4px 8px rgba(255,255,255,0.5)',
                border: 'none',
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium" style={{ color: '#9CA3AF' }}>Damping (%)</Label>
            <Input type="text" value={form.sf2_damping}
              onChange={e => setField('sf2_damping', e.target.value)}
              placeholder="e.g. -130"
              className="h-9 text-sm"
              style={{
                background: '#E0E5EC',
                color: '#3D4852',
                boxShadow: 'inset 4px 4px 8px rgb(163 177 198 / 0.6), inset -4px -4px 8px rgba(255,255,255,0.5)',
                border: 'none',
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium" style={{ color: '#9CA3AF' }}>Press</Label>
            <Input type="text" value={form.sf2_press}
              onChange={e => setField('sf2_press', e.target.value)}
              placeholder="e.g. 1.2"
              className="h-9 text-sm"
              style={{
                background: '#E0E5EC',
                color: '#3D4852',
                boxShadow: 'inset 4px 4px 8px rgb(163 177 198 / 0.6), inset -4px -4px 8px rgba(255,255,255,0.5)',
                border: 'none',
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium" style={{ color: '#9CA3AF' }}>Tension</Label>
            <Input type="text" value={form.sf2_tension}
              onChange={e => setField('sf2_tension', e.target.value)}
              placeholder="e.g. 5"
              className="h-9 text-sm"
              style={{
                background: '#E0E5EC',
                color: '#3D4852',
                boxShadow: 'inset 4px 4px 8px rgb(163 177 198 / 0.6), inset -4px -4px 8px rgba(255,255,255,0.5)',
                border: 'none',
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium" style={{ color: '#9CA3AF' }}>Temperature (°C)</Label>
            <Input type="text" value={form.sf2_temperatur}
              onChange={e => setField('sf2_temperatur', e.target.value)}
              placeholder="e.g. 70"
              className="h-9 text-sm"
              style={{
                background: '#E0E5EC',
                color: '#3D4852',
                boxShadow: 'inset 4px 4px 8px rgb(163 177 198 / 0.6), inset -4px -4px 8px rgba(255,255,255,0.5)',
                border: 'none',
              }}
            />
          </div>
        </div>
      </div>

      {/* Output */}
      <div>
        <h3 className="text-xs font-semibold mb-3 flex items-center gap-2" style={{ color: '#9CA3AF' }}>
          <Gauge className="w-3 h-3" /> Output
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium" style={{ color: '#9CA3AF' }}>Susut (%)</Label>
            <Input type="text" value={form.sf2_susut}
              onChange={e => setField('sf2_susut', e.target.value)}
              placeholder="e.g. 20-21"
              className="h-9 text-sm"
              style={{
                background: '#E0E5EC',
                color: '#3D4852',
                boxShadow: 'inset 4px 4px 8px rgb(163 177 198 / 0.6), inset -4px -4px 8px rgba(255,255,255,0.5)',
                border: 'none',
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium" style={{ color: '#9CA3AF' }}>Awal</Label>
            <Input type="text" value={form.sf2_awal}
              onChange={e => setField('sf2_awal', e.target.value)}
              placeholder="Initial"
              className="h-9 text-sm"
              style={{
                background: '#E0E5EC',
                color: '#3D4852',
                boxShadow: 'inset 4px 4px 8px rgb(163 177 198 / 0.6), inset -4px -4px 8px rgba(255,255,255,0.5)',
                border: 'none',
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium" style={{ color: '#9CA3AF' }}>Akhir</Label>
            <Input type="text" value={form.sf2_akhir}
              onChange={e => setField('sf2_akhir', e.target.value)}
              placeholder="Final"
              className="h-9 text-sm"
              style={{
                background: '#E0E5EC',
                color: '#3D4852',
                boxShadow: 'inset 4px 4px 8px rgb(163 177 198 / 0.6), inset -4px -4px 8px rgba(255,255,255,0.5)',
                border: 'none',
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium" style={{ color: '#9CA3AF' }}>Panjang</Label>
            <Input type="text" value={form.sf2_panjang}
              onChange={e => setField('sf2_panjang', e.target.value)}
              placeholder="Length"
              className="h-9 text-sm"
              style={{
                background: '#E0E5EC',
                color: '#3D4852',
                boxShadow: 'inset 4px 4px 8px rgb(163 177 198 / 0.6), inset -4px -4px 8px rgba(255,255,255,0.5)',
                border: 'none',
              }}
            />
          </div>
        </div>
      </div>

      {/* Problems & Operator */}
      <div>
        <h3 className="text-xs font-semibold mb-3" style={{ color: '#9CA3AF' }}>Problems & Operator</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium" style={{ color: '#9CA3AF' }}>Permasalahan (Problems)</Label>
            <Input type="text" value={form.sf2_permasalahan}
              onChange={e => setField('sf2_permasalahan', e.target.value)}
              placeholder="Any issues noted..."
              className="h-9 text-sm"
              style={{
                background: '#E0E5EC',
                color: '#3D4852',
                boxShadow: 'inset 4px 4px 8px rgb(163 177 198 / 0.6), inset -4px -4px 8px rgba(255,255,255,0.5)',
                border: 'none',
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium" style={{ color: '#9CA3AF' }}>Pelaksana (Operator)</Label>
            <Input type="text" value={form.sf2_pelaksana}
              onChange={e => setField('sf2_pelaksana', e.target.value)}
              placeholder="Operator name"
              className="h-9 text-sm"
              style={{
                background: '#E0E5EC',
                color: '#3D4852',
                boxShadow: 'inset 4px 4px 8px rgb(163 177 198 / 0.6), inset -4px -4px 8px rgba(255,255,255,0.5)',
                border: 'none',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );

  if (loadingSc) {
    return (
      <div className="px-4 sm:px-8 py-8 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={`BBSF — ${kp}`}
        subtitle="Washing, Sanforizing & Finishing"
      />

      <KpContextBanner
        kp={kp}
        codename={sc?.codename ?? null}
        customer={sc?.permintaan ?? null}
        kat_kode={sc?.kat_kode ?? null}
        te={sc?.te ?? null}
        color={sc?.ket_warna ?? null}
        currentStage="BBSF"
      />

      <form onSubmit={handleSubmit}>
        <div className="px-4 sm:px-8 pb-8 space-y-5">
          {/* Tabs */}
          <div
            className="rounded-[32px] p-1"
            style={{
              background: '#E0E5EC',
              boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)',
            }}
          >
            <div className="flex gap-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors`}
                  style={{
                    background: activeTab === tab.id ? '#6C63FF' : 'transparent',
                    color: activeTab === tab.id ? '#FFFFFF' : '#6B7280',
                    boxShadow: activeTab !== tab.id ? 'inset 4px 4px 8px rgb(163 177 198 / 0.6), inset -4px -4px 8px rgba(255,255,255,0.5)' : 'none',
                    border: 'none',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div
            className="rounded-[32px] p-6"
            style={{
              background: '#E0E5EC',
              boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)',
            }}
          >
            {activeTab === 'washing' && renderWashingTab()}
            {activeTab === 'sanfor1' && renderSanfor1Tab()}
            {activeTab === 'sanfor2' && renderSanfor2Tab()}
          </div>

          {/* Submit row */}
          <div className="flex justify-end gap-3">
            <Button type="button"
              onClick={() => router.back()}
              style={{
                background: '#E0E5EC',
                color: '#6B7280',
                boxShadow: '5px 5px 10px rgb(163 177 198 / 0.6), -5px -5px 10px rgba(255,255,255,0.5)',
                border: 'none',
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}
              style={{
                background: '#6C63FF',
                color: '#FFFFFF',
                border: 'none',
              }}
              className="min-w-32"
            >
              {submitting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...</>
              ) : 'Complete & Send to Inspect Finish'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
