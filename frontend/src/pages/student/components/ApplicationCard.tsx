import React, { memo } from 'react';
import { 
    Building, 
    Calendar, 
    Book, 
    MessageCircle, 
    Video, 
    ShieldCheck, 
    ChevronRight,
    ArrowUpRight
} from 'lucide-react';
import Card from '../../../components/Card/Card';
import Button from '../../../components/Button/Button';
import StatusBadge, { ApplicationStatus } from '../../../components/StatusBadge/StatusBadge';

export interface UIApplication {
    _id: string;
    status: ApplicationStatus;
    matchScore?: number;
    appliedAt: string;
    offer_letter_url?: string;
    offer_expires_at?: string;
    student_notes?: string;
    checklists?: any[];
    job: {
        _id: string;
        title: string;
        company_name?: string;
        company?: {
            company_name: string;
        };
        location: string;
        description: string;
        skills_required: string[];
    };
}

interface ApplicationCardProps {
    application: UIApplication;
    viewMode: 'grid' | 'list';
    onJournal: (app: UIApplication) => void;
    onMessage: (appId: string) => void;
    onJoinVideo: (appId: string) => void;
    onViewOffer: (url: string) => void;
    onRespondOffer: (id: string, action: 'accept' | 'decline') => void;
    isProcessing: boolean;
}

const ApplicationCard: React.FC<ApplicationCardProps> = memo(({
    application: app,
    viewMode,
    onJournal,
    onMessage,
    onJoinVideo,
    onViewOffer,
    onRespondOffer,
    isProcessing
}) => {
    const isOffer = app.status === 'SELECTED';
    const canChat = ['SHORTLISTED', 'SELECTED', 'INTERVIEW', 'OFFER_ACCEPTED'].includes(app.status);
    const companyName = app.job?.company_name || app.job?.company?.company_name || 'Unknown Company';

    // Horizontal Stepper for Grid View
    const Stepper = () => {
        const stages = [
            { id: 'SUBMITTED', label: 'Applied' },
            { id: 'REVIEWED', label: 'Review' },
            { id: 'SHORTLISTED', label: 'Shortlist' },
            { id: 'INTERVIEW', label: 'Interview' },
            { id: 'SELECTED', label: 'Offer' }
        ];

        const getStatus = (id: string) => {
            const statusOrder = ['SUBMITTED', 'REVIEWED', 'SHORTLISTED', 'INTERVIEW', 'SELECTED', 'OFFER_ACCEPTED', 'REJECTED'];
            const currentIndex = statusOrder.indexOf(app.status);
            const targetIndex = statusOrder.indexOf(id);

            if (app.status === 'REJECTED' && targetIndex <= currentIndex) return 'error';
            if (currentIndex > targetIndex || (app.status === 'OFFER_ACCEPTED' && id === 'SELECTED')) return 'completed';
            if (currentIndex === targetIndex) return 'active';
            return 'pending';
        };

        return (
            <div className="flex items-center w-full px-1 py-4">
                {stages.map((stage, index) => {
                    const status = getStatus(stage.id);
                    return (
                        <React.Fragment key={stage.id}>
                            <div className="flex flex-col items-center relative gap-2">
                                <div className={`w-2.5 h-2.5 rounded-full z-10 transition-all duration-500 ${
                                    status === 'completed' ? 'bg-indigo-500 ring-4 ring-indigo-500/20' : 
                                    status === 'active' ? 'bg-indigo-500 scale-125 ring-4 ring-indigo-500/20 shadow-lg' : 
                                    status === 'error' ? 'bg-rose-500 ring-4 ring-rose-500/20' : 
                                    'bg-slate-200 dark:bg-slate-700'
                                }`} />
                                <span className={`text-[8px] font-black uppercase tracking-tighter absolute -bottom-5 whitespace-nowrap ${
                                    status === 'active' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'
                                }`}>
                                    {stage.label}
                                </span>
                            </div>
                            {index < stages.length - 1 && (
                                <div className={`flex-1 h-[2px] mx-1 transition-all duration-500 ${
                                    getStatus(stages[index + 1].id) === 'completed' || getStatus(stages[index + 1].id) === 'active' 
                                    ? 'bg-indigo-500' : 'bg-slate-100 dark:bg-slate-800'
                                }`} />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        );
    };

    if (viewMode === 'list') {
        return (
            <Card border className="group relative flex items-center gap-6 p-4 !bg-white/80 dark:!bg-slate-800/90 hover:!bg-indigo-50/30 dark:hover:!bg-indigo-500/5 transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center text-xl font-black text-indigo-600 dark:text-indigo-400 shrink-0 border border-slate-100 dark:border-slate-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    {companyName.charAt(0)}
                </div>

                <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                    <div className="col-span-1">
                        <h3 className="text-[15px] font-bold text-slate-900 dark:text-slate-50 truncate">{app.job.title}</h3>
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest truncate">{companyName}</p>
                    </div>

                    <div className="flex items-center gap-2 text-slate-500">
                        <Calendar size={14} className="text-slate-400" />
                        <span className="text-xs font-semibold">{new Date(app.appliedAt).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <StatusBadge status={app.status} />
                    </div>

                    <div className="flex items-center gap-2">
                         {app.matchScore && (
                            <div className="px-2 py-1 rounded-md bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 text-[10px] font-black border border-indigo-500/10">
                                {app.matchScore}% Match
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => onJournal(app)} title="Journal" className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-colors">
                        <Book size={16} />
                    </button>
                    {canChat && (
                        <button onClick={() => onMessage(app._id)} title="Message" className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all">
                            <MessageCircle size={16} />
                        </button>
                    )}
                    <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-colors">
                        <ArrowUpRight size={18} />
                    </button>
                </div>
            </Card>
        );
    }

    return (
        <Card border hoverable className={`flex flex-col h-full p-6 group !bg-white/80 dark:!bg-slate-800/90 transition-all duration-500 relative overflow-hidden ${isOffer ? 'border-purple-300 ring-2 ring-purple-100 ring-offset-2' : ''}`}>
             <div className="flex items-start justify-between mb-6">
                <div className="flex gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center text-xl font-black text-indigo-600 dark:text-indigo-400 shrink-0 border border-slate-100 dark:border-slate-600 shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                        {companyName.charAt(0)}
                    </div>
                    <div className="flex flex-col pt-1">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2 max-w-[200px]">
                            {app.job.title}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-1 opacity-60">
                            <Building size={12} />
                            <span className="text-[10px] font-black uppercase tracking-widest truncate">{companyName}</span>
                        </div>
                    </div>
                </div>
                <StatusBadge status={app.status} />
            </div>

            <div className="mb-8 p-4 bg-slate-50/50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                <Stepper />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                    <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Applied Date</span>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
                            <Calendar size={12} className="text-indigo-500" />
                            <span>{new Date(app.appliedAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Match Strength</span>
                        <div className="flex items-center gap-1 text-xs font-black text-indigo-700 dark:text-indigo-400">
                             {app.matchScore || 0}%
                        </div>
                    </div>
            </div>

            {/* Application Footer Actions */}
            <div className="flex items-center gap-3 mt-auto pt-4 border-t border-slate-50 dark:border-slate-700/30">
                {isOffer ? (
                    <div className="flex flex-col w-full gap-2">
                         <Button 
                            variant="primary" 
                            size="sm" 
                            isFullWidth
                            className="font-black text-[10px] uppercase tracking-widest py-2.5 rounded-xl shadow-lg shadow-indigo-500/10"
                            onClick={() => onViewOffer(app.offer_letter_url!)}
                        >
                            <ShieldCheck size={14} className="mr-1.5" /> View Offer
                        </Button>
                        <div className="flex gap-2">
                             <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex-1 py-2 text-[10px] uppercase tracking-widest"
                                onClick={() => onRespondOffer(app._id, 'decline')}
                                disabled={isProcessing}
                            >
                                Decline
                            </Button>
                             <Button 
                                variant="primary" 
                                size="sm" 
                                className="flex-1 py-2 text-[10px] uppercase tracking-widest bg-emerald-600 shadow-emerald-500/10"
                                onClick={() => onRespondOffer(app._id, 'accept')}
                                disabled={isProcessing}
                            >
                                {isProcessing ? 'Wait...' : 'Accept'}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 font-black text-[10px] uppercase tracking-widest py-2.5 rounded-xl border-slate-200"
                            onClick={() => onJournal(app)}
                        >
                            <Book size={14} className="mr-1.5" /> Journal
                        </Button>
                        {app.status === 'INTERVIEW' ? (
                             <Button
                                variant="primary"
                                size="sm"
                                className="flex-[1.5] font-black text-[10px] uppercase tracking-widest py-2.5 rounded-xl bg-emerald-600 shadow-emerald-500/10"
                                onClick={() => onJoinVideo(app._id)}
                            >
                                <Video size={14} className="mr-1.5" /> Join Room
                            </Button>
                        ) : (
                            <Button
                                variant="primary"
                                size="sm"
                                className="flex-[1.5] font-black text-[10px] uppercase tracking-widest py-2.5 rounded-xl"
                                onClick={() => {}} 
                            >
                                Track Progress <ChevronRight size={14} className="ml-1" />
                            </Button>
                        )}
                        {canChat && (
                             <button 
                                onClick={() => onMessage(app._id)}
                                className={`p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 text-slate-400 hover:text-indigo-500 transition-all`}
                            >
                                <MessageCircle size={18} />
                            </button>
                        )}
                    </>
                )}
            </div>
        </Card>
    );
});

ApplicationCard.displayName = 'ApplicationCard';

export default ApplicationCard;
