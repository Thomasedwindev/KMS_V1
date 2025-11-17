import { useState } from 'react';
import { Search, FileCode, Database, AlertCircle, BookOpen } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SearchResult {
  type: 'code' | 'query' | 'error' | 'sop';
  item: any;
  relevance: number;
}

export default function SearchCenter() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setSearching(true);
    try {
      const searchLower = query.toLowerCase();

      const [codeData, queryData, errorData, sopData] = await Promise.all([
        supabase.from('code_docs').select('*'),
        supabase.from('query_library').select('*'),
        supabase.from('error_logs').select('*'),
        supabase.from('sop_library').select('*')
      ]);

      const searchResults: SearchResult[] = [];

      (codeData.data || []).forEach((doc) => {
        let relevance = 0;
        if (doc.filename?.toLowerCase().includes(searchLower)) relevance += 3;
        if (doc.summary?.toLowerCase().includes(searchLower)) relevance += 2;
        if (doc.content?.toLowerCase().includes(searchLower)) relevance += 1;

        if (relevance > 0) {
          searchResults.push({ type: 'code', item: doc, relevance });
        }
      });

      (queryData.data || []).forEach((q) => {
        let relevance = 0;
        if (q.query_text?.toLowerCase().includes(searchLower)) relevance += 3;
        if (q.category?.toLowerCase().includes(searchLower)) relevance += 2;
        if (q.example_usage?.toLowerCase().includes(searchLower)) relevance += 1;

        if (relevance > 0) {
          searchResults.push({ type: 'query', item: q, relevance });
        }
      });

      (errorData.data || []).forEach((err) => {
        let relevance = 0;
        if (err.filename?.toLowerCase().includes(searchLower)) relevance += 3;
        if (err.summary?.toLowerCase().includes(searchLower)) relevance += 2;

        if (Array.isArray(err.errors)) {
          err.errors.forEach((e: any) => {
            if (e.category?.toLowerCase().includes(searchLower)) relevance += 2;
            if (e.pattern?.toLowerCase().includes(searchLower)) relevance += 1;
            if (e.root_cause?.toLowerCase().includes(searchLower)) relevance += 1;
          });
        }

        if (relevance > 0) {
          searchResults.push({ type: 'error', item: err, relevance });
        }
      });

      (sopData.data || []).forEach((sop) => {
        let relevance = 0;
        if (sop.title?.toLowerCase().includes(searchLower)) relevance += 3;
        if (sop.category?.toLowerCase().includes(searchLower)) relevance += 2;

        if (Array.isArray(sop.steps)) {
          sop.steps.forEach((step: string) => {
            if (step?.toLowerCase().includes(searchLower)) relevance += 1;
          });
        }

        if (relevance > 0) {
          searchResults.push({ type: 'sop', item: sop, relevance });
        }
      });

      searchResults.sort((a, b) => b.relevance - a.relevance);
      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearching(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'code': return FileCode;
      case 'query': return Database;
      case 'error': return AlertCircle;
      case 'sop': return BookOpen;
      default: return Search;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'code': return 'text-blue-600';
      case 'query': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'sop': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'code': return 'bg-blue-50 border-blue-200';
      case 'query': return 'bg-green-50 border-green-200';
      case 'error': return 'bg-red-50 border-red-200';
      case 'sop': return 'bg-yellow-50 border-yellow-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.type]) acc[result.type] = [];
    acc[result.type].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">AI Search Center</h1>
        <p className="text-gray-600 mt-2">Search across all knowledge using natural language</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex space-x-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Contoh: Mengapa price_idm toko 0344 berubah?"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={searching || !query.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {searching ? 'Searching...' : 'Search'}
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => setQuery('price mismatch')}
            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
          >
            price mismatch
          </button>
          <button
            onClick={() => setQuery('BKP tidak ditemukan')}
            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
          >
            BKP tidak ditemukan
          </button>
          <button
            onClick={() => setQuery('SELECT query')}
            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
          >
            SELECT query
          </button>
          <button
            onClick={() => setQuery('error handling')}
            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
          >
            error handling
          </button>
        </div>
      </div>

      {results.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              Found {results.length} results
            </h2>
          </div>

          {Object.entries(groupedResults).map(([type, typeResults]) => (
            <div key={type} className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 capitalize flex items-center space-x-2">
                {(() => {
                  const Icon = getIcon(type);
                  return <Icon className={`w-5 h-5 ${getColor(type)}`} />;
                })()}
                <span>{type === 'code' ? 'Code Documentation' : type === 'query' ? 'SQL Queries' : type === 'error' ? 'Error Logs' : 'SOPs'} ({typeResults.length})</span>
              </h3>

              {typeResults.map((result, idx) => (
                <div
                  key={idx}
                  className={`border rounded-lg p-4 ${getBgColor(result.type)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">
                        {result.item.filename || result.item.title || 'Untitled'}
                      </h4>
                      {result.item.summary && (
                        <p className="text-sm text-gray-700 mt-1">{result.item.summary}</p>
                      )}
                      {result.type === 'query' && (
                        <pre className="text-xs font-mono bg-white p-2 rounded mt-2 overflow-x-auto">
                          {result.item.query_text?.substring(0, 150)}...
                        </pre>
                      )}
                      {result.type === 'error' && result.item.errors && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {result.item.errors.slice(0, 3).map((err: any, i: number) => (
                            <span key={i} className="px-2 py-1 bg-red-600 text-white text-xs rounded">
                              {err.category}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end ml-4">
                      <div className="px-2 py-1 bg-white rounded text-xs font-semibold">
                        Relevance: {result.relevance}
                      </div>
                      {result.item.created_at && (
                        <span className="text-xs text-gray-600 mt-2">
                          {new Date(result.item.created_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {!searching && results.length === 0 && query && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Search className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
          <p className="text-gray-600">Try different keywords or browse the knowledge library</p>
        </div>
      )}
    </div>
  );
}
