import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, X } from 'lucide-react';

interface CreateFromTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: any;
  onCreate: (data: any) => void;
}

export function CreateFromTemplateModal({ isOpen, onClose, template, onCreate }: CreateFromTemplateModalProps) {
  const [documentName, setDocumentName] = useState('');
  const [folder, setFolder] = useState('');
  const [customContent, setCustomContent] = useState(template?.content || '');

  const handleCreate = () => {
    onCreate({
      name: documentName,
      folder,
      content: customContent,
      templateId: template?.id
    });
    onClose();
    setDocumentName('');
    setFolder('');
  };

  if (!template) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create from Template: {template.name}</DialogTitle>
          <DialogDescription>
            Customize the template before creating your document
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="doc-name">Document Name</Label>
            <Input
              id="doc-name"
              placeholder="Enter document name"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="folder">Folder</Label>
            <Select value={folder} onValueChange={setFolder}>
              <SelectTrigger>
                <SelectValue placeholder="Select folder" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="proposals">Proposals</SelectItem>
                <SelectItem value="rfp-responses">RFP Responses</SelectItem>
                <SelectItem value="cover-letters">Cover Letters</SelectItem>
                <SelectItem value="technical">Technical Documents</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content (Customize as needed)</Label>
            <Textarea
              id="content"
              rows={10}
              value={customContent}
              onChange={(e) => setCustomContent(e.target.value)}
              className="font-mono text-sm"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!documentName || !folder}>
            <FileText className="h-4 w-4 mr-2" />
            Create Document
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
