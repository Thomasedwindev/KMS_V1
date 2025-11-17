import { useEffect, useState } from 'react';
import { FileCode, Database, AlertCircle, BookOpen, GitBranch } from 'lucide-react';
import { jsonStorage } from '../lib/jsonStorage';

interface Stats {
  codeDocs: number;
  queries: number;
  errors: number;
  sops: number;
  flows: number;
}

export default function Dashboard({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [stats, setStats] = useState<Stats>({
    codeDocs: 0,
    queries: 0,
    errors: 0,
    sops: 0,
    flows: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    const [codeDocs, queries, errors, sops, flows] = await Promise.all([
      jsonStorage.select('code_docs'),
      jsonStorage.select('query_library'),
      jsonStorage.select('error_logs'),
      jsonStorage.select('sop_library'),
      jsonStorage.select('flows')
    ]);

    setStats({
      codeDocs: codeDocs.count || 0,
      queries: queries.count || 0,
      errors: errors.count || 0,
      sops: sops.count || 0,
      flows: flows.count || 0
    });
  }

  const cards = [
    { title: 'Code Documentation', count: stats.codeDocs, icon: FileCode, color: 'bg-blue-500', page: 'knowledge' },
    { title: 'SQL Query Library', count: stats.queries, icon: Database, color: 'bg-green-500', page: 'knowledge' },
    { title: 'Error Intelligence', count: stats.errors, icon: AlertCircle, color: 'bg-red-500', page: 'knowledge' },
    { title: 'SOP Library', count: stats.sops, icon: BookOpen, color: 'bg-yellow-500', page: 'knowledge' },
    { title: 'Flow Diagrams', count: stats.flows, icon: GitBranch, color: 'bg-purple-500', page: 'flows' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">KMS-360° Dashboard</h1>
        <p className="text-gray-600 mt-2">SD7 Indomaret IT Knowledge Management System</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <button
            key={card.title}
            onClick={() => onNavigate(card.page)}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-left"
          >
            <div className="flex items-center justify-between">
              <div className={`${card.color} p-3 rounded-lg`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{card.count}</span>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">{card.title}</h3>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => onNavigate('upload')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Upload Files
          </button>
          <button
            onClick={() => onNavigate('search')}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
          >
            Search Knowledge
          </button>
          <button
            onClick={() => onNavigate('flows')}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
          >
            View Flows
          </button>
        </div>
      </div>
    </div>
  );
}
