import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface BulkMoveModalProps {
  open: boolean;
  onClose: () => void;
  onMove: (folder: string) => void;
  selectedCount: number;
}

export function BulkMoveModal({ open, onClose, onMove, selectedCount }: BulkMoveModalProps) {
  const [folder, setFolder] = useState('');

  const handleMove = () => {
    if (folder.trim()) {
      onMove(folder.trim());
      setFolder('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Move {selectedCount} Documents</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="folder">Folder Path</Label>
            <Input
              id="folder"
              placeholder="e.g., /proposals/2024"
              value={folder}
              onChange={(e) => setFolder(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleMove}>Move Documents</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
