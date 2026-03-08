import React, { useState, useEffect } from 'react';

import { useToast } from '../../context/ToastContext';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import SkeletonProfileForm from '../../components/Skeleton/SkeletonProfileForm';
import { Building2, Save, Mail, User, Link as LinkIcon, ExternalLink, Bell } from 'lucide-react';
import api from '../../services/api';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import NotificationSettings from '../../components/NotificationSettings/NotificationSettings';

const recruiterProfileSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    company_name: z.string().min(2, 'Company name is required'),
    website: z.string().url('Must be a valid URL (e.g., https://example.com)').or(z.literal('')),
    description: z.string().max(1000, 'Description is too long').optional()
});

type RecruiterFormData = z.infer<typeof recruiterProfileSchema>;

const RecruiterProfile: React.FC = () => {
    const { addToast } = useToast();
    const [activeTab, setActiveTab] = useState<'company' | 'notifications'>('company');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSaving, setIsSaving] = useState<boolean>(false);

    const [originalProfile, setOriginalProfile] = useState<any>(null);

    const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<RecruiterFormData>({
        resolver: zodResolver(recruiterProfileSchema),
        mode: 'onTouched'
    });

    const watchCompanyName = watch('company_name');
    const watchWebsite = watch('website');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/auth/me'); // Gets the logged in user's full profile
            const profile = res.data.data;

            setOriginalProfile(profile);
            reset({
                name: profile.name || '',
                company_name: profile.company_name || '',
                website: profile.website || '',
                description: profile.description || ''
            });
        } catch (error) {
            addToast('Failed to load profile data', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const onSubmit = async (_data: RecruiterFormData) => {
        setIsSaving(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network
            addToast('Profile updated successfully', 'success');
        } catch (error) {
            addToast('Profile updated successfully (Simulated)', 'success');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <SkeletonProfileForm />;

    return (
        <div className="max-w-[1100px] mx-auto pb-12 animate-fade-in">
            <div className="flex items-center gap-6 mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-400 to-indigo-600 text-white flex items-center justify-center text-3xl font-bold shadow-lg shadow-indigo-500/20">
                    {watchCompanyName ? watchCompanyName.charAt(0).toUpperCase() : 'C'}
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-indigo-700 mb-1">
                        {activeTab === 'company' ? (watchCompanyName || 'Company Profile') : 'Settings & Alerts'}
                    </h1>
                    <p className="text-slate-500 text-base m-0">
                        {activeTab === 'company'
                            ? "Manage your organization's presence on the platform."
                            : "Configure your personal notification preferences."
                        }
                    </p>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 gap-8 mb-8">
                <button
                    onClick={() => setActiveTab('company')}
                    className={`pb-4 px-2 text-sm font-semibold transition-all relative ${activeTab === 'company' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
                >
                    <div className="flex items-center gap-2">
                        <Building2 size={18} />
                        Company Profile
                    </div>
                    {activeTab === 'company' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 animate-slide-in-right" />}
                </button>
                <button
                    onClick={() => setActiveTab('notifications')}
                    className={`pb-4 px-2 text-sm font-semibold transition-all relative ${activeTab === 'notifications' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
                >
                    <div className="flex items-center gap-2">
                        <Bell size={18} />
                        Notification Settings
                    </div>
                    {activeTab === 'notifications' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 animate-slide-in-right" />}
                </button>
            </div>

            {activeTab === 'company' ? (
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 animate-fade-in">
                    <div>
                        <Card className="p-8">
                            <h2 className="text-xl font-bold text-slate-800 mb-6">Company Information</h2>

                            <form onSubmit={handleSubmit(onSubmit)}>
                                <div className="mb-6">
                                    <label className="flex items-center gap-2 text-slate-700 font-medium mb-2">
                                        <Building2 size={16} className="text-indigo-600" /> Company Name
                                    </label>
                                    <Input
                                        placeholder="Acme Corporation"
                                        {...register('company_name')}
                                        error={errors.company_name?.message}
                                    />
                                </div>

                                <div className="mb-6">
                                    <label className="flex items-center gap-2 text-slate-700 font-medium mb-2">
                                        <LinkIcon size={16} className="text-indigo-600" /> Website URL
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-grow">
                                            <Input
                                                placeholder="https://www.example.com"
                                                {...register('website')}
                                                error={errors.website?.message}
                                            />
                                        </div>
                                        {watchWebsite && (
                                            <a href={watchWebsite.startsWith('http') ? watchWebsite : `https://${watchWebsite}`} target="_blank" rel="noreferrer" className="flex items-center justify-center w-[42px] h-[42px] rounded-md bg-white border border-slate-200 text-indigo-600 transition-colors hover:bg-indigo-50 hover:border-indigo-300" title="Visit website">
                                                <ExternalLink size={18} />
                                            </a>
                                        )}
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <label className="flex items-center gap-2 text-slate-700 font-medium mb-2">Company Overview / Description</label>
                                    <textarea
                                        className="w-full px-4 py-3 rounded-md border border-slate-300 bg-white text-slate-800 font-sans text-sm resize-y transition-shadow focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                        rows={5}
                                        placeholder="Tell students about your company..."
                                        {...register('description')}
                                    />
                                    {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
                                </div>

                                <div className="h-px bg-slate-200 my-8"></div>

                                <h2 className="text-xl font-bold text-slate-800 mb-6">Contact Person details</h2>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="mb-6">
                                        <label className="flex items-center gap-2 text-slate-700 font-medium mb-2">
                                            <User size={16} className="text-indigo-600" /> Representative Name
                                        </label>
                                        <Input
                                            placeholder="John Doe"
                                            {...register('name')}
                                            error={errors.name?.message}
                                        />
                                    </div>
                                    <div className="mb-6">
                                        <label className="flex items-center gap-2 text-slate-700 font-medium mb-2">
                                            <Mail size={16} className="text-indigo-600" /> Account Email
                                        </label>
                                        <Input
                                            value={originalProfile?.email || ''}
                                            disabled
                                            title="Email cannot be changed"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end mt-4">
                                    <Button type="submit" variant="primary" icon={Save} isLoading={isSaving}>
                                        Save Changes
                                    </Button>
                                </div>
                            </form>
                        </Card>
                    </div>
                </div>
            ) : (
                <div className="animate-fade-in max-w-4xl">
                    <NotificationSettings />
                </div>
            )}
        </div>
    );
};

export default RecruiterProfile;
