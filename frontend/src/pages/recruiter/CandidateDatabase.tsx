import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import StudentProfileDrawer from '../../components/ProfileViewer/StudentProfileDrawer';
import { Search, Filter, Globe, MapPin, GraduationCap, SlidersHorizontal, ChevronDown, Bookmark, Star, Download, Trash2, Send, CheckSquare, X } from 'lucide-react';
import JobSelectionModal from '../../components/Modal/JobSelectionModal';
import Pagination from '../../components/Pagination/Pagination';
import api from '../../services/api';
import { exportToCSV } from '../../utils/export';

// --- Types ---
export interface DBStudent {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    branch?: string;
    graduation_year?: number;
    cgpa?: number;
    skills?: string[];
    profile_image_url?: string;
    resume_url?: string;
    bio?: string;
    location?: string;
    isMock?: boolean;
}

export interface SavedSearch {
    id: string;
    name: string;
    query: string;
    minCgpa: number;
    branch: string;
    gradYear: string;
}

// --- Boolean Search Evaluator ---
const evaluateBooleanQuery = (query: string, searchableText: string): boolean => {
    if (!query.trim()) return true;

    const lowerText = searchableText.toLowerCase();

    // Split by OR to evaluate disjunctions
    const orClauses = query.split(/\s+OR\s+/i);

    return orClauses.some(orClause => {
        const tokens = orClause.trim().split(/\s+/);

        let isValid = true;
        let expectingNot = false;

        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            if (!token) continue;

            if (token.toUpperCase() === 'AND') {
                continue; 
            } else if (token.toUpperCase() === 'NOT') {
                expectingNot = true;
                continue;
            }

            const match = lowerText.includes(token.toLowerCase());

            if (expectingNot) {
                if (match) isValid = false;
                expectingNot = false;
            } else {
                if (!match) isValid = false;
            }

            if (!isValid) break;
        }

        return isValid;
    });
};

const CandidateDatabase: React.FC = () => {
    const { user } = useAuth();
    const { addToast } = useToast();

    // Search and Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [minCgpa, setMinCgpa] = useState<number>(0);
    const [selectedBranch, setSelectedBranch] = useState<string>('ALL');
    const [selectedGradYear, setSelectedGradYear] = useState<string>('ALL');
    const [selectedCandidate, setSelectedCandidate] = useState<DBStudent | null>(null);
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);
    const [page, setPage] = useState(1);
    const limit = 12;
    
    // Bulk Selection State
    const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([]);
    const [isBulkMode, setIsBulkMode] = useState(false);

    // Messaging/Invite State
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [candidateToInvite, setCandidateToInvite] = useState<DBStudent | null>(null);
    const [isInviting, setIsInviting] = useState(false);

    // Saved Search State
    const [savedSearches, setSavedSearches] = useState<SavedSearch[]>(() => {
        const stored = localStorage.getItem('pms_saved_searches');
        return stored ? JSON.parse(stored) : [];
    });
    const [isSavingSearch, setIsSavingSearch] = useState(false);
    const [newSearchName, setNewSearchName] = useState('');

    // Shortlisting State
    const [shortlistedIds, setShortlistedIds] = useState<string[]>(() => {
        const stored = localStorage.getItem('pms_shortlisted_candidates');
        return stored ? JSON.parse(stored) : [];
    });
    const [showShortlistedOnly, setShowShortlistedOnly] = useState(false);

    const { data, isLoading, isError } = useQuery({
        queryKey: ['globalCandidates', page],
        queryFn: async () => {
            const res = await api.get(`/students?page=${page}&limit=${limit}`);
            return res.data; 
        },
        enabled: !!user,
    });

    const candidates = data?.data || [];
    const pagination = data?.pagination || { total: 0, pages: 0 };

    useEffect(() => {
        if (isError) {
            addToast('Error fetching candidates. Please check your connection.', 'error');
        }
    }, [isError, addToast]);

    // Persistence Effect
    useEffect(() => {
        localStorage.setItem('pms_saved_searches', JSON.stringify(savedSearches));
    }, [savedSearches]);

    useEffect(() => {
        localStorage.setItem('pms_shortlisted_candidates', JSON.stringify(shortlistedIds));
    }, [shortlistedIds]);

    // Reset selection when filters change
    useEffect(() => {
        setSelectedCandidateIds([]);
    }, [searchQuery, minCgpa, selectedBranch, selectedGradYear, showShortlistedOnly]);

    // Extract unique branches and grad years for filters
    const branches = useMemo(() => Array.from(new Set(candidates.map((c: any) => c.branch).filter(Boolean))), [candidates]);
    const gradYears = useMemo(() => Array.from(new Set(candidates.map((c: any) => c.graduation_year).filter(Boolean))), [candidates]);

    // Process Search and Filters
    const filteredCandidates = useMemo(() => {
        return candidates.filter((candidate: DBStudent) => {
            if (minCgpa > 0 && (candidate.cgpa || 0) < minCgpa) return false;
            if (selectedBranch !== 'ALL' && candidate.branch !== selectedBranch) return false;
            if (selectedGradYear !== 'ALL' && String(candidate.graduation_year) !== selectedGradYear) return false;
            if (showShortlistedOnly && !shortlistedIds.includes(candidate._id)) return false;

            if (searchQuery.trim()) {
                const searchableText = [
                    candidate.name,
                    candidate.email,
                    candidate.branch,
                    ...(candidate.skills || [])
                ].join(' ');

                return evaluateBooleanQuery(searchQuery, searchableText);
            }

            return true;
        });
    }, [candidates, searchQuery, minCgpa, selectedBranch, selectedGradYear, showShortlistedOnly, shortlistedIds]);

    // --- Selection Handlers ---
    const toggleSelection = (id: string) => {
        setSelectedCandidateIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const selectAll = () => {
        if (selectedCandidateIds.length === filteredCandidates.length) {
            setSelectedCandidateIds([]);
        } else {
            setSelectedCandidateIds(filteredCandidates.map((c: DBStudent) => c._id));
        }
    };

    // --- Action Handlers ---
    const handleSaveSearch = () => {
        if (!newSearchName.trim()) return;
        const newSearch: SavedSearch = {
            id: Math.random().toString(36).substring(7),
            name: newSearchName,
            query: searchQuery,
            minCgpa,
            branch: selectedBranch,
            gradYear: selectedGradYear
        };
        setSavedSearches(prev => [newSearch, ...prev]);
        setNewSearchName('');
        setIsSavingSearch(false);
        addToast('Search query bookmarked!', 'success');
    };

    const applySavedSearch = (s: SavedSearch) => {
        setSearchQuery(s.query);
        setMinCgpa(s.minCgpa);
        setSelectedBranch(s.branch);
        setSelectedGradYear(s.gradYear);
        addToast(`Applied search: ${s.name}`, 'info');
    };

    const deleteSavedSearch = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setSavedSearches(prev => prev.filter(s => s.id !== id));
        addToast('Saved search removed', 'info');
    };

    const toggleShortlist = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setShortlistedIds(prev => {
            const isStarred = prev.includes(id);
            if (isStarred) {
                addToast('Removed from talent pool', 'info');
                return prev.filter(i => i !== id);
            } else {
                addToast('Added to talent pool', 'success');
                return [...prev, id];
            }
        });
    };

    const handleBulkTalentPool = () => {
        setShortlistedIds(prev => {
            const next = [...new Set([...prev, ...selectedCandidateIds])];
            addToast(`Added ${selectedCandidateIds.length} candidates to talent pool`, 'success');
            return next;
        });
        setSelectedCandidateIds([]);
        setIsBulkMode(false);
    };

    const handleExport = () => {
        const toExport = selectedCandidateIds.length > 0
            ? candidates.filter((c: DBStudent) => selectedCandidateIds.includes(c._id))
            : filteredCandidates;

        if (toExport.length === 0) return;
        const exportData = toExport.map((c: DBStudent) => ({
            Name: c.name,
            Email: c.email,
            Phone: c.phone || 'N/A',
            Branch: c.branch,
            'Grad Year': c.graduation_year,
            CGPA: c.cgpa,
            Skills: (c.skills || []).join(', '),
            Location: c.location || 'Remote'
        }));
        exportToCSV(exportData, `candidate-export-${new Date().toISOString().slice(0, 10)}`);
        addToast(`Exported ${toExport.length} candidates`, 'success');
    };

    const handleInviteClick = (e: React.MouseEvent, candidate: DBStudent) => {
        e.stopPropagation();
        setCandidateToInvite(candidate);
        setIsInviteModalOpen(true);
    };

    const handleBulkInvite = () => {
        if (selectedCandidateIds.length === 0) return;
        setCandidateToInvite({ name: `${selectedCandidateIds.length} candidates` } as any);
        setIsInviteModalOpen(true);
    };

    const handleConfirmInvite = async (jobId: string) => {
        setIsInviting(true);
        try {
            if (selectedCandidateIds.length > 0) {
                await Promise.all(selectedCandidateIds.map(id => api.post(`/students/${id}/invite`, { jobId })));
                addToast(`Invitations sent to ${selectedCandidateIds.length} candidates!`, 'success');
                setSelectedCandidateIds([]);
                setIsBulkMode(false);
            } else if (candidateToInvite) {
                await api.post(`/students/${candidateToInvite._id}/invite`, { jobId });
                addToast(`Invitation sent to ${candidateToInvite.name}!`, 'success');
            }
            setIsInviteModalOpen(false);
            setCandidateToInvite(null);
        } catch (error: any) {
            addToast(error.response?.data?.message || 'Failed to send invitation(s)', 'error');
        } finally {
            setIsInviting(false);
        }
    };

    const mapToUIApplicant = (student: DBStudent): any => {
        return {
            _id: `mock_app_${student._id}`,
            student: student,
            status: 'N/A',
            matchScore: 0,
            job: null
        };
    };

    return (
        <div className="max-w-[1400px] mx-auto pb-12 animate-fade-in flex flex-col min-h-full">
            {/* Header Section */}
            <div className="mb-6 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-indigo-700 mb-2 flex items-center gap-3">
                        <Globe className="text-indigo-500" />
                        Global Candidate Database
                    </h1>
                    <p className="text-slate-500 text-base m-0">
                        Source top talent across the entire platform using powerful Boolean search parameters.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button 
                        variant={isBulkMode ? "secondary" : "ghost"}
                        icon={isBulkMode ? X : CheckSquare}
                        onClick={() => {
                            setIsBulkMode(!isBulkMode);
                            if (isBulkMode) setSelectedCandidateIds([]);
                        }}
                    >
                        {isBulkMode ? "Cancel Selection" : "Bulk Select"}
                    </Button>
                </div>
            </div>

            {/* Bulk Actions Floating Bar */}
            {isBulkMode && selectedCandidateIds.length > 0 && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-8 z-[200] animate-slide-up border-t border-slate-800">
                    <div className="flex items-center gap-4">
                        <span className="text-indigo-400 font-bold whitespace-nowrap">{selectedCandidateIds.length} Candidates Selected</span>
                        <div className="w-px h-6 bg-slate-700"></div>
                        <button 
                            onClick={selectAll} 
                            className="text-xs font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-wider"
                        >
                            {selectedCandidateIds.length === filteredCandidates.length ? 'Deselect All' : 'Select Page'}
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" className="text-slate-300 hover:text-white" icon={Download} onClick={handleExport}>Export</Button>
                        <Button size="sm" variant="ghost" className="text-amber-400 hover:text-white" icon={Star} onClick={handleBulkTalentPool}>Save to Pool</Button>
                        <Button size="sm" variant="primary" className="bg-indigo-600 border-none shadow-lg shadow-indigo-900/40" icon={Send} onClick={handleBulkInvite}>Invite to Job</Button>
                    </div>
                </div>
            )}

            {/* Search and Filters Strip */}
            <Card className="p-5 mb-6 border-slate-200 shadow-sm">
                <div className="flex gap-3 items-center">
                    <div className="relative flex items-center w-full">
                        <div className="absolute left-4 text-slate-400">
                            <Search size={20} />
                        </div>
                        <input
                            type="text"
                            placeholder='Boolean Search: e.g. "React AND Node OR Python NOT Django"'
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-24 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-mono text-sm shadow-inner text-slate-800 dark:text-slate-200 placeholder:text-slate-400 placeholder:font-sans"
                        />
                        <div className="absolute right-2 flex items-center gap-1">
                            <button
                                onClick={() => setIsSavingSearch(true)}
                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 rounded-lg transition-colors"
                                title="Bookmark query"
                            >
                                <Bookmark size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="hidden lg:block relative group">
                        <button className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors whitespace-nowrap">
                            <Bookmark size={16} className="text-indigo-500" />
                            Saved Queries
                            <ChevronDown size={14} className="opacity-50" />
                        </button>
                        <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden z-[100] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                            <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">My Bookmarks</span>
                            </div>
                            <div className="max-h-[300px] overflow-y-auto">
                                {savedSearches.length === 0 ? (
                                    <div className="p-4 text-center text-xs text-slate-500 italic">No bookmarked searches</div>
                                ) : (
                                    savedSearches.map(s => (
                                        <div key={s.id} onClick={() => applySavedSearch(s)} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-between group/item">
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{s.name}</p>
                                                <p className="text-[10px] text-slate-500 truncate">{s.query}</p>
                                            </div>
                                            <button onClick={(e) => deleteSavedSearch(e, s.id)} className="p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleExport}
                        disabled={filteredCandidates.length === 0}
                        className="hidden lg:flex items-center gap-2 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Download size={16} />
                        Export
                    </button>

                    <button
                        onClick={() => setIsFiltersOpen(prev => !prev)}
                        className={`lg:hidden flex items-center gap-2 px-3 py-3 rounded-xl border text-sm font-semibold transition-colors shrink-0 ${isFiltersOpen
                            ? 'bg-indigo-600 border-indigo-600 text-white'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                    >
                        <SlidersHorizontal size={18} />
                        <ChevronDown size={14} className={`transition-transform ${isFiltersOpen ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                {isSavingSearch && (
                    <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl animate-slide-in-right flex flex-col sm:flex-row items-center gap-3">
                        <div className="flex-1 w-full">
                            <input
                                type="text"
                                value={newSearchName}
                                onChange={(e) => setNewSearchName(e.target.value)}
                                placeholder="Label for this search (e.g. Java Developers)"
                                className="w-full bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                autoFocus
                            />
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <button onClick={() => setIsSavingSearch(false)} className="px-4 py-2 text-sm font-semibold text-slate-500">Cancel</button>
                            <button onClick={handleSaveSearch} disabled={!newSearchName.trim()} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold shadow-lg shadow-indigo-200 transition-all">Save Bookmark</button>
                        </div>
                    </div>
                )}

                <div className={`${isFiltersOpen ? 'flex' : 'hidden'} lg:flex flex-wrap items-center gap-4 mt-4`}>
                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700">
                        <Filter size={16} className="text-slate-500" />
                        <select value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)} className="bg-transparent border-none text-sm font-medium text-slate-700 dark:text-slate-300 focus:ring-0 outline-none w-32 cursor-pointer">
                            <option value="ALL">All Branches</option>
                            {branches.map(b => <option key={String(b)} value={String(b)}>{String(b)}</option>)}
                        </select>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700">
                        <GraduationCap size={16} className="text-slate-500" />
                        <select value={selectedGradYear} onChange={(e) => setSelectedGradYear(e.target.value)} className="bg-transparent border-none text-sm font-medium text-slate-700 dark:text-slate-300 focus:ring-0 outline-none w-28 cursor-pointer">
                            <option value="ALL">Any Year</option>
                            {gradYears.map(y => <option key={String(y)} value={String(y)}>{String(y)}</option>)}
                        </select>
                    </div>

                    <div className="flex items-center gap-3 bg-indigo-50/50 dark:bg-indigo-900/20 px-4 py-2 rounded-lg border border-indigo-100 dark:border-indigo-800 shrink-0">
                        <span className="text-xs font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wide">Min CGPA</span>
                        <input type="range" min="0" max="10" step="0.5" value={minCgpa} onChange={(e) => setMinCgpa(Number(e.target.value))} className="w-24 accent-indigo-600" />
                        <span className="text-sm font-black w-6 text-right text-indigo-700 dark:text-indigo-400">{minCgpa}</span>
                    </div>

                    <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 hidden lg:block mx-1"></div>

                    <button
                        onClick={() => setShowShortlistedOnly(!showShortlistedOnly)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all font-bold text-sm ${showShortlistedOnly
                            ? 'bg-amber-100 border-amber-200 text-amber-700 shadow-inner'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'}`}
                    >
                        <Star size={16} className={showShortlistedOnly ? 'fill-amber-500 text-amber-500' : ''} />
                        Talent Pool
                    </button>
                </div>
            </Card>

            {/* Results Section */}
            <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="font-bold text-slate-700 dark:text-slate-300">
                    Found {filteredCandidates.length} candidate{filteredCandidates.length !== 1 ? 's' : ''}
                </h3>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-64 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl border border-slate-200 dark:border-slate-700" />
                    ))}
                </div>
            ) : filteredCandidates.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-20 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                    <Search size={48} className="text-slate-300 dark:text-slate-600 mb-4" />
                    <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">No candidates found</h3>
                    <p className="text-slate-500">Try adjusting your filters or query.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredCandidates.map((candidate: DBStudent) => (
                        <div
                            key={candidate._id}
                            onClick={() => isBulkMode ? toggleSelection(candidate._id) : setSelectedCandidate(candidate)}
                            className={`group bg-white dark:bg-slate-800 border ${selectedCandidateIds.includes(candidate._id) ? 'border-2 border-indigo-500 ring-4 ring-indigo-500/10' : 'border-slate-200 dark:border-slate-700'} rounded-2xl overflow-hidden hover:shadow-xl transition-all cursor-pointer flex flex-col h-full relative`}
                        >
                            {/* Checkbox Overlay */}
                            {(isBulkMode || selectedCandidateIds.includes(candidate._id)) && (
                                <div className="absolute top-4 left-4 z-20">
                                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${selectedCandidateIds.includes(candidate._id) ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white/90 border-slate-300 text-transparent group-hover:border-indigo-400'}`}>
                                        {selectedCandidateIds.includes(candidate._id) && (
                                            <svg width="14" height="12" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M4 10L0 6.00003L1.40002 4.60001L4 7.20001L10.6 0.599976L12 1.99997L4 10Z" fill="currentColor" />
                                            </svg>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="p-5 flex-1 select-none">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-xl font-black text-indigo-600 dark:text-indigo-400 shrink-0 relative">
                                            {candidate.name.charAt(0)}
                                            {shortlistedIds.includes(candidate._id) && (
                                                <div className="absolute -top-1 -right-1 bg-amber-400 p-1 rounded-full border-2 border-white dark:border-slate-800 text-white">
                                                    <Star size={10} className="fill-white" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="font-bold text-lg text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                                                {candidate.name}
                                            </h4>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                                {candidate.branch}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2 shrink-0">
                                        <div className="bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded font-bold text-emerald-700 dark:text-emerald-400 text-xs">
                                            {candidate.cgpa} CGPA
                                        </div>
                                        {!isBulkMode && (
                                            <button
                                                onClick={(e) => toggleShortlist(e, candidate._id)}
                                                className={`p-2 rounded-lg transition-all ${shortlistedIds.includes(candidate._id) ? 'bg-amber-50 text-amber-500' : 'text-slate-300 hover:text-amber-400 hover:bg-amber-50/50'}`}
                                            >
                                                <Star size={18} className={shortlistedIds.includes(candidate._id) ? 'fill-amber-400' : ''} />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                                        <GraduationCap size={14} className="text-indigo-400" />
                                        <span>Class of {candidate.graduation_year}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                                        <MapPin size={14} className="text-slate-400" />
                                        <span className="truncate">{candidate.location || 'Remote'}</span>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-1.5 h-[52px] overflow-hidden">
                                    {candidate.skills?.map(skill => (
                                        <span key={skill} className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold rounded uppercase tracking-wide">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="flex border-t border-slate-100 dark:border-slate-800">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (isBulkMode) toggleSelection(candidate._id);
                                        else setSelectedCandidate(candidate);
                                    }}
                                    className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-900/50 text-center text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 transition-colors border-r border-slate-100 dark:border-slate-800 rounded-bl-2xl"
                                >
                                    Full Profile
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (isBulkMode) toggleSelection(candidate._id);
                                        else handleInviteClick(e, candidate);
                                    }}
                                    className="flex-1 px-4 py-3 bg-indigo-600 text-center text-xs font-extrabold text-white hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 rounded-br-2xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)]"
                                >
                                    {isBulkMode ? (selectedCandidateIds.includes(candidate._id) ? 'Deselect' : 'Select') : (
                                        <><Send size={14} /> Invite</>
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Pagination 
                currentPage={page} 
                totalPages={pagination.pages || 1} 
                onPageChange={setPage} 
                isLoading={isLoading} 
            />

            <JobSelectionModal
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                onConfirm={handleConfirmInvite}
                studentName={candidateToInvite?.name || ''}
                isSubmitting={isInviting}
            />

            <StudentProfileDrawer
                isOpen={!!selectedCandidate}
                onClose={() => setSelectedCandidate(null)}
                applicant={selectedCandidate ? mapToUIApplicant(selectedCandidate) : null}
            />
        </div>
    );
};

export default CandidateDatabase;
