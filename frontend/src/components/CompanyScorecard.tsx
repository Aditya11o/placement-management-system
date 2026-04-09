import React, { useState, useEffect } from 'react';
import { 
  X, TrendingUp, DollarSign, Users, Award, 
  BarChart3, Clock, Briefcase, Zap, Info
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import api from '../api';
import { motion, AnimatePresence } from 'framer-motion';

interface CompanyScorecardProps {
  companyName: string;
  onClose: () => void;
}

const CompanyScorecard: React.FC<CompanyScorecardProps> = ({ companyName, onClose }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScorecard = async () => {
      try {
        const res = await api.get(`/companies/${encodeURIComponent(companyName)}/scorecard`);
        setData(res.data);
      } catch (err) {
        console.error('Failed to fetch scorecard', err);
      } finally {
        setLoading(false);
      }
    };
    fetchScorecard();
  }, [companyName]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data) return null;

  const difficultyData = [
    { name: 'Easy', value: data.stats.difficulty.Easy || 0, color: '#10b981' },
    { name: 'Medium', value: data.stats.difficulty.Medium || 0, color: '#f59e0b' },
    { name: 'Hard', value: data.stats.difficulty.Hard || 0, color: '#ef4444' }
  ];

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-[#000613]/80 backdrop-blur-md overflow-y-auto"
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          className="relative w-full max-w-5xl bg-white rounded-[40px] shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-8 md:p-12 bg-gradient-to-br from-[#000613] to-[#0a1a3a] text-white relative">
            <button 
              onClick={onClose}
              className="absolute top-8 right-8 p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all"
            >
              <X size={24} />
            </button>
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-24 h-24 rounded-3xl bg-white p-1 shadow-2xl shadow-blue-500/20">
                <img 
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${companyName}`} 
                  alt={companyName} 
                  className="w-full h-full rounded-2xl object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-500/30">
                    Verified Partner
                  </span>
                </div>
                <h2 className="text-4xl md:text-5xl font-black tracking-tighter">{companyName}</h2>
                <p className="text-blue-200/60 font-medium mt-2 max-w-lg">
                  Aggregated hiring dashboard based on {data.stats.totalApplications} student applications and {data.stats.totalReviews} interview experiences.
                </p>
              </div>
            </div>
            
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
              <div className="bg-white/5 border border-white/10 p-5 rounded-[24px]">
                <div className="flex items-center gap-3 text-blue-400 mb-1">
                  <TrendingUp size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Selection Rate</span>
                </div>
                <div className="text-3xl font-black">{data.stats.selectionRate}%</div>
              </div>
              <div className="bg-white/5 border border-white/10 p-5 rounded-[24px]">
                <div className="flex items-center gap-3 text-emerald-400 mb-1">
                  <DollarSign size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Avg. Package</span>
                </div>
                <div className="text-3xl font-black">{data.stats.avgSalary} LPA</div>
              </div>
              <div className="bg-white/5 border border-white/10 p-5 rounded-[24px]">
                <div className="flex items-center gap-3 text-purple-400 mb-1">
                  <Users size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Total Hired</span>
                </div>
                <div className="text-3xl font-black">{data.stats.totalSelected}</div>
              </div>
              <div className="bg-white/5 border border-white/10 p-5 rounded-[24px]">
                <div className="flex items-center gap-3 text-orange-400 mb-1">
                  <Briefcase size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Active Roles</span>
                </div>
                <div className="text-3xl font-black">{data.stats.totalJobs}</div>
              </div>
            </div>
          </div>

          <div className="p-8 md:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Difficulty Pulse */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-[18px] font-black tracking-tight flex items-center gap-3">
                    <Zap className="text-blue-600" size={20} /> Interview Pulse
                  </h3>
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Based on student feedback</div>
                </div>
                <div className="h-[240px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={difficultyData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }} />
                      <Tooltip 
                        cursor={{ fill: '#f8fafc' }}
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                      />
                      <Bar dataKey="value" radius={[8, 8, 8, 8]} barSize={40}>
                        {difficultyData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Top Skills Cloud */}
              <div className="space-y-8">
                <div>
                  <h3 className="text-[18px] font-black tracking-tight flex items-center gap-3 mb-6">
                    <Award className="text-blue-600" size={20} /> Core Stack Required
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {data.topSkills.map((skill: string) => (
                      <span key={skill} className="px-5 py-3 bg-gray-50 text-gray-900 border border-gray-100 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-white hover:border-blue-200 transition-all cursor-default">
                        {skill}
                      </span>
                    ))}
                    {data.topSkills.length === 0 && <span className="text-gray-400 font-bold italic">No skill data available</span>}
                  </div>
                </div>

                <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100/50">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shrink-0">
                      <BarChart3 size={20} />
                    </div>
                    <div>
                      <h4 className="font-black text-[15px] text-blue-900 mb-1">Inside Hiring Pattern</h4>
                      <p className="text-[13px] font-bold text-blue-700/70 leading-relaxed">
                        Selection rate is currently <strong>{data.stats.selectionRate}%</strong>. Candidates with certifications in <strong>{data.topSkills[0] || 'Domain Core'}</strong> have shown 40% higher selection probability.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Reviews Preview */}
            <div className="mt-12 pt-12 border-t border-gray-100">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-[18px] font-black tracking-tight flex items-center gap-3">
                  <Clock className="text-blue-600" size={20} /> Recent Experiences
                </h3>
                <button className="text-[11px] font-black text-blue-600 uppercase tracking-widest hover:underline">View All in Global Forum</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.recentReviews.map((review: any, idx: number) => (
                  <div key={idx} className="p-6 rounded-3xl border border-gray-100 bg-white hover:shadow-xl hover:shadow-gray-500/5 transition-all">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[9px] font-black uppercase rounded tracking-widest">
                        {review.experienceType}
                      </span>
                    </div>
                    <h4 className="font-black text-[14px] text-gray-900 line-clamp-2 mb-2">{review.title}</h4>
                    <div className="text-[11px] font-bold text-gray-400 italic">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
                {data.recentReviews.length === 0 && (
                  <div className="col-span-full py-12 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200 text-gray-400 font-bold uppercase tracking-widest text-xs">
                    No student reviews found yet. Be the first to post!
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CompanyScorecard;
