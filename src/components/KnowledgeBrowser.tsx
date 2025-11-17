import { useEffect, useState } from 'react';
import { FileCode, Database, AlertCircle, BookOpen, X } from 'lucide-react';
import { jsonStorage } from '../lib/jsonStorage';

type Tab = 'code' | 'queries' | 'errors' | 'sops';

export default function KnowledgeBrowser() {
  const [activeTab, setActiveTab] = useState<Tab>('code');
  const [codeDocs, setCodeDocs] = useState<any[]>([]);
  const [queries, setQueries] = useState<any[]>([]);
  const [errors, setErrors] = useState<any[]>([]);
  const [sops, setSops] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  async function loadData() {
    setLoading(true);
    try {
      if (activeTab === 'code') {
        const { data } = await jsonStorage.select('code_docs');
        setCodeDocs(data.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
      } else if (activeTab === 'queries') {
        const { data } = await jsonStorage.select('query_library');
        setQueries(data.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
      } else if (activeTab === 'errors') {
        const { data } = await jsonStorage.select('error_logs');
        setErrors(data.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
      } else if (activeTab === 'sops') {
        const { data } = await jsonStorage.select('sop_library');
        setSops(data.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  const tabs = [
    { id: 'code' as Tab, label: 'Code Docs', icon: FileCode, color: 'text-blue-600' },
    { id: 'queries' as Tab, label: 'SQL Queries', icon: Database, color: 'text-green-600' },
    { id: 'errors' as Tab, label: 'Error Intelligence', icon: AlertCircle, color: 'text-red-600' },
    { id: 'sops' as Tab, label: 'SOP Library', icon: BookOpen, color: 'text-yellow-600' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Knowledge Browser</h1>
        <p className="text-gray-600 mt-2">Browse and explore extracted knowledge</p>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <div className="flex space-x-1 p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-semibold transition-colors ${
                  activeTab === tab.id
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? tab.color : ''}`} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-12 text-gray-600">Loading...</div>
          ) : (
            <div className="space-y-3">
              {activeTab === 'code' && codeDocs.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => setSelectedItem(doc)}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{doc.filename}</h3>
                      <p className="text-sm text-gray-600 mt-1">{doc.summary}</p>
                      <div className="flex space-x-4 mt-2 text-xs text-gray-500">
                        <span>{doc.functions?.length || 0} functions</span>
                        <span>{doc.queries?.length || 0} queries</span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(doc.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}

              {activeTab === 'queries' && queries.map((query) => (
                <div
                  key={query.id}
                  onClick={() => setSelectedItem(query)}
                  className="border border-gray-200 rounded-lg p-4 hover:border-green-400 hover:bg-green-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                          {query.category?.toUpperCase()}
                        </span>
                      </div>
                      <pre className="text-sm text-gray-800 font-mono bg-gray-50 p-2 rounded overflow-x-auto">
                        {query.query_text.substring(0, 100)}...
                      </pre>
                      <p className="text-xs text-gray-500 mt-2">Source: {query.source_file}</p>
                    </div>
                  </div>
                </div>
              ))}

              {activeTab === 'errors' && errors.map((error) => (
                <div
                  key={error.id}
                  onClick={() => setSelectedItem(error)}
                  className="border border-gray-200 rounded-lg p-4 hover:border-red-400 hover:bg-red-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{error.filename}</h3>
                      <p className="text-sm text-gray-600 mt-1">{error.summary}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {Array.isArray(error.errors) && error.errors.slice(0, 3).map((err: any, idx: number) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded"
                          >
                            {err.category}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(error.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}

              {activeTab === 'sops' && sops.map((sop) => (
                <div
                  key={sop.id}
                  onClick={() => setSelectedItem(sop)}
                  className="border border-gray-200 rounded-lg p-4 hover:border-yellow-400 hover:bg-yellow-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{sop.title}</h3>
                      <span className="inline-block mt-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded">
                        {sop.category}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(sop.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}

              {activeTab === 'code' && codeDocs.length === 0 && (
                <div className="text-center py-12 text-gray-500">No code documentation yet</div>
              )}
              {activeTab === 'queries' && queries.length === 0 && (
                <div className="text-center py-12 text-gray-500">No SQL queries yet</div>
              )}
              {activeTab === 'errors' && errors.length === 0 && (
                <div className="text-center py-12 text-gray-500">No error logs yet</div>
              )}
              {activeTab === 'sops' && sops.length === 0 && (
                <div className="text-center py-12 text-gray-500">No SOPs yet</div>
              )}
            </div>
          )}
        </div>
      </div>

      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {selectedItem.filename || selectedItem.title || 'Details'}
              </h2>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {activeTab === 'code' && (
                <>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Summary</h3>
                    <p className="text-gray-700">{selectedItem.summary}</p>
                  </div>
                  {selectedItem.functions && selectedItem.functions.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Functions/Subs</h3>
                      <div className="space-y-2">
                        {selectedItem.functions.map((func: any, idx: number) => (
                          <div key={idx} className="bg-gray-50 p-3 rounded">
                            <span className="font-mono text-sm">{func.type} {func.name}</span>
                            <span className="text-xs text-gray-500 ml-2">Line {func.line}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedItem.queries && selectedItem.queries.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">SQL Queries</h3>
                      <div className="space-y-2">
                        {selectedItem.queries.map((query: any, idx: number) => (
                          <div key={idx} className="bg-gray-50 p-3 rounded">
                            <div className="text-xs text-green-600 font-semibold mb-1">{query.type}</div>
                            <pre className="text-xs font-mono overflow-x-auto">{query.query}</pre>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {activeTab === 'queries' && (
                <>
                  <div>
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded">
                      {selectedItem.category?.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Query</h3>
                    <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm font-mono">
                      {selectedItem.query_text}
                    </pre>
                  </div>
                  {selectedItem.example_usage && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Usage Example</h3>
                      <p className="text-gray-700">{selectedItem.example_usage}</p>
                    </div>
                  )}
                  <div className="text-xs text-gray-500">
                    Source: {selectedItem.source_file}
                  </div>
                </>
              )}

              {activeTab === 'errors' && (
                <>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Summary</h3>
                    <p className="text-gray-700">{selectedItem.summary}</p>
                  </div>
                  {selectedItem.errors && selectedItem.errors.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Error Patterns Detected</h3>
                      <div className="space-y-3">
                        {selectedItem.errors.map((err: any, idx: number) => (
                          <div key={idx} className="border border-red-200 bg-red-50 p-4 rounded-lg">
                            <div className="flex items-start justify-between mb-2">
                              <span className="px-2 py-1 bg-red-600 text-white text-xs font-semibold rounded">
                                {err.category}
                              </span>
                              <span className="text-xs text-gray-600">Line {err.line}</span>
                            </div>
                            <p className="text-sm text-gray-800 font-mono mb-2">{err.pattern}</p>
                            <div className="text-sm text-red-800">
                              <strong>Root Cause:</strong> {err.root_cause}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {activeTab === 'sops' && (
                <>
                  <div>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-semibold rounded">
                      {selectedItem.category}
                    </span>
                  </div>
                  {selectedItem.steps && selectedItem.steps.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Steps</h3>
                      <ol className="list-decimal list-inside space-y-2">
                        {selectedItem.steps.map((step: string, idx: number) => (
                          <li key={idx} className="text-gray-700">{step}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                  {selectedItem.related_errors && selectedItem.related_errors.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Related Errors</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedItem.related_errors.map((err: string, idx: number) => (
                          <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-800 text-sm rounded">
                            {err}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
