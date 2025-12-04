import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { UserPlus, Mail, Trash2, Shield } from 'lucide-react';

interface TeamMember {
  id: string;
  email: string;
  role: string;
  status: string;
  invited_at: string;
  user_id?: string;
}

export function TeamManagement() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('viewer');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTeamMembers();
  }, []);

  const loadTeamMembers = async () => {
    const { data } = await supabase.from('team_members').select('*').order('created_at', { ascending: false });
    if (data) setMembers(data);
  };

  const inviteMember = async () => {
    if (!email) return;
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('team_members').insert({
        email, role, organization_id: user?.id, invited_by: user?.id
      });
      if (error) throw error;

      await supabase.functions.invoke('invite-team-member', {
        body: { email, role, organizationName: 'Your Organization', inviterName: user?.email }
      });

      toast.success('Invitation sent!');
      setEmail('');
      loadTeamMembers();
    } catch (error: any) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  const removeMember = async (id: string) => {
    await supabase.from('team_members').delete().eq('id', id);
    toast.success('Member removed');
    loadTeamMembers();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5" />Team Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="viewer">Viewer</SelectItem>
              <SelectItem value="editor">Editor</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={inviteMember} disabled={loading}><UserPlus className="w-4 h-4 mr-2" />Invite</Button>
        </div>
        <div className="space-y-2">
          {members.map(m => (
            <div key={m.id} className="flex items-center justify-between p-3 border rounded">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>{m.email}</span>
                <Badge variant={m.status === 'active' ? 'default' : 'secondary'}>{m.status}</Badge>
                <Badge variant="outline">{m.role}</Badge>
              </div>
              <Button variant="ghost" size="sm" onClick={() => removeMember(m.id)}><Trash2 className="w-4 h-4" /></Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
