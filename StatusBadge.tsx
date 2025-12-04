interface StatusBadgeProps {
  status: string;
  className?: string;
}

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const getStyles = () => {
    switch (status.toUpperCase()) {
      case 'PRIME':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'SUB_PLAY':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'REJECT':
        return 'bg-gray-100 text-gray-600 border-gray-300';
      case 'NEW':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'IN_REVIEW':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'OUTREACH':
        return 'bg-cyan-100 text-cyan-800 border-cyan-300';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-300';
    }
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStyles()} ${className}`}>
      {status.replace('_', ' ')}
    </span>
  );
}
