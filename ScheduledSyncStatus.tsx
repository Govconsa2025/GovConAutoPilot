import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function ScheduledSyncStatus() {
  const [runs, setRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentRuns();
    const subscription = supabase
      .channel('scheduled_sync_runs')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'scheduled_sync_runs' 
      }, loadRecentRuns)
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadRecentRuns = async () => {
    const { data } = await supabase
      .from('scheduled_sync_runs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    setRuns(data || []);
    setLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'running': return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'completed_with_errors': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default: return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'running': return 'secondary';
      case 'completed_with_errors': return 'outline';
      default: return 'destructive';
    }
  };

  if (loading) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Scheduled Sync History
        </CardTitle>
        <CardDescription>Recent automated sync runs every 12 hours</CardDescription>
      </CardHeader>
      <CardContent>
        {runs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No scheduled syncs have run yet. First sync will occur at next scheduled time.
          </p>
        ) : (
          <div className="space-y-3">
            {runs.map((run) => (
              <div key={run.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(run.status)}
                  <div>
                    <p className="text-sm font-medium">
                      {run.configs_processed} configs processed
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(run.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={getStatusColor(run.status)}>
                    {run.status.replace('_', ' ')}
                  </Badge>
                  {run.status === 'completed' && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {run.total_new} new, {run.total_updated} updated
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
