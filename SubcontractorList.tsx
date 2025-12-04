import { useState } from 'react';

interface SubcontractorListProps {
  subcontractors: any[];
  onSelect?: (sub: any) => void;
}

export default function SubcontractorList({ subcontractors, onSelect }: SubcontractorListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = subcontractors.filter(sub =>
    sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.services?.some((s: string) => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search subcontractors..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(sub => (
          <div key={sub.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
            <h3 className="font-bold text-gray-900 mb-2">{sub.name}</h3>
            <p className="text-sm text-gray-600 mb-2">{sub.city}, {sub.state}</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {sub.services?.slice(0, 3).map((service: string, i: number) => (
                <span key={i} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                  {service}
                </span>
              ))}
            </div>
            <div className="flex gap-2 text-sm">
              <a href={`tel:${sub.phone}`} className="text-blue-600 hover:underline">{sub.phone}</a>
              <span className="text-gray-400">|</span>
              <a href={`mailto:${sub.email}`} className="text-blue-600 hover:underline">Email</a>
            </div>
            {onSelect && (
              <button
                onClick={() => onSelect(sub)}
                className="mt-3 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 text-sm font-semibold"
              >
                Select for RFQ
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
