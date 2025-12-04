import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, TrendingUp, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { TemplateCard } from './TemplateCard';
import { TemplatePreviewModal } from './TemplatePreviewModal';
import { CreateFromTemplateModal } from './CreateFromTemplateModal';
import { TemplateShareModal } from './TemplateShareModal';
import { TemplateAnalytics } from './TemplateAnalytics';
import { AITemplateGenerator } from './AITemplateGenerator';

const CATEGORIES = ['RFP Response', 'Cover Letter', 'Technical Proposal', 'Past Performance', 'Capability Statement', 'Other'];

export function TemplatesLibrary() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [previewTemplate, setPreviewTemplate] = useState<any>(null);
  const [createFromTemplate, setCreateFromTemplate] = useState<any>(null);
  const [shareTemplate, setShareTemplate] = useState<any>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '', description: '', category: '', content: '', tags: '', is_public: false
  });


  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    const { data } = await supabase.from('document_templates').select('*').order('usage_count', { ascending: false });
    if (data) setTemplates(data);
  };

  const createTemplate = async () => {
    if (!newTemplate.name || !newTemplate.category || !newTemplate.content) {
      toast.error('Please fill required fields');
      return;
    }

    const tags = newTemplate.tags.split(',').map(t => t.trim()).filter(Boolean);
    const { error } = await supabase.from('document_templates').insert({
      ...newTemplate,
      tags,
      user_id: (await supabase.auth.getUser()).data.user?.id
    });

    if (error) {
      toast.error('Failed to create template');
    } else {
      toast.success('Template created');
      setShowCreateTemplate(false);
      setNewTemplate({ name: '', description: '', category: '', content: '', tags: '', is_public: false });
      loadTemplates();
    }
  };

  const handleAITemplateGenerated = async (template: string, metadata: any) => {
    setNewTemplate({
      name: `AI Generated - ${metadata.templateType}`,
      description: `Generated for ${metadata.agency || 'Federal Government'} - ${metadata.contractType || 'General'}`,
      category: metadata.templateType === 'rfp_response' ? 'RFP Response' : 
                metadata.templateType === 'cover_letter' ? 'Cover Letter' :
                metadata.templateType === 'technical_proposal' ? 'Technical Proposal' :
                metadata.templateType === 'past_performance' ? 'Past Performance' :
                metadata.templateType === 'capability_statement' ? 'Capability Statement' : 'Other',
      content: template,
      tags: `AI-generated,${metadata.contractType || ''},${metadata.agency || ''}`,
      is_public: false
    });
    setShowAIGenerator(false);
    setShowCreateTemplate(true);
  };

  const handleUseTemplate = async (template: any) => {
    setCreateFromTemplate(template);
    await supabase.from('document_templates').update({ usage_count: template.usage_count + 1 }).eq('id', template.id);
    loadTemplates();
  };

  const handleCreateDocument = async (data: any) => {
    const { error } = await supabase.from('documents').insert({
      name: data.name,
      description: `Created from template: ${createFromTemplate.name}`,
      content: data.content,
      folder_id: null,
      tags: createFromTemplate.tags,
      organization_id: 'default-org'
    });

    if (error) {
      toast.error('Failed to create document');
    } else {
      toast.success('Document created from template');
    }
  };

  const filteredTemplates = templates.filter(t => {
    if (searchQuery && !t.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
    return true;
  });


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Document Templates</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowAIGenerator(!showAIGenerator)}>
            <Sparkles className="w-4 h-4 mr-2" />
            AI Generator
          </Button>
          <Button variant="outline" onClick={() => setShowAnalytics(!showAnalytics)}>
            <TrendingUp className="w-4 h-4 mr-2" />
            {showAnalytics ? 'Hide' : 'Show'} Analytics
          </Button>
          <Dialog open={showCreateTemplate} onOpenChange={setShowCreateTemplate}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 mr-2" />Create Template</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Create New Template</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Name*</Label><Input value={newTemplate.name} onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})} /></div>
                <div><Label>Description</Label><Textarea value={newTemplate.description} onChange={(e) => setNewTemplate({...newTemplate, description: e.target.value})} /></div>
                <div><Label>Category*</Label><Select value={newTemplate.category} onValueChange={(v) => setNewTemplate({...newTemplate, category: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select></div>
                <div><Label>Content*</Label><Textarea rows={8} value={newTemplate.content} onChange={(e) => setNewTemplate({...newTemplate, content: e.target.value})} /></div>
                <div><Label>Tags</Label><Input placeholder="comma separated" value={newTemplate.tags} onChange={(e) => setNewTemplate({...newTemplate, tags: e.target.value})} /></div>
                <Button onClick={createTemplate} className="w-full">Create Template</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {showAIGenerator && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg">
          <AITemplateGenerator onTemplateGenerated={handleAITemplateGenerated} />
        </div>
      )}

      {showAnalytics && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
          <TemplateAnalytics showTopTemplates={true} />
        </div>
      )}


      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input placeholder="Search templates..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          {CATEGORIES.map(cat => <TabsTrigger key={cat} value={cat}>{cat}</TabsTrigger>)}
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map(template => (
          <TemplateCard 
            key={template.id} 
            template={template} 
            onPreview={setPreviewTemplate} 
            onUse={handleUseTemplate}
            onShare={setShareTemplate}
          />
        ))}
      </div>

      <TemplatePreviewModal isOpen={!!previewTemplate} onClose={() => setPreviewTemplate(null)} template={previewTemplate} onUse={handleUseTemplate} />
      <CreateFromTemplateModal isOpen={!!createFromTemplate} onClose={() => setCreateFromTemplate(null)} template={createFromTemplate} onCreate={handleCreateDocument} />
      {shareTemplate && (
        <TemplateShareModal 
          isOpen={!!shareTemplate} 
          onClose={() => setShareTemplate(null)} 
          templateId={shareTemplate.id}
          templateName={shareTemplate.name}
        />
      )}
    </div>
  );
}