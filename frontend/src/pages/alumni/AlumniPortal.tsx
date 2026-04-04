import React, { useState, useEffect } from 'react';
import { 
  Briefcase, MessageSquare, 
  Plus, Globe, 
  ShieldCheck, Users,
  Trophy, ChevronRight, X, Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

const AlumniPortal: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { showSuccess, showError } = useNotification();

    const [stats, setStats] = useState({ referralsGiven: 0, mentorshipHours: 0, studentImpact: 0 });
    const [referrals, setReferrals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [showReferralModal, setShowReferralModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
      title: '',
      companyName: '',
      location: '',
      salary: '',
      jobType: 'Full-time',
      deadline: '',
      description: ''
    });

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                setLoading(true);
                const [statsRes, refRes] = await Promise.all([
                    api.get('/alumni/dashboard'),
                    api.get('/alumni/referrals')
                ]);
                setStats(statsRes.data);
                setReferrals(refRes.data);
            } catch (err) {
                console.error('Failed to load portal data', err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    const handleCreateReferral = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        setSubmitting(true);
        const { data } = await api.post('/alumni/referrals', formData);
        setReferrals([data, ...referrals]);
        setShowReferralModal(false);
        setStats(prev => ({ ...prev, referralsGiven: prev.referralsGiven + 1 }));
        showSuccess('Job Referral posted successfully!');
        // Reset form
        setFormData({ title: '', companyName: '', location: '', salary: '', jobType: 'Full-time', deadline: '', description: '' });
      } catch (error) {
        showError('Failed to post referral');
        console.error(error);
      } finally {
        setSubmitting(false);
      }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <Loader2 size={32} className="animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-8 animate-in fade-in duration-700">
            {/* Legend Header */}
            <div className="bg-[#000613] text-white rounded-[40px] p-12 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full -mr-40 -mt-40" />
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-12">
                     <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400 text-[10px] font-black uppercase tracking-widest">
                            <ShieldCheck size={14} /> Official Alumni Member
                        </div>
                        <h1 className="text-5xl font-black tracking-tighter leading-[1.1]">The Alumni <br/><span className="text-blue-400">Collaborative.</span></h1>
                        <p className="text-gray-400 text-lg font-medium max-w-xl leading-relaxed">
                            Welcome back, {user?.name?.split(' ')[0] || 'Alumni'}. Continue shaping the future of our students by providing job referrals, mentorship, and industry insights.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <button 
                              onClick={() => setShowReferralModal(true)}
                              className="px-8 py-4 bg-white text-black rounded-2xl text-[11px] font-black uppercase tracking-widest hover:scale-105 transition-all active:scale-95 shadow-xl shadow-white/5"
                            >
                                Post Job Referral
                            </button>
                            <button 
                              onClick={() => navigate('/alumni/settings')}
                              className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                            >
                                Update Mentor Profile
                            </button>
                        </div>
                     </div>
                     <div className="relative group">
                        <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full scale-75 group-hover:scale-100 transition-all duration-1000" />
                        <div className="w-64 h-64 rounded-[60px] border-8 border-white/5 overflow-hidden relative z-10 rotate-3 group-hover:rotate-0 transition-transform duration-700 shadow-2xl">
                            <img src={user?.profilePhoto || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1024&auto=format&fit=crop"} className="w-full h-full object-cover" alt="Profile" />
                        </div>
                        <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-[32px] shadow-2xl z-20 animate-bounce-slow">
                             <div className="flex items-center gap-3">
                                <Trophy size={24} className="text-amber-500" />
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Global Mentor</p>
                                    <p className="text-sm font-black text-gray-900">Elite Status</p>
                                </div>
                             </div>
                        </div>
                     </div>
                </div>
            </div>

            {/* Stats & Activity */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Referrals Given', value: stats.referralsGiven, icon: Briefcase, color: 'blue' },
                    { label: 'Mentorship Sessions', value: stats.mentorshipHours, icon: MessageSquare, color: 'purple' },
                    { label: 'Student Impact', value: stats.studentImpact, icon: Users, color: 'emerald' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm hover:shadow-xl transition-all group">
                         <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${
                            stat.color === 'blue' ? 'bg-blue-50 text-blue-600' : 
                            stat.color === 'purple' ? 'bg-purple-50 text-purple-600' : 
                            'bg-emerald-50 text-emerald-600'
                         }`}>
                            <stat.icon size={24} />
                         </div>
                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                         <h3 className="text-3xl font-black text-gray-900 tracking-tight">{stat.value}</h3>
                    </div>
                ))}
            </div>

            {/* Active Referrals */}
            <div className="bg-white border border-gray-100 rounded-[40px] p-10 shadow-sm">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Your Posted Referrals</h2>
                        <p className="text-gray-500 text-sm font-medium mt-1">Opportunities you've shared with the batch.</p>
                    </div>
                    <button 
                      onClick={() => setShowReferralModal(true)}
                      className="p-4 bg-gray-50 text-gray-900 rounded-2xl hover:bg-gray-100 transition-all flex items-center gap-2 text-[11px] font-black uppercase tracking-widest"
                    >
                        <Plus size={16} /> New Ref
                    </button>
                </div>

                <div className="space-y-4">
                    {referrals.length > 0 ? referrals.map((ref) => (
                        <div key={ref._id} className="group flex items-center justify-between p-6 bg-gray-50/50 hover:bg-white border border-transparent hover:border-gray-100 rounded-3xl transition-all cursor-pointer">
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 bg-white rounded-2xl border border-gray-100 flex items-center justify-center">
                                    <Globe size={24} className="text-blue-500" />
                                </div>
                                <div>
                                    <h4 className="font-black text-gray-900 tracking-tight">{ref.title}</h4>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{ref.companyName} • {ref.applicationsCount || 0} Candidates Applied</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right mr-4 hidden md:block">
                                    <p className={`text-[10px] font-black uppercase tracking-widest ${ref.status === 'open' ? 'text-emerald-600' : 'text-gray-400'}`}>{ref.status}</p>
                                    <p className="text-[11px] font-bold text-gray-400 mt-0.5">Expires {new Date(ref.deadline).toLocaleDateString()}</p>
                                </div>
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white border border-gray-100 text-gray-400 group-hover:text-blue-600 group-hover:border-blue-100 transition-all">
                                    <ChevronRight size={20} />
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="py-12 text-center">
                            <ShieldCheck size={32} className="mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-500 font-bold italic">You haven't posted any referrals yet.</p>
                            <p className="text-xs text-gray-400 mt-1">Help a junior out by posting an opening at your company!</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal for Creating Referral */}
            {showReferralModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#000613]/40 backdrop-blur-sm" onClick={() => setShowReferralModal(false)} />
                    <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl p-8 max-h-[90vh] overflow-y-auto custom-scrollbar animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Post a Referral</h3>
                                <p className="text-sm font-medium text-gray-500">Share a career opportunity with the network</p>
                            </div>
                            <button onClick={() => setShowReferralModal(false)} className="p-2 text-gray-400 hover:text-gray-900 bg-gray-50 rounded-xl">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateReferral} className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Job Title</label>
                                    <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm focus:border-blue-500 outline-none transition-all" placeholder="Frontend Developer" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Company Name</label>
                                    <input required type="text" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm focus:border-blue-500 outline-none transition-all" placeholder="Google" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Location</label>
                                    <input required type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm focus:border-blue-500 outline-none transition-all" placeholder="Remote / Bangalore" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Salary/Stipend</label>
                                    <input required type="text" value={formData.salary} onChange={e => setFormData({...formData, salary: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm focus:border-blue-500 outline-none transition-all" placeholder="12 LPA" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Job Type</label>
                                    <select required value={formData.jobType} onChange={e => setFormData({...formData, jobType: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm focus:border-blue-500 outline-none transition-all">
                                        <option value="Full-time">Full-time</option>
                                        <option value="Internship">Internship</option>
                                        <option value="Contract">Contract</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Application Deadline</label>
                                    <input required type="date" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm focus:border-blue-500 outline-none transition-all" />
                                </div>
                            </div>
                            
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Detailed Description & Requirements</label>
                                <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={4} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm focus:border-blue-500 outline-none transition-all custom-scrollbar" placeholder="Describe the role, tech stack, and what you're looking for..."></textarea>
                            </div>

                            <button 
                                type="submit" 
                                disabled={submitting}
                                className="w-full py-4 bg-[#000613] text-white rounded-xl font-black text-[11px] uppercase tracking-widest flex justify-center items-center gap-2 hover:bg-blue-600 transition-colors disabled:opacity-50"
                            >
                                {submitting ? <Loader2 size={16} className="animate-spin" /> : 'Publish Referral'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AlumniPortal;
