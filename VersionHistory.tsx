import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Clock, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

interface Version {
  id: string;
  version_number: number;
  created_by_name: string;
  change_summary?: string;
  created_at: string;
  content: any;
}

export function VersionHistory({ proposalId, onRestore }: { proposalId: string; onRestore: (content: any) => void }) {
  const [versions, setVersions] = useState<Version[]>([]);

  useEffect(() => {
    loadVersions();
  }, [proposalId]);

  const loadVersions = async () => {
    const { data } = await supabase.from('proposal_versions').select('*').eq('proposal_id', proposalId).order('version_number', { ascending: false });
    if (data) setVersions(data);
  };

  const restoreVersion = (version: Version) => {
    onRestore(version.content);
    toast.success(`Restored version ${version.version_number}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Clock className="w-5 h-5" />Version History</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-3">
            {versions.map(v => (
              <div key={v.id} className="flex items-start justify-between p-3 border rounded">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge>v{v.version_number}</Badge>
                    <span className="text-sm font-medium">{v.created_by_name}</span>
                  </div>
                  {v.change_summary && <p className="text-sm text-muted-foreground">{v.change_summary}</p>}
                  <p className="text-xs text-muted-foreground">{new Date(v.created_at).toLocaleString()}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => restoreVersion(v)}><RotateCcw className="w-4 h-4 mr-1" />Restore</Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
