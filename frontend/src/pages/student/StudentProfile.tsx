import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/Card/Card';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import SkeletonProfileForm from '../../components/Skeleton/SkeletonProfileForm';
import { User, BookOpen, Edit2, Code, Plus, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '../../services/api';

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

    // Non-form data
    const [originalProfile, setOriginalProfile] = useState<any>(null);
    const [skills, setSkills] = useState<string[]>([]);

    // UI State
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [newSkill, setNewSkill] = useState<string>('');

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
            const res = await api.get('/students/profile');
            const data = res.data.data;
            setOriginalProfile(data);
            setSkills(data.skills || []);
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
            // Merge form data with skills array
            const updateData = {
                ...data,
                skills: skills
            };

            await api.put('/students/profile', updateData);

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
    };

    if (isLoading) return <SkeletonProfileForm />;

    return (
        <div className="flex flex-col gap-6 animate-fade-in">

            <div className="flex justify-between items-start flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-indigo-700 mb-1">My Profile</h1>
                    <p className="text-slate-500 text-base m-0">Manage your academic details and skill sets.</p>
                </div>
                {!isEditing ? (
                    <Button icon={Edit2} onClick={() => setIsEditing(true)}>Edit Profile</Button>
                ) : (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Button variant="ghost" onClick={handleCancel}>Cancel</Button>
                        <Button variant="primary" onClick={handleSubmit(onSubmit)} isLoading={isSaving}>Save Changes</Button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Personal Details */}
                <Card>
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200">
                        <User className="text-sky-500" size={24} />
                        <h2 className="text-lg m-0 font-bold">Personal Details</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                        <div className="col-span-1 sm:col-span-2">
                            <label className="text-slate-500 text-sm block mb-1">Full Name</label>
                            <p className="font-semibold text-slate-800 text-base mb-4 mt-0">{user?.name}</p>
                        </div>
                        <div className="col-span-1 sm:col-span-2">
                            <label className="text-slate-500 text-sm block mb-1">Email Address</label>
                            <p className="font-semibold text-slate-800 text-base mb-4 mt-0">{user?.email}</p>
                        </div>
                    </div>
                </Card>

                {/* Academic Details */}
                <Card>
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200">
                        <BookOpen className="text-purple-500" size={24} />
                        <h2 className="text-lg m-0 font-bold">Academic History</h2>
                    </div>

                    <form className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                        <div className="col-span-1 sm:col-span-2 mb-2">
                            <Input label="Branch" error={errors.branch?.message} {...register('branch')} disabled={!isEditing} />
                        </div>
                        <div className="mb-2">
                            <Input label="Current CGPA" type="number" step="0.01" error={errors.cgpa?.message} {...register('cgpa')} disabled={!isEditing} />
                        </div>
                        <div className="mb-2">
                            <Input label="Graduation Year" type="number" error={errors.graduation_year?.message} {...register('graduation_year')} disabled={!isEditing} />
                        </div>
                        <div className="mb-2">
                            <Input label="10th Marks (%)" type="number" step="0.01" error={errors.marks_10th?.message} {...register('marks_10th')} disabled={!isEditing} />
                        </div>
                        <div className="mb-2">
                            <Input label="12th Marks (%)" type="number" step="0.01" error={errors.marks_12th?.message} {...register('marks_12th')} disabled={!isEditing} />
                        </div>
                    </form>
                </Card>

                {/* Skills Management */}
                <Card className="col-span-1 lg:col-span-2">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200">
                        <Code className="text-orange-500" size={24} />
                        <h2 className="text-lg m-0 font-bold">Technical Skills</h2>
                    </div>
                    <p className="text-slate-500 text-sm block mb-6">Add relevant skills to improve your AI Job Matching score.</p>

                    <div className="flex flex-wrap gap-2">
                        {skills?.map((skill, index) => (
                            <div key={index} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full text-sm font-medium transition-colors hover:bg-indigo-100">
                                {skill}
                                {isEditing && (
                                    <button className="bg-transparent border-none flex items-center justify-center text-indigo-500 cursor-pointer rounded-full p-0.5 hover:bg-indigo-200 hover:text-red-500" onClick={() => handleRemoveSkill(skill)}>
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                        ))}
                        {skills?.length === 0 && !isEditing && (
                            <p className="text-slate-500 text-sm block mb-1">No skills added yet.</p>
                        )}
                    </div>

                    {isEditing && (
                        <div className="flex items-end gap-2 mt-6">
                            <div className="w-[250px]">
                                <Input
                                    placeholder="e.g. React.js, Python, AWS"
                                    value={newSkill}
                                    onChange={(e) => setNewSkill(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                                    fullWidth={true}
                                />
                            </div>
                            <div className="mb-[16px]">
                                <Button type="button" variant="secondary" onClick={handleAddSkill} icon={Plus}>Add</Button>
                            </div>
                        </div>
                    )}
                </Card>

            </div>
        </div>
    );
};

export default StudentProfile;
