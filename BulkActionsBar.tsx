import { Download, Trash2, Tag, FolderInput, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BulkActionsBarProps {
  selectedCount: number;
  onDownload: () => void;
  onDelete: () => void;
  onEditTags: () => void;
  onMoveToFolder: () => void;
  onClearSelection: () => void;
}

export function BulkActionsBar({
  selectedCount,
  onDownload,
  onDelete,
  onEditTags,
  onMoveToFolder,
  onClearSelection
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5">
      <div className="bg-primary text-primary-foreground rounded-lg shadow-2xl px-6 py-4 flex items-center gap-4">
        <span className="font-semibold">{selectedCount} selected</span>
        <div className="h-6 w-px bg-primary-foreground/20" />
        <Button variant="ghost" size="sm" onClick={onDownload} className="text-primary-foreground hover:bg-primary-foreground/20">
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
        <Button variant="ghost" size="sm" onClick={onEditTags} className="text-primary-foreground hover:bg-primary-foreground/20">
          <Tag className="h-4 w-4 mr-2" />
          Edit Tags
        </Button>
        <Button variant="ghost" size="sm" onClick={onMoveToFolder} className="text-primary-foreground hover:bg-primary-foreground/20">
          <FolderInput className="h-4 w-4 mr-2" />
          Move
        </Button>
        <Button variant="ghost" size="sm" onClick={onDelete} className="text-primary-foreground hover:bg-primary-foreground/20">
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
        <div className="h-6 w-px bg-primary-foreground/20" />
        <Button variant="ghost" size="sm" onClick={onClearSelection} className="text-primary-foreground hover:bg-primary-foreground/20">
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
