import { 
  Briefcase, MessageSquare, 
  Plus, Globe, 
  ShieldCheck, Users,
  Trophy, ChevronRight 
} from 'lucide-react';

const AlumniPortal: React.FC = () => {
    // This is a specialized view for Alumni/Mentors
    return (
        <div className="max-w-7xl mx-auto p-6 space-y-8 animate-fade-in">
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
                            Your journey didn't end at graduation. Continue shaping the future of our students by providing job referrals, mentorship, and industry insights.
                        </p>
                        <div className="flex gap-4">
                            <button className="px-8 py-4 bg-white text-black rounded-2xl text-[11px] font-black uppercase tracking-widest hover:scale-105 transition-all active:scale-95 shadow-xl shadow-white/5">
                                Post Job Referral
                            </button>
                            <button className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                                Update Mentor Profile
                            </button>
                        </div>
                     </div>
                     <div className="relative group">
                        <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full scale-75 group-hover:scale-100 transition-all duration-1000" />
                        <div className="w-64 h-64 rounded-[60px] border-8 border-white/5 overflow-hidden relative z-10 rotate-3 group-hover:rotate-0 transition-transform duration-700 shadow-2xl">
                            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1024&auto=format&fit=crop" className="w-full h-full object-cover" alt="Profile" />
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
                    { label: 'Referrals Given', value: '12', icon: Briefcase, color: 'blue' },
                    { label: 'Mentorship Hours', value: '45', icon: MessageSquare, color: 'purple' },
                    { label: 'Student Impact', value: '150+', icon: Users, color: 'emerald' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm hover:shadow-xl transition-all group">
                         <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
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
                    <button className="p-4 bg-gray-50 text-gray-900 rounded-2xl hover:bg-gray-100 transition-all flex items-center gap-2 text-[11px] font-black uppercase tracking-widest">
                        <Plus size={16} /> New Ref
                    </button>
                </div>

                <div className="space-y-4">
                    {[1, 2].map((_, i) => (
                        <div key={i} className="group flex items-center justify-between p-6 bg-gray-50/50 hover:bg-white border border-transparent hover:border-gray-100 rounded-3xl transition-all cursor-pointer">
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 bg-white rounded-2xl border border-gray-100 flex items-center justify-center">
                                    <Globe size={24} className="text-blue-500" />
                                </div>
                                <div>
                                    <h4 className="font-black text-gray-900 tracking-tight">Software Engineer II</h4>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Microsoft • 5 Candidates Applied</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right mr-4">
                                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Active</p>
                                    <p className="text-[11px] font-bold text-gray-400 mt-0.5">Expires in 12 days</p>
                                </div>
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white border border-gray-100 text-gray-400 group-hover:text-blue-600 group-hover:border-blue-100 transition-all">
                                    <ChevronRight size={20} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AlumniPortal;
