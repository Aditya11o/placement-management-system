import React, { useState, useEffect } from 'react';
import api from '../../api';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import type { SettingsData } from '../../types';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<SettingsData>({
    portalName: 'Placement Management System',
    primaryColor: '#001f3f',
    logoUrl: ''
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await api.get('/settings');
      if (data) setSettings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await api.put('/settings', settings);
      alert('Settings updated successfully. Refresh to see color changes.');
    } catch (err) {
      alert('Failed to update settings');
    }
  };

  const handleUploadLogo = async () => {
    if (!logoFile) return alert('Select an image first');
    const formData = new FormData();
    formData.append('file', logoFile);
    
    try {
      const { data } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const updatedSettings = { ...settings, logoUrl: data.url };
      setSettings(updatedSettings);
      await api.put('/settings', updatedSettings);
      alert('Logo uploaded successfully');
    } catch (err) {
      alert('Failed to upload logo');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="display-md mb-2">Platform Settings</h2>
        <p className="text-[var(--on-surface-variant)] text-lg">Dynamic Branding & Configuration.</p>
      </div>
      
      <Card>
        <h3 className="title-md mb-4 border-b border-[var(--surface-container)] pb-2">Branding</h3>
        <form onSubmit={handleSave} className="space-y-4">
          <Input 
            label="Portal Name" 
            value={settings.portalName || ''} 
            onChange={e => setSettings({...settings, portalName: e.target.value})} 
          />
          <div className="flex flex-col gap-1">
            <label className="label-sm">Primary Theme Color</label>
            <div className="flex items-center gap-4">
              <input 
                type="color" 
                className="w-12 h-12 p-1 rounded-md border border-[var(--surface-container)] cursor-pointer" 
                value={settings.primaryColor || '#001f3f'} 
                onChange={e => setSettings({...settings, primaryColor: e.target.value})} 
              />
              <span className="text-[var(--on-surface-variant)] font-mono">{settings.primaryColor}</span>
            </div>
          </div>
          <Button type="submit" className="mt-4">Save Configuration</Button>
        </form>
      </Card>

      <Card>
        <h3 className="title-md mb-4 border-b border-[var(--surface-container)] pb-2">Institution Logo</h3>
        <div className="flex items-center gap-4">
          {settings.logoUrl && (
            <img src={settings.logoUrl} alt="Logo" className="w-16 h-16 object-contain rounded-md border border-[var(--surface-container)]" />
          )}
          <input 
            type="file" 
            accept="image/*"
            onChange={e => setLogoFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-[var(--on-surface-variant)] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--surface-container)] file:text-[var(--primary)] hover:file:bg-[var(--surface-container-high)]"
          />
          <Button onClick={handleUploadLogo}>Upload New Logo</Button>
        </div>
      </Card>
    </div>
  );
};

export default Settings;
