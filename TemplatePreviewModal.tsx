import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, X } from 'lucide-react';
import { TemplateRatingReview } from './TemplateRatingReview';
import { TemplateVersionHistory } from './TemplateVersionHistory';
import { TemplateApprovalWorkflow } from './TemplateApprovalWorkflow';
import { TemplateAnalytics } from './TemplateAnalytics';
interface TemplatePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: any;
  onUse: (template: any) => void;
}

export function TemplatePreviewModal({ isOpen, onClose, template, onUse }: TemplatePreviewModalProps) {
  if (!template) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{template.name}</DialogTitle>
          <DialogDescription>{template.description}</DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="preview" className="w-full">
          <TabsList>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="ratings">Ratings & Reviews</TabsTrigger>
            <TabsTrigger value="versions">Version History</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="approval">Approval</TabsTrigger>
          </TabsList>
          
          <TabsContent value="preview" className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge>{template.category}</Badge>
              {template.tags?.map((tag: string) => (
                <Badge key={tag} variant="outline">{tag}</Badge>
              ))}
            </div>
            <ScrollArea className="h-[400px] w-full border rounded-md p-4">
              <div className="whitespace-pre-wrap text-sm">{template.content}</div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="ratings">
            <TemplateRatingReview templateId={template.id} />
          </TabsContent>
          
          <TabsContent value="versions">
            <TemplateVersionHistory templateId={template.id} />
          </TabsContent>
          
          <TabsContent value="analytics">
            <TemplateAnalytics templateId={template.id} />
          </TabsContent>
          
          <TabsContent value="approval">
            <TemplateApprovalWorkflow templateId={template.id} />
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}><X className="h-4 w-4 mr-2" />Close</Button>
          <Button onClick={() => { onUse(template); onClose(); }}><Copy className="h-4 w-4 mr-2" />Use Template</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}