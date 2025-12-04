import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { SamSyncConfig } from './SamSyncConfig';
import { SyncHistory } from './SyncHistory';
import { ScheduledSyncStatus } from './ScheduledSyncStatus';
import { TeamManagement } from './TeamManagement';




export default function SettingsPanel() {
  const { profile: userProfile, hasRole, user } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [profile, setProfile] = useState({
    legal_name: 'Covered Bridge Solutions, Inc.',
    uei: '1234567890AB',
    cage_code: '9XYZ1',
    sdvosb_status: true,
    default_markup_percent: 15
  });
  const [notificationPrefs, setNotificationPrefs] = useState({
    new_solicitations_email: true,
    quote_received_email: true,
    deadline_alerts_email: true,
    email_bounce_alerts: true,
    deadline_alert_days: 3
  });
  const [saved, setSaved] = useState(false);


  useEffect(() => {
    if (hasRole(['Admin'])) {
      fetchUsers();
    }
    loadNotificationPrefs();
  }, []);

  const loadNotificationPrefs = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (data) {
      setNotificationPrefs(data);
    }
  };

  const saveNotificationPrefs = async () => {
    if (!user) return;
    const { error } = await supabase
      .from('notification_preferences')
      .upsert({ ...notificationPrefs, user_id: user.id, updated_at: new Date().toISOString() });
    
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Notification preferences saved' });
    }
  };


  const fetchUsers = async () => {
    const { data } = await supabase.from('user_profiles').select('*').order('created_at', { ascending: false });
    if (data) setUsers(data);
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    const { error } = await supabase.from('user_profiles').update({ role: newRole }).eq('id', userId);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'User role updated' });
      fetchUsers();
    }
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase.from('company_profiles').update(profile).eq('legal_name', 'Covered Bridge Solutions, Inc.');
      if (error) throw error;
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Error saving:', err);
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Company Profile</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Legal Name</label>
            <input type="text" value={profile.legal_name} onChange={(e) => setProfile({ ...profile, legal_name: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">UEI</label>
            <input type="text" value={profile.uei} onChange={(e) => setProfile({ ...profile, uei: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
          </div>
        </div>
      </div>


      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Notification Preferences</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">New Solicitation Alerts</p>
              <p className="text-sm text-gray-500">Get notified when new opportunities match your criteria</p>
            </div>
            <Switch
              checked={notificationPrefs.new_solicitations_email}
              onCheckedChange={(val) => setNotificationPrefs({ ...notificationPrefs, new_solicitations_email: val })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Quote Received Alerts</p>
              <p className="text-sm text-gray-500">Get notified when subcontractors submit quotes</p>
            </div>
            <Switch
              checked={notificationPrefs.quote_received_email}
              onCheckedChange={(val) => setNotificationPrefs({ ...notificationPrefs, quote_received_email: val })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Deadline Alerts</p>
              <p className="text-sm text-gray-500">Get notified before proposal deadlines</p>
            </div>
            <Switch
              checked={notificationPrefs.deadline_alerts_email}
              onCheckedChange={(val) => setNotificationPrefs({ ...notificationPrefs, deadline_alerts_email: val })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email Bounce Alerts</p>
              <p className="text-sm text-gray-500">Get notified when outreach emails fail</p>
            </div>
            <Switch
              checked={notificationPrefs.email_bounce_alerts}
              onCheckedChange={(val) => setNotificationPrefs({ ...notificationPrefs, email_bounce_alerts: val })}
            />
          </div>
          <button
            onClick={saveNotificationPrefs}
            className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700"
          >
            Save Notification Preferences
          </button>
        </div>
      </div>

      <div className="mb-6">
        <SamSyncConfig />
      </div>

      <div className="mb-6">
        <SyncHistory />
      </div>

      <div className="mb-6">
        <ScheduledSyncStatus />
      </div>

      <div className="mb-6">
        <TeamManagement />
      </div>




      {hasRole(['Admin']) && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">User Management</h2>
          <div className="space-y-3">
            {users.map(user => (
              <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{user.full_name || user.email}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                <Select value={user.role} onValueChange={(val) => updateUserRole(user.id, val)}>
                  <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Manager">Manager</SelectItem>
                    <SelectItem value="Analyst">Analyst</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </div>
      )}


      <button onClick={handleSave} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700">
        {saved ? 'Saved!' : 'Save Settings'}
      </button>
    </div>
  );
}
