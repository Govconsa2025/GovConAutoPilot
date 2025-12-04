import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface OutreachModalProps {
  opportunity: any;
  subcontractor: any;
  onClose: () => void;
}

export default function OutreachModal({ opportunity, subcontractor, onClose }: OutreachModalProps) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-outreach-email', {
        body: {
          to: subcontractor.email,
          subName: subcontractor.name,
          projectTitle: opportunity.title,
          location: opportunity.place_of_performance,
          scopeSummary: 'Comprehensive services as detailed in attached SOW'
        }
      });
      
      if (error) throw error;
      setSent(true);
      setTimeout(() => onClose(), 2000);
    } catch (err) {
      console.error('Send error:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6">
        <h2 className="text-2xl font-bold mb-4">Send Outreach Email</h2>
        
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">To:</p>
          <p className="font-semibold">{subcontractor.name} ({subcontractor.email})</p>
        </div>

        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Project:</p>
          <p className="font-semibold">{opportunity.title}</p>
          <p className="text-sm text-gray-600 mt-2">{opportunity.place_of_performance}</p>
        </div>

        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            This email will include the SOW document (without solicitation number), 
            pricing template, and request a quote within 5 business days.
          </p>
        </div>

        {sent && (
          <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-green-800 font-semibold">Email sent successfully!</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleSend}
            disabled={sending || sent}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {sending ? 'Sending...' : sent ? 'Sent!' : 'Send Outreach Email'}
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
