'use client';

import { Clock } from 'lucide-react';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { InspectGrayFormState } from './types';

interface Props {
  form: InspectGrayFormState;
  setField: (key: keyof InspectGrayFormState, value: string) => void;
}

export default function InspectGrayBasicFields({ form, setField }: Props) {
  return (
    <div className="rounded-xl p-6 bg-[#F7F8FA] border border-[#E5E7EB]">
      <h2 className="text-sm font-semibold mb-1 flex items-center gap-2 text-[#0F1117]">
        <span className="w-5 h-5 rounded-full text-white text-xs flex items-center justify-center font-bold bg-[#1D4ED8]">1</span>
        Inspection Details
      </h2>
      <p className="text-xs mb-5 flex items-center gap-1 text-[#6B7280]">
        <Clock className="w-3 h-3" />
        Date and time recorded automatically on submit
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-[#6B7280]">Inspector Name</Label>
          <Input type="text" value={form.inspector_name}
            onChange={e => setField('inspector_name', e.target.value)}
            placeholder="Inspector name" className="h-9 text-sm bg-white border border-[#E5E7EB]" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-[#6B7280]">SJ (Surat Jalan)</Label>
          <Input type="text" value={form.sj}
            onChange={e => setField('sj', e.target.value)}
            placeholder="Delivery note number" className="h-9 text-sm bg-white border border-[#E5E7EB]" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-[#6B7280]">OPG</Label>
          <Input type="text" value={form.opg}
            onChange={e => setField('opg', e.target.value)}
            placeholder="OPG reference" className="h-9 text-sm bg-white border border-[#E5E7EB]" />
        </div>
      </div>
    </div>
  );
}
