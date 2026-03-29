'use client';

import { useState } from 'react';
import { authFetch } from '../../../../lib/authFetch';
import { Button } from '../../../ui/button';
import { X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { FabricSpec, FormData } from './types';

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

// ─── Styles ────────────────────────────────────────────────────
const PANEL_STYLE: React.CSSProperties = {
  width: 480,
  backgroundColor: '#FFFFFF',
  borderLeft: '1px solid #E5E7EB',
  padding: '24px',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
};

const HEADER_STYLE: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 600,
  color: '#0F1E2E',
  marginBottom: 4,
};

const SUBTITLE_STYLE: React.CSSProperties = {
  fontSize: 13,
  color: '#6B7280',
  marginBottom: 24,
};

const SECTION_HEADER_STYLE: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 500,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: '#9CA3AF',
  borderBottom: '1px solid #F3F4F6',
  paddingBottom: 8,
  marginBottom: 12,
};

const GRID_STYLE: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 12,
};

const LABEL_STYLE: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 500,
  color: '#374151',
  marginBottom: 4,
};

const INPUT_STYLE = (focused?: boolean): React.CSSProperties => ({
  width: '100%',
  height: 36,
  borderRadius: 8,
  border: `1px solid ${focused ? '#1D4ED8' : '#E5E7EB'}`,
  padding: '0 12px',
  fontSize: 14,
  color: '#0F1E2E',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
  background: '#FFFFFF',
  transition: 'border-color 150ms',
});

const TEXTAREA_STYLE: React.CSSProperties = {
  width: '100%',
  minHeight: 64,
  borderRadius: 8,
  border: '1px solid #E5E7EB',
  padding: '8px 12px',
  fontSize: 14,
  color: '#0F1E2E',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
  resize: 'vertical',
};

const FOOTER_STYLE: React.CSSProperties = {
  position: 'sticky',
  bottom: 0,
  borderTop: '1px solid #E5E7EB',
  padding: '16px 24px',
  display: 'flex',
  gap: 12,
  background: '#FFFFFF',
  marginTop: 'auto',
};

// ─── Field renderer ─────────────────────────────────────────────
type FieldDef = { key: keyof FabricSpec; label: string; type?: 'text' | 'number'; fullWidth?: boolean };

function FieldGroup({
  defs,
  formData,
  onChange,
}: {
  defs: FieldDef[];
  formData: FormData;
  onChange: (k: keyof FabricSpec, v: string | number | null) => void;
}) {
  return (
    <>
      {defs.map(def => {
        const val = (formData as Record<string, unknown>)[def.key];
        const displayValue = val === null || val === undefined ? '' : String(val);
        const isTextarea = def.key === 'remarks';
        const isSelect = def.key === 'kat_kode';

        return (
          <div key={def.key} style={def.fullWidth ? { gridColumn: '1 / -1' } : undefined}>
            <label style={LABEL_STYLE}>{def.label}</label>
            {isSelect ? (
              <select
                value={displayValue}
                onChange={e => onChange(def.key, e.target.value)}
                style={{ ...INPUT_STYLE(), cursor: 'pointer', appearance: 'none' }}
              >
                {(['SC', 'WS', 'Other'] as const).map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : isTextarea ? (
              <textarea
                value={displayValue}
                onChange={e => onChange(def.key, e.target.value)}
                style={TEXTAREA_STYLE}
                rows={3}
              />
            ) : (
              <input
                type={def.type ?? 'text'}
                value={displayValue}
                onChange={e => {
                  const raw = e.target.value;
                  const next = def.type === 'number'
                    ? (raw === '' ? null : Number(raw))
                    : raw;
                  onChange(def.key, next as string | number | null);
                }}
                style={INPUT_STYLE()}
                placeholder={def.label}
              />
            )}
          </div>
        );
      })}
    </>
  );
}

export function FabricSpecsSlideout({ open, editingSpec, onClose, onSaved }: Props) {
  const [formData, setFormData] = useState<FormData>(
    editingSpec ? { ...editingSpec } : { ...BLANK_FORM }
  );
  const [saving, setSaving] = useState(false);

  // Sync when editingSpec changes (open/close)
  if (open && !editingSpec && formData.item !== '') {
    setFormData({ ...BLANK_FORM });
  }
  if (open && editingSpec && formData.id !== editingSpec.id) {
    setFormData({ ...editingSpec });
  }

  const handleChange = (field: keyof FabricSpec, value: string | number | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.item || !formData.kons_kode || !formData.kode) {
      toast.error('Please fill in required fields: Item, Kons Kode, Kode');
      return;
    }

    setSaving(true);
    try {
      const { id: _id, usage_count: _uc, ...payload } = formData as Record<string, unknown>;
      const url = editingSpec ? `/denim/fabric-specs/${editingSpec.id}` : '/denim/fabric-specs';
      const method = editingSpec ? 'PUT' : 'POST';

      await authFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      toast.success(editingSpec ? 'Spec updated' : 'Spec created');
      onClose();
      onSaved();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  const SECTION = (title: string, defs: FieldDef[]) => (
    <div style={{ marginBottom: 20 }}>
      <div style={SECTION_HEADER_STYLE}>{title}</div>
      <div style={GRID_STYLE}>
        <FieldGroup defs={defs} formData={formData} onChange={handleChange} />
      </div>
    </div>
  );

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.3)',
          zIndex: 40,
        }}
        onClick={onClose}
      />

      {/* Panel */}
      <div style={{ ...PANEL_STYLE, position: 'fixed', top: 0, right: 0, zIndex: 50, overflowY: 'auto' }}>
        {/* Close button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            style={{ height: 32, width: 32, padding: 0, background: 'transparent', border: 'none' }}
          >
            <X size={16} style={{ color: '#41474D' }} />
          </Button>
        </div>

        {/* Header */}
        <div style={HEADER_STYLE}>
          {editingSpec ? 'Edit Fabric Spec' : 'New Fabric Spec'}
        </div>
        <div style={SUBTITLE_STYLE}>
          {editingSpec?.item ?? 'Fill in the spec details below'}
        </div>

        {/* Form sections */}
        {SECTION('Identity', [
          { key: 'item', label: 'Item', type: 'text' },
          { key: 'kons_kode', label: 'Kons Kode', type: 'text' },
          { key: 'kode', label: 'Kode', type: 'text' },
          { key: 'kat_kode', label: 'Category', type: 'text' },
          { key: 'te', label: 'TE', type: 'number' },
          { key: 'p_kons', label: 'P Kons', type: 'text' },
        ])}

        {SECTION('Lusi', [
          { key: 'lusi_type', label: 'Lusi Type', type: 'text' },
          { key: 'lusi_ne', label: 'Lusi NE', type: 'text' },
          { key: 'sisir', label: 'Sisir', type: 'text' },
          { key: 'pick', label: 'Pick', type: 'number' },
          { key: 'anyaman', label: 'Anyaman', type: 'text' },
          { key: 'arah', label: 'Arah', type: 'text' },
          { key: 'lg_inches', label: 'LG (inches)', type: 'number' },
          { key: 'lf_inches', label: 'LF (inches)', type: 'number' },
        ])}

        {SECTION('Pakan', [
          { key: 'pakan_type', label: 'Pakan Type', type: 'text' },
          { key: 'pakan_ne', label: 'Pakan NE', type: 'text' },
          { key: 'susut_pakan', label: 'Susut Pakan', type: 'number' },
        ])}

        {SECTION('Color & Process', [
          { key: 'warna', label: 'Warna', type: 'text' },
          { key: 'pretreatment', label: 'Pre-treatment', type: 'text' },
          { key: 'indigo_i', label: 'Indigo I', type: 'number' },
          { key: 'indigo_bak_i', label: 'Indigo Bak I', type: 'number' },
          { key: 'sulfur_s', label: 'Sulfur S', type: 'number' },
          { key: 'sulfur_bak_s', label: 'Sulfur Bak S', type: 'number' },
          { key: 'posttreatment', label: 'Post-treatment', type: 'text' },
          { key: 'finish', label: 'Finish', type: 'text' },
        ])}

        {SECTION('Weight', [
          { key: 'oz_g', label: 'OZ (Gram)', type: 'number' },
          { key: 'oz_f', label: 'OZ (Feet)', type: 'number' },
        ])}

        {SECTION('Remarks', [
          { key: 'remarks', label: 'Remarks', type: 'text', fullWidth: true },
        ])}

        {/* Footer */}
        <div style={FOOTER_STYLE}>
          <Button
            variant="secondary"
            onClick={onClose}
            style={{ borderRadius: 8, flex: 1, height: 40, fontSize: 14 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            style={{
              flex: 2,
              borderRadius: 8,
              height: 40,
              fontSize: 14,
              fontWeight: 500,
              background: '#1D4ED8',
              color: '#FFFFFF',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            {saving && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
            {editingSpec ? 'Update Spec' : 'Create Spec'}
          </Button>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { opacity: 1; }
      `}</style>
    </>
  );
}
