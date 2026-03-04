import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/Card/Card';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import { Mail, Lock, User, Briefcase, Phone, BookOpen, Building, MapPin } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '../../services/api';

const studentSchema = z.object({
    email: z.string().min(1, 'Email is required').email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    phone: z.string().min(10, 'Phone must be at least 10 characters'),
    name: z.string().min(2, 'Full name is required'),
    branch: z.string().min(2, 'Branch is required'),
    cgpa: z.coerce.number().min(0, 'Min 0').max(10, 'Max 10'),
    graduation_year: z.coerce.number().int().min(2000, 'Invalid year').max(2100, 'Invalid year'),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
    marks_10th: z.coerce.number().min(0).max(100),
    marks_12th: z.coerce.number().min(0).max(100),
});

const recruiterSchema = z.object({
    email: z.string().min(1, 'Email is required').email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    phone: z.string().min(10, 'Phone must be at least 10 characters'),
    company_name: z.string().min(2, 'Company name is required'),
    contact_person: z.string().min(2, 'Contact person is required'),
    industry: z.string().min(2, 'Industry is required'),
    location: z.string().min(2, 'Location is required'),
    website: z.string().url('Invalid website URL')
});

const Register = () => {
    const [role, setRole] = useState('STUDENT');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { addToast } = useToast();
    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors: strictErrors }, clearErrors, reset } = useForm({
        resolver: zodResolver(role === 'STUDENT' ? studentSchema : recruiterSchema),
        mode: 'onTouched',
        defaultValues: { gender: 'MALE' }
    });
    const errors: any = strictErrors;

    // Clear validation errors and inputs when switching roles
    const handleRoleSelect = (selectedRole: 'STUDENT' | 'RECRUITER') => {
        setRole(selectedRole);
        clearErrors();
        reset(undefined, { keepDefaultValues: true });
    };

    const onSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            const endpoint = role === 'STUDENT' ? '/auth/register/student' : '/auth/register/recruiter';
            const res = await api.post(endpoint, data);

            if (res.data.success) {
                addToast('Registration successful! Please login.', 'success');
                navigate('/login');
            }
        } catch (error: any) {
            let errorMsg = error.response?.data?.message || 'Registration failed. Check inputs.';
            if (error.response?.data?.errors && error.response.data.errors.length > 0) {
                errorMsg = error.response.data.errors[0];
            }
            addToast(errorMsg, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute rounded-full blur-[80px] opacity-60 bg-indigo-100 w-[500px] h-[500px] -top-[10%] -left-[10%]"></div>
                <div className="absolute rounded-full blur-[80px] opacity-60 bg-indigo-50 w-[400px] h-[400px] -bottom-[5%] -right-[5%]"></div>
            </div>

            <div className="relative z-10 w-full max-w-[600px] p-4">
                <div className="text-center mb-6 animate-fade-in">
                    <h1 className="text-4xl text-indigo-600 tracking-tight font-bold mb-1">Nexus</h1>
                    <p className="text-slate-500 text-base m-0">Join the Placement Management System</p>
                </div>

                <Card className="!p-8 sm:!p-10 shadow-xl animate-fade-in" style={{ animationDelay: '0.1s' }}>
                    <h2 className="text-2xl font-bold text-center mb-2 text-slate-800">Create Account</h2>
                    <p className="text-slate-500 text-center mb-8 text-sm">Select your account type to continue</p>

                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

                        <div className="flex bg-slate-100 rounded-md p-1 mb-2">
                            <button
                                type="button"
                                className={`flex-1 flex items-center justify-center gap-1.5 p-2 rounded text-[13px] font-medium transition-all ${role === 'STUDENT' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                                onClick={() => handleRoleSelect('STUDENT')}
                            >
                                <User size={18} /> Student
                            </button>
                            <button
                                type="button"
                                className={`flex-1 flex items-center justify-center gap-1.5 p-2 rounded text-[13px] font-medium transition-all ${role === 'RECRUITER' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                                onClick={() => handleRoleSelect('RECRUITER')}
                            >
                                <Briefcase size={18} /> Recruiter
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                            {/* ── COMMON FIELDS ── */}
                            <div className="sm:col-span-2">
                                <Input icon={Mail} type="email" placeholder="Work/College Email address" error={errors.email?.message} {...register('email')} />
                            </div>
                            <div>
                                <Input icon={Lock} type="password" placeholder="Password" error={errors.password?.message} {...register('password')} />
                            </div>
                            <div>
                                <Input icon={Phone} type="text" placeholder="Phone Number" error={errors.phone?.message} {...register('phone')} />
                            </div>

                            {/* ── STUDENT FIELDS ── */}
                            {role === 'STUDENT' && (
                                <>
                                    <div className="sm:col-span-2">
                                        <Input icon={User} type="text" placeholder="Full Legal Name" error={errors.name?.message} {...register('name')} />
                                    </div>
                                    <div>
                                        <Input icon={BookOpen} type="text" placeholder="Branch (e.g. CSE)" error={errors.branch?.message} {...register('branch')} />
                                    </div>
                                    <div>
                                        <Input type="number" step="0.01" placeholder="Current CGPA" error={errors.cgpa?.message} {...register('cgpa')} />
                                    </div>
                                    <div>
                                        <Input type="number" placeholder="Graduation Year" error={errors.graduation_year?.message} {...register('graduation_year')} />
                                    </div>
                                    <div className="flex flex-col mb-1 relative">
                                        <select className={`w-full px-3 py-2 border rounded-md text-[14px] text-slate-800 bg-white transition-all focus:outline-none focus:ring-2 focus:border-transparent ${errors.gender ? 'border-red-400 focus:ring-red-100 shadow-[0_0_0_1px_#f87171]' : 'border-slate-300 focus:ring-indigo-100 focus:border-indigo-400'} hover:border-slate-400`} {...register('gender')} style={{ height: '42px' }}>
                                            <option value="MALE">Male</option>
                                            <option value="FEMALE">Female</option>
                                            <option value="OTHER">Other</option>
                                        </select>
                                        {errors.gender && <span className="text-red-500 text-[11px] font-medium mt-1 ml-1">{errors.gender?.message}</span>}
                                    </div>
                                    <div>
                                        <Input type="number" step="0.01" placeholder="10th Marks (%)" error={errors.marks_10th?.message} {...register('marks_10th')} />
                                    </div>
                                    <div>
                                        <Input type="number" step="0.01" placeholder="12th Marks (%)" error={errors.marks_12th?.message} {...register('marks_12th')} />
                                    </div>
                                </>
                            )}

                            {/* ── RECRUITER FIELDS ── */}
                            {role === 'RECRUITER' && (
                                <>
                                    <div className="sm:col-span-2">
                                        <Input icon={Building} type="text" placeholder="Company Name" error={errors.company_name?.message} {...register('company_name')} />
                                    </div>
                                    <div>
                                        <Input icon={User} type="text" placeholder="Contact Person Name" error={errors.contact_person?.message} {...register('contact_person')} />
                                    </div>
                                    <div>
                                        <Input type="text" placeholder="Industry (e.g. IT, Auto)" error={errors.industry?.message} {...register('industry')} />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <Input icon={MapPin} type="text" placeholder="HQ Location" error={errors.location?.message} {...register('location')} />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <Input type="url" placeholder="Company Website URL" error={errors.website?.message} {...register('website')} />
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="mt-4">
                            <Button type="submit" isFullWidth isLoading={isSubmitting}>
                                Register Account
                            </Button>
                        </div>
                    </form>

                    <div className="mt-6 text-center text-sm text-slate-500 pt-6 border-t border-slate-200">
                        <p>Already have an account? <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700 ml-1">Sign in here</Link></p>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Register;
