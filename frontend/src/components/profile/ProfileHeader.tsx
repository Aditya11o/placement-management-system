import React from 'react';
import { Camera, Shield } from 'lucide-react';
import Avatar from '../Avatar';

interface ProfileHeaderProps {
  profile: any;
  previewUrl: string | null;
  skills: string[];
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: () => void;
  className?: string;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile, previewUrl, skills, fileInputRef, onFileChange, onSave, className = ""
}) => {
  const student = profile || {};

  return (
    <div className={`col-span-12 lg:col-span-8 ${className}`}>
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
        <div className="relative">
          <Avatar 
            name={profile?.user?.name} 
            profilePhoto={previewUrl || profile?.profile_photo} 
            size="2xl" 
            className="rounded-2xl border-4 border-gray-50 shadow-sm transition-transform duration-500 group-hover:scale-105"
          />
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={onFileChange} 
            accept="image/*" 
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-2 -right-2 p-2 bg-blue-950 text-white rounded-lg shadow-lg hover:bg-black transition-all active:scale-90"
          >
            <Camera size={16} />
          </button>
        </div>
        
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{profile?.user?.name}</h2>
          <p className="text-gray-500 font-medium mt-1 flex items-center justify-center md:justify-start gap-2">
            {student.department || 'Add Department'} <span className="text-gray-300">•</span> Class of {student.passing_year || '202X'}
          </p>
          
          <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-4">
            {skills.slice(0, 4).map((skill, i) => (
              <span key={i} className="px-3 py-1 bg-gray-100 text-gray-600 text-[11px] font-bold uppercase rounded-md tracking-wider">
                {skill}
              </span>
            ))}
            {skills.length > 4 && (
              <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[11px] font-bold uppercase rounded-md tracking-wider">
                +{skills.length - 4} More
              </span>
            )}
          </div>
          
          <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-6">
            <button 
              onClick={() => onSave()}
              className="bg-blue-950 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-black transition-all shadow-md active:scale-95 flex items-center gap-2"
            >
              Save Profile
            </button>
            <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl font-bold text-xs flex items-center gap-2">
              <Shield size={14} /> {student.placementStatus || 'Unplaced'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
