import React from 'react';
import { FileText, PlayCircle, BarChart3, ChevronRight } from 'lucide-react';

const CareerResources: React.FC = () => {
  const resources = [ 
    { label: 'Resume Builder', icon: FileText, desc: 'Professional AI-driven builder' },
    { label: 'Interview Guide', icon: PlayCircle, desc: 'Cracking top-tier companies' },
    { label: 'Package Stats', icon: BarChart3, desc: 'Salary benchmarks 2024' }
  ];

  return (
    <div className="h-full flex flex-col justify-between">
      <div>
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">CAREER RESOURCES</h3>
        <div className="space-y-4">
          {resources.map((resource, i) => (
            <button key={i} className="w-full bg-white p-4 rounded-xl flex items-center justify-between border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all group">
              <div className="flex items-center gap-4 text-left">
                <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-blue-50 transition-colors">
                  <resource.icon size={20} className="text-gray-600 group-hover:text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-900">{resource.label}</p>
                  <p className="text-xs text-gray-500">{resource.desc}</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-400 group-hover:text-gray-600 transition-all" />
            </button>
          ))}
        </div>
      </div>
      <div className="mt-6 pt-4 text-center border-t border-gray-100">
         <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">AUTHORIZED ACCESS ONLY • V2.1</p>
      </div>
    </div>
  );
};

export default CareerResources;
