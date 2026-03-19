import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentService } from '../../services/studentService';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import BadgeSection from '../../components/Profile/BadgeSection';
import SkillSection from '../../components/Profile/SkillSection';
import { useToast } from '../../context/ToastContext';
import Loader from '../../components/Loader/Loader';
import SkeletonProfileForm from '../../components/Skeleton/SkeletonProfileForm';
import { 
    User, Edit2, X, Image as ImageIcon, Bell, Printer, 
    FileType, Camera, ShieldCheck, Zap, 
    ChevronRight, ExternalLink, Calendar, Mail, 
    LogOut, Award,
    CheckCircle2
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const profileSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    branch: z.string().min(2, 'Branch is required'),
    cgpa: z.number().min(0).max(10),
    phone: z.string().optional(),
    location: z.string().optional(),
    bio: z.string().optional().nullable(),
    github: z.string().url().optional().or(z.literal('')),
    linkedin: z.string().url().optional().or(z.literal('')),
    portfolio: z.string().url().optional().or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const StudentProfile: React.FC = () => {
    const { addToast } = useToast();
    const queryClient = useQueryClient();
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [newSkill, setNewSkill] = useState<string>('');
    const [showResume, setShowResume] = useState<boolean>(false);

    const { data: gStats } = useQuery({
        queryKey: ['gamificationStats'],
        queryFn: () => studentService.getGamificationStats(),
    });

    const { data: profile, isLoading: isProfileLoading } = useQuery({
        queryKey: ['studentProfile'],
        queryFn: async () => {
            const data = await studentService.getProfile();
            setIsLoading(false);
            return data;
        },
    });

    const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: profile || {},
    });

    useEffect(() => {
        if (profile) {
            reset(profile);
        }
    }, [profile, reset]);

    const updateProfileMutation = useMutation({
        mutationFn: (data: ProfileFormValues) => studentService.updateProfile(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['studentProfile'] });
            addToast('Profile updated successfully', 'success');
            setIsEditing(false);
        },
        onError: () => {
            addToast('Failed to update profile', 'error');
        },
    });

    const addSkillMutation = useMutation({
        mutationFn: (skill: string) => studentService.addSkill(skill),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['studentProfile'] });
            setNewSkill('');
            addToast('Skill added', 'success');
        },
    });

    const removeSkillMutation = useMutation({
        mutationFn: (skill: string) => studentService.removeSkill(skill),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['studentProfile'] });
            addToast('Skill removed', 'success');
        },
    });

    const handleAddSkill = () => {
        if (newSkill.trim()) {
            addSkillMutation.mutate(newSkill.trim());
        }
    };

    if (isProfileLoading || isLoading) return <SkeletonProfileForm />;

    return (
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-10 relative">
            <div className="grid lg:grid-cols-12 gap-10">
                {/* Main Profile Info */}
                <div className="lg:col-span-8 flex flex-col gap-10">
                    <Card className="p-0 border-none bg-white dark:bg-slate-900 rounded-[3.5rem] shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden relative">
                        {/* Decorative Header */}
                        <div className="h-48 bg-gradient-to-r from-indigo-600 to-violet-700 relative">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                            <div className="absolute -bottom-16 left-12">
                                <div className="w-40 h-40 rounded-[2.5rem] bg-white dark:bg-slate-800 p-2 shadow-xl border-4 border-white dark:border-slate-900 relative group">
                                    <div className="w-full h-full rounded-[2rem] bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                                        <User size={64} className="text-slate-300" />
                                    </div>
                                    <button className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera className="text-white" size={24} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="pt-24 px-12 pb-12">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h1 className="text-4xl font-black text-slate-800 dark:text-white uppercase tracking-tighter m-0">{profile?.name}</h1>
                                    <p className="text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-widest text-sm mt-1 m-0">{profile?.branch} Student</p>
                                    <div className="flex items-center gap-6 mt-4 text-slate-500 font-medium">
                                        <div className="flex items-center gap-2">
                                            <Mail size={16} />
                                            <span>{profile?.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar size={16} />
                                            <span>Batch 2024</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Award size={16} className="text-amber-500" />
                                            <span className="text-slate-800 dark:text-slate-200 font-bold">{profile?.cgpa} CGPA</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <Button 
                                        variant="secondary" 
                                        icon={Printer}
                                        className="rounded-2xl font-bold"
                                        onClick={() => window.print()}
                                    >
                                        Export CV
                                    </Button>
                                    <Button 
                                        variant={isEditing ? 'ghost' : 'primary'} 
                                        icon={isEditing ? X : Edit2}
                                        onClick={() => setIsEditing(!isEditing)}
                                        className="rounded-2xl font-bold"
                                    >
                                        {isEditing ? 'Cancel' : 'Edit Profile'}
                                    </Button>
                                </div>
                            </div>

                            {isEditing ? (
                                <form onSubmit={handleSubmit((data) => updateProfileMutation.mutate(data))} className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-2">Display Name</label>
                                            <input {...register('name')} className="w-full h-14 px-6 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl font-bold" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-2">CGPA</label>
                                            <input type="number" step="0.01" {...register('cgpa', { valueAsNumber: true })} className="w-full h-14 px-6 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl font-bold" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-2">Bio / Professional Summary</label>
                                        <textarea {...register('bio')} rows={4} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl font-bold resize-none" />
                                    </div>
                                    <div className="flex justify-end gap-3">
                                        <Button 
                                            type="submit" 
                                            variant="primary" 
                                            isLoading={updateProfileMutation.isPending}
                                            className="px-8 rounded-2xl shadow-lg shadow-indigo-600/20"
                                        >
                                            Save Changes
                                        </Button>
                                    </div>
                                </form>
                            ) : (
                                <div className="prose prose-slate dark:prose-invert max-w-none">
                                    <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-400 italic">
                                        "{profile?.bio || 'No professional summary provided yet. Click edit to add your story!'}"
                                    </p>
                                </div>
                            )}
                        </div>
                    </Card>

                    <div className="grid md:grid-cols-2 gap-10">
                        {/* Skills Section */}
                        <div className="md:col-span-2">
                            <SkillSection 
                                skills={profile?.skills || []}
                                onAdd={handleAddSkill}
                                onRemove={(skill) => removeSkillMutation.mutate(skill)}
                                isAdding={addSkillMutation.isPending}
                                newSkill={newSkill}
                                setNewSkill={setNewSkill}
                            />
                        </div>
                    </div>
                </div>

                {/* Sidebar Intelligence */}
                <div className="lg:col-span-4 flex flex-col gap-10">
                    {/* Gamification Badges */}
                    {gStats?.badges && <BadgeSection badges={gStats.badges} />}

                    {/* Quick Access Documents */}
                    <Card className="p-10 rounded-[3.5rem] border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-violet-100 dark:bg-violet-900/20 text-violet-600 rounded-2xl">
                                    <FileType size={20} />
                                </div>
                                <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight m-0">Documents</h3>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="group p-5 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-xl flex items-center justify-center">
                                            <FileType size={18} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800 dark:text-white text-sm m-0">Master Resume</p>
                                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest m-0">PDF • 1.2 MB</p>
                                        </div>
                                    </div>
                                    <ExternalLink size={16} className="text-slate-300 group-hover:text-indigo-600 transition-colors" />
                                </div>
                            </div>
                        </div>

                        <Button 
                            variant="ghost" 
                            className="w-full mt-6 rounded-[1.5rem] border-2 border-slate-100 dark:border-slate-800 text-slate-400 font-black uppercase text-xs tracking-[0.2em] py-4 hover:bg-slate-50 transition-all"
                        >
                            Upload Document
                        </Button>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default StudentProfile;
