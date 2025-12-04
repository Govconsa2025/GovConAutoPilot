interface QuickActionsProps {
  onAction: (action: string) => void;
}

export default function QuickActions({ onAction }: QuickActionsProps) {
  const actions = [
    { id: 'search', label: 'Run SAM Search', icon: '🔍', color: 'bg-blue-600 hover:bg-blue-700' },
    { id: 'analyze', label: 'Analyze Document', icon: '📊', color: 'bg-purple-600 hover:bg-purple-700' },
    { id: 'outreach', label: 'Send Outreach', icon: '📧', color: 'bg-green-600 hover:bg-green-700' },
    { id: 'proposal', label: 'Generate Proposal', icon: '📄', color: 'bg-amber-600 hover:bg-amber-700' },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
      <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map(action => (
          <button
            key={action.id}
            onClick={() => onAction(action.id)}
            className={`${action.color} text-white p-4 rounded-lg font-semibold transition-colors flex flex-col items-center gap-2`}
          >
            <span className="text-3xl">{action.icon}</span>
            <span className="text-sm">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
