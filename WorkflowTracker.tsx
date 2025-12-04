interface WorkflowTrackerProps {
  currentStage: string;
}

export default function WorkflowTracker({ currentStage }: WorkflowTrackerProps) {
  const stages = [
    { id: 'discovery', label: 'Discovery', icon: '🔍' },
    { id: 'analysis', label: 'Analysis', icon: '📊' },
    { id: 'outreach', label: 'Outreach', icon: '📧' },
    { id: 'pricing', label: 'Pricing', icon: '💰' },
    { id: 'proposal', label: 'Proposal', icon: '📄' },
    { id: 'submission', label: 'Submission', icon: '✅' },
  ];

  const currentIndex = stages.findIndex(s => s.id === currentStage);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <h3 className="text-lg font-bold mb-4">Workflow Progress</h3>
      <div className="flex items-center justify-between">
        {stages.map((stage, index) => {
          const isComplete = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isPending = index > currentIndex;

          return (
            <div key={stage.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-2 ${
                  isComplete ? 'bg-green-500 text-white' :
                  isCurrent ? 'bg-blue-500 text-white' :
                  'bg-gray-200 text-gray-400'
                }`}>
                  {stage.icon}
                </div>
                <span className={`text-xs font-medium ${
                  isComplete || isCurrent ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {stage.label}
                </span>
              </div>
              {index < stages.length - 1 && (
                <div className={`flex-1 h-1 mx-2 ${
                  isComplete ? 'bg-green-500' : 'bg-gray-200'
                }`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
