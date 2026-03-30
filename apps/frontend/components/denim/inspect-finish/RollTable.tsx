'use client';

import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Plus, Trash2, ChevronDown, ChevronRight, AlertTriangle } from 'lucide-react';
import {
  RollRow,
  DefectFields,
  calculateBMC,
  DEFECT_CRITICAL,
  DEFECT_MEDIUM,
  DEFECT_LOW,
  DEFECT_LABELS,
} from './types';

interface RollTableProps {
  rolls: RollRow[];
  setRollField: (index: number, key: keyof RollRow, value: string) => void;
  setDefectField: (rollIndex: number, defectKey: string, value: string) => void;
  toggleExpand: (index: number) => void;
  addRoll: () => void;
  removeRoll: (index: number) => void;
}

function DefectInputs({
  rollIndex,
  defects,
  setDefectField,
}: {
  rollIndex: number;
  defects: DefectFields;
  setDefectField: (rollIndex: number, defectKey: string, value: string) => void;
}) {
  const inputStyle: React.CSSProperties = {
    height: '32px',
    borderRadius: 'var(--input-radius)',
    border: '1px solid var(--border)',
    background: 'var(--page-bg)',
    padding: '0 8px',
    fontSize: '13px',
    color: 'var(--text-primary)',
    width: '100%',
    fontFamily: 'inherit',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const renderGroup = (list: readonly string[], severity: string, color: string) => (
    <div style={{ marginBottom: '12px' }}>
      <p style={{ fontSize: '11px', fontWeight: 600, marginBottom: '8px', color }}>
        {severity}
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '8px' }}>
        {list.map(key => (
          <div key={key}>
            <Label style={{ fontSize: '11px', display: 'block', marginBottom: '4px', color: 'var(--text-muted)' }}>
              {DEFECT_LABELS[key] || key}
            </Label>
            <Input
              type="number"
              min="0"
              value={defects[key] || ''}
              onChange={e => setDefectField(rollIndex, key, e.target.value)}
              placeholder="0"
              style={inputStyle}
            />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{
      borderRadius: 'var(--card-radius)',
      padding: '12px',
      marginTop: '8px',
      background: 'var(--page-bg)',
      border: '1px solid var(--border)',
    }}>
      {renderGroup(DEFECT_CRITICAL, 'CRITICAL (Severity 4)', 'var(--danger-text)')}
      {renderGroup(DEFECT_MEDIUM, 'MEDIUM (Severity 2)', 'var(--warning-text)')}
      {renderGroup(DEFECT_LOW, 'LOW (Severity 1)', 'var(--success-text)')}
    </div>
  );
}

const ROW_GRID = {
  gridTemplateColumns: '40px 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 40px',
  gap: '8px',
} as const;

const inputStyle: React.CSSProperties = {
  height: '36px',
  borderRadius: 'var(--input-radius)',
  border: '1px solid var(--border)',
  background: 'var(--page-bg)',
  padding: '0 8px',
  fontSize: '13px',
  color: 'var(--text-primary)',
  width: '100%',
  fontFamily: 'inherit',
  outline: 'none',
  boxSizing: 'border-box',
};

const selectStyle: React.CSSProperties = {
  height: '36px',
  borderRadius: 'var(--input-radius)',
  border: '1px solid var(--border)',
  background: 'var(--page-bg)',
  padding: '0 8px',
  fontSize: '13px',
  color: 'var(--text-primary)',
  width: '100%',
  fontFamily: 'inherit',
  outline: 'none',
  boxSizing: 'border-box',
  appearance: 'none',
  cursor: 'pointer',
};

export default function RollTable({
  rolls,
  setRollField,
  setDefectField,
  toggleExpand,
  addRoll,
  removeRoll,
}: RollTableProps) {
  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #E5E7EB',
      borderRadius: 12,
      overflow: 'hidden',
    }}>
      {/* Table header */}
      <div
        style={{
          display: 'grid',
          ...ROW_GRID,
          padding: '0 16px',
          background: '#F9FAFB',
          borderBottom: '1px solid #E5E7EB',
          alignItems: 'center',
          height: 36,
        }}
      >
        <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', textAlign: 'center' }}>#</p>
        <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>Roll</p>
        <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>SN</p>
        <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>Tgl Potong</p>
        <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>Width</p>
        <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>KG</p>
        <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>Susut</p>
        <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>Grade</p>
        <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>Point</p>
        <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>BMC</p>
        <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>Defects</p>
        <p />
      </div>

      <div style={{ padding: '8px 16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
          {rolls.map((roll, i) => {
            const bmc = calculateBMC(roll.defects);
            const hasDefects = bmc > 0;

            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                <div style={{ display: 'grid', ...ROW_GRID, alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
                    {i + 1}
                  </span>
                  <Input
                    type="number"
                    value={roll.no_roll}
                    onChange={e => setRollField(i, 'no_roll', e.target.value)}
                    placeholder="1"
                    style={{ ...inputStyle, height: '34px' }}
                  />
                  <Input
                    type="text"
                    value={roll.sn}
                    onChange={e => setRollField(i, 'sn', e.target.value)}
                    placeholder="SN"
                    style={{ ...inputStyle, height: '34px' }}
                  />
                  <Input
                    type="date"
                    value={roll.tgl_potong}
                    onChange={e => setRollField(i, 'tgl_potong', e.target.value)}
                    style={{ ...inputStyle, height: '34px' }}
                  />
                  <Input
                    type="number"
                    step="0.01"
                    value={roll.lebar}
                    onChange={e => setRollField(i, 'lebar', e.target.value)}
                    placeholder="cm"
                    style={{ ...inputStyle, height: '34px' }}
                  />
                  <Input
                    type="number"
                    step="0.01"
                    value={roll.kg}
                    onChange={e => setRollField(i, 'kg', e.target.value)}
                    placeholder="kg"
                    style={{ ...inputStyle, height: '34px' }}
                  />
                  <Input
                    type="number"
                    step="0.01"
                    value={roll.susut_lusi}
                    onChange={e => setRollField(i, 'susut_lusi', e.target.value)}
                    placeholder="%"
                    style={{ ...inputStyle, height: '34px' }}
                  />
                  <select
                    value={roll.grade}
                    onChange={e => setRollField(i, 'grade', e.target.value)}
                    style={{ ...selectStyle, height: '34px' }}
                  >
                    <option value="">-</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="Reject">Reject</option>
                  </select>
                  <Input
                    type="number"
                    step="0.01"
                    value={roll.point}
                    onChange={e => setRollField(i, 'point', e.target.value)}
                    placeholder="pt"
                    style={{ ...inputStyle, height: '34px' }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 600, color: hasDefects ? 'var(--warning)' : 'var(--text-muted)' }}>
                    {hasDefects ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <AlertTriangle size={12} style={{ color: 'var(--warning)' }} />
                        {bmc}
                      </span>
                    ) : '-'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => toggleExpand(i)}
                      variant="secondary"
                      style={{ height: '32px', fontSize: '12px', padding: '0 8px' }}
                    >
                      {roll.expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                      {hasDefects ? `${bmc}` : 'Add'}
                    </Button>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    {rolls.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeRoll(i)}
                        style={{ padding: '4px', color: 'var(--text-muted)' }}
                      >
                        <Trash2 size={14} />
                      </Button>
                    )}
                  </div>
                </div>

                {roll.expanded && (
                  <DefectInputs
                    rollIndex={i}
                    defects={roll.defects}
                    setDefectField={setDefectField}
                  />
                )}
              </div>
            );
          })}
        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={addRoll}
          leftIcon={<Plus size={13} />}
        >
          Add Roll
        </Button>
      </div>
    </div>
  );
}
