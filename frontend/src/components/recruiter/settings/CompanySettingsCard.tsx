import React, { useState, useEffect } from 'react';
import { Building2, MapPin, Loader2 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useNotification } from '../../../context/NotificationContext';
import api from '../../../api';

const CompanySettingsCard: React.FC = () => {
  const { profile, refreshUser } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(false);

  const [companyData, setCompanyData] = useState({
    name: profile?.recruiterDetails?.companyName || '',
    website: profile?.recruiterDetails?.companyWebsite || '',
    location: profile?.recruiterDetails?.location || '',
  });

  useEffect(() => {
    if (profile) {
      setCompanyData({
        name: profile.recruiterDetails?.companyName || '',
        website: profile.recruiterDetails?.companyWebsite || '',
        location: profile.recruiterDetails?.location || '',
      });
    }
  }, [profile]);

  const handleUpdateCompany = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('recruiterDetails', JSON.stringify({
        ...profile?.recruiterDetails,
        companyName: companyData.name,
        companyWebsite: companyData.website,
        location: companyData.location,
      }));

      await api.put('/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      await refreshUser();
      showSuccess('Company information updated successfully!', 'Settings Updated');
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to update company info');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm h-full flex flex-col">
      <div className="flex items-center gap-3 mb-8">
        <Building2 size={20} className="text-gray-400" />
        <h2 className="text-xl font-black text-gray-900 tracking-tight">Company Settings</h2>
      </div>

      <div className="space-y-6 flex-1">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Company Name</label>
          <input 
            type="text" 
            value={companyData.name}
            onChange={e => setCompanyData({...companyData, name: e.target.value})}
            placeholder="e.g. Acme Corp"
            className="w-full px-5 py-3.5 bg-gray-50 border border-transparent focus:bg-white focus:border-gray-900 rounded-xl font-bold text-gray-900 text-[14px] outline-none transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Company Website</label>
          <div className="relative flex items-center">
            <input 
              type="text" 
              value={companyData.website}
              onChange={e => setCompanyData({...companyData, website: e.target.value})}
              placeholder="e.g. acme.com"
              className="w-full px-5 py-3.5 bg-gray-50 border border-transparent focus:bg-white focus:border-gray-900 rounded-xl font-bold text-gray-900 text-[14px] outline-none transition-all"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Company Location</label>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              value={companyData.location}
              onChange={e => setCompanyData({...companyData, location: e.target.value})}
              placeholder="e.g. Bangalore, India"
              className="w-full pl-11 pr-5 py-3.5 bg-gray-50 border border-transparent focus:bg-white focus:border-gray-900 rounded-xl font-bold text-gray-900 text-[14px] outline-none transition-all"
            />
          </div>
        </div>
      </div>

      <div className="mt-8 pt-8 border-t border-gray-50 items-center justify-center flex">
          <button 
          onClick={handleUpdateCompany}
          disabled={loading}
          className="w-full py-4 bg-[#000613] text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl shadow-black/10 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
          {loading ? <Loader2 className="animate-spin" size={14} /> : 'Update Company Info'}
        </button>
      </div>
    </div>
  );
};

export default CompanySettingsCard;
