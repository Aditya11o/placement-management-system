import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import SkeletonProfileForm from '../../components/Skeleton/SkeletonProfileForm';
import { 
    User, Edit2, X, Image as ImageIcon, Bell, Printer, 
    FileType, Camera, Sparkles, ShieldCheck, 
    TrendingUp, ExternalLink, Calendar, Mail, Phone,
    MapPin, Award, CheckCircle2, Zap
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { studentService } from '../../services/studentService';
import { useMutation, useQuery } from '@tanstack/react-query';
import FileUpload from '../../components/FileUpload/FileUpload';
import NotificationSettings from '../../components/NotificationSettings/NotificationSettings';
import ResumePreview from '../../components/Resume/ResumePreview';
import { aiService } from '../../services/aiService';
import BadgeSection from '../../components/Profile/BadgeSection';
import { gamificationService } from '../../services/gamificationService';
import { StudentProfile as IStudentProfile, Project, Internship } from '../../types';
import AcademicDetails from './components/AcademicDetails';
import ProfessionalHistory from './components/ProfessionalHistory';
import SkillSection from './components/SkillSection';
import PersonalDetails from './components/PersonalDetails';
import PortfolioThemes from './components/PortfolioThemes';
import { motion, AnimatePresence } from 'framer-motion';

const profileSchema = z.object({
    branch: z.string().min(2, 'Branch is required'),
    cgpa: z.coerce.number().min(0).max(10),
    graduation_year: z.coerce.number().int().min(2000).max(2100),
    marks_10th: z.coerce.number().min(0).max(100),
    marks_12th: z.coerce.number().min(0).max(100),
});

const StudentProfile: React.FC = () => {
    const { user } = useAuth();
    const { addToast } = useToast();

    const [activeTab, setActiveTab] = useState<'profile' | 'notifications'>('profile');
    const [originalProfile, setOriginalProfile] = useState<IStudentProfile | null>(null);
    const [skills, setSkills] = useState<string[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [internships, setInternships] = useState<Internship[]>([]);
    
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [newSkill, setNewSkill] = useState<string>('');
    const [showResume, setShowResume] = useState<boolean>(false);

    const { data: suggestedSkills = [], isLoading: isSuggestionsLoading } = useQuery({
        queryKey: ['skillSuggestions'],
        queryFn: () => aiService.getSkillSuggestions(),
        enabled: isEditing,
    });

    const { data: gStats } = useQuery({
        queryKey: ['gamificationStats'],
        queryFn: () => gamificationService.getStats(),
        enabled: !!user,
    });

    const completionStats = useMemo(() => {
        if (!originalProfile) return { percentage: 0, items: [] };
        let points = 0;
        let total = 7;
        const items = [];

        if (originalProfile.profile_image_url) points++;
        else items.push('Profile Photo');
        
        if (originalProfile.resume_url || originalProfile.activeResume) points++;
        else items.push('Professional Resume');
        
        if (originalProfile.skills?.length > 3) points++;
        else items.push('Core Skills (min 4)');
        
        if (originalProfile.projects?.length > 0) points++;
        else items.push('Featured Projects');
        
        if (originalProfile.internships?.length > 0) points++;
        else items.push('Professional History');
        
        if (originalProfile.cgpa > 0) points++;
        else items.push('Academic History');
        
        if (originalProfile.branch) points++;
        
        return { 
            percentage: Math.round((points / total) * 100),
            missing: items
        };
    }, [originalProfile]);

    const uploadPhotoMutation = useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData();
            formData.append('photo', file);
            return await studentService.uploadProfilePhoto(formData);
        },
        onSuccess: () => {
            addToast('Profile photo updated', 'success');
            fetchProfile();
        },
        onError: (err: any) => addToast(err.response?.data?.message || 'Upload failed', 'error')
    });

    const uploadResumeMutation = useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData();
            formData.append('resume', file);
            return await studentService.uploadResume(formData);
        },
        onSuccess: () => {
            addToast('Resume updated', 'success');
            fetchProfile();
        },
        onError: (err: any) => addToast(err.response?.data?.message || 'Upload failed', 'error')
    });

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        resolver: zodResolver(profileSchema),
        mode: 'onTouched'
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await studentService.getProfile();
            const data: IStudentProfile = res.data;
            setOriginalProfile(data);
            setSkills(data.skills || []);
            setProjects(data.projects || []);
            setInternships(data.internships || []);
            reset({
                branch: data.branch,
                cgpa: data.cgpa,
                graduation_year: data.graduation_year,
                marks_10th: data.marks_10th,
                marks_12th: data.marks_12th,
            });
        } catch {
            addToast('Failed to load profile', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const onSubmit = async (data: any) => {
        setIsSaving(true);
        try {
            await studentService.updateProfile({ ...data, skills, projects, internships });
            addToast('Profile synchronized successfully!', 'success');
            setIsEditing(false);
            fetchProfile();
        } catch (error: any) {
            addToast(error.response?.data?.message || 'Sync failed', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <SkeletonProfileForm />;

    return (
        <div className="flex flex-col gap-10 animate-in fade-in duration-700 pb-20">
            
            {/* Immersive Identity Hero */}
            <div className="relative rounded-[3.5rem] overflow-hidden shadow-2xl bg-white dark:bg-slate-900 min-h-[400px]">
                {/* Banner Background */}
                <div className="h-64 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-amber-500 animate-[gradient_15s_ease_infinite]" />
                    <div className="absolute inset-0 opacity-20 mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
                    <button className="absolute top-6 right-6 p-4 rounded-2xl bg-white/10 border border-white/20 text-white backdrop-blur-xl hover:bg-white/20 transition-all opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 flex items-center gap-2 font-black text-[10px] uppercase tracking-widest">
                        <Camera size={16} /> Edit Banner
                    </button>
                    
                    {/* Floating Quick Stats */}
                    <div className="absolute top-6 left-6 flex gap-4">
                        <div className="px-5 py-2 rounded-2xl bg-black/20 backdrop-blur-xl border border-white/10 text-white flex items-center gap-3">
                            <ShieldCheck size={18} className="text-emerald-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Recruiter Verified</span>
                        </div>
                    </div>
                </div>

                {/* Profile Overlap Content */}
                <div className="px-8 lg:px-16 pb-12 flex flex-col lg:flex-row items-end gap-10 -mt-24 relative z-10">
                    <div className="relative group flex-shrink-0">
                        <div className="w-48 h-48 rounded-[3.5rem] bg-slate-100 dark:bg-slate-800 border-[8px] border-white dark:border-slate-900 shadow-2xl overflow-hidden flex items-center justify-center">
                            {originalProfile?.profile_image_url ? (
                                <img src={originalProfile.profile_image_url} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <User size={80} className="text-slate-300" />
                            )}
                        </div>
                        <button 
                            onClick={() => document.getElementById('profile-photo-upload')?.click()}
                            className="absolute bottom-4 right-4 p-4 rounded-2xl bg-indigo-600 text-white shadow-xl hover:scale-110 active:scale-95 transition-all"
                        >
                            <Camera size={20} />
                        </button>
                    </div>

                    <div className="flex-1 flex flex-col lg:flex-row justify-between items-end gap-8 w-full">
                        <div className="space-y-4 text-center lg:text-left">
                            <div className="flex flex-wrap items-center gap-4 justify-center lg:justify-start">
                                <h1 className="text-4xl lg:text-6xl font-black text-slate-900 dark:text-white m-0 tracking-tighter italic">
                                    {user?.name}
                                </h1>
                                <div className="px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-500/20 italic">
                                    {originalProfile?.branch || 'Student Candidate'}
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-6 justify-center lg:justify-start text-slate-500 dark:text-slate-400">
                                <span className="flex items-center gap-2 text-sm font-bold italic"><Mail size={16} /> {user?.email}</span>
                                <span className="flex items-center gap-2 text-sm font-bold italic"><Calendar size={16} /> Class of {originalProfile?.graduation_year}</span>
                                <span className="flex items-center gap-2 text-sm font-bold italic text-amber-600 dark:text-amber-400"><Award size={16} /> CGPA: {originalProfile?.cgpa?.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                             {!isEditing ? (
                                 <>
                                    <Button variant="secondary" icon={Printer} className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest italic" onClick={() => setShowResume(true)}>Professional CV</Button>
                                    <Button icon={Edit2} className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest italic shadow-xl shadow-indigo-500/20" onClick={() => setIsEditing(true)}>Edit Profile</Button>
                                 </>
                             ) : (
                                 <div className="flex gap-3">
                                     <Button variant="ghost" className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest italic" onClick={() => setIsEditing(false)}>Cancel</Button>
                                     <Button variant="primary" className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest italic shadow-xl shadow-indigo-500/20" onClick={handleSubmit(onSubmit)} isLoading={isSaving}>Sync Changes</Button>
                                 </div>
                             )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Application Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-[1700px] mx-auto w-full">
                
                {/* Sidebar Intelligence */}
                <div className="lg:col-span-4 flex flex-col gap-10">
                    
                    {/* Completion Engine */}
                    <Card className="p-10 rounded-[3.5rem] bg-slate-900 text-white border-0 shadow-2xl relative overflow-hidden group">
                         <div className="relative z-10">
                              <div className="flex items-center justify-between mb-8">
                                   <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/20">
                                        <Sparkles size={24} className="text-amber-400" />
                                   </div>
                                   <div className="text-right">
                                        <div className="text-4xl font-black italic">{completionStats.percentage}%</div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Profile Strength</div>
                                   </div>
                              </div>
                              
                              <div className="w-full h-3 bg-white/5 rounded-full mb-10 relative overflow-hidden">
                                   <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${completionStats.percentage}%` }}
                                        transition={{ duration: 1 }}
                                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 to-amber-500 shadow-[0_0_20px_rgba(99,102,241,0.5)]" 
                                   />
                              </div>

                              <div className="space-y-6">
                                   <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 italic">Next Steps to 100%</h4>
                                   {completionStats.missing.slice(0, 3).map((item, i) => (
                                       <div key={i} className="flex items-center justify-between group/item cursor-pointer">
                                            <div className="flex items-center gap-4">
                                                 <div className="w-2 h-2 rounded-full border-2 border-slate-700" />
                                                 <span className="text-sm font-bold text-slate-400 group-hover/item:text-white transition-colors uppercase italic">{item}</span>
                                            </div>
                                            <Button variant="ghost" size="sm" className="bg-white/5 hover:bg-white/10 px-3 py-1.5 h-auto text-[9px] font-black text-white uppercase italic tracking-widest border-0">Add</Button>
                                       </div>
                                   ))}
                                   {completionStats.missing.length === 0 && (
                                       <div className="flex items-center gap-3 text-emerald-400 bg-emerald-400/10 p-4 rounded-2xl border border-emerald-400/20">
                                            <CheckCircle2 size={20} />
                                            <span className="text-sm font-black italic uppercase tracking-tight">All-Star Profile Status</span>
                                       </div>
                                   )}
                              </div>
                         </div>
                         <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] -mr-32 -mt-32" />
                    </Card>

                    {/* Gamification Badges */}
                    {gStats && <BadgeSection badges={gStats.badges} />}

                    {/* Quick Access Documents */}
                    <Card className="p-10 rounded-[3.5rem] border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900">
                         <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-10 italic flex items-center gap-3">
                              <Zap size={16} className="text-amber-500" /> Credential Vault
                         </h4>
                         <div className="space-y-8">
                             <div className="flex items-center justify-between group cursor-pointer" onClick={() => setShowResume(true)}>
                                  <div className="flex items-center gap-5">
                                       <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center transition-all group-hover:bg-indigo-600 group-hover:text-white border border-slate-100 dark:border-slate-700 shadow-sm">
                                            <FileType size={20} />
                                       </div>
                                       <div>
                                            <div className="text-xs font-black uppercase tracking-tight italic">Active CV / Resume</div>
                                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">PDF Document • {originalProfile?.activeResume?.url ? 'Generated' : 'System PDF'}</div>
                                       </div>
                                  </div>
                                  <ExternalLink size={14} className="text-slate-300 group-hover:text-indigo-500 trasition-colors" />
                             </div>
                             
                             <div className="flex items-center justify-between group cursor-pointer">
                                  <div className="flex items-center gap-5">
                                       <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center transition-all group-hover:bg-amber-500 group-hover:text-white border border-slate-100 dark:border-slate-700 shadow-sm">
                                            <ShieldCheck size={20} />
                                       </div>
                                       <div>
                                            <div className="text-xs font-black uppercase tracking-tight italic">Public Portfolio</div>
                                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">/{originalProfile?.public_profile_slug || 'pending'}</div>
                                       </div>
                                  </div>
                                  <ExternalLink size={14} className="text-slate-300 group-hover:text-amber-500 trasition-colors" />
                             </div>
                         </div>
                    </Card>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-8 space-y-12">
                     {/* Tab Evolution */}
                    <div className="flex bg-white dark:bg-slate-900 p-2 rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800 shadow-sm relative z-20">
                         {['profile', 'notifications'].map((tab) => (
                             <button
                                 key={tab}
                                 onClick={() => setActiveTab(tab as any)}
                                 className={`flex-1 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] italic transition-all relative ${
                                     activeTab === tab 
                                     ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20' 
                                     : 'text-slate-500 hover:text-slate-800'
                                 }`}
                             >
                                 {tab === 'profile' ? 'Career Identity' : 'Notification Protocols'}
                             </button>
                         ))}
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, scale: 0.98, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98, y: -10 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            className="space-y-12"
                        >
                            {activeTab === 'profile' ? (
                                <div className="space-y-12">
                                     {/* Personal Identity */}
                                     <PersonalDetails user={user} />

                                     {/* Media Lab */}
                                     <Card className="p-10 rounded-[3.5rem] border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900">
                                        <div className="flex items-center gap-3 mb-10 pb-6 border-b border-slate-100 dark:border-slate-800">
                                            <ImageIcon className="text-indigo-500" size={24} />
                                            <h2 className="text-2xl m-0 font-black italic tracking-tight uppercase">Credential <br />Media Lab.</h2>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                            <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-700 group hover:border-indigo-500 transition-all">
                                                 <FileUpload
                                                    label="Profile Avatar"
                                                    accept="image/jpeg,image/png,image/webp"
                                                    id="profile-photo-upload"
                                                    description="High resolution professional portrait."
                                                    currentFileUrl={originalProfile?.profile_image_url}
                                                    isUploading={uploadPhotoMutation.isPending}
                                                    onUpload={async (file) => uploadPhotoMutation.mutateAsync(file)}
                                                />
                                            </div>
                                            <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-700 group hover:border-amber-500 transition-all">
                                                <FileUpload
                                                    label="Career Resume (PDF)"
                                                    accept="application/pdf"
                                                    description="ATS-optimized professional resume."
                                                    currentFileUrl={originalProfile?.activeResume?.url || originalProfile?.resume_url}
                                                    isUploading={uploadResumeMutation.isPending}
                                                    onUpload={async (file) => uploadResumeMutation.mutateAsync(file)}
                                                />
                                            </div>
                                        </div>
                                    </Card>

                                    {/* Academic Matrix */}
                                    <AcademicDetails register={register} errors={errors} isEditing={isEditing} />

                                    {/* Skill Matrix */}
                                    <SkillSection 
                                        isEditing={isEditing}
                                        skills={skills}
                                        newSkill={newSkill}
                                        setNewSkill={setNewSkill}
                                        handleAddSkill={() => {
                                            if (!newSkill.trim() || skills.includes(newSkill.trim())) return;
                                            setSkills([...skills, newSkill.trim()]);
                                            setNewSkill('');
                                        }}
                                        handleRemoveSkill={(s) => setSkills(skills.filter(x => x !== s))}
                                        suggestedSkills={suggestedSkills}
                                        isSuggestionsLoading={isSuggestionsLoading}
                                        setSkills={setSkills} // Allow component to set its own skills for grouping/proficiencies
                                    />

                                    {/* Visual Life-path (History) */}
                                    <ProfessionalHistory 
                                        isEditing={isEditing}
                                        projects={projects}
                                        internships={internships}
                                        setProjects={setProjects}
                                        setInternships={setInternships}
                                    />

                                    {/* Strategy Settings (Theme selection) */}
                                    {originalProfile && (
                                        <PortfolioThemes 
                                            currentTheme={originalProfile.portfolio_theme || 'MINIMALIST'} 
                                            slug={originalProfile.public_profile_slug} 
                                        />
                                    )}
                                </div>
                            ) : (
                                <div className="max-w-4xl mx-auto py-10">
                                    <NotificationSettings />
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Resume Preview Modal */}
            <AnimatePresence>
                {showResume && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 lg:p-10">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl"
                            onClick={() => setShowResume(false)}
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 40 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 40 }}
                            className="relative w-full max-w-6xl bg-white dark:bg-slate-900 rounded-[3.5rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
                        >
                            <div className="flex items-center justify-between p-8 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-500/20 shadow-sm">
                                        <FileType size={28} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-800 dark:text-white m-0 italic uppercase tracking-tight">Identity Extract.</h3>
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400 m-0 uppercase font-black tracking-[0.2em] italic">High Resolution Professional PDF</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <button 
                                        className="h-14 px-8 bg-indigo-600 hover:bg-slate-900 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest italic transition-all shadow-xl shadow-indigo-500/20 active:scale-95 flex items-center gap-3"
                                        onClick={() => window.print()}
                                    >
                                        <Printer size={18} />
                                        Print / Generate PDF
                                    </button>
                                    <button 
                                        onClick={() => setShowResume(false)}
                                        className="w-14 h-14 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-red-500 rounded-2xl flex items-center justify-center transition-all"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-slate-100/50 dark:bg-slate-950/20">
                                <div className="print:hidden rounded-2xl overflow-hidden shadow-2xl bg-white">
                                    <ResumePreview student={originalProfile} user={user} />
                                </div>
                            </div>
                            
                            <div className="hidden print:block fixed inset-0 z-[9999] bg-white">
                                <ResumePreview student={originalProfile} user={user} />
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default StudentProfile;
