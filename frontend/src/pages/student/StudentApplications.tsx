import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/Card/Card';
import SkeletonJobCard from '../../components/Skeleton/SkeletonJobCard';
import { Briefcase, Calendar, Building, ShieldCheck, Clock, Book } from 'lucide-react';
import { Application } from '../../types';
import { studentService } from '../../services/studentService';
import EmptyState from '../../components/EmptyState/EmptyState';
import ApplicationTimeline, { TimelineStep } from '../../components/Timeline/ApplicationTimeline';
import Modal from '../../components/Modal/Modal';
import ApplicationJournal from '../../components/Journal/ApplicationJournal';
import ChatThread from '../../components/Chat/ChatThread';
import { format } from 'date-fns';
import PageHeader from '../../components/PageHeader/PageHeader';
import { MessageCircle } from 'lucide-react';

interface UIApplication extends Omit<Application, 'job'> {
    matchScore?: number;
    appliedAt: string;
    offer_letter_url?: string;
    offer_issued_at?: string;
    offer_expires_at?: string;
    job: {
        _id: string;
        title: string;
        company_name?: string;
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
    student_notes?: string;
    checklists?: any[];
}

const StudentApplications: React.FC = () => {
    const { addToast } = useToast();
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [journalApp, setJournalApp] = useState<UIApplication | null>(null);
    const [chatAppId, setChatAppId] = useState<string | null>(null);

    const { data: applications = [], isLoading, refetch } = useQuery({
        queryKey: ['studentApplications'],
        queryFn: async () => {
            const res = await studentService.getApplications();
            return res.data as UIApplication[];
        },
    });

    const handleOfferResponse = async (id: string, action: 'accept' | 'decline') => {
        setProcessingId(id);
        try {
            await studentService.respondToOffer(id, action);
            addToast(action === 'accept' ? 'Congratulations! Offer accepted.' : 'Offer declined.', 'success');
            refetch();
        } catch (error: any) {
            addToast(error.response?.data?.message || 'Action failed', 'error');
        } finally {
            setProcessingId(null);
        }
    };

    // Helper to generate a realistic timeline based on current status
    const generateTimeline = (app: UIApplication): TimelineStep[] => {
        const statuses = ['SUBMITTED', 'REVIEWED', 'SHORTLISTED', 'INTERVIEW', 'OFFER'];
        
        let currentIndex = statuses.indexOf(app.status);
        if (app.status === 'SELECTED' || app.status === 'OFFER_ACCEPTED' || app.status === 'OFFER_DECLINED') {
            currentIndex = 4; // Offer stage
        } else if (app.status === 'REJECTED') {
            // Keep at current index but mark as error later
            currentIndex = Math.max(0, currentIndex);
        }

        const steps: TimelineStep[] = [
            {
                label: 'Application Submitted',
                status: currentIndex >= 0 ? (app.status === 'REJECTED' && currentIndex === 0 ? 'error' : 'completed') : 'pending',
                date: app.appliedAt ? format(new Date(app.appliedAt), 'MMM dd, yyyy') : undefined
            },
            {
                label: 'Under Review',
                status: currentIndex > 1 ? 'completed' : (currentIndex === 1 ? (app.status === 'REJECTED' ? 'error' : 'active') : 'pending')
            },
            {
                label: 'Shortlisted',
                status: currentIndex > 2 ? 'completed' : (currentIndex === 2 ? (app.status === 'REJECTED' ? 'error' : 'active') : 'pending')
            },
            {
                label: 'Interview Process',
                status: currentIndex > 3 ? 'completed' : (currentIndex === 3 ? (app.status === 'REJECTED' ? 'error' : 'active') : 'pending')
            },
            {
                label: 'Final Decision',
                status: app.status === 'OFFER_ACCEPTED' ? 'completed' : 
                        (app.status === 'OFFER_DECLINED' || app.status === 'REJECTED' ? 'error' : 
                        (app.status === 'SELECTED' ? 'active' : 'pending')),
                description: app.status === 'SELECTED' ? 'You have a pending offer!' : undefined
            }
        ];

        return steps;
    };

    return (
        <div className="flex flex-col gap-8">
            <PageHeader 
                title="Your Applications"
                subtitle="Track the real-time status of your career opportunities."
            />

            {isLoading ? (
                <SkeletonJobCard count={4} />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {applications.length === 0 ? (
                        <div className="col-span-full">
                            <EmptyState 
                                illustration="/src/assets/illustrations/empty_apps.png"
                                title="No applications yet"
                                description="Your applied jobs will appear here once you start sourcing."
                            />
                        </div>
                    ) : (
                        applications.map(app => {
                            const isOffer = app.status === 'SELECTED';
                            const canChat = ['SHORTLISTED', 'SELECTED', 'OFFERED', 'HIRED', 'ACCEPTED'].includes(app.status);

                            return (
                                <Card key={app._id} className={`flex flex-col h-full p-0 overflow-hidden hover:shadow-2xl transition-all duration-300 border ${isOffer ? 'border-purple-300 ring-2 ring-purple-100 ring-offset-2' : 'border-slate-100 dark:border-slate-700/50'}`}>
                                    <div className="p-6 flex-1">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="w-14 h-14 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-2xl font-black shadow-sm shrink-0">
                                            {(app.job?.company_name || app.job?.company?.company_name || 'C').charAt(0).toUpperCase()}
                                        </div>
                                    </div>


                                        <div className="mb-6">
                                            <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2" title={app.job?.title}>
                                                {app.job?.title || 'Unknown Job'}
                                            </h3>
                                            <p className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-bold">
                                                <Building size={16} className="text-slate-400" />
                                                {app.job?.company_name || app.job?.company?.company_name || 'Unknown Company'}
                                            </p>
                                        </div>

                                        <div className="space-y-3 mb-6 font-medium text-slate-600 dark:text-slate-400">
                                            <div className="flex items-center gap-3 text-sm">
                                                <Calendar size={18} className="text-slate-400" />
                                                <span>Applied on {new Date(app.appliedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                            </div>
                                            {isOffer && app.offer_expires_at && (
                                                <div className="flex items-center gap-3 text-amber-600 dark:text-amber-500 text-sm font-bold">
                                                    <Clock size={18} />
                                                    <span>Offer expires on {new Date(app.offer_expires_at).toLocaleDateString()}</span>
                                                </div>
                                            )}
                                        </div>

                                        {app.matchScore && (
                                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">AI Match Score</span>
                                                <span className={`text-sm font-black ${app.matchScore > 80 ? 'text-emerald-600' : 'text-indigo-600'}`}>
                                                    {app.matchScore}%
                                                </span>
                                            </div>
                                        )}

                                        {/* Application Timeline */}
                                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                                            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">Progress Tracker</h4>
                                            <div className="pl-2">
                                                <ApplicationTimeline steps={generateTimeline(app)} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Footers */}
                                    {isOffer ? (
                                        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border-t border-purple-100 dark:border-purple-800 grid grid-cols-2 gap-3">
                                            <button 
                                                onClick={() => window.open(app.offer_letter_url, '_blank')}
                                                className="col-span-2 py-3 bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-400 font-bold rounded-xl border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-all flex items-center justify-center gap-2 mb-1 shadow-sm"
                                            >
                                                <Briefcase size={16} /> View Offer Letter (PDF)
                                            </button>
                                            <button 
                                                disabled={processingId === app._id}
                                                onClick={() => handleOfferResponse(app._id, 'decline')}
                                                className="py-2.5 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 transition-all disabled:opacity-50"
                                            >
                                                Decline
                                            </button>
                                            <button 
                                                disabled={processingId === app._id}
                                                onClick={() => handleOfferResponse(app._id, 'accept')}
                                                className="py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200/20 hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                            >
                                                {processingId === app._id ? 'Processing...' : 'Accept Offer'}
                                            </button>
                                        </div>
                                    ) : app.status === 'OFFER_ACCEPTED' ? (
                                        <>
                                            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border-t border-emerald-100 dark:border-emerald-800">
                                                <button 
                                                    onClick={() => app.offer_letter_url && window.open(app.offer_letter_url, '_blank')}
                                                    className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-200/20 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                                                >
                                                    <ShieldCheck size={18} /> View Signed Offer
                                                </button>
                                            </div>
                                            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                                                <button 
                                                    onClick={() => setJournalApp(app)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-lg border border-indigo-100 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 transition-all shadow-sm"
                                                >
                                                    <Book size={14} /> Prep Journal
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="p-4 bg-slate-50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                <button 
                                                    onClick={() => setJournalApp(app)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-lg border border-indigo-100 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 transition-all shadow-sm shrink-0"
                                                >
                                                    <Book size={14} /> Journal
                                                </button>
                                                {canChat && (
                                                    <button 
                                                        onClick={() => setChatAppId(app._id)}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg shadow-lg shadow-indigo-200/20 hover:bg-indigo-700 transition-all shrink-0"
                                                    >
                                                        <MessageCircle size={14} /> Message
                                                    </button>
                                                )}
                                            </div>
                                            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase">In Progress</span>
                                        </div>
                                    )}
                                </Card>
                            );
                        })
                    )}
                </div>
            )}

            {/* Journal Modal */}
            {journalApp && (
                <Modal
                    isOpen={!!journalApp}
                    onClose={() => setJournalApp(null)}
                    title="Application Journal"
                    size="lg"
                >
                    <div className="h-[600px]">
                        <ApplicationJournal 
                            applicationId={journalApp._id}
                            initialNotes={journalApp.student_notes || ''}
                            initialChecklist={journalApp.checklists || []}
                            jobTitle={journalApp.job.title}
                            jobDescription={journalApp.job.description}
                            jobSkills={journalApp.job.skills_required}
                            onClose={() => setJournalApp(null)}
                            onUpdate={refetch}
                        />
                    </div>
                </Modal>
            )}

            {/* Chat Modal */}
            <Modal
                isOpen={!!chatAppId}
                onClose={() => setChatAppId(null)}
                title="Recruiter Message Thread"
                size="md"
            >
                <div className="h-[600px]">
                    {chatAppId && (
                        <ChatThread 
                            applicationId={chatAppId} 
                            onClose={() => setChatAppId(null)} 
                        />
                    )}
                </div>
            </Modal>
        </div>
    );
};

export default StudentApplications;
