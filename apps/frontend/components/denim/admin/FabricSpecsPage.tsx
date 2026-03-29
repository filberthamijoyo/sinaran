'use client';

import { useEffect, useState, useCallback } from 'react';
import { authFetch } from '../../../lib/authFetch';
import PageHeader from '../../layout/PageHeader';
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
    <div>
      <PageHeader
        title="Fabric Specs"
        subtitle={`${rows.length.toLocaleString()} specs`}
        actions={
          <Button variant="outline" size="sm" onClick={fetchSpecs} className="h-8 w-8 p-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>
          </Button>
        }
      />
      <div className="px-4 py-4 sm:px-8 pb-8">
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
        />
      </div>

      <FabricSpecsSlideout
        open={panelOpen}
        editingSpec={editingSpec}
        onClose={() => { setPanelOpen(false); setEditingSpec(null); }}
        onSaved={fetchSpecs}
      />
    </div>
  );
}
