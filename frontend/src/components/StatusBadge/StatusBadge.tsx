import { CheckCircle, Clock, Ban, Shield } from 'lucide-react';

type Status = 'APPROVED' | 'PENDING' | 'BLOCKED' | string;

interface StatusBadgeProps {
    status: Status;
    /** Override the displayed label text */
    label?: string;
    /** 'account' uses Active/Blocked labels; 'verification' uses Verified/Pending/Blocked */
    variant?: 'account' | 'verification';
}

const configs: Record<string, { icon: React.ReactNode; text: string; className: string }> = {
    APPROVED_account: {
        icon: <CheckCircle size={12} className="inline mr-1" />,
        text: 'Active',
        className: 'bg-green-100 text-green-600',
    },
    APPROVED_verification: {
        icon: <Shield size={12} className="inline mr-1" />,
        text: 'Verified',
        className: 'bg-green-100 text-green-600',
    },
    PENDING: {
        icon: <Clock size={12} className="inline mr-1" />,
        text: 'Pending',
        className: 'bg-amber-100 text-amber-600',
    },
    BLOCKED: {
        icon: <Ban size={12} className="inline mr-1" />,
        text: 'Blocked',
        className: 'bg-red-100 text-red-600',
    },
};

const StatusBadge = ({ status, label, variant = 'account' }: StatusBadgeProps) => {
    const key = status === 'APPROVED' ? `APPROVED_${variant}` : status;
    const config = configs[key] ?? configs['BLOCKED'];

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase inline-flex items-center ${config.className}`}>
            {config.icon}
            {label ?? config.text}
        </span>
    );
};

export default StatusBadge;
