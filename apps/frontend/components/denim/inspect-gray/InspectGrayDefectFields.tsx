'use client';

import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { AlertTriangle, ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react';
import {
  DEFECT_CRITICAL, DEFECT_MEDIUM, DEFECT_LOW, DEFECT_LABELS,
  ALL_DEFECTS, DefectFields, RollRow, InspectGrayFormState,
} from './types';

interface Props {
  form: InspectGrayFormState;
  rolls: RollRow[];
  summary: {
    totalRolls: number;
    totalPanjang: number;
    totalBerat: number;
    totalBMC: number;
    gradeACount: number;
    gradeBCount: number;
    gradeCCount: number;
    rejectCount: number;
  };
  calculateBMC: (defects: DefectFields) => number;
  onAddRoll: () => void;
  onRemoveRoll: (index: number) => void;
  onSetRollField: (index: number, key: keyof RollRow, value: string) => void;
  onSetDefectField: (rollIndex: number, defectKey: string, value: string) => void;
  onToggleExpand: (index: number) => void;
}

function DefectInputs({ rollIndex, defects, onSetDefectField }: {
  rollIndex: number;
  defects: DefectFields;
  onSetDefectField: (rollIndex: number, defectKey: string, value: string) => void;
}) {
  const renderGroup = (defectsList: readonly string[], severity: string, color: string) => (
    <div className="mb-3">
      <p className="text-xs font-semibold mb-2" style={{ color }}>{severity}</p>
      <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
        {defectsList.map(key => (
          <div key={key} className="space-y-1">
            <Label className="text-[10px] block text-[#6B7280]">
              {DEFECT_LABELS[key] || key}
            </Label>
            <Input
              type="number" min="0"
              value={defects[key] || ''}
              onChange={e => onSetDefectField(rollIndex, key, e.target.value)}
              className="h-7 text-xs font-mono bg-white border border-[#E5E7EB]"
              placeholder="0"
            />
          </div>
        ))}
      </div>
    </div>
  );
  return (
    <div className="rounded-xl p-3 mt-2 bg-[#F7F8FA] border border-[#E5E7EB]">
      {renderGroup(DEFECT_CRITICAL, 'CRITICAL (Severity 4)', '#BA1A1A')}
      {renderGroup(DEFECT_MEDIUM,   'MEDIUM (Severity 2)',    '#7D5700')}
      {renderGroup(DEFECT_LOW,      'LOW (Severity 1)',       '#006E1C')}
    </div>
  );
}

export default function InspectGrayDefectFields({ form, rolls, summary, calculateBMC, onAddRoll, onRemoveRoll, onSetRollField, onSetDefectField, onToggleExpand }: Props) {
  return (
    <div className="space-y-5">
      {/* Roll Table */}
      <div className="rounded-xl p-6 bg-[#F7F8FA] border border-[#E5E7EB]">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold flex items-center gap-2 text-[#0F1117]">
            <span className="w-5 h-5 rounded-full text-white text-xs flex items-center justify-center font-bold bg-[#1D4ED8]">2</span>
            Roll-by-Roll Inspection
            <span className="ml-1 text-xs font-normal text-[#6B7280]">({form.rolls.length})</span>
          </h2>
          <Button type="button" size="sm" onClick={onAddRoll} className="h-7 text-xs gap-1 bg-[#1D4ED8] text-white border-none">
            <Plus className="w-3 h-3" /> Add Roll
          </Button>
        </div>

        <div className="space-y-2">
          <div className="grid grid-cols-13 gap-3 px-1">
            {['#', 'Roll No.', 'Length (m)', 'Width (cm)', 'Weight (kg)', 'Grade', 'BMC', 'Defects', 'Notes', ''].map((h, idx) => (
              <p key={idx} className="text-xs font-medium text-[#6B7280]">{h}</p>
            ))}
          </div>

          {rolls.map((roll, i) => {
            const bmc = calculateBMC(roll.defects);
            const hasDefects = bmc > 0;
            return (
              <div key={i} className="space-y-2">
                <div className="grid grid-cols-13 gap-3 items-center">
                  <span className="text-xs font-mono text-center text-[#6B7280]">{i + 1}</span>
                  <div className="col-span-1"><Input type="number" value={roll.no_roll} onChange={e => onSetRollField(i, 'no_roll', e.target.value)} placeholder="1" className="h-8 text-sm font-mono bg-white border border-[#E5E7EB]" /></div>
                  <div className="col-span-1"><Input type="number" step="0.01" value={roll.panjang} onChange={e => onSetRollField(i, 'panjang', e.target.value)} placeholder="50" className="h-8 text-sm font-mono bg-white border border-[#E5E7EB]" /></div>
                  <div className="col-span-1"><Input type="number" step="0.01" value={roll.lebar} onChange={e => onSetRollField(i, 'lebar', e.target.value)} placeholder="150" className="h-8 text-sm font-mono bg-white border border-[#E5E7EB]" /></div>
                  <div className="col-span-1"><Input type="number" step="0.01" value={roll.berat} onChange={e => onSetRollField(i, 'berat', e.target.value)} placeholder="25" className="h-8 text-sm font-mono bg-white border border-[#E5E7EB]" /></div>
                  <div className="col-span-1">
                    <select value={roll.grade} onChange={e => onSetRollField(i, 'grade', e.target.value)}
                      className="w-full h-8 px-2 text-sm rounded-lg bg-white border border-[#E5E7EB] text-[#0F1117]">
                      <option value="">Select...</option>
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="Reject">Reject</option>
                    </select>
                  </div>
                  <div className="col-span-1 flex items-center justify-center font-bold text-sm" style={{ color: hasDefects ? '#7D5700' : '#6B7280' }}>
                    {hasDefects ? <span className="flex items-center gap-1"><AlertTriangle className="w-3 h-3" style={{ color: '#7D5700' }} />{bmc}</span> : '-'}
                  </div>
                  <div className="col-span-1 flex items-center gap-2">
                    <Button type="button" size="sm" onClick={() => onToggleExpand(i)} className="h-7 px-2 text-xs text-[#6B7280]">
                      {roll.expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      {hasDefects ? `${bmc} defects` : 'Add'}
                    </Button>
                  </div>
                  <div className="col-span-2"><Input value={roll.cacat} onChange={e => onSetRollField(i, 'cacat', e.target.value)} placeholder="Defect notes..." className="h-8 text-sm bg-white border border-[#E5E7EB]" /></div>
                  <div className="col-span-1 flex justify-center">
                    {form.rolls.length > 1 && (
                      <button type="button" onClick={() => onRemoveRoll(i)} className="hover:opacity-70 transition-opacity text-[#6B7280]">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                {roll.expanded && <DefectInputs rollIndex={i} defects={roll.defects} onSetDefectField={onSetDefectField} />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary */}
      <div className="rounded-xl p-6 bg-[#F7F8FA] border border-[#E5E7EB]">
        <h2 className="text-sm font-semibold mb-5 flex items-center gap-2 text-[#0F1117]">
          <span className="w-5 h-5 rounded-full flex items-center justify-center font-bold bg-[#1D4ED8] text-white text-[10px]">3</span>
          Summary
        </h2>
        <div className="grid grid-cols-3 md:grid-cols-7 gap-4">
          {[
            ['Total Rolls',    summary.totalRolls,   '#0F1117'],
            ['Total Length',   `${summary.totalPanjang.toLocaleString(undefined, { maximumFractionDigits: 1 })} m`, '#0F1117'],
            ['Total Weight',   `${summary.totalBerat.toLocaleString(undefined, { maximumFractionDigits: 1 })} kg`, '#0F1117'],
            ['Total BMC',      summary.totalBMC,      '#7D5700'],
            ['Grade A',        summary.gradeACount,   '#006E1C'],
            ['Grade B',        summary.gradeBCount,   '#7D5700'],
            ['Reject',         summary.rejectCount,   '#BA1A1A'],
          ].map(([label, value]) => (
            <div key={label as string} className="rounded-xl p-4 text-center bg-white border border-[#E5E7EB]">
              <p className="text-xs mb-1 text-[#6B7280]">{label as string}</p>
              <p className="text-2xl font-bold" style={{ color: value as string }}>{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
