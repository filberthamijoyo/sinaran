'use client';

import { useEffect, useState, useCallback } from 'react';
import { authFetch } from '../../../lib/authFetch';
import { PageShell } from '../../ui/erp/PageShell';
import { Button } from '../../ui/button';
import { FabricSpecsTable } from './fabric-specs/FabricSpecsTable';
import { FabricSpecsSlideout } from './fabric-specs/FabricSpecsSlideout';
import type { FabricSpec } from './fabric-specs/types';

interface Props {
  initialData?: FabricSpec[];
}

export default function FabricSpecsPage({ initialData }: Props) {
  const [rows, setRows] = useState<FabricSpec[]>(initialData ?? []);
  const [loading, setLoading] = useState(!initialData);
  const [search, setSearch] = useState('');
  const [katKode, setKatKode] = useState<string>('all');
  const [panelOpen, setPanelOpen] = useState(false);
  const [editingSpec, setEditingSpec] = useState<FabricSpec | null>(null);

  const fetchSpecs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('q', search);
      if (katKode && katKode !== 'all') params.set('kat_kode', katKode);
      const data = await authFetch(`/denim/fabric-specs?${params}`) as FabricSpec[];
      setRows(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search, katKode]);

  useEffect(() => {
    if (initialData) return;
    const timer = setTimeout(() => fetchSpecs(), 300);
    return () => clearTimeout(timer);
  }, [fetchSpecs, initialData]);

  return (
    <PageShell
      title="Fabric Specs"
      subtitle={`${rows.length.toLocaleString()} specs`}
      actions={
        <Button
          onClick={() => { setEditingSpec(null); setPanelOpen(true); }}
          style={{
            height: 36,
            padding: '0 14px',
            borderRadius: 8,
            background: '#1D4ED8',
            border: 'none',
            color: '#FFFFFF',
            fontSize: 13,
            fontWeight: 600,
            fontFamily: 'inherit',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14"/><path d="M12 5v14"/>
          </svg>
          New Spec
        </Button>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        <FabricSpecsTable
          rows={rows}
          loading={loading}
          search={search}
          katKode={katKode}
          onSearchChange={setSearch}
          onKatKodeChange={setKatKode}
          onRefresh={fetchSpecs}
          onEdit={spec => { setEditingSpec(spec); setPanelOpen(true); }}
          onNew={() => { setEditingSpec(null); setPanelOpen(true); }}
          onRowClick={spec => { setEditingSpec(spec); setPanelOpen(true); }}
        />
      </div>

      <FabricSpecsSlideout
        open={panelOpen}
        editingSpec={editingSpec}
        onClose={() => { setPanelOpen(false); setEditingSpec(null); }}
        onSaved={fetchSpecs}
      />
    </PageShell>
  );
}
