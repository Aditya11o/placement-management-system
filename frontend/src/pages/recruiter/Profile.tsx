import React, { useState, useEffect } from 'react';
import { 
  Building2, Globe, Users, MapPin, 
  Mail, Info, Upload, Camera, 
  Save, CornerDownRight, Heart, Loader2
} from 'lucide-react';
import api from '../../api';

const CompanyProfile: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [companyInfo, setCompanyInfo] = useState({
    name: '',
    website: '',
    description: '',
    industry: 'Software & Technology',
    size: '501 - 1,000 employees',
    location: '',
  });

  const [hrContact, setHrContact] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/profile/me');
      setProfile(data);
      const rec = data.recruiterDetails || {};
      setCompanyInfo({
        name: rec.companyName || '',
        website: rec.companyWebsite || '',
        description: data.bio || '',
        industry: rec.industry || 'Software & Technology',
        size: rec.size || '501 - 1,000 employees',
        location: rec.location || '',
      });
      setHrContact({
        name: data.user?.name || '',
        email: data.user?.email || '',
        phone: rec.phone || '',
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async () => {
    try {
      await api.put('/profile', {
        bio: companyInfo.description,
        recruiterDetails: {
          companyName: companyInfo.name,
          companyWebsite: companyInfo.website,
          industry: companyInfo.industry,
          size: companyInfo.size,
          location: companyInfo.location,
          phone: hrContact.phone,
        }
      });
      alert('Profile updated successfully!');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#000613] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Organization Settings</p>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Company Profile</h1>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => fetchProfile()}
            className="px-6 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all active:scale-95"
          >
            Discard Changes
          </button>
          <button 
            onClick={handleSave}
            className="px-6 py-2.5 bg-[#000613] text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-lg shadow-black/10 flex items-center gap-2 active:scale-95"
          >
            <Save size={14} />
            Save Profile
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-8">
        
        {/* Left Column - Forms */}
        <div className="col-span-12 lg:col-span-8 space-y-6 text-[13px]">
          
          {/* Company Information Card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Logo Upload Section */}
              <div className="space-y-4">
                <div className="relative group cursor-pointer">
                  <div className="w-40 h-40 bg-gray-100 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-gray-200 group-hover:border-[#000613] group-hover:bg-gray-50 transition-all overflow-hidden relative">
                    {profile?.recruiterDetails?.companyLogo ? (
                      <img src={profile.recruiterDetails.companyLogo} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm text-gray-400 group-hover:text-[#000613] transition-colors mb-2">
                        <Upload size={24} />
                      </div>
                    )}
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Upload Logo</span>
                  </div>
                  <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-600 shadow-lg hover:bg-gray-100 transition-all active:scale-90">
                    <Camera size={18} />
                  </button>
                </div>
              </div>

              {/* Company Fields */}
              <div className="flex-1 space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Company Name</label>
                    <input 
                      type="text" 
                      value={companyInfo.name}
                      onChange={e => setCompanyInfo({...companyInfo, name: e.target.value})}
                      className="w-full px-5 py-3.5 bg-gray-100 border-transparent focus:bg-white focus:border-gray-200 rounded-xl font-bold text-gray-900 focus:outline-none transition-all"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Website URL</label>
                    <div className="relative flex items-center">
                      <span className="absolute left-5 text-gray-400 font-bold opacity-50">https://</span>
                      <input 
                        type="text" 
                        value={companyInfo.website}
                        onChange={e => setCompanyInfo({...companyInfo, website: e.target.value})}
                        className="w-full pl-20 pr-5 py-3.5 bg-gray-100 border-transparent focus:bg-white focus:border-gray-200 rounded-xl font-bold text-gray-900 focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Company Description</label>
                <textarea 
                  value={companyInfo.description}
                  onChange={e => setCompanyInfo({...companyInfo, description: e.target.value})}
                  rows={4}
                  className="w-full px-5 py-4 bg-gray-100 border-transparent focus:bg-white focus:border-gray-200 rounded-xl font-medium text-gray-600 leading-relaxed focus:outline-none transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Industry Type</label>
                  <select 
                    value={companyInfo.industry}
                    onChange={e => setCompanyInfo({...companyInfo, industry: e.target.value})}
                    className="w-full px-5 py-3.5 bg-gray-100 border-transparent focus:bg-white focus:border-gray-200 rounded-xl font-bold text-gray-900 focus:outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option>Software & Technology</option>
                    <option>Finance & Banking</option>
                    <option>Healthcare</option>
                    <option>Education</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Company Size</label>
                  <select 
                    value={companyInfo.size}
                    onChange={e => setCompanyInfo({...companyInfo, size: e.target.value})}
                    className="w-full px-5 py-3.5 bg-gray-100 border-transparent focus:bg-white focus:border-gray-200 rounded-xl font-bold text-gray-900 focus:outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option>1 - 50 employees</option>
                    <option>51 - 200 employees</option>
                    <option>201 - 500 employees</option>
                    <option>501 - 1,000 employees</option>
                    <option>1,000+ employees</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Primary Location</label>
                <div className="relative">
                  <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    value={companyInfo.location}
                    onChange={e => setCompanyInfo({...companyInfo, location: e.target.value})}
                    className="w-full pl-12 pr-5 py-3.5 bg-gray-100 border-transparent focus:bg-white focus:border-gray-200 rounded-xl font-bold text-gray-900 focus:outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* HR Contact Card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                <Users size={18} />
              </div>
              <h2 className="text-lg font-black text-gray-900 tracking-tight">Point of Contact (HR)</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-2 space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">HR Representative Name</label>
                <input 
                  type="text" 
                  value={hrContact.name}
                  readOnly
                  className="w-full px-5 py-3.5 bg-gray-50 border-transparent rounded-xl font-bold text-gray-500 cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">HR Email Address</label>
                <input 
                  type="email" 
                  value={hrContact.email}
                  readOnly
                  className="w-full px-5 py-3.5 bg-gray-50 border-transparent rounded-xl font-bold text-gray-500 cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">HR Phone Number</label>
                <input 
                  type="tel" 
                  value={hrContact.phone}
                  onChange={e => setHrContact({...hrContact, phone: e.target.value})}
                  className="w-full px-5 py-3.5 bg-gray-100 border-transparent focus:bg-white focus:border-gray-200 rounded-xl font-bold text-gray-900 focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Preview & Info */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          
          {/* Student View Preview Card */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Student View Preview</h3>
              <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-[9px] font-black uppercase tracking-wider rounded">Live Preview</span>
            </div>
            
            <div className="relative">
              {/* Header Image Placeholder */}
              <div className="h-24 bg-gradient-to-r from-blue-900 to-indigo-950 px-6 pt-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-2xl rounded-full" />
                <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-white/5 blur-xl rounded-full" />
              </div>

              {/* Company Logo and Info */}
              <div className="px-6 -mt-8 relative z-10 flex justify-between items-end">
                <div className="w-16 h-16 bg-white border-4 border-white rounded-2xl shadow-lg flex items-center justify-center overflow-hidden">
                  <div className="w-full h-full bg-[#000613] flex items-center justify-center text-white">
                    <Building2 size={24} />
                  </div>
                </div>
                <button className="w-8 h-8 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center border border-gray-100 mb-1 hover:text-rose-500 transition-colors">
                  <Heart size={14} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h4 className="text-lg font-black text-gray-900 tracking-tight leading-none">{companyInfo.name || 'Company Name'}</h4>
                <a href={`https://${companyInfo.website}`} className="text-[11px] font-bold text-gray-400 hover:text-blue-600 transition-colors mt-2 inline-block">
                  {companyInfo.website || 'website.com'}
                </a>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-[9px] font-black uppercase tracking-tighter">
                  {companyInfo.industry}
                </span>
                <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-[9px] font-black uppercase tracking-tighter">
                  {companyInfo.size}
                </span>
              </div>

              <p className="text-[12px] text-gray-500 leading-relaxed line-clamp-3">
                {companyInfo.description || 'Company description goes here...'}
              </p>

              <div className="pt-4 space-y-2 border-t border-gray-50">
                <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400">
                  <MapPin size={14} className="opacity-50" />
                  {companyInfo.location || 'Location'}
                </div>
                <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400">
                  <Mail size={14} className="opacity-50" />
                  {hrContact.email}
                </div>
              </div>

              <button className="w-full py-3 bg-[#000613] text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center justify-center gap-2 mt-4 shadow-lg active:scale-95">
                <span>View Job Openings</span>
                <CornerDownRight size={14} />
              </button>
            </div>
          </div>

          {/* Tip Card */}
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 flex gap-4">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm border border-gray-100 flex-shrink-0">
              <Info size={20} />
            </div>
            <div>
              <p className="text-[12px] font-medium text-gray-600 leading-relaxed">
                <span className="font-black text-gray-900 block mb-1">Expert Tip:</span>
                Companies with high-quality descriptions and logos receive <span className="text-blue-600 font-black">40% more</span> student applications on average.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Global Action Footer */}
      <div className="flex justify-between items-center pt-8 border-t border-gray-100">
        <div className="flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-widest">
          <Globe size={14} />
          Preview as Student
        </div>
        <button 
          onClick={handleSave}
          className="px-12 py-3.5 bg-[#000613] text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl shadow-black/10 active:scale-95"
        >
          Update Profile
        </button>
      </div>

    </div>
  );
};

export default CompanyProfile;
