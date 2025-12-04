import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';

export function SyncHistory() {
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('sync_history')
      .select('*')
      .eq('user_id', user.id)
      .order('started_at', { ascending: false })
      .limit(10);

    if (data) setHistory(data);
  };

  const getStatusIcon = (status: string) => {
    if (status === 'completed') return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    if (status === 'failed') return <XCircle className="h-5 w-5 text-red-600" />;
    return <Clock className="h-5 w-5 text-blue-600 animate-spin" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sync History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {history.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(item.status)}
                <div>
                  <p className="font-medium">{new Date(item.started_at).toLocaleString()}</p>
                  {item.status === 'completed' && (
                    <p className="text-sm text-gray-500">
                      {item.solicitations_found} found, {item.solicitations_new} new, {item.solicitations_updated} updated
                    </p>
                  )}
                  {item.error_message && (
                    <p className="text-sm text-red-600">{item.error_message}</p>
                  )}
                </div>
              </div>
              <Badge variant={item.status === 'completed' ? 'default' : item.status === 'failed' ? 'destructive' : 'secondary'}>
                {item.status}
              </Badge>
            </div>
          ))}
          {history.length === 0 && (
            <p className="text-center text-gray-500 py-4">No sync history yet</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
