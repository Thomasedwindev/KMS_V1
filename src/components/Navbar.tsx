import { Home, Upload, BookOpen, Search, GitBranch } from 'lucide-react';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function Navbar({ currentPage, onNavigate }: NavbarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'upload', label: 'Upload', icon: Upload },
    { id: 'knowledge', label: 'Knowledge', icon: BookOpen },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'flows', label: 'Flows', icon: GitBranch }
  ];

  return (
    <nav className="bg-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">K</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">KMS-360°</h1>
              <p className="text-xs text-gray-600">SD7 Knowledge Management</p>
            </div>
          </div>

          <div className="flex space-x-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  currentPage === item.id
                    ? 'bg-blue-100 text-blue-700 font-semibold'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
