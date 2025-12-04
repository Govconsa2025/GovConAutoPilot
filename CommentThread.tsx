import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { MessageSquare, Send, Check } from 'lucide-react';

interface Comment {
  id: string;
  content: string;
  user_name: string;
  created_at: string;
  resolved: boolean;
}

export function CommentThread({ proposalId, section }: { proposalId: string; section: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadComments();
    const subscription = supabase
      .channel(`comments:${proposalId}:${section}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'proposal_comments', filter: `proposal_id=eq.${proposalId}` }, loadComments)
      .subscribe();
    return () => { subscription.unsubscribe(); };
  }, [proposalId, section]);

  const loadComments = async () => {
    const { data } = await supabase.from('proposal_comments').select('*').eq('proposal_id', proposalId).eq('section', section).order('created_at', { ascending: true });
    if (data) setComments(data);
  };

  const addComment = async () => {
    if (!newComment.trim()) return;
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('proposal_comments').insert({
      proposal_id: proposalId, section, content: newComment, user_id: user?.id, user_name: user?.email?.split('@')[0] || 'User'
    });
    if (error) toast.error(error.message);
    else { setNewComment(''); toast.success('Comment added'); }
    setLoading(false);
  };

  const toggleResolved = async (id: string, resolved: boolean) => {
    await supabase.from('proposal_comments').update({ resolved: !resolved }).eq('id', id);
  };

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center gap-2 font-semibold"><MessageSquare className="w-4 h-4" />Comments ({comments.length})</div>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {comments.map(c => (
          <div key={c.id} className="p-2 bg-muted rounded text-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium">{c.user_name}</span>
              <div className="flex items-center gap-2">
                {c.resolved && <Badge variant="outline" className="text-xs">Resolved</Badge>}
                <Button variant="ghost" size="sm" onClick={() => toggleResolved(c.id, c.resolved)}><Check className="w-3 h-3" /></Button>
              </div>
            </div>
            <p>{c.content}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Textarea placeholder="Add a comment..." value={newComment} onChange={(e) => setNewComment(e.target.value)} className="min-h-[60px]" />
        <Button onClick={addComment} disabled={loading}><Send className="w-4 h-4" /></Button>
      </div>
    </Card>
  );
}
