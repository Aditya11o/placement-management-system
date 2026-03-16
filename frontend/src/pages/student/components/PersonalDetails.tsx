import React from 'react';
import Card from '../../../components/Card/Card';
import { User as UserIcon, Mail, ShieldCheck } from 'lucide-react';
import { User } from '../../../types';

interface PersonalDetailsProps {
    user: User | null;
}

const PersonalDetails: React.FC<PersonalDetailsProps> = ({ user }) => {
    return (
        <Card className="p-10 rounded-[3.5rem] border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden relative group">
            <div className="flex items-center gap-3 mb-10 pb-6 border-b border-slate-100 dark:border-slate-800">
                <UserIcon className="text-indigo-500" size={24} />
                <h2 className="text-2xl m-0 font-black italic tracking-tight uppercase">Personal <br />Identity.</h2>
            </div>

            <div className="space-y-8 relative z-10">
                <div className="group/item">
                    <label className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] mb-2 block italic">Legal Full Name</label>
                    <div className="flex items-center gap-3">
                         <p className="font-black text-slate-800 dark:text-white text-xl m-0 tracking-tight italic uppercase">{user?.name}</p>
                         <ShieldCheck size={16} className="text-indigo-500 fill-indigo-500/10 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                    </div>
                </div>
                
                <div className="group/item">
                    <label className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] mb-2 block italic">Verified Communication</label>
                    <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400">
                         <Mail size={18} />
                         <p className="font-bold text-lg m-0 tracking-tight italic">{user?.email}</p>
                    </div>
                </div>

                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700">
                     <div className="flex items-center justify-between">
                          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Identity Verification</div>
                          <div className="px-3 py-1 bg-emerald-500 text-white text-[8px] font-black uppercase tracking-widest rounded-lg">Active</div>
                     </div>
                     <p className="text-[10px] text-slate-400 font-bold mt-3 italic leading-relaxed">Your personal identity is verified against the institutional records for placement eligibility.</p>
                </div>
            </div>
            
            <div className="absolute bottom-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                <UserIcon size={120} className="rotate-12" />
            </div>
        </Card>
    );
};

export default PersonalDetails;
