'use client';

import { useRef } from 'react';
import { Search, Loader2, X } from 'lucide-react';
import { authFetch } from '../../../../lib/authFetch';
import type { SearchResult } from '../types';

interface RollTraceSearchProps {
  sn: string;
  setSn: (value: string) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  searchResults: SearchResult[];
  setSearchResults: (results: SearchResult[]) => void;
  showDropdown: boolean;
  setShowDropdown: (show: boolean) => void;
  searching: boolean;
  loading: boolean;
  error: string;
  onSelectResult: (result: SearchResult) => void;
  onSearch: () => void;
  onClear: () => void;
}

export function RollTraceSearch({
  sn,
  setSn,
  searchQuery,
  setSearchQuery,
  searchResults,
  setSearchResults,
  showDropdown,
  setShowDropdown,
  searching,
  loading,
  error,
  onSelectResult,
  onSearch,
  onClear,
}: RollTraceSearchProps) {
  const searchRef = useRef<HTMLDivElement>(null);

  return (
    <div className="mb-8" ref={searchRef}>
      <form onSubmit={(e) => { e.preventDefault(); onSearch(); }}>
        <div className="relative max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#9CA3AF' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value.toUpperCase());
              setSn(e.target.value.toUpperCase());
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            placeholder="Search SN (e.g. AE04, 182, D03L)"
            className="w-full rounded-[16px] py-3 pl-12 pr-12 text-lg"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={onClear}
              className="absolute right-4 top-1/2 -translate-y-1/2"
              style={{ color: '#9CA3AF' }}
            >
              <X className="w-5 h-5" />
            </button>
          )}
          {searching && (
            <Loader2 className="absolute right-12 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin" style={{ color: '#9CA3AF' }} />
          )}
        </div>
      </form>

      {/* Search Results Dropdown */}
      {showDropdown && searchResults.length > 0 && (
        <div 
          className="absolute z-50 mt-2 w-full max-w-2xl rounded-[16px] shadow-lg max-h-80 overflow-y-auto"
        >
          {searchResults.map((result, i) => (
            <button
              key={`${result.sn}-${i}`}
              onClick={() => onSelectResult(result)}
              className="w-full px-4 py-3 text-left flex items-center justify-between"
              style={{ 
                borderBottom: '1px solid rgb(163 177 198 / 0.3)',
                color: '#3D4852',
              }}
            >
              <div>
                <span className="font-mono" style={{ color: '#3D4852' }}>{result.sn}</span>
                <span className="ml-2 text-xs" style={{ color: '#9CA3AF' }}>via {result.source === 'gray' ? 'Inspect Gray' : 'Inspect Finish'}</span>
              </div>
              <div className="text-right">
                <span className="text-sm" style={{ color: '#6B7280' }}>{result.kp || 'No KP'}</span>
                <span className={`ml-2 text-xs px-2 py-0.5 rounded-[9999px]`} style={{ 
                  background: result.grade === 'A' ? '#16A34A' : result.grade === 'B' ? '#D97706' : '#9CA3AF',
                  color: '#fff',
                }}>
                  {result.grade || 'No grade'}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Search Button */}
      <button
        onClick={onSearch}
        disabled={loading || !sn.trim()}
        className="mt-4 mb-6 px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed font-medium rounded-[16px] transition-all flex items-center gap-2"
        style={{ 
          background: '#6C63FF', 
          color: '#fff',
        }}
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
        Trace Roll
      </button>
      
      {/* Error */}
      {error && (
        <div 
          className="px-4 py-3 rounded-[16px] mb-6"
          style={{
            color: '#DC2626',
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}
