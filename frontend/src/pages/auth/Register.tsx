import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import { Mail, Lock, User, Briefcase, Phone, BookOpen, Building, MapPin, Users, Shield, GraduationCap, Percent, Globe } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
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
    company_name: z.string().optional().or(z.literal('')),
    join_code: z.string().optional().or(z.literal('')),
    contact_person: z.string().min(2, 'Contact person is required'),
    industry: z.string().min(2, 'Industry is required'),
    location: z.string().min(2, 'Location is required'),
    website: z.string().url('Invalid website URL').optional().or(z.literal(''))
}).refine((data) => (data.company_name && data.company_name.length >= 2) || (data.join_code && data.join_code.length >= 4), {
    message: "Company Name (min 2 chars) or a valid Join Code is required",
    path: ["company_name"],
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
        <div className="h-screen w-full flex bg-white font-sans overflow-hidden">
            {/* Left Side - Branding (Hidden on mobile) */}
            <div className="hidden lg:flex w-[40%] xl:w-[45%] relative flex-col justify-between overflow-hidden bg-slate-900 sticky top-0 h-full">
                <img 
                    src="/assets/images/login_hero.jpg" 
                    alt="Register Hero" 
                    className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-overlay"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900/50 w-full h-full pointer-events-none" />

                <div className="relative z-10 p-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#6C63FF] rounded-lg flex items-center justify-center shadow-lg">
                            <Shield className="text-white w-6 h-6" />
                        </div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">TNU PMS</h1>
                    </div>
                </div>

                <div className="relative z-10 p-10 pb-12">
                    <blockquote className="space-y-4 max-w-lg">
                        <p className="text-3xl font-medium text-white leading-tight">
                            "Empowering students and recruiters to connect effortlessly and shape the future."
                        </p>
                        <footer className="text-indigo-200">
                            <p className="font-semibold text-white">Join our ecosystem</p>
                            <p className="text-sm opacity-80">Placement Management System</p>
                        </footer>
                    </blockquote>
                </div>
            </div>

            {/* Right Side - Register Form */}
            <div className="w-full lg:w-[60%] xl:w-[55%] flex flex-col items-center justify-center px-6 lg:px-12 relative bg-white text-slate-800 h-full overflow-hidden">
                
                <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none lg:hidden">
                    <div className="absolute rounded-full blur-[100px] opacity-40 bg-indigo-100 w-[600px] h-[600px] -top-[10%] -left-[10%]"></div>
                    <div className="absolute rounded-full blur-[100px] opacity-40 bg-indigo-50 w-[500px] h-[500px] -bottom-[10%] -right-[10%]"></div>
                </div>

                <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="w-full max-w-[800px] relative z-10 flex flex-col justify-center h-full max-h-screen pt-2 pb-2"
                >
                    <div className="lg:hidden flex flex-col items-center justify-center mb-2">
                        <div className="w-8 h-8 bg-[#6C63FF] rounded-lg flex items-center justify-center shadow-md mb-1">
                            <Shield className="text-white w-4 h-4" />
                        </div>
                        <h1 className="text-lg font-bold text-slate-900 tracking-tight">TNU PMS</h1>
                    </div>

                    <div className="mb-3 text-center lg:text-left">
                        <h2 className="text-xl lg:text-2xl font-bold text-slate-900 mb-0">Create your account</h2>
                        <p className="text-slate-500 font-medium text-[11px] lg:text-[12.5px]">Join the TNU Placement Management System</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-1 lg:space-y-1.5 overflow-y-visible">
                        {/* Role Selector */}
                        <div className="bg-slate-100/70 p-1 rounded-2xl flex shadow-sm border border-slate-200/50 relative overflow-hidden mb-1">
                            {(['STUDENT', 'RECRUITER'] as const).map((r) => {
                                const isSelected = role === r;
                                return (
                                    <button
                                        key={r}
                                        type="button"
                                        onClick={() => handleRoleSelect(r)}
                                        className={`relative flex-1 flex items-center justify-center gap-2 py-1.5 lg:py-2 rounded-xl text-[12.5px] font-bold transition-all duration-300 z-10 ${
                                            isSelected ? 'text-[#6C63FF]' : 'text-slate-500 hover:text-slate-800'
                                        }`}
                                    >
                                        {isSelected && (
                                            <motion.div
                                                layoutId="activeRoleTabRegister"
                                                className="absolute inset-0 bg-white shadow-sm border border-slate-200/50 rounded-xl"
                                                initial={false}
                                                transition={{ type: "spring", stiffness: 350, damping: 30 }}
                                            />
                                        )}
                                        <div className="relative z-20 flex items-center gap-2">
                                            {r === 'STUDENT' ? <User size={13} /> : <Briefcase size={13} />}
                                            <span className="capitalize">{r.toLowerCase()}</span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Student Form Sections */}
                        {role === 'STUDENT' && (
                            <div className="space-y-1 lg:space-y-1.5">
                                <section className="space-y-0.5">
                                    <h3 className="text-[9.5px] font-extrabold text-[#6C63FF] uppercase tracking-[0.2em] border-l-4 border-[#6C63FF] pl-2 py-0 mb-1">Basic Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-0">
                                        <Input compact label="Email address" icon={Mail} type="email" placeholder="name@college.edu" error={errors.email?.message} {...register('email')} />
                                        <Input compact label="Phone Number" icon={Phone} placeholder="+91 00000 00000" error={errors.phone?.message} {...register('phone')} />
                                        <Input compact label="Password" icon={Lock} type="password" placeholder="Min. 6 characters" error={errors.password?.message} {...register('password')} />
                                        <Input compact label="Full Legal Name" icon={User} placeholder="Enter your full name" error={errors.name?.message} {...register('name')} />
                                    </div>
                                </section>

                                <section className="space-y-0.5">
                                    <h3 className="text-[9.5px] font-extrabold text-[#6C63FF] uppercase tracking-[0.2em] border-l-4 border-[#6C63FF] pl-2 py-0 mb-1">Academic Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-0 text-left">
                                        <Input compact label="Branch" icon={BookOpen} placeholder="e.g. CSE, ECE" error={errors.branch?.message} {...register('branch')} />
                                        <Input compact label="Current CGPA" icon={GraduationCap} type="number" step="0.01" placeholder="0.00-10.0" error={errors.cgpa?.message} {...register('cgpa')} />
                                        <Input compact label="Graduation Year" icon={Globe} type="number" placeholder="YYYY" error={errors.graduation_year?.message} {...register('graduation_year')} />
                                        
                                        <div className="flex flex-col gap-0.5 mb-2">
                                            <label className="text-[12px] font-semibold text-slate-700">Gender</label>
                                            <div className="relative">
                                                <select className={`w-full px-4 py-1.5 bg-white border rounded-lg text-[12.5px] font-medium text-slate-700 transition-all focus:border-[#6C63FF] focus:ring-4 focus:ring-[#6C63FF]/15 outline-none appearance-none ${errors.gender ? 'border-red-500' : 'border-slate-300'}`} {...register('gender')}>
                                                    <option value="MALE">Male</option>
                                                    <option value="FEMALE">Female</option>
                                                    <option value="OTHER">Other</option>
                                                </select>
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                                                    <BookOpen size={11} className="rotate-90" />
                                                </div>
                                            </div>
                                            <div className="min-h-[14px] mt-0.5">
                                                {errors.gender && <span className="text-[10px] font-medium text-red-500">{errors.gender?.message}</span>}
                                            </div>
                                        </div>

                                        <Input compact label="10th Marks (%)" icon={Percent} type="number" step="0.01" placeholder="Percentage" error={errors.marks_10th?.message} {...register('marks_10th')} />
                                        <Input compact label="12th Marks (%)" icon={Percent} type="number" step="0.01" placeholder="Percentage" error={errors.marks_12th?.message} {...register('marks_12th')} />
                                    </div>
                                </section>
                            </div>
                        )}

                        {/* Recruiter Form Sections */}
                        {role === 'RECRUITER' && (
                            <div className="space-y-1 lg:space-y-1.5">
                                <section className="space-y-0.5">
                                    <h3 className="text-[9.5px] font-extrabold text-[#6C63FF] uppercase tracking-[0.2em] border-l-4 border-[#6C63FF] pl-2 py-0 mb-1">Team Onboarding</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-0 p-3 bg-slate-50 border border-slate-200 rounded-2xl relative shadow-sm">
                                        <Input compact label="Team Join Code (Optional)" icon={Users} placeholder="Existing team code" error={errors.join_code?.message} {...register('join_code')} />
                                        <div className="hidden md:flex items-center mb-6">
                                            <span className="text-[9px] font-bold text-slate-400 italic">Joining a team? Use code.</span>
                                        </div>
                                        <div className="md:col-span-2 flex items-center gap-4 py-0 text-center">
                                            <div className="flex-1 h-px bg-slate-200"></div>
                                            <span className="text-[7.5px] font-black text-slate-300 uppercase tracking-widest whitespace-nowrap px-2">OR BRAND NEW</span>
                                            <div className="flex-1 h-px bg-slate-200"></div>
                                        </div>
                                        <div className="md:col-span-2">
                                            <Input compact label="Company Name" icon={Building} placeholder="Enter company name" error={errors.company_name?.message} {...register('company_name')} />
                                        </div>
                                    </div>
                                </section>

                                <section className="space-y-0.5">
                                    <h3 className="text-[9.5px] font-extrabold text-[#6C63FF] uppercase tracking-[0.2em] border-l-4 border-[#6C63FF] pl-2 py-0 mb-1">Company Detail</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-0">
                                        <Input compact label="Contact Person Name" icon={User} placeholder="Full name" error={errors.contact_person?.message} {...register('contact_person')} />
                                        <Input compact label="Work Email" icon={Mail} type="email" placeholder="name@company.com" error={errors.email?.message} {...register('email')} />
                                        <Input compact label="Phone Number" icon={Phone} placeholder="+91 00000 00000" error={errors.phone?.message} {...register('phone')} />
                                        <Input compact label="Industry" icon={Briefcase} placeholder="e.g. IT, Finance" error={errors.industry?.message} {...register('industry')} />
                                        <Input compact label="HQ Location" icon={MapPin} placeholder="City, Country" error={errors.location?.message} {...register('location')} />
                                        <Input compact label="Website URL" icon={Globe} type="url" placeholder="https://company.com" error={errors.website?.message} {...register('website')} />
                                        <div className="md:col-span-2">
                                            <Input compact label="Password" icon={Lock} type="password" placeholder="Min. 6 characters" error={errors.password?.message} {...register('password')} />
                                        </div>
                                    </div>
                                </section>
                            </div>
                        )}

                        <div className="pt-0.5">
                            <Button 
                                type="submit" 
                                isFullWidth 
                                isLoading={isSubmitting}
                                className="h-10 lg:h-11 bg-[#6C63FF] hover:bg-[#5b54e0] text-white rounded-xl shadow-lg shadow-indigo-500/10 transition-all font-bold text-[14px] lg:text-[15px]"
                            >
                                Create Account
                            </Button>
                        </div>
                    </form>

                    <div className="mt-2 text-center">
                        <p className="text-slate-500 font-medium text-[12px] lg:text-[13px]">
                            Already have an account?{' '}
                            <Link to="/login" className="text-[#6C63FF] font-bold hover:text-[#5b54e0] transition-all hover:underline underline-offset-4">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Register;
