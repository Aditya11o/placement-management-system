import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Construction, ArrowLeft, Sparkles } from 'lucide-react';

interface ComingSoonProps {
  featureName?: string;
}

const ComingSoon: React.FC<ComingSoonProps> = ({ featureName = 'This Feature' }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 animate-in fade-in zoom-in duration-500">
      <div className="relative mb-8">
        <div className="absolute -inset-4 bg-blue-500/10 rounded-full blur-2xl animate-pulse"></div>
        <div className="bg-white p-8 rounded-3xl shadow-xl relative">
          <Construction size={64} className="text-blue-950 mb-2 mx-auto" strokeWidth={1.5} />
        </div>
      </div>
      
      <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-4">
        {featureName} is <span className="text-blue-600">Coming Soon</span>
      </h2>
      
      <p className="max-w-md text-gray-500 font-medium mb-12 leading-relaxed">
        We're currently building a premium experience for {featureName.toLowerCase()}. 
        This feature will be available in the next version update.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center justify-center gap-2 px-8 py-3.5 bg-gray-100 text-gray-900 rounded-2xl font-bold text-sm hover:bg-gray-200 transition-all active:scale-95"
         shadow-sm>
          <ArrowLeft size={18} />
          Go Back
        </button>
        <button 
          onClick={() => navigate('/student/dashboard')}
          className="flex items-center justify-center gap-2 px-8 py-3.5 bg-blue-950 text-white rounded-2xl font-bold text-sm hover:bg-black transition-all shadow-lg hover:shadow-blue-900/20 active:scale-95"
        >
          Return to Dashboard
        </button>
      </div>

      <div className="mt-16 grid grid-cols-3 gap-8 opacity-20 filter grayscale">
         <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-1.5 bg-gray-400 rounded-full" />
            <div className="w-8 h-1.5 bg-gray-400 rounded-full" />
         </div>
         <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-1.5 bg-gray-400 rounded-full" />
            <div className="w-8 h-1.5 bg-gray-400 rounded-full" />
         </div>
         <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-1.5 bg-gray-400 rounded-full" />
            <div className="w-8 h-1.5 bg-gray-400 rounded-full" />
         </div>
      </div>
    </div>
  );
};

export default ComingSoon;
