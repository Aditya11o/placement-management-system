import React from 'react';
import { User } from 'lucide-react';
import Dropdown from '../Dropdown';

interface PersonalInfoSectionProps {
  profile: any;
  student: any;
  onChange: (field: string, value: any) => void;
}

const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({ profile, student, onChange }) => {
  return (
    <div className="col-span-12 lg:col-span-6">
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 h-full hover:shadow-lg transition-all duration-300">
        <div className="flex items-center gap-3 mb-6 border-b border-gray-50 pb-4">
          <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
            <User size={20} />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Personal Information</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="col-span-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Full Name</label>
            <input type="text" value={profile?.user?.name || ''} readOnly className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium transition-all bg-gray-50 opacity-70" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Email</label>
            <input type="email" value={profile?.user?.email || ''} readOnly className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium transition-all bg-gray-50 opacity-70" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Phone</label>
            <input 
              type="text" 
              value={student.phone || ''} 
              onChange={(e) => onChange('phone', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/30" 
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">DOB</label>
            <input 
              type="date" 
              value={student.dob ? new Date(student.dob).toISOString().split('T')[0] : ''} 
              onChange={(e) => onChange('dob', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/30" 
            />
          </div>
          <div>
            <Dropdown 
              label="Gender"
              value={student.gender || 'Male'}
              onChange={(val) => onChange('gender', val)}
              options={['Male', 'Female', 'Other']}
            />
          </div>
          <div className="col-span-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Address</label>
            <input 
              type="text" 
              value={student.address || ''} 
              onChange={(e) => onChange('address', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/30" 
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">City</label>
            <input 
              type="text" 
              value={student.city || ''} 
              onChange={(e) => onChange('city', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/30" 
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">State</label>
            <input 
              type="text" 
              value={student.state || ''} 
              onChange={(e) => onChange('state', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/30" 
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">LinkedIn</label>
            <input 
              type="text" 
              value={student.linkedin || ''} 
              onChange={(e) => onChange('linkedin', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/30" 
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">GitHub</label>
            <input 
              type="text" 
              value={student.github || ''} 
              onChange={(e) => onChange('github', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/30" 
            />
          </div>
          <div className="col-span-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Portfolio</label>
            <input 
              type="text" 
              value={student.portfolio || ''} 
              onChange={(e) => onChange('portfolio', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/30" 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoSection;
