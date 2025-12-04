export default function ActivityFeed() {
  const activities = [
    { id: 1, type: 'opportunity', message: 'New opportunity discovered: Janitorial Services - Fort Benning', time: '2 hours ago', icon: '🎯' },
    { id: 2, type: 'analysis', message: 'AI analysis completed for W9124D-25-R-0023', time: '4 hours ago', icon: '📊' },
    { id: 3, type: 'outreach', message: 'Outreach sent to 3 subcontractors for Pest Control project', time: '6 hours ago', icon: '📧' },
    { id: 4, type: 'quote', message: 'Quote received from Superior Roofing Co ($580,000)', time: '1 day ago', icon: '💰' },
    { id: 5, type: 'proposal', message: 'Proposal generated for N00244-25-R-0089', time: '1 day ago', icon: '📄' },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
      <div className="space-y-3">
        {activities.map(activity => (
          <div key={activity.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
            <div className="text-2xl">{activity.icon}</div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">{activity.message}</p>
              <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
