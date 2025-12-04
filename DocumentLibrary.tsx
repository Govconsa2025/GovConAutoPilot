import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Search, FolderPlus, File, Download, Eye, Trash2, Clock, Tag, Users, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DocumentPreviewModal } from './DocumentPreviewModal';
import { DocumentFilterPanel } from './DocumentFilterPanel';
import { BulkActionsBar } from './BulkActionsBar';
import { BulkTagEditor } from './BulkTagEditor';
import { BulkMoveModal } from './BulkMoveModal';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';


export function DocumentLibrary() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [folders, setFolders] = useState<any[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploading, setUploading] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadData, setUploadData] = useState({ name: '', description: '', tags: '' });
  const [filters, setFilters] = useState({ tags: [], dateFrom: '', dateTo: '', fileTypes: [], minSize: 0, maxSize: Infinity });
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());
  const [showBulkTagEditor, setShowBulkTagEditor] = useState(false);
  const [showBulkMove, setShowBulkMove] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);



  useEffect(() => {
    loadFolders();
    loadDocuments();
  }, [selectedFolder]);

  const loadFolders = async () => {
    const { data } = await supabase.from('document_folders').select('*').order('name');
    if (data) setFolders(data);
  };

  const loadDocuments = async () => {
    let query = supabase.from('documents').select('*').order('created_at', { ascending: false });
    if (selectedFolder) query = query.eq('folder_id', selectedFolder);
    const { data } = await query;
    if (data) setDocuments(data);
  };

  const createFolder = async () => {
    if (!newFolderName) return;
    const { error } = await supabase.from('document_folders').insert({
      name: newFolderName,
      organization_id: 'default-org',
      parent_id: selectedFolder
    });
    if (error) toast.error('Failed to create folder');
    else {
      toast.success('Folder created');
      setNewFolderName('');
      loadFolders();
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const filePath = `${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage.from('documents').upload(filePath, file);

    if (uploadError) {
      toast.error('Upload failed');
      setUploading(false);
      return;
    }

    const tags = uploadData.tags.split(',').map(t => t.trim()).filter(Boolean);
    const { error: dbError } = await supabase.from('documents').insert({
      name: uploadData.name || file.name,
      description: uploadData.description,
      file_path: filePath,
      file_size: file.size,
      file_type: file.type,
      folder_id: selectedFolder,
      tags,
      organization_id: 'default-org'
    });

    if (dbError) toast.error('Failed to save document');
    else {
      toast.success('Document uploaded');
      setShowUpload(false);
      setUploadData({ name: '', description: '', tags: '' });
      loadDocuments();
    }
    setUploading(false);
  };

  const downloadDocument = async (doc: any) => {
    const { data } = await supabase.storage.from('documents').download(doc.file_path);
    if (data) {
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.name;
      a.click();
      toast.success('Download started');
    }
  };

  const deleteDocument = async (docId: string) => {
    const { error } = await supabase.from('documents').delete().eq('id', docId);
    if (error) toast.error('Failed to delete');
    else {
      toast.success('Document deleted');
      loadDocuments();
    }
  };

  const toggleDocSelection = (docId: string) => {
    const newSelected = new Set(selectedDocs);
    if (newSelected.has(docId)) {
      newSelected.delete(docId);
    } else {
      newSelected.add(docId);
    }
    setSelectedDocs(newSelected);
  };

  const handleBulkDownload = async () => {
    const { data, error } = await supabase.functions.invoke('bulk-download-documents', {
      body: { documentIds: Array.from(selectedDocs) }
    });
    
    if (error) {
      toast.error('Bulk download failed');
    } else {
      // Download each file individually
      for (const docId of selectedDocs) {
        const doc = documents.find(d => d.id === docId);
        if (doc) await downloadDocument(doc);
      }
      toast.success(`Downloaded ${selectedDocs.size} documents`);
    }
  };

  const handleBulkDelete = async () => {
    const { error } = await supabase.from('documents').delete().in('id', Array.from(selectedDocs));
    if (error) {
      toast.error('Bulk delete failed');
    } else {
      toast.success(`Deleted ${selectedDocs.size} documents`);
      setSelectedDocs(new Set());
      loadDocuments();
    }
    setShowDeleteConfirm(false);
  };

  const handleBulkTagSave = async (tags: string[]) => {
    const { error } = await supabase.from('documents')
      .update({ tags })
      .in('id', Array.from(selectedDocs));
    
    if (error) {
      toast.error('Failed to update tags');
    } else {
      toast.success(`Updated tags for ${selectedDocs.size} documents`);
      setSelectedDocs(new Set());
      loadDocuments();
    }
  };

  const handleBulkMove = async (folder: string) => {
    const targetFolder = folders.find(f => f.name === folder);
    const { error } = await supabase.from('documents')
      .update({ folder_id: targetFolder?.id || null })
      .in('id', Array.from(selectedDocs));
    
    if (error) {
      toast.error('Failed to move documents');
    } else {
      toast.success(`Moved ${selectedDocs.size} documents`);
      setSelectedDocs(new Set());
      loadDocuments();
    }
  };

  const getFileTypeCategory = (fileType: string) => {
    if (fileType.includes('pdf')) return 'PDF';
    if (fileType.includes('image')) return 'Image';
    if (fileType.includes('text')) return 'Text';
    if (fileType.includes('word') || fileType.includes('document')) return 'Word';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'Excel';
    return 'Other';
  };

  const filteredDocs = documents.filter(doc => {
    // Search query filter
    if (searchQuery && !doc.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    
    // Tag filters
    if (filters.tags.length > 0 && !filters.tags.some(tag => doc.tags?.includes(tag))) return false;
    
    // Date range filters
    if (filters.dateFrom && new Date(doc.created_at) < new Date(filters.dateFrom)) return false;
    if (filters.dateTo && new Date(doc.created_at) > new Date(filters.dateTo)) return false;
    
    // File type filters
    if (filters.fileTypes.length > 0) {
      const docType = getFileTypeCategory(doc.file_type || '');
      if (!filters.fileTypes.includes(docType)) return false;
    }
    
    // File size filters (convert bytes to MB)
    const sizeMB = doc.file_size / (1024 * 1024);
    if (filters.minSize > 0 && sizeMB < filters.minSize) return false;
    if (filters.maxSize < Infinity && sizeMB > filters.maxSize) return false;
    
    return true;
  });



  const allTags = Array.from(new Set(documents.flatMap(d => d.tags || [])));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline"><FolderPlus className="w-4 h-4 mr-2" />New Folder</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Folder</DialogTitle></DialogHeader>
              <Input placeholder="Folder name" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} />
              <Button onClick={createFolder}>Create</Button>
            </DialogContent>
          </Dialog>
          
          <Dialog open={showUpload} onOpenChange={setShowUpload}>
            <DialogTrigger asChild>
              <Button><Upload className="w-4 h-4 mr-2" />Upload Document</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Upload Document</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <Input placeholder="Document name" value={uploadData.name} onChange={(e) => setUploadData({...uploadData, name: e.target.value})} />
                <Textarea placeholder="Description" value={uploadData.description} onChange={(e) => setUploadData({...uploadData, description: e.target.value})} />
                <Input placeholder="Tags (comma separated)" value={uploadData.tags} onChange={(e) => setUploadData({...uploadData, tags: e.target.value})} />
                <Input type="file" onChange={handleUpload} disabled={uploading} />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="w-64 space-y-2">
          <h3 className="font-semibold mb-2">Folders</h3>
          <Button variant={!selectedFolder ? "default" : "ghost"} className="w-full justify-start" onClick={() => setSelectedFolder(null)}>
            All Documents
          </Button>
          {folders.map(folder => (
            <Button key={folder.id} variant={selectedFolder === folder.id ? "default" : "ghost"} className="w-full justify-start" onClick={() => setSelectedFolder(folder.id)}>
              📁 {folder.name}
            </Button>
          ))}
        </div>

        <div className="flex-1">
          <div className="mb-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Search documents..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            
            <DocumentFilterPanel 
              allTags={allTags}
              filters={filters}
              onFiltersChange={setFilters}
            />
          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocs.map(doc => (
              <Card key={doc.id} className="p-4 hover:shadow-lg transition-shadow relative">
                <div className="absolute top-2 left-2">
                  <Checkbox
                    checked={selectedDocs.has(doc.id)}
                    onCheckedChange={() => toggleDocSelection(doc.id)}
                  />
                </div>
                <div className="flex items-start justify-between mb-3 ml-8">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-blue-500" />
                    <div>
                      <h3 className="font-semibold text-sm">{doc.name}</h3>
                      <p className="text-xs text-muted-foreground">v{doc.version_number}</p>
                    </div>
                  </div>
                </div>
                {doc.description && <p className="text-sm text-gray-600 mb-2 ml-8">{doc.description}</p>}
                {doc.tags && doc.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3 ml-8">
                    {doc.tags.map((tag: string) => <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>)}
                  </div>
                )}
                <div className="flex gap-2 ml-8">
                  <Button size="sm" variant="outline" onClick={() => downloadDocument(doc)}><Download className="w-3 h-3" /></Button>
                  <Button size="sm" variant="outline" onClick={() => setSelectedDoc(doc)}><Eye className="w-3 h-3" /></Button>
                  <Button size="sm" variant="outline" onClick={() => deleteDocument(doc.id)}><Trash2 className="w-3 h-3" /></Button>
                </div>
              </Card>
            ))}
          </div>

        </div>
      </div>
      
      <BulkActionsBar
        selectedCount={selectedDocs.size}
        onDownload={handleBulkDownload}
        onDelete={() => setShowDeleteConfirm(true)}
        onEditTags={() => setShowBulkTagEditor(true)}
        onMoveToFolder={() => setShowBulkMove(true)}
        onClearSelection={() => setSelectedDocs(new Set())}
      />

      <BulkTagEditor
        open={showBulkTagEditor}
        onClose={() => setShowBulkTagEditor(false)}
        onSave={handleBulkTagSave}
        selectedCount={selectedDocs.size}
      />

      <BulkMoveModal
        open={showBulkMove}
        onClose={() => setShowBulkMove(false)}
        onMove={handleBulkMove}
        selectedCount={selectedDocs.size}
      />

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedDocs.size} Documents?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the selected documents.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {selectedDoc && (
        <DocumentPreviewModal
          document={selectedDoc}
          open={!!selectedDoc}
          onOpenChange={(open) => !open && setSelectedDoc(null)}
        />
      )}
    </div>
  );
}

