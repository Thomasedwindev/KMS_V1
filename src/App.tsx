import { useState } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import UploadCenter from './components/UploadCenter';
import KnowledgeBrowser from './components/KnowledgeBrowser';
import SearchCenter from './components/SearchCenter';
import FlowViewer from './components/FlowViewer';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />;
      case 'upload':
        return <UploadCenter />;
      case 'knowledge':
        return <KnowledgeBrowser />;
      case 'search':
        return <SearchCenter />;
      case 'flows':
        return <FlowViewer />;
      default:
        return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
