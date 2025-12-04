import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { CheckCircle, XCircle, Clock, Send } from 'lucide-react';
import { toast } from 'sonner';

interface TemplateApprovalWorkflowProps {
  templateId: string;
  isAdmin?: boolean;
  onStatusChange?: () => void;
}

export function TemplateApprovalWorkflow({ templateId, isAdmin, onStatusChange }: TemplateApprovalWorkflowProps) {
  const [template, setTemplate] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTemplate();
  }, [templateId]);

  const loadTemplate = async () => {
    const { data } = await supabase
      .from('document_templates')
      .select('*')
      .eq('id', templateId)
      .single();
    
    setTemplate(data);
  };

  const handleSubmitForApproval = async () => {
    setLoading(true);
    const { error } = await supabase
      .from('document_templates')
      .update({ approval_status: 'pending' })
      .eq('id', templateId);

    if (error) {
      toast.error('Failed to submit for approval');
    } else {
      toast.success('Template submitted for approval');
      loadTemplate();
      if (onStatusChange) onStatusChange();
    }
    setLoading(false);
  };

  const handleApprove = async () => {
    setLoading(true);
    const { data: currentUser } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('document_templates')
      .update({
        approval_status: 'approved',
        approved_by: currentUser.user?.id,
        approved_at: new Date().toISOString()
      })
      .eq('id', templateId);

    if (error) {
      toast.error('Failed to approve template');
    } else {
      toast.success('Template approved');
      loadTemplate();
      if (onStatusChange) onStatusChange();
    }
    setLoading(false);
  };

  const handleReject = async () => {
    if (!rejectionReason) {
      toast.error('Please provide a rejection reason');
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from('document_templates')
      .update({ approval_status: 'rejected' })
      .eq('id', templateId);

    if (error) {
      toast.error('Failed to reject template');
    } else {
      toast.success('Template rejected');
      loadTemplate();
      if (onStatusChange) onStatusChange();
    }
    setLoading(false);
  };

  if (!template) return null;

  const getStatusBadge = () => {
    switch (template.approval_status) {
      case 'draft':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Draft</Badge>;
      case 'pending':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-700"><Clock className="h-3 w-3 mr-1" />Pending Review</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-600"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
    }
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Approval Status</h3>
          {getStatusBadge()}
        </div>

        {template.approval_status === 'draft' && !isAdmin && (
          <Button onClick={handleSubmitForApproval} disabled={loading} className="w-full">
            <Send className="h-4 w-4 mr-2" />
            Submit for Approval
          </Button>
        )}

        {template.approval_status === 'pending' && isAdmin && (
          <div className="space-y-3">
            <Textarea
              placeholder="Rejection reason (if rejecting)"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
            <div className="flex gap-2">
              <Button onClick={handleApprove} disabled={loading} className="flex-1 bg-green-600 hover:bg-green-700">
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
              <Button onClick={handleReject} disabled={loading} variant="destructive" className="flex-1">
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </div>
          </div>
        )}

        {template.approved_at && (
          <p className="text-sm text-gray-500">
            Approved on {new Date(template.approved_at).toLocaleDateString()}
          </p>
        )}
      </div>
    </Card>
  );
}