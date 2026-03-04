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
    job: {
        _id: string;
        title: string;
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

    const getStatusConfig = (status: string): { label: string; class: string; icon: LucideIcon } => {
        switch (status) {
            case 'PENDING':
                return { label: 'In Review', class: 'bg-yellow-100 text-yellow-700', icon: Clock };
            case 'SHORTLISTED':
                return { label: 'Shortlisted', class: 'bg-blue-100 text-blue-700', icon: ShieldCheck };
            case 'REJECTED':
                return { label: 'Rejected', class: 'bg-red-100 text-red-700', icon: XCircle };
            case 'HIRED':
                return { label: 'Hired / Placed', class: 'bg-green-100 text-green-700', icon: ShieldCheck };
            default:
                return { label: status, class: 'bg-slate-100 text-slate-700', icon: Clock };
        }
    };

    return (
        <div className="flex flex-col gap-8 animate-fade-in">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-indigo-700 mb-1">My Applications</h1>
                    <p className="text-slate-500 text-base m-0">Track the status of roles you have applied for.</p>
                </div>
            </div>

            {isLoading ? (
                <SkeletonJobCard count={4} />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {applications.length === 0 ? (
                        <div className="col-span-1 sm:col-span-2 lg:col-span-3 xl:col-span-4 flex flex-col items-center justify-center p-12 bg-white rounded-lg border border-dashed border-slate-200 text-center">
                            <Briefcase size={48} className="text-slate-400 mb-4 opacity-50" />
                            <p className="text-slate-500">You haven't applied to any jobs yet.</p>
                        </div>
                    ) : (
                        applications.map(app => {
                            const statusConfig = getStatusConfig(app.status);

                            return (
                                <Card key={app._id} className="flex flex-col h-full p-6 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                                    <div className="flex items-start gap-4 mb-5 relative">
                                        <div className="w-12 h-12 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl font-bold shrink-0">
                                            {app.job?.company?.company_name?.charAt(0) || 'C'}
                                        </div>
                                        <div className="grow pr-16">
                                            <h3 className="text-lg mb-1 text-slate-900 leading-snug font-bold overflow-hidden text-ellipsis whitespace-nowrap" title={app.job?.title || 'Unknown Job'}>{app.job?.title || 'Unknown Job'}</h3>
                                            <span className="flex items-center gap-1.5 text-sm text-slate-500 font-medium">
                                                <Building size={14} className="text-slate-400" /> <span className="truncate max-w-[120px]" title={app.job?.company?.company_name}>{app.job?.company?.company_name || 'Unknown Company'}</span>
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 mb-4 pb-4 border-b border-slate-200">
                                        <div className="flex items-center gap-2 text-slate-500 text-sm">
                                            <Calendar size={16} />
                                            <span>Applied: {new Date(app.appliedAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    <div className="mt-auto p-4 rounded-lg bg-slate-50 flex flex-col gap-2">
                                        <span className="text-xs text-slate-500 font-semibold uppercase">
                                            Current Status
                                        </span>
                                        <div className="flex items-center gap-2 font-semibold">
                                            <span className={`inline-block px-3 py-1 rounded-full text-sm ${statusConfig.class}`}>
                                                {statusConfig.label}
                                            </span>
                                        </div>

                                        {app.matchScore && (
                                            <div className="mt-2 text-sm flex justify-between">
                                                <span className="text-slate-500">AI Match Score:</span>
                                                <span className={`font-semibold ${app.matchScore > 75 ? 'text-green-600' : 'text-indigo-500'}`}>
                                                    {app.matchScore}%
                                                </span>
                                            </div>
                                        )}
                                    </div>
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
