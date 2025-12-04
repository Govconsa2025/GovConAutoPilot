import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { RefreshCw, Plus, X, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function SamSyncConfig() {
  const [config, setConfig] = useState<any>(null);
  const [syncing, setSyncing] = useState(false);
  const [keywords, setKeywords] = useState('');
  const [naics, setNaics] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('sync_configurations')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setConfig(data);
    } else {
      await createDefaultConfig(user.id);
    }
  };

  const createDefaultConfig = async (userId: string) => {
    const { data } = await supabase
      .from('sync_configurations')
      .insert({
        user_id: userId,
        name: 'Default Configuration',
        keywords: [],
        set_asides: ['SBA', '8A', 'WOSB', 'SDVOSB'],
        naics_codes: [],
        locations: [],
        source_types: ['federal', 'state', 'local', 'education'],
        min_days_until_due: 14,
        lookback_months: 3,
        is_active: true
      })
      .select()
      .single();
    setConfig(data);
  };

  const syncNow = async () => {
    if (!config) return;
    setSyncing(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase.functions.invoke('sync-sam-gov', {
        body: { configId: config.id, userId: user?.id }
      });

      if (error) throw error;

      toast({
        title: 'Sync Complete',
        description: `Found ${data.found} opportunities, ${data.newCount} new, ${data.updated} updated`
      });
    } catch (error: any) {
      toast({
        title: 'Sync Failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setSyncing(false);
    }
  };

  const addKeyword = () => {
    if (!keywords.trim() || !config) return;
    const updated = [...(config.keywords || []), keywords.trim()];
    updateConfig({ keywords: updated });
    setKeywords('');
  };

  const removeKeyword = (kw: string) => {
    const updated = config.keywords.filter((k: string) => k !== kw);
    updateConfig({ keywords: updated });
  };

  const addNaics = () => {
    if (!naics.trim() || !config) return;
    const updated = [...(config.naics_codes || []), naics.trim()];
    updateConfig({ naics_codes: updated });
    setNaics('');
  };

  const removeNaics = (code: string) => {
    const updated = config.naics_codes.filter((c: string) => c !== code);
    updateConfig({ naics_codes: updated });
  };

  const toggleAutoSync = async (enabled: boolean) => {
    await updateConfig({ is_active: enabled });
    toast({
      title: enabled ? 'Auto-Sync Enabled' : 'Auto-Sync Disabled',
      description: enabled 
        ? 'Opportunities will sync automatically every 12 hours' 
        : 'Automatic syncing has been paused'
    });
  };

  const updateConfig = async (updates: any) => {
    const { data } = await supabase
      .from('sync_configurations')
      .update(updates)
      .eq('id', config.id)
      .select()
      .single();
    setConfig(data);
  };

  if (!config) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>SAM.gov Sync Configuration</CardTitle>
        <CardDescription>
          Configure filters for Federal, State, Local & Education opportunities
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Automatic Sync</p>
              <p className="text-xs text-muted-foreground">
                Runs every 12 hours (6 AM & 6 PM UTC)
              </p>
            </div>
          </div>
          <Switch
            checked={config.is_active}
            onCheckedChange={toggleAutoSync}
          />
        </div>

        <div>
          <Label>Keywords</Label>
          <div className="flex gap-2 mt-1">
            <Input value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="Add keyword" />
            <Button onClick={addKeyword} size="icon"><Plus className="h-4 w-4" /></Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {config.keywords?.map((kw: string) => (
              <Badge key={kw} variant="secondary">
                {kw}
                <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => removeKeyword(kw)} />
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <Label>NAICS Codes</Label>
          <div className="flex gap-2 mt-1">
            <Input value={naics} onChange={(e) => setNaics(e.target.value)} placeholder="Add NAICS code" />
            <Button onClick={addNaics} size="icon"><Plus className="h-4 w-4" /></Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {config.naics_codes?.map((code: string) => (
              <Badge key={code} variant="secondary">
                {code}
                <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => removeNaics(code)} />
              </Badge>
            ))}
          </div>
        </div>

        <Button onClick={syncNow} disabled={syncing} className="w-full">
          <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Syncing...' : 'Sync Now'}
        </Button>
      </CardContent>
    </Card>
  );
}
