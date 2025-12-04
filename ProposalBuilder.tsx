import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PresenceIndicators } from './PresenceIndicators';
import { CommentThread } from './CommentThread';
import { VersionHistory } from './VersionHistory';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { FileText, Users, History, Save } from 'lucide-react';

export default function ProposalBuilder() {
  const [selectedSolicitation, setSelectedSolicitation] = useState('');
  const [generating, setGenerating] = useState(false);
  const [proposal, setProposal] = useState<any>(null);
  const [proposalId] = useState('demo-proposal-' + Date.now());
  const [currentSection, setCurrentSection] = useState('cover');
  const [userRole, setUserRole] = useState('editor');

  const sections = [
    { id: 'cover', title: 'Cover Letter', status: 'complete' },
    { id: 'exec', title: 'Executive Summary', status: 'complete' },
    { id: 'tech', title: 'Technical Approach', status: 'draft' },
    { id: 'mgmt', title: 'Management Plan', status: 'draft' },
    { id: 'past', title: 'Past Performance', status: 'pending' },
    { id: 'price', title: 'Price Volume', status: 'pending' },
  ];

  const handleGenerate = async () => {
    setGenerating(true);
    setTimeout(() => {
      setProposal({ title: 'Proposal for Janitorial Services - Fort Benning', sections });
      setGenerating(false);
    }, 2000);
  };

  const saveVersion = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: versions } = await supabase.from('proposal_versions').select('version_number').eq('proposal_id', proposalId).order('version_number', { ascending: false }).limit(1);
    const nextVersion = (versions?.[0]?.version_number || 0) + 1;
    await supabase.from('proposal_versions').insert({
      proposal_id: proposalId, version_number: nextVersion, content: proposal, created_by: user?.id, created_by_name: user?.email?.split('@')[0] || 'User', change_summary: 'Manual save'
    });
    toast.success('Version saved');
  };

  return (
    <div className="max-w-6xl space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5" />Proposal Builder</CardTitle>
            {proposal && <PresenceIndicators proposalId={proposalId} currentSection={currentSection} />}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={selectedSolicitation} onValueChange={setSelectedSolicitation}>
            <SelectTrigger><SelectValue placeholder="Choose a solicitation..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="1">W912L9-25-Q-0045 - Janitorial Services</SelectItem>
              <SelectItem value="2">W9124D-25-R-0023 - Roofing Repair</SelectItem>
              <SelectItem value="3">GS-09P-25-MQD-0012 - Pest Control</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleGenerate} disabled={!selectedSolicitation || generating} className="w-full">{generating ? 'Generating...' : 'Generate AI Proposal'}</Button>
        </CardContent>
      </Card>

      {proposal && (
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{proposal.title}</CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="outline">{userRole}</Badge>
                    <Button onClick={saveVersion} size="sm"><Save className="w-4 h-4 mr-1" />Save Version</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs value={currentSection} onValueChange={setCurrentSection}>
                  <TabsList className="grid grid-cols-3 mb-4">
                    {sections.slice(0, 3).map(s => (<TabsTrigger key={s.id} value={s.id}>{s.title}</TabsTrigger>))}
                  </TabsList>
                  {sections.map(s => (
                    <TabsContent key={s.id} value={s.id} className="space-y-4">
                      <div className="p-4 bg-muted rounded min-h-[300px]"><p className="text-muted-foreground">Section content for {s.title}...</p></div>
                      <CommentThread proposalId={proposalId} section={s.id} />
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-4">
            <Dialog>
              <DialogTrigger asChild><Button variant="outline" className="w-full"><Users className="w-4 h-4 mr-2" />Collaborators</Button></DialogTrigger>
              <DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>Manage Collaborators</DialogTitle></DialogHeader><p className="text-sm text-muted-foreground">Add team members to collaborate on this proposal</p></DialogContent>
            </Dialog>
            <Dialog>
              <DialogTrigger asChild><Button variant="outline" className="w-full"><History className="w-4 h-4 mr-2" />Version History</Button></DialogTrigger>
              <DialogContent className="max-w-2xl"><VersionHistory proposalId={proposalId} onRestore={setProposal} /></DialogContent>
            </Dialog>
          </div>
        </div>
      )}
    </div>
  );
}

