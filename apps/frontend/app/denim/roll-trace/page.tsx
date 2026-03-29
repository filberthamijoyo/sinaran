'use client';

import { useState, useEffect, useRef } from 'react';
import PageHeader from '../../../components/layout/PageHeader';
import { authFetch } from '../../../lib/authFetch';
import { RollTraceSearch } from './components/RollTraceSearch';
import { RollTraceTimeline } from './components/RollTraceTimeline';
import type { SearchResult, RollTraceData } from './types';

export default function RollTracePage() {
  const [sn, setSn] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState<RollTraceData | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Search for SNs when typing
  useEffect(() => {
    const search = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }
      
      setSearching(true);
      try {
        const result = await authFetch(`/denim/roll-trace/search?q=${encodeURIComponent(searchQuery)}`) as { results?: SearchResult[] };
        setSearchResults(result.results || []);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    };

    const debounce = setTimeout(search, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSelectResult = (result: SearchResult) => {
    setSn(result.sn);
    setSearchQuery(result.sn);
    setShowDropdown(false);
    setSearchResults([]);
  };

  const handleSearch = async () => {
    if (!sn.trim()) return;
    
    setLoading(true);
    setError('');
    setData(null);
    
    try {
      const result = await authFetch(`/denim/roll-trace/${encodeURIComponent(sn.trim())}`) as RollTraceData;
      setData(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch roll trace');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    setSn('');
    setSearchResults([]);
    setData(null);
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <PageHeader 
        title="Roll Trace" 
        subtitle="Trace fabric through the entire production pipeline"
      />
      
      <div className="px-4 sm:px-8 pb-8">
        <RollTraceSearch
          sn={sn}
          setSn={setSn}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchResults={searchResults}
          setSearchResults={setSearchResults}
          showDropdown={showDropdown}
          setShowDropdown={setShowDropdown}
          searching={searching}
          loading={loading}
          error={error}
          onSelectResult={handleSelectResult}
          onSearch={handleSearch}
          onClear={handleClear}
        />
        
        <RollTraceTimeline data={data} />
      </div>
    </div>
  );
}
