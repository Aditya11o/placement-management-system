import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayCircle, BarChart3, ChevronRight, Sparkles } from 'lucide-react';

interface ResourceCardProps {
  label: string;
  desc: string;
  icon: any;
  onClick: () => void;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ label, desc, icon: Icon, onClick }) => (
  <button 
    onClick={onClick}
    className="w-full bg-surface-container-high p-4 rounded-xl flex items-center justify-between border border-outline-variant/30 shadow-sm hover:shadow-lg hover:border-surface-tint/30 hover:scale-[1.02] transition-all group active:scale-95"
  >
    <div className="flex items-center gap-4 text-left">
      <div className="p-2 bg-surface-container-low rounded-lg group-hover:bg-surface-tint/10 transition-colors">
        <Icon size={20} className="text-on-surface-variant group-hover:text-surface-tint" />
      </div>
      <div>
        <p className="font-bold text-sm text-on-surface">{label}</p>
        <p className="text-xs text-on-surface-variant/60 font-medium">{desc}</p>
      </div>
    </div>
    <ChevronRight size={18} className="text-outline group-hover:text-surface-tint group-hover:translate-x-1 transition-all" />
  </button>
);

const CareerResources: React.FC = () => {
  const navigate = useNavigate();
  const resources = [ 
    { label: 'Technical Guide', icon: PlayCircle, desc: 'Cracking top-tier companies', path: '/student/resources/technical' },
    { label: 'Aptitude Prep', icon: BarChart3, desc: 'Master quant fundamentals', path: '/student/resources/aptitude' },
    { label: 'Interview Toolkit', icon: Sparkles, desc: 'Your mission control for prep', path: '/student/interview-toolkit' }
  ];

  return (
    <div className="h-full flex flex-col justify-between">
      <div>
        <h3 className="text-[11px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em] mb-4">Support & Logistics</h3>
        <div className="space-y-4">
          {resources.map((resource, i) => (
            <ResourceCard 
              key={i}
              label={resource.label}
              desc={resource.desc}
              icon={resource.icon}
              onClick={() => navigate(resource.path)}
            />
          ))}
        </div>
      </div>
      <div className="mt-8 pt-4 text-center border-t border-outline-variant/10">
         <p className="text-[10px] text-on-surface-variant/40 font-black uppercase tracking-[0.2em]">PMS SECURE CORE • v2.1</p>
      </div>
    </div>
  );
};

export default CareerResources;
