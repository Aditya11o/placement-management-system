import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import SkeletonProfileForm from '../../components/Skeleton/SkeletonProfileForm';
import { Building2, Save, Mail, User, Link as LinkIcon, ExternalLink, Bell, Camera, X, Eye } from 'lucide-react';
import api from '../../services/api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
// React-Quill removed due to React 19 compatibility issues causing infinite loops.
// Replaced with standard textarea for stability.
import NotificationSettings from '../../components/NotificationSettings/NotificationSettings';
import TagInput from '../../components/Input/TagInput';
import CompanyProfilePreviewModal from '../../components/Modal/CompanyProfilePreviewModal';
import CalendarConnect from './components/CalendarConnect';

const recruiterProfileSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    company_name: z.string().min(2, 'Company name is required'),
    website: z.string().url('Must be a valid URL (e.g., https://example.com)').or(z.literal('')),
    description: z.string().max(1000, 'Description is too long').optional(),
    webhook_url: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
    banner_image_url: z.string().url().or(z.literal('')).optional(),
    tech_stack: z.array(z.string()).optional(),
    perks: z.array(z.string()).optional(),
    culture_photos: z.array(z.string()).optional()
});

type RecruiterFormData = z.infer<typeof recruiterProfileSchema>;

const RecruiterProfile: React.FC = () => {
    const { addToast } = useToast();
    const [activeTab, setActiveTab] = useState<'company' | 'notifications'>('company');
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [originalProfile, setOriginalProfile] = useState<any>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);

    // Logo Upload State
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<RecruiterFormData>({
        resolver: zodResolver(recruiterProfileSchema),
        mode: 'onTouched',
        defaultValues: {
            tech_stack: [],
            perks: [],
            culture_photos: []
        }
    });

    const watchCompanyName = watch('company_name');
    const watchWebsite = watch('website');
    const watchDescription = watch('description');
    const watchTechStack = watch('tech_stack') || [];
    const watchPerks = watch('perks') || [];

    // Use React Query for stable, cached data fetching
    const { data: profileResponse, isLoading, refetch } = useQuery({
        queryKey: ['recruiterProfile'],
        queryFn: async () => {
            const res = await api.get('/auth/me');
            return res.data;
        },
        staleTime: 300000, // 5 minutes
    });

    useEffect(() => {
        if (profileResponse?.success && profileResponse?.data) {
            const profile = profileResponse.data;
            setOriginalProfile(profile);
            setProfileImage(profile.profile_image_url || null);

            reset({
                name: profile.name || '',
                company_name: profile.company_name || '',
                website: profile.website || '',
                description: profile.description || '',
                webhook_url: profile.webhook_url || '',
                banner_image_url: profile.banner_image_url || '',
                tech_stack: profile.tech_stack || [],
                perks: profile.perks || [],
                culture_photos: profile.culture_photos || []
            });
        }
    }, [profileResponse, reset]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validations
        if (!file.type.startsWith('image/')) {
            addToast('Please upload a valid image file', 'error');
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            addToast('Image size should be less than 2MB', 'error');
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await api.post('/upload/image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const imageUrl = res.data.url || res.data.fileUrl; // Adjust based on your actual backend response
            setProfileImage(imageUrl);

            // Immediately save the new image URL to profile
            await api.put('/auth/recruiter/profile', { profile_image_url: imageUrl });
            addToast('Company logo updated', 'success');
        } catch (error: any) {
            addToast(error.response?.data?.message || 'Failed to upload image', 'error');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validations
        if (!file.type.startsWith('image/')) {
            addToast('Please upload a valid image file', 'error');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            addToast('Banner size should be less than 5MB', 'error');
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await api.post('/upload/image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const imageUrl = res.data.url || res.data.fileUrl;
            setValue('banner_image_url', imageUrl, { shouldDirty: true });

            // Immediately save the new image URL to profile
            await api.put('/auth/recruiter/profile', { banner_image_url: imageUrl });
            addToast('Company banner updated', 'success');
        } catch (error: any) {
            addToast(error.response?.data?.message || 'Failed to upload banner', 'error');
        } finally {
            setIsUploading(false);
        }
    };

    const handleCulturePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            addToast('Please upload a valid image file', 'error');
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await api.post('/upload/image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const imageUrl = res.data.url || res.data.fileUrl;
            const currentPhotos = watch('culture_photos') || [];

            if (currentPhotos.length >= 4) {
                addToast('Maximum 4 culture photos allowed', 'error');
                return;
            }

            const newPhotos = [...currentPhotos, imageUrl];
            setValue('culture_photos', newPhotos, { shouldDirty: true });

            // Auto-save photos
            await api.put('/auth/recruiter/profile', { culture_photos: newPhotos });
            addToast('Culture photo added', 'success');
        } catch (error: any) {
            addToast(error.response?.data?.message || 'Failed to upload photo', 'error');
        } finally {
            setIsUploading(false);
        }
    };

    const removeCulturePhoto = async (indexToRemove: number) => {
        const currentPhotos = watch('culture_photos') || [];
        const newPhotos = currentPhotos.filter((_, idx) => idx !== indexToRemove);
        setValue('culture_photos', newPhotos, { shouldDirty: true });

        try {
            await api.put('/auth/recruiter/profile', { culture_photos: newPhotos });
            addToast('Photo removed', 'success');
        } catch (error) {
            // Revert on failure could be implemented here
            addToast('Failed to remove photo', 'error');
        }
    };

    const onSubmit = async (data: RecruiterFormData) => {
        setIsSaving(true);
        try {
            await api.put('/auth/recruiter/profile', data);
            addToast('Profile updated successfully', 'success');
            refetch();
        } catch (error: any) {
            addToast(error.response?.data?.message || 'Failed to update profile', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <SkeletonProfileForm />;

    return (
        <div className="max-w-[1100px] mx-auto pb-12 animate-fade-in relative">

            {/* Dynamic Banner Area */}
            {activeTab === 'company' && (
                <div className="relative w-full h-48 md:h-64 bg-indigo-50 rounded-2xl mb-12 overflow-hidden border border-slate-200 group">
                    {watch('banner_image_url') ? (
                        <div className="w-full h-full relative">
                            <img src={watch('banner_image_url')} alt="Company Banner" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                        </div>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center relative overflow-hidden bg-gradient-to-r from-indigo-500 to-purple-600">
                            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
                            <div className="text-center text-white/80 z-10 flex flex-col items-center">
                                <Camera size={32} className="mb-2 opacity-50" />
                                <p className="font-medium">No banner uploaded</p>
                            </div>
                        </div>
                    )}

                    <label className="absolute right-4 bottom-4 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/30 px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-all shadow-sm flex items-center gap-2">
                        <Camera size={16} />
                        {isUploading ? 'Uploading...' : 'Change Cover'}
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleBannerUpload}
                            disabled={isUploading}
                        />
                    </label>
                </div>
            )}

            <div className={`flex flex-wrap items-center justify-between gap-6 mb-8 ${activeTab === 'company' ? '-mt-24 px-8 relative z-10' : ''}`}>
                <div className="flex items-center gap-6">
                    <div className="relative group">
                        <div className="w-24 h-24 rounded-2xl bg-white text-indigo-600 flex items-center justify-center text-4xl font-bold shadow-xl overflow-hidden ring-4 ring-white">
                            {profileImage ? (
                                <img src={profileImage} alt="Company Logo" className="w-full h-full object-cover" />
                            ) : (
                                watchCompanyName ? watchCompanyName.charAt(0).toUpperCase() : 'C'
                            )}
                        </div>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center rounded-2xl cursor-pointer"
                        >
                            <Camera size={20} className={isUploading ? 'animate-pulse' : ''} />
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                            accept="image/*"
                            className="hidden"
                        />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 mb-1">
                            {activeTab === 'company' ? (watchCompanyName || 'Company Profile') : 'Settings & Alerts'}
                        </h1>
                        <p className={`text-sm m-0 ${activeTab === 'company' ? 'text-slate-100 font-medium drop-shadow-md' : 'text-slate-500'}`}>
                            {activeTab === 'company'
                                ? "Manage your organization's presence on the platform."
                                : "Configure your personal notification preferences."
                            }
                        </p>
                    </div>
                </div>

                {activeTab === 'company' && (
                    <Button variant="secondary" icon={Eye} onClick={() => setIsPreviewOpen(true)}>
                        Preview Public Page
                    </Button>
                )}
            </div>

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
                                    <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium mb-2">Company Overview / Description</label>
                                    <div className="rich-text-editor min-h-[250px] mb-12">
                                        <textarea
                                            {...register('description')}
                                            className="w-full h-64 p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none font-sans"
                                            placeholder="Tell students about your company, mission, and culture..."
                                        />
                                    </div>
                                    {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
                                </div>

                                {/* Tech Stack & Perks tags */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <TagInput
                                        label="Tech Stack & Tools"
                                        placeholder="e.g. React, Python, Docker"
                                        value={watchTechStack}
                                        onChange={(tags) => setValue('tech_stack', tags, { shouldDirty: true })}
                                    />
                                    <TagInput
                                        label="Perks & Benefits"
                                        placeholder="e.g. 401k, Remote Work, Gym"
                                        value={watchPerks}
                                        onChange={(tags) => setValue('perks', tags, { shouldDirty: true })}
                                    />
                                </div>

                                <div className="h-px bg-slate-200 my-8"></div>

                                {/* Culture Photos Grid */}
                                <div className="mb-8">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="flex items-center gap-2 text-slate-700 font-medium">Culture Photos</label>
                                        <span className="text-xs text-slate-400 font-medium">{(watch('culture_photos') || []).length} / 4 uploaded</span>
                                    </div>
                                    <p className="text-sm text-slate-500 mb-4">Showcase your office, team events, and daily life to prospective candidates.</p>

                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        {(watch('culture_photos') || []).map((photoUrl, idx) => (
                                            <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-slate-200 group">
                                                <img src={photoUrl} alt={`Culture ${idx + 1}`} className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeCulturePhoto(idx)}
                                                    className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-600 text-white p-1 rounded backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}

                                        {/* Upload Button */}
                                        {(watch('culture_photos') || []).length < 4 && (
                                            <label className="aspect-video rounded-lg border-2 border-dashed border-slate-300 hover:border-indigo-400 hover:bg-indigo-50 flex flex-col items-center justify-center cursor-pointer transition-colors text-slate-400 hover:text-indigo-500">
                                                <Camera size={24} className="mb-2" />
                                                <span className="text-xs font-semibold">Add Photo</span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={handleCulturePhotoUpload}
                                                    disabled={isUploading}
                                                />
                                            </label>
                                        )}
                                    </div>
                                </div>

                                <div className="h-px bg-slate-200 my-8"></div>

                                <h2 className="text-xl font-bold text-slate-800 mb-6">Contact & Integrations</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                                    <div>
                                        <label className="flex items-center gap-2 text-slate-700 font-medium mb-2">
                                            <User size={16} className="text-indigo-600" /> Representative
                                        </label>
                                        <Input
                                            placeholder="John Doe"
                                            {...register('name')}
                                            error={errors.name?.message}
                                        />
                                    </div>
                                    <div>
                                        <label className="flex items-center gap-2 text-slate-700 font-medium mb-2">
                                            <Mail size={16} className="text-indigo-600" /> Email (Read-only)
                                        </label>
                                        <Input
                                            value={originalProfile?.email || ''}
                                            disabled
                                        />
                                    </div>
                                </div>

                                <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 mb-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg text-indigo-600">
                                            <ExternalLink size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800 dark:text-white">Workspace Webhook</h3>
                                            <p className="text-xs text-slate-500 font-medium">Connect Slack or Discord for job alerts.</p>
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-sm font-semibold mb-2">
                                            Webhook URL
                                        </label>
                                        <Input
                                            placeholder="https://hooks.slack.com/services/..."
                                            {...register('webhook_url')}
                                            error={errors.webhook_url?.message}
                                        />
                                        <p className="text-[10px] text-slate-400 mt-2">
                                            We'll push application summaries to this URL whenever a student applies.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <Button type="submit" variant="primary" icon={Save} isLoading={isSaving}>
                                        Save Profile & Settings
                                    </Button>
                                </div>
                            </form>
                        </Card>
                    </div>

                    {/* Right column widgets */}
                    <div className="hidden lg:block space-y-6">
                        <CalendarConnect />
                    </div>
                </div>
            ) : (
                <div className="animate-fade-in max-w-4xl">
                    <NotificationSettings />
                </div>
            )}

            {/* Preview Modal */}
            <CompanyProfilePreviewModal
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                data={{
                    company_name: watchCompanyName,
                    website: watchWebsite,
                    description: watchDescription,
                    banner_image_url: watch('banner_image_url'),
                    profile_image_url: profileImage || undefined,
                    tech_stack: watchTechStack,
                    perks: watchPerks,
                    culture_photos: watch('culture_photos')
                }}
            />
        </div>
    );
};

export default RecruiterProfile;
