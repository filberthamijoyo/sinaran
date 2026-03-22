'use client';

import { useEffect, useState, useCallback, CSSProperties } from 'react';
import { authFetch } from '../../../lib/authFetch';
import PageHeader from '../../layout/PageHeader';
import { Button } from '../../ui/button';
import { Skeleton } from '../../ui/skeleton';
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '../../ui/table';
import { Input } from '../../ui/input';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '../../ui/select';
import { toast } from 'sonner';
import { Search, Plus, Edit3, X, ChevronDown, ChevronRight, Loader2, Inbox } from 'lucide-react';

type FabricSpec = {
  id: number;
  item: string;
  kons_kode: string;
  kode: string;
  kat_kode: string;
  te: number | null;
  lusi_type: string | null;
  lusi_ne: string | null;
  pakan_type: string | null;
  pakan_ne: string | null;
  sisir: string | null;
  pick: number | null;
  anyaman: string | null;
  arah: string | null;
  lg_inches: number | null;
  lf_inches: number | null;
  susut_pakan: number | null;
  warna: string | null;
  pretreatment: string | null;
  indigo_i: number | null;
  indigo_bak_i: number | null;
  sulfur_s: number | null;
  sulfur_bak_s: number | null;
  posttreatment: string | null;
  finish: string | null;
  oz_g: number | null;
  oz_f: number | null;
  p_kons: string | null;
  remarks: string | null;
  usage_count: number;
};

const KAT_KODE_OPTIONS = ['SC', 'WS', 'Other'];

const CATEGORY_COLORS: Record<string, CSSProperties> = {
  SC: { background: '#E0E5EC', color: '#3D4852', boxShadow: '3px 3px 6px rgb(163 177 198 / 0.6), -3px -3px 6px rgba(255,255,255,0.5)' },
  WS: { background: '#E0E5EC', color: '#3D4852', boxShadow: '3px 3px 6px rgb(163 177 198 / 0.6), -3px -3px 6px rgba(255,255,255,0.5)' },
};

function getCategoryColor(kat_kode: string | null): CSSProperties {
  if (!kat_kode) return { background: '#E0E5EC', color: '#6B7280' };
  return CATEGORY_COLORS[kat_kode] || { background: '#E0E5EC', color: '#6B7280' };
}

export default function FabricSpecsPage() {
  const [rows, setRows] = useState<FabricSpec[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [katKode, setKatKode] = useState<string>('all');

  // Slide-out panel state
  const [panelOpen, setPanelOpen] = useState(false);
  const [editingSpec, setEditingSpec] = useState<FabricSpec | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Partial<FabricSpec>>({});

  // Collapsible sections state
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    identity: true,
    threadWeave: true,
    dimensions: true,
    colorProcess: true,
  });

  const fetchSpecs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('q', search);
      if (katKode && katKode !== 'all') params.set('kat_kode', katKode);

      const data = await authFetch(
        `/denim/fabric-specs?${params}`
      ) as FabricSpec[];
      setRows(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search, katKode]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSpecs();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchSpecs]);

  const openNewSpec = () => {
    setEditingSpec(null);
    setFormData({
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
    });
    setExpandedSections({
      identity: true,
      threadWeave: true,
      dimensions: true,
      colorProcess: true,
    });
    setPanelOpen(true);
  };

  const openEditSpec = (spec: FabricSpec) => {
    setEditingSpec(spec);
    setFormData({ ...spec });
    setExpandedSections({
      identity: true,
      threadWeave: true,
      dimensions: true,
      colorProcess: true,
    });
    setPanelOpen(true);
  };

  const closePanel = () => {
    setPanelOpen(false);
    setEditingSpec(null);
    setFormData({});
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
      closePanel();
      fetchSpecs();
    } catch (e: any) {
      toast.error(e.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const updateFormField = (field: keyof FabricSpec, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const renderFormField = (
    field: keyof FabricSpec,
    label: string,
    required = false,
    type: 'text' | 'number' = 'text'
  ) => {
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
            updateFormField(field, newVal);
          }}
          className="input"
        />
      </div>
    );
  };

  return (
    <div>
      <PageHeader
        title="Fabric Specs"
        subtitle={`${rows.length.toLocaleString()} specs`}
        actions={
          <Button variant="outline" size="sm" onClick={fetchSpecs} className="h-8 w-8 p-0">
            <Search className="w-3.5 h-3.5" />
          </Button>
        }
      />

      <div className="px-4 py-4 sm:px-8 pb-8">
        {/* Filters */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9CA3AF' }} />
            <Input
              placeholder="Search by item, kons_kode, kode..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>

          <Select value={katKode} onValueChange={setKatKode}>
            <SelectTrigger className="w-36 h-9">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {KAT_KODE_OPTIONS.map(opt => (
                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={openNewSpec} style={{ marginLeft: 'auto', background: '#6C63FF', borderRadius: '16px', boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)', color: '#fff', border: 'none', padding: '8px 16px', fontSize: '14px', fontWeight: 500 }}>
            <Plus className="w-4 h-4 mr-1.5" />
            New Spec
          </Button>
        </div>

        {/* Table */}
        <div
          className="rounded-[32px] p-6 overflow-x-auto"
          style={{
            background: '#E0E5EC',
            boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)',
          }}
        >
          <Table>
            <TableHeader>
              <TableRow style={{ background: '#E0E5EC', borderBottom: '1px solid rgb(163 177 198 / 0.3)' }}>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Item</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Category</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>TE</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Ne Lusi / Ne Pakan</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Sisir / Pick</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Warna</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Used In</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest w-16" style={{ color: '#9CA3AF' }}>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8}>
                    <div className="flex flex-col items-center justify-center py-16" style={{ color: '#9CA3AF' }}>
                      <Inbox className="w-10 h-10 mb-3" />
                      <p className="text-sm font-medium">No fabric specs found</p>
                      <p className="text-xs mt-1">Try adjusting your search</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map(spec => (
                  <TableRow key={spec.id} style={{ background: '#E0E5EC', borderBottom: '1px solid rgb(163 177 198 / 0.3)' }}>
                    <TableCell>
                      <div className="font-medium" style={{ color: '#3D4852' }}>{spec.item}</div>
                      <div className="text-xs" style={{ color: '#6B7280' }}>{spec.kons_kode}</div>
                    </TableCell>
                    <TableCell>
                      <span style={getCategoryColor(spec.kat_kode)} className="inline-flex px-2 py-0.5 rounded-[9999px] text-xs font-bold">
                        {spec.kat_kode || '—'}
                      </span>
                    </TableCell>
                    <TableCell style={{ color: '#6B7280' }}>{spec.te ?? '—'}</TableCell>
                    <TableCell style={{ color: '#6B7280' }}>
                      {spec.lusi_ne || '—'} / {spec.pakan_ne || '—'}
                    </TableCell>
                    <TableCell style={{ color: '#6B7280' }}>
                      {spec.sisir || '—'} / {spec.pick ?? '—'}
                    </TableCell>
                    <TableCell style={{ color: '#6B7280' }}>{spec.warna || '—'}</TableCell>
                    <TableCell style={{ color: '#6B7280' }}>
                      {spec.usage_count > 0 ? (
                        <span style={{ color: '#3D4852', fontWeight: 500 }}>{spec.usage_count}</span>
                      ) : (
                        <span>0</span>
                      )}
                      <span style={{ color: '#6B7280', fontSize: '12px', marginLeft: '4px' }}>orders</span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditSpec(spec)}
                        style={{ height: '28px', padding: '0 8px', background: 'transparent', border: 'none', color: '#9CA3AF' }}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Slide-out Panel */}
      {panelOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.3)' }}
            onClick={closePanel}
          />

          {/* Panel */}
          <div className="fixed top-0 right-0 z-50 h-full w-[480px] overflow-y-auto" style={{ background: '#E0E5EC', boxShadow: '-9px 0 16px rgb(163 177 198 / 0.4)' }}>
            {/* Header */}
            <div className="sticky top-0 px-6 py-4 flex items-center justify-between" style={{ background: '#E0E5EC', borderBottom: '1px solid rgb(163 177 198 / 0.3)' }}>
              <h2 className="text-lg font-semibold" style={{ color: '#3D4852' }}>
                {editingSpec ? `Edit: ${editingSpec.item}` : 'New Fabric Spec'}
              </h2>
              <Button variant="ghost" size="sm" onClick={closePanel} style={{ height: '32px', width: '32px', padding: 0, background: 'transparent', border: 'none' }}>
                <X className="w-4 h-4" style={{ color: '#6B7280' }} />
              </Button>
            </div>

            {/* Form */}
            <div className="p-6 space-y-4">
              {/* Identity Section */}
              <div style={{ border: '1px solid rgb(163 177 198 / 0.3)', borderRadius: '16px', overflow: 'hidden' }}>
                <button
                  type="button"
                  onClick={() => toggleSection('identity')}
                  className="w-full px-4 py-3 flex items-center justify-between"
                  style={{ background: '#E0E5EC' }}
                >
                  <span className="font-medium" style={{ color: '#3D4852' }}>Identity</span>
                  {expandedSections.identity ? (
                    <ChevronDown className="w-4 h-4" style={{ color: '#6B7280' }} />
                  ) : (
                    <ChevronRight className="w-4 h-4" style={{ color: '#6B7280' }} />
                  )}
                </button>
                {expandedSections.identity && (
                  <div className="p-4 grid grid-cols-2 gap-3">
                    {renderFormField('item', 'Item', true)}
                    {renderFormField('kons_kode', 'Kons Kode', true)}
                    {renderFormField('kode', 'Kode', true)}
                    <div className="form-group">
                      <label>Category</label>
                      <select
                        value={formData.kat_kode || ''}
                        onChange={e => updateFormField('kat_kode', e.target.value)}
                        className="input"
                      >
                        {KAT_KODE_OPTIONS.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Thread & Weave Section */}
              <div style={{ border: '1px solid rgb(163 177 198 / 0.3)', borderRadius: '16px', overflow: 'hidden' }}>
                <button
                  type="button"
                  onClick={() => toggleSection('threadWeave')}
                  className="w-full px-4 py-3 flex items-center justify-between"
                  style={{ background: '#E0E5EC' }}
                >
                  <span className="font-medium" style={{ color: '#3D4852' }}>Thread & Weave</span>
                  {expandedSections.threadWeave ? (
                    <ChevronDown className="w-4 h-4" style={{ color: '#6B7280' }} />
                  ) : (
                    <ChevronRight className="w-4 h-4" style={{ color: '#6B7280' }} />
                  )}
                </button>
                {expandedSections.threadWeave && (
                  <div className="p-4 grid grid-cols-2 gap-3">
                    {renderFormField('lusi_type', 'Lusi Type')}
                    {renderFormField('lusi_ne', 'Lusi NE')}
                    {renderFormField('pakan_type', 'Pakan Type')}
                    {renderFormField('pakan_ne', 'Pakan NE')}
                    {renderFormField('sisir', 'Sisir')}
                    {renderFormField('pick', 'Pick', false, 'number')}
                    {renderFormField('anyaman', 'Anyaman')}
                    {renderFormField('arah', 'Arah')}
                    {renderFormField('te', 'TE', false, 'number')}
                  </div>
                )}
              </div>

              {/* Dimensions & Weight Section */}
              <div style={{ border: '1px solid rgb(163 177 198 / 0.3)', borderRadius: '16px', overflow: 'hidden' }}>
                <button
                  type="button"
                  onClick={() => toggleSection('dimensions')}
                  className="w-full px-4 py-3 flex items-center justify-between"
                >
                  <span className="font-medium" style={{ color: '#3D4852' }}>Dimensions & Weight</span>
                  {expandedSections.dimensions ? (
                    <ChevronDown className="w-4 h-4" style={{ color: '#6B7280' }} />
                  ) : (
                    <ChevronRight className="w-4 h-4" style={{ color: '#6B7280' }} />
                  )}
                </button>
                {expandedSections.dimensions && (
                  <div className="p-4 grid grid-cols-2 gap-3">
                    {renderFormField('lg_inches', 'LG (inches)', false, 'number')}
                    {renderFormField('lf_inches', 'LF (inches)', false, 'number')}
                    {renderFormField('susut_pakan', 'Susut Pakan', false, 'number')}
                    {renderFormField('oz_g', 'OZ (Gram)', false, 'number')}
                    {renderFormField('oz_f', 'OZ (Feet)', false, 'number')}
                  </div>
                )}
              </div>

              {/* Color & Process Section */}
              <div style={{ border: '1px solid rgb(163 177 198 / 0.3)', borderRadius: '16px', overflow: 'hidden' }}>
                <button
                  type="button"
                  onClick={() => toggleSection('colorProcess')}
                  className="w-full px-4 py-3 flex items-center justify-between"
                >
                  <span className="font-medium" style={{ color: '#3D4852' }}>Color & Process</span>
                  {expandedSections.colorProcess ? (
                    <ChevronDown className="w-4 h-4" style={{ color: '#6B7280' }} />
                  ) : (
                    <ChevronRight className="w-4 h-4" style={{ color: '#6B7280' }} />
                  )}
                </button>
                {expandedSections.colorProcess && (
                  <div className="p-4 grid grid-cols-2 gap-3">
                    {renderFormField('warna', 'Warna')}
                    {renderFormField('pretreatment', 'Pre-treatment')}
                    {renderFormField('indigo_i', 'Indigo I', false, 'number')}
                    {renderFormField('indigo_bak_i', 'Indigo Bak I', false, 'number')}
                    {renderFormField('sulfur_s', 'Sulfur S', false, 'number')}
                    {renderFormField('sulfur_bak_s', 'Sulfur Bak S', false, 'number')}
                    {renderFormField('posttreatment', 'Post-treatment')}
                    {renderFormField('finish', 'Finish')}
                    {renderFormField('p_kons', 'P Kons')}
                    <div className="form-group col-span-2">
                      <label>Remarks</label>
                      <textarea
                        value={formData.remarks || ''}
                        onChange={e => updateFormField('remarks', e.target.value)}
                        className="input min-h-[60px]"
                        rows={2}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Save Button */}
              <div className="pt-4 flex gap-3">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  style={{ flex: 1, background: '#6C63FF', borderRadius: '16px', boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)', color: '#fff', border: 'none', padding: '8px 16px', fontSize: '14px', fontWeight: 500 }}
                >
                  {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editingSpec ? 'Update Spec' : 'Create Spec'}
                </Button>
                <Button variant="outline" onClick={closePanel} style={{ background: '#E0E5EC', borderRadius: '16px', boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)', color: '#6B7280', border: 'none' }}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      <style jsx global>{`
        .input {
          width: 100%;
          height: 36px;
          padding: 0 10px;
          font-size: 14px;
          border: none;
          border-radius: 16px;
          background: #E0E5EC;
          color: #3D4852;
          box-shadow: inset 6px 6px 10px rgb(163 177 198 / 0.6), inset -6px -6px 10px rgba(255,255,255,0.5);
          transition: box-shadow 0.15s;
        }
        .input::placeholder {
          color: #9CA3AF;
        }
        .input:focus {
          outline: none;
          box-shadow: inset 10px 10px 20px rgb(163 177 198 / 0.7), inset -10px -10px 20px rgba(255,255,255,0.6), 0 0 0 2px #6C63FF;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .form-group label {
          font-size: 10px;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #9CA3AF;
        }
        .form-group label .required {
          color: #DC2626;
          margin-left: 2px;
        }
        .form-error {
          font-size: 12px;
          color: #DC2626;
        }
        textarea.input {
          height: auto;
          padding: 8px 10px;
          resize: vertical;
        }
        select.input {
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
