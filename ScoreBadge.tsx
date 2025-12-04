interface ScoreBadgeProps {
  score: number;
  label?: string;
}

export default function ScoreBadge({ score, label }: ScoreBadgeProps) {
  const getColor = () => {
    if (score >= 85) return 'text-green-600 bg-green-50';
    if (score >= 70) return 'text-blue-600 bg-blue-50';
    if (score >= 50) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="flex flex-col items-center">
      <div className={`text-2xl font-bold ${getColor()} px-3 py-1 rounded-lg`}>
        {score}
      </div>
      {label && <span className="text-xs text-gray-500 mt-1">{label}</span>}
    </div>
  );
}
