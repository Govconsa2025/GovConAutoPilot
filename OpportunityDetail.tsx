import { useState } from 'react';
import StatusBadge from './StatusBadge';
import ScoreBadge from './ScoreBadge';
import { supabase } from '@/lib/supabase';

interface OpportunityDetailProps {
  opportunity: any;
  onClose: () => void;
}

export default function OpportunityDetail({ opportunity, onClose }: OpportunityDetailProps) {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-solicitation', {
        body: {
          documentText: `This is a sample solicitation for ${opportunity.title}`,
          solicitationTitle: opportunity.title
        }
      });
      
      if (error) throw error;
      setAnalysis(JSON.parse(data.analysis));
    } catch (err) {
      console.error('Analysis error:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{opportunity.title}</h2>
            <p className="text-gray-600">{opportunity.solicitation_number}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
        </div>

        <div className="p-6">
          <div className="flex gap-4 mb-6">
            <StatusBadge status={opportunity.classification} />
            <ScoreBadge score={opportunity.prime_score} label="Prime Score" />
            <ScoreBadge score={opportunity.sub_score} label="Sub Score" />
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="text-sm text-gray-600">Agency</label>
              <p className="font-semibold">{opportunity.agency}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Set Aside</label>
              <p className="font-semibold">{opportunity.set_aside}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Location</label>
              <p className="font-semibold">{opportunity.place_of_performance}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Due Date</label>
              <p className="font-semibold">{new Date(opportunity.due_date).toLocaleDateString()}</p>
            </div>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 mb-6"
          >
            {analyzing ? 'Analyzing...' : 'Run AI Analysis'}
          </button>

          {analysis && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-bold mb-2">Scope of Work</h3>
                <p className="text-gray-700">{analysis.scopeOfWork}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-bold mb-2">Technical Requirements</h3>
                <ul className="list-disc list-inside text-gray-700">
                  {analysis.technicalRequirements?.map((req: string, i: number) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
