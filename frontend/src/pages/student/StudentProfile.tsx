import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import SkeletonProfileForm from '../../components/Skeleton/SkeletonProfileForm';
import { User, Edit2, X, Image as ImageIcon, Bell, Printer, FileType } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { studentService } from '../../services/studentService';
import { useMutation } from '@tanstack/react-query';
import FileUpload from '../../components/FileUpload/FileUpload';
import NotificationSettings from '../../components/NotificationSettings/NotificationSettings';
import PageHeader from '../../components/PageHeader/PageHeader';
import ResumePreview from '../../components/Resume/ResumePreview';
import { aiService } from '../../services/aiService';
import { useQuery } from '@tanstack/react-query';
import BadgeSection from '../../components/Profile/BadgeSection';
import { gamificationService } from '../../services/gamificationService';
import { StudentProfile as IStudentProfile, Project, Internship } from '../../types';
import AcademicDetails from './components/AcademicDetails';
import ProfessionalHistory from './components/ProfessionalHistory';
import SkillSection from './components/SkillSection';
import PersonalDetails from './components/PersonalDetails';
import PortfolioThemes from './components/PortfolioThemes';

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

    // Tabs state
    const [activeTab, setActiveTab] = useState<'profile' | 'notifications'>('profile');

    // Non-form data
    const [originalProfile, setOriginalProfile] = useState<IStudentProfile | null>(null);
    const [skills, setSkills] = useState<string[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [internships, setInternships] = useState<Internship[]>([]);

    // UI State
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

    // Mutations for uploads
    const uploadPhotoMutation = useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData();
            formData.append('photo', file);
            return await studentService.uploadProfilePhoto(formData);
        },
        onSuccess: () => {
            addToast('Profile photo updated', 'success');
            fetchProfile(); // refresh data
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
            addToast('Resume uploaded successfully', 'success');
            fetchProfile(); // refresh data
        },
        onError: (err: any) => addToast(err.response?.data?.message || 'Upload failed', 'error')
    });

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        resolver: zodResolver(profileSchema),
        mode: 'onTouched'
    });

    useEffect(() => {
        fetchProfile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
            addToast('Failed to load profile details', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddSkill = () => {
        if (!newSkill.trim()) return;
        if (skills.includes(newSkill.trim())) {
            addToast('Skill already added', 'info');
            return;
        }
        setSkills([...skills, newSkill.trim()]);
        setNewSkill('');
    };

    const handleRemoveSkill = (skillToRemove: string) => {
        setSkills(skills.filter(s => s !== skillToRemove));
    };

    const onSubmit = async (data: any) => {
        setIsSaving(true);
        try {
            // Merge form data with arrays
            const updateData = {
                ...data,
                skills,
                projects,
                internships
            };
 
            await studentService.updateProfile(updateData);

            addToast('Profile updated successfully!', 'success');
            setIsEditing(false);
            fetchProfile(); // reload original profile reference
        } catch (error: any) {
            addToast(error.response?.data?.message || 'Failed to update profile', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        // Reset form to original DB values
        reset({
            branch: originalProfile?.branch,
            cgpa: originalProfile?.cgpa,
            graduation_year: originalProfile?.graduation_year,
            marks_10th: originalProfile?.marks_10th,
            marks_12th: originalProfile?.marks_12th,
        });
        setSkills(originalProfile?.skills || []);
        setProjects(originalProfile?.projects || []);
        setInternships(originalProfile?.internships || []);
    };

    if (isLoading) return <SkeletonProfileForm />;

    return (
        <div className="flex flex-col gap-6 animate-fade-in relative">
            <PageHeader 
                title="Account & Profile"
                subtitle="Manage your academic details and generate your professional CV."
                action={
                    <div className="flex gap-3">
                        {!isEditing && (
                            <Button 
                                variant="secondary" 
                                icon={Printer} 
                                onClick={() => setShowResume(true)}
                            >
                                Professional CV
                            </Button>
                        )}
                        {activeTab === 'profile' && (
                            !isEditing ? (
                                <Button icon={Edit2} onClick={() => setIsEditing(true)}>Edit Profile</Button>
                            ) : (
                                <div className="flex gap-2">
                                    <Button variant="ghost" onClick={handleCancel}>Cancel</Button>
                                    <Button variant="primary" onClick={handleSubmit(onSubmit)} isLoading={isSaving}>Save Changes</Button>
                                </div>
                            )
                        )}
                    </div>
                }
            />

            {/* Tabs Navigation */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 gap-8">
                <button
                    onClick={() => setActiveTab('profile')}
                    className={`pb-4 px-2 text-sm font-semibold transition-all relative ${activeTab === 'profile' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
                >
                    <div className="flex items-center gap-2">
                        <User size={18} />
                        Profile Details
                    </div>
                    {activeTab === 'profile' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 animate-slide-in-right" />}
                </button>
                <button
                    onClick={() => setActiveTab('notifications')}
                    className={`pb-4 px-2 text-sm font-semibold transition-all relative ${activeTab === 'notifications' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
                >
                    <div className="flex items-center gap-2">
                        <Bell size={18} />
                        Notifications
                    </div>
                    {activeTab === 'notifications' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 animate-slide-in-right" />}
                </button>
            </div>

            {activeTab === 'profile' ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
                    {/* Personal Details */}
                    <PersonalDetails user={user} />

                    {/* Uploads Section */}
                    <Card className="col-span-1 lg:col-span-2">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200">
                            <ImageIcon className="text-pink-500" size={24} />
                            <h2 className="text-lg m-0 font-bold">Documents & Media</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <FileUpload
                                label="Profile Photo (Avatar)"
                                accept="image/jpeg,image/png,image/webp"
                                description="JPEG, PNG or WebP up to 5MB"
                                currentFileUrl={originalProfile?.profile_image_url}
                                isUploading={uploadPhotoMutation.isPending}
                                onUpload={async (file) => uploadPhotoMutation.mutateAsync(file)}
                            />
                            <FileUpload
                                label="Professional Resume"
                                accept="application/pdf"
                                description="PDF only up to 10MB. We extract skills automatically."
                                currentFileUrl={originalProfile?.activeResume?.url || originalProfile?.resume_url}
                                isUploading={uploadResumeMutation.isPending}
                                onUpload={async (file) => uploadResumeMutation.mutateAsync(file)}
                            />
                        </div>
                    </Card>

                    {/* Academic Details */}
                    <AcademicDetails register={register} errors={errors} isEditing={isEditing} />

                    {/* Skills Management */}
                    <SkillSection 
                        isEditing={isEditing}
                        skills={skills}
                        newSkill={newSkill}
                        setNewSkill={setNewSkill}
                        handleAddSkill={handleAddSkill}
                        handleRemoveSkill={handleRemoveSkill}
                        suggestedSkills={suggestedSkills}
                        isSuggestionsLoading={isSuggestionsLoading}
                        setSkills={setSkills}
                    />

                    {/* Badge Section */}
                    {gStats && <BadgeSection badges={gStats.badges} />}

                    {/* Portfolio Themes Selection */}
                    {originalProfile && (
                        <PortfolioThemes 
                            currentTheme={originalProfile.portfolio_theme || 'MINIMALIST'} 
                            slug={originalProfile.public_profile_slug} 
                        />
                    )}

                    {/* Professional History */}
                    <ProfessionalHistory 
                        isEditing={isEditing}
                        projects={projects}
                        internships={internships}
                        setProjects={setProjects}
                        setInternships={setInternships}
                    />
                </div>
            ) : (
                <div className="animate-fade-in max-w-4xl">
                    <NotificationSettings />
                </div>
            )}

            {/* Resume Preview Modal */}
            {showResume && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
                    <div 
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-fade-in"
                        onClick={() => setShowResume(false)}
                    />
                    <div className="relative w-full max-w-4xl bg-slate-100 dark:bg-slate-900 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-slide-up">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg">
                                    <FileType size={20} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-800 dark:text-white m-0">Resume Preview</h3>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 m-0 uppercase font-black tracking-widest">Ready to Print</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button 
                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold transition-all shadow-md active:scale-95"
                                    onClick={() => window.print()}
                                >
                                    <Printer size={16} />
                                    Print / Save as PDF
                                </button>
                                <button 
                                    onClick={() => setShowResume(false)}
                                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-10 custom-scrollbar bg-slate-200 dark:bg-slate-950/50">
                            <div className="print:hidden">
                                <ResumePreview student={originalProfile} user={user} />
                            </div>
                        </div>
                        
                        {/* Hidden Print Content (Exactly what will be printed) */}
                        <div className="hidden print:block fixed inset-0 z-[999] bg-white">
                            <ResumePreview student={originalProfile} user={user} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentProfile;
