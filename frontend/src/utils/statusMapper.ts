import { Clock, ShieldCheck, XCircle, LucideIcon } from 'lucide-react';

export interface StatusConfig {
    label: string;
    class: string;
    icon: LucideIcon;
}

export const getStatusConfig = (status: string): StatusConfig => {
    switch (status) {
        case 'SUBMITTED':
        case 'PENDING':
            return { label: 'In Review', class: 'bg-yellow-100 text-yellow-700', icon: Clock };
        case 'REVIEWED':
            return { label: 'Under Review', class: 'bg-indigo-100 text-indigo-700', icon: Clock };
        case 'SHORTLISTED':
            return { label: 'Shortlisted', class: 'bg-blue-100 text-blue-700', icon: ShieldCheck };
        case 'SELECTED':
            return { label: 'Offer Received 🎓', class: 'bg-purple-100 text-purple-700 font-bold animate-pulse', icon: ShieldCheck };
        case 'OFFER_ACCEPTED':
            return { label: 'Placed 🎉', class: 'bg-green-100 text-green-700 font-bold', icon: ShieldCheck };
        case 'OFFER_DECLINED':
            return { label: 'Declined', class: 'bg-slate-200 text-slate-600', icon: XCircle };
        case 'REJECTED':
            return { label: 'Rejected', class: 'bg-red-100 text-red-700', icon: XCircle };
        default:
            return { label: status, class: 'bg-slate-100 text-slate-700', icon: Clock };
    }
};
