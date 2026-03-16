import React from 'react';
import { 
    Send, 
    CheckCircle2, 
    Search, 
    UserCheck, 
    Video, 
    Award, 
    XCircle
} from 'lucide-react';

export type ApplicationStatus = 
    | 'SUBMITTED' 
    | 'REVIEWED' 
    | 'SHORTLISTED' 
    | 'INTERVIEW' 
    | 'SELECTED' 
    | 'REJECTED' 
    | 'OFFER_ACCEPTED' 
    | 'OFFER_DECLINED';

interface StatusBadgeProps {
    status: ApplicationStatus;
    className?: string;
}

const statusConfig: Record<ApplicationStatus, { label: string; icon: any; colorClass: string; pulse?: boolean }> = {
    SUBMITTED: {
        label: 'Submitted',
        icon: Send,
        colorClass: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20'
    },
    REVIEWED: {
        label: 'Application Reviewed',
        icon: Search,
        colorClass: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-500/20'
    },
    SHORTLISTED: {
        label: 'Shortlisted',
        icon: UserCheck,
        colorClass: 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400 border-violet-200 dark:border-violet-500/20',
        pulse: true
    },
    INTERVIEW: {
        label: 'Interviewing',
        icon: Video,
        colorClass: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
        pulse: true
    },
    SELECTED: {
        label: 'Offer Received',
        icon: Award,
        colorClass: 'bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 border-purple-200 dark:border-purple-500/20',
        pulse: true
    },
    OFFER_ACCEPTED: {
        label: 'Hired',
        icon: CheckCircle2,
        colorClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
    },
    OFFER_DECLINED: {
        label: 'Offer Declined',
        icon: XCircle,
        colorClass: 'bg-slate-50 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400 border-slate-200 dark:border-slate-500/20'
    },
    REJECTED: {
        label: 'Rejected',
        icon: XCircle,
        colorClass: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border-rose-200 dark:border-rose-500/20'
    }
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
    const config = statusConfig[status] || statusConfig.SUBMITTED;
    const Icon = config.icon;

    return (
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${config.colorClass} ${className}`}>
            {config.pulse && (
                <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-current"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current"></span>
                </span>
            )}
            <Icon size={12} className={config.pulse ? '' : 'opacity-80'} />
            {config.label}
        </div>
    );
};

export default StatusBadge;
