import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Presence {
  user_id: string;
  user_name: string;
  section?: string;
  last_seen: string;
}

export function PresenceIndicators({ proposalId, currentSection }: { proposalId: string; currentSection?: string }) {
  const [presence, setPresence] = useState<Presence[]>([]);

  useEffect(() => {
    updatePresence();
    const interval = setInterval(updatePresence, 5000);
    loadPresence();
    const subscription = supabase
      .channel(`proposal:${proposalId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'proposal_presence', filter: `proposal_id=eq.${proposalId}` }, loadPresence)
      .subscribe();
    return () => {
      clearInterval(interval);
      subscription.unsubscribe();
    };
  }, [proposalId, currentSection]);

  const updatePresence = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('proposal_presence').upsert({
      proposal_id: proposalId, user_id: user.id, user_name: user.email?.split('@')[0] || 'User', section: currentSection, last_seen: new Date().toISOString()
    });
  };

  const loadPresence = async () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { data } = await supabase.from('proposal_presence').select('*').eq('proposal_id', proposalId).gte('last_seen', fiveMinutesAgo);
    if (data) setPresence(data);
  };

  return (
    <TooltipProvider>
      <div className="flex -space-x-2">
        {presence.slice(0, 5).map(p => (
          <Tooltip key={p.user_id}>
            <TooltipTrigger>
              <Avatar className="w-8 h-8 border-2 border-background">
                <AvatarFallback className="text-xs bg-blue-500 text-white">{p.user_name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent><p>{p.user_name}{p.section && ` - ${p.section}`}</p></TooltipContent>
          </Tooltip>
        ))}
        {presence.length > 5 && <Avatar className="w-8 h-8 border-2 border-background"><AvatarFallback className="text-xs">+{presence.length - 5}</AvatarFallback></Avatar>}
      </div>
    </TooltipProvider>
  );
}
