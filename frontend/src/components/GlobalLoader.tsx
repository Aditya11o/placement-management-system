import React from 'react';
import { Loader2, ShieldCheck } from 'lucide-react';
import { useLoading } from '../context/LoadingContext';

const GlobalLoader: React.FC = () => {
  const { isLoading, loadingMessage } = useLoading();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#000613]/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative max-w-sm w-full mx-4">
        {/* Decorative Background Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-indigo-500/10 rounded-full blur-[60px] pointer-events-none" />

        <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl border border-white/20 text-center relative overflow-hidden group">
          {/* Top accent line */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600" />
          
          <div className="mb-8 relative inline-block">
             <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto shadow-inner border border-gray-100">
                <Loader2 className="w-10 h-10 text-[#000613] animate-spin" />
             </div>
             <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-1.5 rounded-xl shadow-lg border-2 border-white">
                <ShieldCheck size={14} />
             </div>
          </div>

          <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase italic mb-3">
             Academic Authority
          </h3>
          
          <div className="space-y-4">
            <p className="text-sm font-bold text-gray-500 leading-relaxed px-4">
              {loadingMessage}
            </p>
            
            <div className="flex items-center justify-center gap-1.5">
               <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
               <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
               <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></span>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-50">
             <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                Official Placement Management System
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalLoader;
