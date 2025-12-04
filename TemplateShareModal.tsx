import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { Users, X } from 'lucide-react';
import { toast } from 'sonner';

interface TemplateShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateId: string;
  templateName: string;
}

export function TemplateShareModal({ isOpen, onClose, templateId, templateName }: TemplateShareModalProps) {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState('view');
  const [shares, setShares] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadShares();
    }
  }, [isOpen, templateId]);

  const loadShares = async () => {
    const { data } = await supabase
      .from('template_shares')
      .select('*, shared_with:auth.users!shared_with(email)')
      .eq('template_id', templateId);
    setShares(data || []);
  };

  const handleShare = async () => {
    setLoading(true);
    const { data: user } = await supabase.from('auth.users').select('id').eq('email', email).single();
    
    if (!user) {
      toast.error('User not found');
      setLoading(false);
      return;
    }

    const { data: currentUser } = await supabase.auth.getUser();
    const { error } = await supabase.from('template_shares').insert({
      template_id: templateId,
      shared_by: currentUser.user?.id,
      shared_with: user.id,
      permission
    });

    if (error) {
      toast.error('Failed to share template');
    } else {
      toast.success('Template shared successfully');
      setEmail('');
      loadShares();
    }
    setLoading(false);
  };

  const handleRemoveShare = async (shareId: string) => {
    await supabase.from('template_shares').delete().eq('id', shareId);
    toast.success('Share removed');
    loadShares();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Share Template: {templateName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <Label>Email Address</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@example.com" />
            </div>
            <div>
              <Label>Permission</Label>
              <Select value={permission} onValueChange={setPermission}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view">View</SelectItem>
                  <SelectItem value="edit">Edit</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleShare} disabled={loading || !email}>Share</Button>

          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Shared With</h4>
            <div className="space-y-2">
              {shares.map((share) => (
                <div key={share.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span>{share.shared_with?.email}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">{share.permission}</span>
                    <Button size="sm" variant="ghost" onClick={() => handleRemoveShare(share.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}