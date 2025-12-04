import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export default function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const { profile, signOut } = useAuth();
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'opportunities', label: 'Opportunities', icon: '🎯' },
    { id: 'subcontractors', label: 'Subcontractors', icon: '🏢' },
    { id: 'proposals', label: 'Proposals', icon: '📄' },
    { id: 'evaluator', label: 'AI Evaluator', icon: '🤖' },
    { id: 'comparison', label: 'Compare Proposals', icon: '⚖️' },
    { id: 'documents', label: 'Documents', icon: '📁' },
    { id: 'templates', label: 'Templates', icon: '📋' },
    { id: 'pricing', label: 'Pricing', icon: '💰' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];





  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <div className="w-64 bg-slate-900 text-white h-screen fixed left-0 top-0 overflow-y-auto flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-2xl font-bold">GovCon Autopilot</h1>
        <p className="text-sm text-slate-400 mt-1">CBSI Platform</p>
      </div>
      
      <nav className="p-4 flex-1">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
              activeView === item.id 
                ? 'bg-blue-600 text-white' 
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center gap-3 mb-3 px-2">
          <User className="w-5 h-5 text-slate-400" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{profile?.full_name || profile?.email}</p>
            <p className="text-xs text-slate-400">{profile?.role}</p>
          </div>
        </div>
        <Button 
          onClick={handleSignOut} 
          variant="ghost" 
          className="w-full justify-start text-slate-300 hover:bg-slate-800"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
