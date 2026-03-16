import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import SkeletonJobCard from '../../components/Skeleton/SkeletonJobCard';
import { Search, Grid, List, Filter, ArrowUpDown } from 'lucide-react';
import { studentService } from '../../services/studentService';
import EmptyState from '../../components/EmptyState/EmptyState';
import Modal from '../../components/Modal/Modal';
import ApplicationJournal from '../../components/Journal/ApplicationJournal';
import ChatThread from '../../components/Chat/ChatThread';
import PageHeader from '../../components/PageHeader/PageHeader';
import ApplicationCard, { UIApplication } from './components/ApplicationCard';
import { motion, AnimatePresence } from 'framer-motion';

const StudentApplications: React.FC = () => {
    const { addToast } = useToast();
    const navigate = useNavigate();
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [journalApp, setJournalApp] = useState<UIApplication | null>(null);
    const [chatAppId, setChatAppId] = useState<string | null>(null);
    
    // UI Logic States
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [sortBy, setSortBy] = useState<'recent' | 'match'>('recent');

    const { data: applications = [], isLoading, refetch } = useQuery({
        queryKey: ['studentApplications'],
        queryFn: async () => {
            const res = await studentService.getApplications();
            return res.data as unknown as UIApplication[];
        },
    });

    const filteredApplications = useMemo(() => {
        return applications
            .filter(app => {
                const matchesSearch = 
                    app.job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (app.job.company_name || app.job.company?.company_name || '').toLowerCase().includes(searchTerm.toLowerCase());
                
                const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
                
                return matchesSearch && matchesStatus;
            })
            .sort((a, b) => {
                if (sortBy === 'recent') {
                    return new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime();
                }
                return (b.matchScore || 0) - (a.matchScore || 0);
            });
    }, [applications, searchTerm, statusFilter, sortBy]);

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

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
        }
    };

    return (
        <div className="flex flex-col gap-6">
             <PageHeader 
                title="Applications"
                subtitle="Manage and track your active career pursuits in real-time."
            />

            {/* Premium Filter Bar */}
            <div className="sticky top-0 z-20 pt-2 pb-4 bg-slate-50/80 dark:bg-[#0f172a]/80 backdrop-blur-md">
                <div className="flex flex-col lg:flex-row gap-4 items-center justify-between p-4 bg-white/70 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-slate-700/50 shadow-sm">
                    <div className="flex flex-1 items-center gap-4 w-full">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                            <input 
                                type="text"
                                placeholder="Search by role or company..."
                                className="w-full h-12 pl-12 pr-4 bg-slate-100/50 dark:bg-slate-900/50 border-none rounded-xl text-sm focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        
                        <div className="hidden sm:flex items-center p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
                            <button 
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm' : 'text-slate-400'}`}
                            >
                                <Grid size={18} />
                            </button>
                            <button 
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm' : 'text-slate-400'}`}
                            >
                                <List size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 w-full lg:w-auto">
                         <div className="relative flex-1 lg:flex-none">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                            <select 
                                className="w-full lg:w-48 h-10 pl-9 pr-4 bg-slate-100 dark:bg-slate-900 border-none rounded-xl text-xs font-bold uppercase tracking-widest outline-none appearance-none cursor-pointer"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="ALL">All Status</option>
                                <option value="SUBMITTED">Submitted</option>
                                <option value="INTERVIEW">Interviewing</option>
                                <option value="SELECTED">Offered</option>
                                <option value="REJECTED">Rejected</option>
                            </select>
                        </div>

                        <button 
                            onClick={() => setSortBy(sortBy === 'recent' ? 'match' : 'recent')}
                            className="flex items-center gap-2 h-10 px-4 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-bold uppercase tracking-widest whitespace-nowrap hover:bg-indigo-100 transition-colors"
                        >
                            <ArrowUpDown size={14} />
                            {sortBy === 'recent' ? 'Latest' : 'Match'}
                        </button>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <SkeletonJobCard count={6} />
            ) : (
                <AnimatePresence mode="wait">
                    {filteredApplications.length === 0 ? (
                        <motion.div 
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <EmptyState 
                                variant="applications"
                                title={searchTerm ? "No matching applications" : "No applications yet"}
                                description={searchTerm ? "Try adjusting your search or filters." : "Your applied jobs will appear here once you start sourcing."}
                            />
                        </motion.div>
                    ) : (
                        <motion.div 
                            key={viewMode + statusFilter + searchTerm}
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className={viewMode === 'grid' 
                                ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" 
                                : "flex flex-col gap-3"
                            }
                        >
                            {filteredApplications.map(app => (
                                <ApplicationCard 
                                    key={app._id} 
                                    application={app} 
                                    viewMode={viewMode}
                                    onJournal={setJournalApp}
                                    onMessage={setChatAppId}
                                    onJoinVideo={(id) => navigate(`/interviews/${id}/room`)}
                                    onViewOffer={(url) => window.open(url, '_blank')}
                                    onRespondOffer={handleOfferResponse}
                                    isProcessing={processingId === app._id}
                                />
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            )}

            {/* Modals */}
            <Modal isOpen={!!journalApp} onClose={() => setJournalApp(null)} title="Application Journal" size="lg">
                <div className="h-[600px]">
                    {journalApp && (
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
                    )}
                </div>
            </Modal>

            <Modal isOpen={!!chatAppId} onClose={() => setChatAppId(null)} title="Recruiter Message Thread" size="md">
                <div className="h-[600px]">
                    {chatAppId && (
                        <ChatThread applicationId={chatAppId} onClose={() => setChatAppId(null)} />
                    )}
                </div>
            </Modal>
        </div>
    );
};

export default StudentApplications;
