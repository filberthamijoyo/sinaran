'use client';

import { useState } from 'react';
import { authFetch } from '../../../../lib/authFetch';
import { Button } from '../../../ui/button';
import { X, ChevronDown, ChevronRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { FabricSpec, FormData, ExpandedSections } from './types';

const defaultSections: ExpandedSections = {
  identity: true,
  threadWeave: true,
  dimensions: true,
  colorProcess: true,
};

type Props = {
  open: boolean;
  editingSpec: FabricSpec | null;
  onClose: () => void;
  onSaved: () => void;
};

const BLANK_FORM: FormData = {
  item: '',
  kons_kode: '',
  kode: '',
  kat_kode: 'SC',
  te: null,
  lusi_type: '',
  lusi_ne: '',
  pakan_type: '',
  pakan_ne: '',
  sisir: '',
  pick: null,
  anyaman: '',
  arah: '',
  lg_inches: null,
  lf_inches: null,
  susut_pakan: null,
  warna: '',
  pretreatment: '',
  indigo_i: null,
  indigo_bak_i: null,
  sulfur_s: null,
  sulfur_bak_s: null,
  posttreatment: '',
  finish: '',
  oz_g: null,
  oz_f: null,
  p_kons: '',
  remarks: '',
};

function renderField(
  field: keyof FabricSpec,
  label: string,
  required: boolean,
  formData: FormData,
  updateField: (f: keyof FabricSpec, v: unknown) => void,
  type: 'text' | 'number' = 'text'
) {
  const val = formData[field];
  const displayValue = val === null || val === undefined ? '' : String(val);

  return (
    <div className="form-group">
      <label>
        {label}
        {required && <span className="required">*</span>}
      </label>
      <input
        type={type}
        value={displayValue}
        onChange={e => {
          const newVal = type === 'number'
            ? (e.target.value ? Number(e.target.value) : null)
            : e.target.value;
          updateField(field, newVal);
        }}
        className="input"
      />
    </div>
  );
}

export function FabricSpecsSlideout({ open, editingSpec, onClose, onSaved }: Props) {
  const [formData, setFormData] = useState<FormData>(editingSpec ? { ...editingSpec } : { ...BLANK_FORM });
  const [sections, setSections] = useState<ExpandedSections>({ ...defaultSections });
  const [saving, setSaving] = useState(false);

  // Sync when editingSpec changes (open/close)
  if (open && !editingSpec && formData.item !== '') {
    setFormData({ ...BLANK_FORM });
    setSections({ ...defaultSections });
  }
  if (open && editingSpec && formData.id !== editingSpec.id) {
    setFormData({ ...editingSpec });
    setSections({ ...defaultSections });
  }

  const updateField = (field: keyof FabricSpec, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleSection = (section: keyof ExpandedSections) => {
    setSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleSave = async () => {
    if (!formData.item || !formData.kons_kode || !formData.kode) {
      toast.error('Please fill in required fields: Item, Kons Kode, Kode');
      return;
    }

    setSaving(true);
    try {
      const url = editingSpec
        ? `/denim/fabric-specs/${editingSpec.id}`
        : '/denim/fabric-specs';
      const method = editingSpec ? 'PUT' : 'POST';

      await authFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      toast.success('Spec saved');
      onClose();
      onSaved();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(0,0,0,0.3)' }}
        onClick={onClose}
      />

      <div className="fixed top-0 right-0 z-50 h-full w-[480px] overflow-y-auto"
        style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.18)', backgroundColor: '#FFFFFF', borderLeft: '1px solid #E5E7EB' }}>
        <div className="sticky top-0 px-6 py-4 flex items-center justify-between"
          style={{ borderBottom: '1px solid #E5E7EB' }}>
          <h2 className="text-lg font-semibold" style={{ color: '#181C20' }}>
            {editingSpec ? `Edit: ${editingSpec.item}` : 'New Fabric Spec'}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}
            style={{ height: '32px', width: '32px', padding: 0, background: 'transparent', border: 'none' }}>
            <X className="w-4 h-4" style={{ color: '#41474D' }} />
          </Button>
        </div>

        <div className="p-6 space-y-4">
          {/* Identity */}
          <Section title="Identity" sectionKey="identity" expanded={sections.identity} onToggle={toggleSection}>
            <div className="grid grid-cols-2 gap-3">
              {renderField('item', 'Item', true, formData, updateField)}
              {renderField('kons_kode', 'Kons Kode', true, formData, updateField)}
              {renderField('kode', 'Kode', true, formData, updateField)}
              <div className="form-group">
                <label>Category</label>
                <select
                  value={formData.kat_kode || ''}
                  onChange={e => updateField('kat_kode', e.target.value)}
                  className="input"
                >
                  {(['SC', 'WS', 'Other'] as const).map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>
          </Section>

          {/* Thread & Weave */}
          <Section title="Thread &amp; Weave" sectionKey="threadWeave" expanded={sections.threadWeave} onToggle={toggleSection}>
            <div className="grid grid-cols-2 gap-3">
              {renderField('lusi_type', 'Lusi Type', false, formData, updateField)}
              {renderField('lusi_ne', 'Lusi NE', false, formData, updateField)}
              {renderField('pakan_type', 'Pakan Type', false, formData, updateField)}
              {renderField('pakan_ne', 'Pakan NE', false, formData, updateField)}
              {renderField('sisir', 'Sisir', false, formData, updateField)}
              {renderField('pick', 'Pick', false, formData, updateField, 'number')}
              {renderField('anyaman', 'Anyaman', false, formData, updateField)}
              {renderField('arah', 'Arah', false, formData, updateField)}
              {renderField('te', 'TE', false, formData, updateField, 'number')}
            </div>
          </Section>

          {/* Dimensions & Weight */}
          <Section title="Dimensions &amp; Weight" sectionKey="dimensions" expanded={sections.dimensions} onToggle={toggleSection}>
            <div className="grid grid-cols-2 gap-3">
              {renderField('lg_inches', 'LG (inches)', false, formData, updateField, 'number')}
              {renderField('lf_inches', 'LF (inches)', false, formData, updateField, 'number')}
              {renderField('susut_pakan', 'Susut Pakan', false, formData, updateField, 'number')}
              {renderField('oz_g', 'OZ (Gram)', false, formData, updateField, 'number')}
              {renderField('oz_f', 'OZ (Feet)', false, formData, updateField, 'number')}
            </div>
          </Section>

          {/* Color & Process */}
          <Section title="Color &amp; Process" sectionKey="colorProcess" expanded={sections.colorProcess} onToggle={toggleSection}>
            <div className="grid grid-cols-2 gap-3">
              {renderField('warna', 'Warna', false, formData, updateField)}
              {renderField('pretreatment', 'Pre-treatment', false, formData, updateField)}
              {renderField('indigo_i', 'Indigo I', false, formData, updateField, 'number')}
              {renderField('indigo_bak_i', 'Indigo Bak I', false, formData, updateField, 'number')}
              {renderField('sulfur_s', 'Sulfur S', false, formData, updateField, 'number')}
              {renderField('sulfur_bak_s', 'Sulfur Bak S', false, formData, updateField, 'number')}
              {renderField('posttreatment', 'Post-treatment', false, formData, updateField)}
              {renderField('finish', 'Finish', false, formData, updateField)}
              {renderField('p_kons', 'P Kons', false, formData, updateField)}
              <div className="form-group col-span-2">
                <label>Remarks</label>
                <textarea
                  value={formData.remarks || ''}
                  onChange={e => updateField('remarks', e.target.value)}
                  className="input min-h-[60px]"
                  rows={2}
                />
              </div>
            </div>
          </Section>

          {/* Save */}
          <div className="pt-4 flex gap-3">
            <Button onClick={handleSave} disabled={saving}
              style={{ flex: 1, background: '#0061A4', borderRadius: '9999px', color: '#fff', border: 'none', padding: '8px 16px', fontSize: '14px', fontWeight: 500 }}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingSpec ? 'Update Spec' : 'Create Spec'}
            </Button>
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .input {
          width: 100%;
          height: 36px;
          padding: 0 10px;
          font-size: 14px;
          border: none;
          border-radius: 12px;
          color: #181C20;
          outline: none;
          border: 1px solid #C1C7CE;
          transition: box-shadow 0.15s;
        }
        .input::placeholder { color: #71787E; }
        .input:focus { outline: none; box-shadow: 0 0 0 2px #0061A4; }
        .form-group { display: flex; flex-direction: column; gap: 4px; }
        .form-group label {
          font-size: 11px; font-weight: 600; text-transform: uppercase;
          letter-spacing: 0.06em; color: #9CA3AF; margin-bottom: 4px;
        }
        .form-group label .required { color: #BA1A1A; margin-left: 2px; }
        textarea.input { height: auto; padding: 8px 10px; resize: vertical; }
        select.input { cursor: pointer; }
      `}</style>
    </>
  );
}

// Internal collapsible section helper
type SectionProps = {
  title: string;
  sectionKey: keyof ExpandedSections;
  expanded: boolean;
  onToggle: (k: keyof ExpandedSections) => void;
  children: React.ReactNode;
};

function Section({ title, sectionKey, expanded, onToggle, children }: SectionProps) {
  return (
    <div style={{ border: '1px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden' }}>
      <button type="button" onClick={() => onToggle(sectionKey)}
        className="w-full px-4 py-3 flex items-center justify-between"
        style={{ borderBottom: expanded ? '1px solid #F3F4F6' : 'none' }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#0F1E2E' }}>{title}</span>
        {expanded
          ? <ChevronDown className="w-4 h-4" style={{ color: '#6B7280' }} />
          : <ChevronRight className="w-4 h-4" style={{ color: '#6B7280' }} />
        }
      </button>
      {expanded && <div className="p-4">{children}</div>}
    </div>
  );
}
