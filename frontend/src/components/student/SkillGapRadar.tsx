import React, { useState, useEffect } from 'react';
import { 
  Radar, RadarChart, PolarGrid, 
  PolarAngleAxis, 
  ResponsiveContainer, Tooltip, Legend 
} from 'recharts';
import { TrendingUp, Info, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import api from '../../api';

const SkillGapRadar: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSkillGap = async () => {
      try {
        setLoading(true);
        const response = await api.get('/students/skill-gap');
        setData(response.data);
      } catch (err) {
        console.error('Failed to fetch skill gap data:', err);
        setError('Failed to load skill analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchSkillGap();
  }, []);

  if (loading) {
    return (
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-sm h-[420px] flex items-center justify-center">
        <Loader2 className="animate-spin text-surface-tint" size={32} />
      </div>
    );
  }

  if (error || data.length === 0) {
    return (
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-sm h-[420px] flex flex-col items-center justify-center text-center">
        <AlertCircle className="text-on-surface-variant/20 mb-4" size={48} />
        <p className="text-sm font-black text-on-surface-variant/40 uppercase tracking-widest italic">No skill analytics available yet</p>
        <p className="text-[10px] text-on-surface-variant/30 mt-1 max-w-xs uppercase tracking-tighter">Add skills to your profile and watchlist jobs to see your comparative analysis.</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dataItem = payload[0].payload;
      return (
        <div className="bg-surface-container-highest/95 backdrop-blur-md border border-outline-variant/30 p-4 rounded-2xl shadow-2xl max-w-xs animate-in zoom-in-95 duration-200">
          <p className="text-[10px] font-black uppercase tracking-widest text-surface-tint mb-1">{dataItem.subject}</p>
          <div className="space-y-1 mb-3">
             <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-gray-500 uppercase tracking-tighter">My Level</span>
                <span className="text-blue-600">{dataItem.me}%</span>
             </div>
             <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-gray-500 uppercase tracking-tighter">Market Demand</span>
                <span className="text-emerald-600">{dataItem.market}%</span>
             </div>
          </div>
          
          {dataItem.missing && dataItem.missing.length > 0 && (
            <div className="pt-3 border-t border-gray-100">
               <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                 <AlertCircle size={10} className="text-orange-400" /> Improvement Areas
               </p>
               <div className="flex flex-wrap gap-1">
                  {dataItem.missing.slice(0, 5).map((skill: string) => (
                    <span key={skill} className="px-2 py-0.5 bg-orange-50 text-[9px] font-black text-orange-600 rounded-md uppercase tracking-tighter">
                      {skill}
                    </span>
                  ))}
                  {dataItem.missing.length > 5 && <span className="text-[9px] font-black text-gray-300">+{dataItem.missing.length - 5} more</span>}
               </div>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-full space-y-4">
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all h-full group">
         <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary-container text-primary rounded-2xl group-hover:rotate-12 transition-transform">
                      <TrendingUp size={24} />
                  </div>
                  <div>
                      <h3 className="text-[13px] font-black text-on-surface tracking-tight flex items-center gap-2 uppercase italic">
                        Skill <span className="text-surface-tint">Analytics</span>
                      </h3>
                      <p className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest leading-none mt-0.5">Compare your profile to real-time market demands</p>
                  </div>
              </div>
              <div className="p-2 bg-surface-container-high text-on-surface-variant/40 rounded-xl hover:text-primary transition-colors cursor-help">
                  <Info size={16} />
              </div>
         </div>

         <div className="h-[280px] w-full">
           <ResponsiveContainer width="100%" height="100%">
             <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
               <PolarGrid stroke="currentColor" className="text-outline-variant/20" />
               <PolarAngleAxis 
                 dataKey="subject" 
                 tick={{ fill: 'currentColor', fontSize: 10, fontWeight: 900 }}
                 className="text-on-surface-variant/50"
               />
               <Tooltip content={<CustomTooltip />} />
               <Radar
                 name="My Skills"
                 dataKey="me"
                 stroke="#2563eb"
                 fill="#2563eb"
                 fillOpacity={0.6}
                 strokeWidth={2}
                 animationDuration={1500}
               />
               <Radar
                 name="Market Demand"
                 dataKey="market"
                 stroke="#10b981"
                 fill="#10b981"
                 fillOpacity={0.2}
                 strokeWidth={2}
                 strokeDasharray="4 4"
                 animationDuration={1500}
               />
               <Legend 
                 verticalAlign="bottom" 
                 height={36} 
                 iconType="circle"
                 wrapperStyle={{ 
                   fontSize: '10px', 
                   fontWeight: 900, 
                   textTransform: 'uppercase', 
                   paddingTop: '20px',
                   letterSpacing: '0.05em'
                 }} 
               />
             </RadarChart>
           </ResponsiveContainer>
         </div>
      </div>
      
    </div>
  );
};

export const StrategicActionPlan: React.FC<{ data: any[] }> = ({ data }) => {
  if (!data || data.length === 0) return null;
  
  return (
    <div className="bg-[#020617] rounded-2xl p-6 text-white shadow-xl shadow-black/10 border border-white/5 relative overflow-hidden">
        {/* Background glow decorator */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/20 rounded-full blur-[80px]" />
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-white/10 rounded-xl text-blue-400">
            <Sparkles size={20} />
          </div>
          <h4 className="text-sm font-black uppercase tracking-tighter italic text-white">Strategic <span className="text-blue-400">Action Plan</span></h4>
        </div>
        
        <div className="space-y-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-400/60 mb-3">Priority Development Skills</p>
            <div className="flex flex-wrap gap-2">
              {Array.from(new Set(data.flatMap(d => d.missing || []))).slice(0, 5).map((skill: any) => (
                <div key={skill} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl flex items-center gap-2 group hover:bg-white/10 transition-all cursor-default">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-xs font-black uppercase tracking-tight text-white">{skill}</span>
                </div>
              ))}
              {Array.from(new Set(data.flatMap(d => d.missing || []))).length === 0 && (
                <p className="text-xs font-bold text-white/40 uppercase">No major gaps detected. Maintain current standards.</p>
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-black text-xs italic">
                  {Math.round(data.reduce((acc, curr) => acc + (curr.me || 0), 0) / (data.length || 1))}%
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Aggregate <br/> Technical Index</p>
              </div>
              <button 
                onClick={() => window.location.href = '/student/profile'}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-[10px] font-black text-white uppercase tracking-widest transition-all"
              >
                Update Profile
              </button>
          </div>
        </div>
      </div>
  );
};

export default SkillGapRadar;
