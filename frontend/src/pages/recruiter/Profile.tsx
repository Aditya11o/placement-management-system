import React, { useState, useEffect } from 'react';
import api from '../../api';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import type { ProfileData } from '../../types';

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<ProfileData>({ 
    bio: '', 
    companyDetails: { companyName: '', designation: '', website: '' } 
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/profile/me');
        if (data) setProfile(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await api.put('/profile', profile);
      alert('Profile updated successfully');
    } catch (err) {
      alert('Failed to update profile');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="display-md mb-2">Company Profile</h2>
        <p className="text-[var(--on-surface-variant)] text-lg">Update your company details and your designation.</p>
      </div>
      
      <Card>
        <h3 className="title-md mb-4 border-b border-[var(--surface-container)] pb-2">Professional Details</h3>
        <form onSubmit={handleSave} className="space-y-4">
          <Input 
            label="Company Name" 
            value={profile.companyDetails?.companyName || ''} 
            onChange={e => setProfile({...profile, companyDetails: {...profile.companyDetails, companyName: e.target.value}} as ProfileData)} 
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="Your Designation" 
              value={profile.companyDetails?.designation || ''} 
              onChange={e => setProfile({...profile, companyDetails: {...profile.companyDetails, designation: e.target.value}} as ProfileData)} 
            />
            <Input 
              label="Company Website" 
              type="url"
              value={profile.companyDetails?.website || ''} 
              onChange={e => setProfile({...profile, companyDetails: {...profile.companyDetails, website: e.target.value}} as ProfileData)} 
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="label-sm">Bio / About you</label>
            <textarea 
              className="input-sleek h-24 resize-none" 
              value={profile.bio || ''} 
              onChange={e => setProfile({...profile, bio: e.target.value})}
            ></textarea>
          </div>
          <Button type="submit" className="mt-4">Save Changes</Button>
        </form>
      </Card>
    </div>
  );
};

export default Profile;
