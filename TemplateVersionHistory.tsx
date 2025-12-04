import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { History, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

interface TemplateVersionHistoryProps {
  templateId: string;
  onRestore?: (version: any) => void;
}

export function TemplateVersionHistory({ templateId, onRestore }: TemplateVersionHistoryProps) {
  const [versions, setVersions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVersions();
  }, [templateId]);

  const loadVersions = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('template_versions')
      .select('*')
      .eq('template_id', templateId)
      .order('version_number', { ascending: false });
    
    setVersions(data || []);
    setLoading(false);
  };

  const handleRestore = async (version: any) => {
    const { data: currentUser } = await supabase.auth.getUser();
    
    // Get current template
    const { data: template } = await supabase
      .from('document_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (!template) return;

    // Save current version before restoring
    await supabase.from('template_versions').insert({
      template_id: templateId,
      version_number: template.version_number,
      content: template.content,
      changes_description: 'Pre-restore backup',
      created_by: currentUser.user?.id
    });

    // Restore version
    await supabase
      .from('document_templates')
      .update({
        content: version.content,
        version_number: template.version_number + 1
      })
      .eq('id', templateId);

    toast.success('Version restored successfully');
    if (onRestore) onRestore(version);
    loadVersions();
  };

  if (loading) return <div>Loading versions...</div>;

  return (
    <div className="space-y-3">
      <h3 className="font-semibold flex items-center gap-2">
        <History className="h-5 w-5" />
        Version History
      </h3>
      {versions.length === 0 ? (
        <p className="text-sm text-gray-500">No version history available</p>
      ) : (
        versions.map((version) => (
          <Card key={version.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">Version {version.version_number}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(version.created_at).toLocaleString()}
                  </span>
                </div>
                {version.changes_description && (
                  <p className="text-sm text-gray-600 mb-2">{version.changes_description}</p>
                )}
                <p className="text-xs text-gray-500 line-clamp-2">{version.content?.substring(0, 150)}...</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleRestore(version)}
                className="ml-4"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Restore
              </Button>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}