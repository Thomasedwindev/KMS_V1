import { useEffect, useState, useRef } from 'react';
import { GitBranch, Plus, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import mermaid from 'mermaid';

export default function FlowViewer() {
  const [flows, setFlows] = useState<any[]>([]);
  const [selectedFlow, setSelectedFlow] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newFlowTitle, setNewFlowTitle] = useState('');
  const [newFlowMermaid, setNewFlowMermaid] = useState('');
  const diagramRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose'
    });
    loadFlows();
  }, []);

  useEffect(() => {
    if (selectedFlow && diagramRef.current) {
      renderDiagram();
    }
  }, [selectedFlow]);

  async function loadFlows() {
    const { data } = await supabase.from('flows').select('*').order('created_at', { ascending: false });
    setFlows(data || []);
  }

  async function renderDiagram() {
    if (!selectedFlow || !diagramRef.current) return;

    try {
      diagramRef.current.innerHTML = '';
      const id = `mermaid-${Date.now()}`;
      const { svg } = await mermaid.render(id, selectedFlow.mermaid_text);
      diagramRef.current.innerHTML = svg;
    } catch (error) {
      console.error('Mermaid rendering error:', error);
      diagramRef.current.innerHTML = `<div class="text-red-600 p-4">Error rendering diagram. Please check the Mermaid syntax.</div>`;
    }
  }

  async function createFlow() {
    if (!newFlowTitle.trim() || !newFlowMermaid.trim()) return;

    try {
      const { error } = await supabase.from('flows').insert({
        title: newFlowTitle,
        source: 'manual',
        mermaid_text: newFlowMermaid
      });

      if (error) throw error;

      setShowCreateModal(false);
      setNewFlowTitle('');
      setNewFlowMermaid('');
      loadFlows();
    } catch (error) {
      console.error('Error creating flow:', error);
      alert('Error creating flow');
    }
  }

  const exampleMermaid = `sequenceDiagram
    participant User
    participant System
    participant Database

    User->>System: Request data
    System->>Database: Query records
    Database-->>System: Return results
    System-->>User: Display data`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Flow Visualizer</h1>
          <p className="text-gray-600 mt-2">View and create sequence diagrams from logs and traces</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
        >
          <Plus className="w-5 h-5" />
          <span>Create Flow</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Available Flows</h2>
            <div className="space-y-2">
              {flows.map((flow) => (
                <button
                  key={flow.id}
                  onClick={() => setSelectedFlow(flow)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedFlow?.id === flow.id
                      ? 'bg-blue-100 border-2 border-blue-500'
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    <GitBranch className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 truncate">{flow.title}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(flow.created_at).toLocaleDateString()}
                      </div>
                      {flow.source && (
                        <div className="text-xs text-gray-600 mt-1 truncate">
                          Source: {flow.source}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}

              {flows.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <GitBranch className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p>No flows yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            {selectedFlow ? (
              <>
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-gray-900">{selectedFlow.title}</h2>
                  {selectedFlow.source && (
                    <p className="text-sm text-gray-600 mt-1">Source: {selectedFlow.source}</p>
                  )}
                </div>

                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 overflow-x-auto">
                  <div ref={diagramRef} className="flex justify-center" />
                </div>

                <details className="mt-4">
                  <summary className="cursor-pointer font-semibold text-gray-700 hover:text-gray-900">
                    View Mermaid Code
                  </summary>
                  <pre className="mt-2 bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm font-mono">
                    {selectedFlow.mermaid_text}
                  </pre>
                </details>
              </>
            ) : (
              <div className="text-center py-12">
                <GitBranch className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Flow Selected</h3>
                <p className="text-gray-600">Select a flow from the list or create a new one</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Create New Flow</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Flow Title
                </label>
                <input
                  type="text"
                  value={newFlowTitle}
                  onChange={(e) => setNewFlowTitle(e.target.value)}
                  placeholder="e.g., User Authentication Flow"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mermaid Code
                </label>
                <textarea
                  value={newFlowMermaid}
                  onChange={(e) => setNewFlowMermaid(e.target.value)}
                  placeholder={exampleMermaid}
                  rows={12}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Mermaid Quick Reference</h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <p><code>sequenceDiagram</code> - Start a sequence diagram</p>
                  <p><code>participant Name</code> - Define a participant</p>
                  <p><code>A-&gt;&gt;B: Message</code> - Solid arrow with message</p>
                  <p><code>A--&gt;&gt;B: Message</code> - Dashed arrow (response)</p>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={createFlow}
                  disabled={!newFlowTitle.trim() || !newFlowMermaid.trim()}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Create Flow
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
