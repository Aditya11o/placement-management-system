import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/Card/Card';
import SkeletonJobCard from '../../components/Skeleton/SkeletonJobCard';
import { Briefcase, Calendar, Building, ShieldCheck, XCircle, Clock, LucideIcon } from 'lucide-react';
import api from '../../services/api';
import { Application } from '../../types';

interface UIApplication extends Application {
    matchScore?: number;
    appliedAt: string;
    offer_letter_url?: string;
    offer_issued_at?: string;
    offer_expires_at?: string;
    job: {
        _id: string;
        title: string;
        company_name?: string; // Standardized link from backend
        company?: {
            company_name: string;
        };
        recruiter: string;
        description: string;
        type: any;
        location: string;
        salary_range: string;
        skills_required: string[];
        status: any;
        deadline: string;
    };
}

const StudentApplications: React.FC = () => {
    const { addToast } = useToast();
    const [applications, setApplications] = useState<UIApplication[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            const res = await api.get('/applications/student');
            setApplications(res.data.data);
        } catch (error) {
            addToast('Failed to load application history', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOfferResponse = async (id: string, action: 'accept' | 'decline') => {
        setProcessingId(id);
        try {
            await api.post(`/applications/${id}/${action}`);
            addToast(action === 'accept' ? 'Congratulations! Offer accepted.' : 'Offer declined.', 'success');
            fetchApplications();
        } catch (error: any) {
            addToast(error.response?.data?.message || 'Action failed', 'error');
        } finally {
            setProcessingId(null);
        }
    };

    const getStatusConfig = (status: string): { label: string; class: string; icon: LucideIcon } => {
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

    return (
        <div className="flex flex-col gap-8 animate-fade-in pb-12">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-indigo-700 mb-1">My Applications</h1>
                    <p className="text-slate-500 text-base m-0">Track the status of roles you have applied for.</p>
                </div>
            </div>

            {isLoading ? (
                <SkeletonJobCard count={4} />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {applications.length === 0 ? (
                        <div className="col-span-full flex flex-col items-center justify-center p-20 bg-white rounded-2xl border-2 border-dashed border-slate-200 text-center">
                            <Briefcase size={64} className="text-slate-300 mb-4" />
                            <h2 className="text-xl font-bold text-slate-700 mb-2">No applications yet</h2>
                            <p className="text-slate-500">Your applied jobs will appear here once you start sourcing.</p>
                        </div>
                    ) : (
                        applications.map(app => {
                            const statusConfig = getStatusConfig(app.status);
                            const isOffer = app.status === 'SELECTED';

                            return (
                                <Card key={app._id} className={`flex flex-col h-full p-0 overflow-hidden hover:shadow-2xl transition-all duration-300 border ${isOffer ? 'border-purple-300 ring-2 ring-purple-100 ring-offset-2' : 'border-slate-100'}`}>
                                    <div className="p-6 flex-1">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="w-14 h-14 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-2xl font-black shadow-sm shrink-0">
                                                {(app.job?.company_name || app.job?.company?.company_name || 'C').charAt(0).toUpperCase()}
                                            </div>
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${statusConfig.class}`}>
                                                <statusConfig.icon size={14} />
                                                {statusConfig.label}
                                            </span>
                                        </div>

                                        <div className="mb-6">
                                            <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2" title={app.job?.title}>
                                                {app.job?.title || 'Unknown Job'}
                                            </h3>
                                            <p className="flex items-center gap-2 text-slate-500 font-bold">
                                                <Building size={16} className="text-slate-400" />
                                                {app.job?.company_name || app.job?.company?.company_name || 'Unknown Company'}
                                            </p>
                                        </div>

                                        <div className="space-y-3 mb-6 font-medium">
                                            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 text-sm">
                                                <Calendar size={18} className="text-slate-400" />
                                                <span>Applied on {new Date(app.appliedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                            </div>
                                            {isOffer && app.offer_expires_at && (
                                                <div className="flex items-center gap-3 text-amber-600 text-sm font-bold">
                                                    <Clock size={18} />
                                                    <span>Offer expires on {new Date(app.offer_expires_at).toLocaleDateString()}</span>
                                                </div>
                                            )}
                                        </div>

                                        {app.matchScore && (
                                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">AI Match Score</span>
                                                <span className={`text-sm font-black ${app.matchScore > 80 ? 'text-emerald-600' : 'text-indigo-600'}`}>
                                                    {app.matchScore}%
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Footers */}
                                    {isOffer ? (
                                        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border-t border-purple-100 dark:border-purple-800 grid grid-cols-2 gap-3">
                                            <button 
                                                onClick={() => window.open(app.offer_letter_url, '_blank')}
                                                className="col-span-2 py-3 bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-400 font-bold rounded-xl border border-purple-200 dark:border-purple-800 hover:bg-purple-100 transition-all flex items-center justify-center gap-2 mb-1 shadow-sm"
                                            >
                                                <Briefcase size={16} /> View Offer Letter (PDF)
                                            </button>
                                            <button 
                                                disabled={processingId === app._id}
                                                onClick={() => handleOfferResponse(app._id, 'decline')}
                                                className="py-2.5 bg-white text-slate-500 font-bold rounded-xl border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all disabled:opacity-50"
                                            >
                                                Decline
                                            </button>
                                            <button 
                                                disabled={processingId === app._id}
                                                onClick={() => handleOfferResponse(app._id, 'accept')}
                                                className="py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                            >
                                                {processingId === app._id ? 'Processing...' : 'Accept Offer'}
                                            </button>
                                        </div>
                                    ) : app.status === 'OFFER_ACCEPTED' ? (
                                        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border-t border-emerald-100 dark:border-emerald-800">
                                            <button 
                                                onClick={() => app.offer_letter_url && window.open(app.offer_letter_url, '_blank')}
                                                className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                                            >
                                                <ShieldCheck size={18} /> View Signed Offer
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="p-4 bg-slate-50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-800 text-center text-xs font-bold text-slate-400 tracking-wider uppercase">
                                            Waiting for Updates
                                        </div>
                                    )}
                                </Card>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
};

export default StudentApplications;
