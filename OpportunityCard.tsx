import StatusBadge from './StatusBadge';
import ScoreBadge from './ScoreBadge';

interface OpportunityCardProps {
  opportunity: any;
  onClick: () => void;
}

export default function OpportunityCard({ opportunity, onClick }: OpportunityCardProps) {
  const daysRemaining = Math.ceil((new Date(opportunity.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const isUrgent = daysRemaining <= 7;

  return (
    <div 
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-lg transition-all cursor-pointer hover:border-blue-400"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{opportunity.title}</h3>
          <p className="text-sm text-gray-600">{opportunity.solicitation_number}</p>
        </div>
        <StatusBadge status={opportunity.classification} />
      </div>
      
      <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
        <div>
          <span className="text-gray-500">Agency:</span>
          <p className="font-medium text-gray-900">{opportunity.agency}</p>
        </div>
        <div>
          <span className="text-gray-500">Location:</span>
          <p className="font-medium text-gray-900">{opportunity.place_of_performance}</p>
        </div>
      </div>

      <div className="flex justify-between items-center pt-3 border-t">
        <div className="flex gap-4">
          <ScoreBadge score={opportunity.prime_score} label="Prime" />
          <ScoreBadge score={opportunity.sub_score} label="Sub" />
        </div>
        <div className={`text-right ${isUrgent ? 'text-red-600' : 'text-gray-600'}`}>
          <p className="text-sm font-semibold">{daysRemaining} days</p>
          <p className="text-xs">remaining</p>
        </div>
      </div>
    </div>
  );
}
