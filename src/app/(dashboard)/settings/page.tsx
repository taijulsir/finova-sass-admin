'use client';

import { useEffect, useState } from 'react';
import { AdminService } from '@/services/admin.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await AdminService.getSettings();
      setSettings(response.settings);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await AdminService.updateSettings(settings);
      alert('Settings updated');
    } catch (error) {
      console.error(error);
    }
  };

  if (loading || !settings) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Configure global application settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="registration" 
                checked={settings.registrationEnabled}
                onCheckedChange={(checked: boolean) => setSettings({...settings, registrationEnabled: checked})}
              />
              <Label htmlFor="registration">Enable User Registration</Label>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="support-email">Support Email</Label>
              <Input 
                id="support-email" 
                value={settings.supportEmail} 
                onChange={(e) => setSettings({...settings, supportEmail: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="trial-days">Default Trial Days</Label>
              <Input 
                id="trial-days" 
                type="number" 
                value={settings.defaultTrialDays} 
                onChange={(e) => setSettings({...settings, defaultTrialDays: parseInt(e.target.value)})}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit">Save Changes</Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
