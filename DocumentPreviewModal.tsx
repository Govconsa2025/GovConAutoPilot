import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, ChevronRight, MessageSquare, Clock, Send } from 'lucide-react';
import { toast } from 'sonner';

interface DocumentPreviewModalProps {
  document: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DocumentPreviewModal({ document, open, onOpenChange }: DocumentPreviewModalProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [versions, setVersions] = useState<any[]>([]);
  const [currentVersion, setCurrentVersion] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (document && open) {
      loadPreview();
      loadVersions();
      loadComments();
    }
  }, [document, open]);

  const loadPreview = async () => {
    const { data } = await supabase.storage.from('documents').download(document.file_path);
    if (data) {
      const url = URL.createObjectURL(data);
      setPreviewUrl(url);
    }
  };

  const loadVersions = async () => {
    const { data } = await supabase
      .from('document_versions')
      .select('*')
      .eq('document_id', document.id)
      .order('version_number', { ascending: false });
    if (data) setVersions(data);
  };

  const loadComments = async () => {
    const { data } = await supabase
      .from('document_comments')
      .select('*, user:user_id(email)')
      .eq('document_id', document.id)
      .order('created_at', { ascending: false });
    if (data) setComments(data);
  };

  const addComment = async () => {
    if (!newComment.trim()) return;
    setLoading(true);
    const { error } = await supabase.from('document_comments').insert({
      document_id: document.id,
      content: newComment
    });
    if (error) toast.error('Failed to add comment');
    else {
      toast.success('Comment added');
      setNewComment('');
      loadComments();
    }
    setLoading(false);
  };

  const switchVersion = async (version: any) => {
    const { data } = await supabase.storage.from('documents').download(version.file_path);
    if (data) {
      const url = URL.createObjectURL(data);
      setPreviewUrl(url);
      setCurrentVersion(version);
    }
  };

  const renderPreview = () => {
    if (!previewUrl) return <div className="flex items-center justify-center h-96">Loading...</div>;

    const fileType = document.file_type || '';
    
    if (fileType.startsWith('image/')) {
      return <img src={previewUrl} alt={document.name} className="max-w-full h-auto" />;
    } else if (fileType === 'application/pdf') {
      return <iframe src={previewUrl} className="w-full h-[600px]" />;
    } else if (fileType.startsWith('text/')) {
      return <iframe src={previewUrl} className="w-full h-[600px] border" />;
    } else {
      return <div className="text-center p-8">Preview not available. <Button onClick={() => window.open(previewUrl)}>Download</Button></div>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{document?.name}</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="preview" className="w-full">
          <TabsList>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="versions">Versions ({versions.length})</TabsTrigger>
            <TabsTrigger value="comments">Comments ({comments.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="preview" className="space-y-4">
            <ScrollArea className="h-[600px]">{renderPreview()}</ScrollArea>
          </TabsContent>
          
          <TabsContent value="versions" className="space-y-2">
            <ScrollArea className="h-[500px]">
              {versions.map(v => (
                <div key={v.id} className="p-3 border rounded mb-2 flex justify-between items-center">
                  <div>
                    <Badge>v{v.version_number}</Badge>
                    <p className="text-sm mt-1">{new Date(v.created_at).toLocaleString()}</p>
                  </div>
                  <Button size="sm" onClick={() => switchVersion(v)}>View</Button>
                </div>
              ))}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="comments" className="space-y-4">
            <div className="flex gap-2">
              <Textarea placeholder="Add a comment..." value={newComment} onChange={(e) => setNewComment(e.target.value)} />
              <Button onClick={addComment} disabled={loading}><Send className="w-4 h-4" /></Button>
            </div>
            <ScrollArea className="h-[400px]">
              {comments.map(c => (
                <div key={c.id} className="p-3 border rounded mb-2">
                  <div className="flex justify-between mb-2">
                    <span className="font-semibold text-sm">{c.user?.email}</span>
                    <span className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleString()}</span>
                  </div>
                  <p className="text-sm">{c.content}</p>
                </div>
              ))}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
