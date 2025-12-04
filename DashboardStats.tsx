interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: string;
  color: string;
}

function StatCard({ title, value, change, icon, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex justify-between items-start mb-4">
        <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center text-2xl`}>
          {icon}
        </div>
        {change && (
          <span className="text-sm font-semibold text-green-600">{change}</span>
        )}
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

interface DashboardStatsProps {
  stats: {
    activeOpportunities: number;
    primeOpportunities: number;
    activeProposals: number;
    totalValue: string;
  };
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard 
        title="Active Opportunities" 
        value={stats.activeOpportunities} 
        change="+12%" 
        icon="🎯" 
        color="bg-blue-100"
      />
      <StatCard 
        title="Prime Opportunities" 
        value={stats.primeOpportunities} 
        icon="⭐" 
        color="bg-green-100"
      />
      <StatCard 
        title="Active Proposals" 
        value={stats.activeProposals} 
        icon="📄" 
        color="bg-purple-100"
      />
      <StatCard 
        title="Total Pipeline Value" 
        value={stats.totalValue} 
        change="+8%" 
        icon="💰" 
        color="bg-amber-100"
      />
    </div>
  );
}
