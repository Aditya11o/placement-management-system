import React from 'react';

interface AvatarProps {
  name?: string;
  profilePhoto?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ 
  name = 'User', 
  profilePhoto, 
  size = 'md',
  className = ''
}) => {
  const getInitials = (userName: string) => {
    const parts = userName.trim().split(/\s+/);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getColor = (userName: string) => {
    const colors = [
      'bg-blue-600', 'bg-indigo-600', 'bg-violet-600', 'bg-purple-600', 
      'bg-fuchsia-600', 'bg-pink-600', 'bg-rose-600', 'bg-orange-600',
      'bg-amber-600', 'bg-emerald-600', 'bg-teal-600', 'bg-cyan-600'
    ];
    
    let hash = 0;
    for (let i = 0; i < userName.length; i++) {
      hash = userName.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const sizeClasses = {
    'xs': 'w-6 h-6 text-[10px]',
    'sm': 'w-8 h-8 text-xs',
    'md': 'w-10 h-10 text-sm',
    'lg': 'w-12 h-12 text-base',
    'xl': 'w-24 h-24 text-2xl',
    '2xl': 'w-32 h-32 text-4xl'
  };

  const initials = getInitials(name);
  const bgColor = getColor(name);

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 rounded-xl overflow-hidden shadow-sm border border-white/10 ${sizeClasses[size]} ${className}`}>
      {profilePhoto ? (
        <img 
          src={profilePhoto} 
          alt={name} 
          className="w-full h-full object-cover"
          onError={(e) => {
            // If image fails to load, fallback to initials
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      ) : (
        <div className={`w-full h-full flex items-center justify-center text-white font-black tracking-tighter ${bgColor}`}>
          {initials}
        </div>
      )}
    </div>
  );
};

export default Avatar;
