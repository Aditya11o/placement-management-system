import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, PlayCircle, BarChart3, ChevronRight } from 'lucide-react';

interface ResourceCardProps {
  label: string;
  desc: string;
  icon: any;
  onClick: () => void;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ label, desc, icon: Icon, onClick }) => (
  <button 
    onClick={onClick}
    className="w-full bg-white p-4 rounded-xl flex items-center justify-between border border-gray-200 shadow-sm hover:shadow-lg hover:border-blue-100 hover:scale-[1.02] transition-all group active:scale-95"
  >
    <div className="flex items-center gap-4 text-left">
      <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-blue-50 transition-colors">
        <Icon size={20} className="text-gray-600 group-hover:text-blue-600" />
      </div>
      <div>
        <p className="font-bold text-sm text-gray-900">{label}</p>
        <p className="text-xs text-gray-500 font-medium">{desc}</p>
      </div>
    </div>
    <ChevronRight size={18} className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
  </button>
);

const CareerResources: React.FC = () => {
  const navigate = useNavigate();
  const resources = [ 
    { label: 'Resume Builder', icon: FileText, desc: 'Professional Resume Builder', path: '/student/resume-builder' },
    { label: 'Interview Guide', icon: PlayCircle, desc: 'Cracking top-tier companies', path: '/student/interview-guide' },
    { label: 'Package Stats', icon: BarChart3, desc: 'Salary benchmarks 2024', path: '/student/package-stats' }
  ];

  return (
    <div className="h-full flex flex-col justify-between">
      <div>
        <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">CAREER RESOURCES</h3>
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
      <div className="mt-8 pt-4 text-center border-t border-gray-100">
         <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] opacity-50">PMS SECURE CORE • v2.1</p>
      </div>
    </div>
  );
};

export default CareerResources;
