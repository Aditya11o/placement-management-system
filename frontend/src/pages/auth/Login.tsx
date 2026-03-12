import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import { Mail, Lock, User, Briefcase, Shield } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const loginSchema = z.object({
    email: z.string().min(1, 'Email is required').email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['STUDENT', 'RECRUITER', 'ADMIN']),
    rememberMe: z.boolean()
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login = () => {
    const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: '', password: '', role: 'STUDENT', rememberMe: false },
        mode: 'onTouched'
    });

    const selectedRole = watch('role');
    const { login } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();

    const handleRoleSelect = (role: 'STUDENT' | 'RECRUITER' | 'ADMIN') => {
        setValue('role', role, { shouldValidate: true });
    };

    const onSubmit = async (data: LoginFormData) => {
        try {
            const { role } = await login(data);
            addToast('Successfully logged in!', 'success');

            // Redirect based on role
            if (role === 'STUDENT') navigate('/student/dashboard');
            else if (role === 'RECRUITER') navigate('/recruiter/dashboard');
            else navigate('/admin/dashboard');

        } catch (error: any) {
            addToast(error.response?.data?.message || 'Login failed', 'error');
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-white font-sans">
            {/* Left Side - Image/Branding (Hidden on mobile) */}
            <div className="hidden lg:flex w-1/2 relative flex-col justify-between overflow-hidden bg-slate-900">
                {/* Background Image */}
                <img 
                    src="/assets/images/login_hero.jpg" 
                    alt="TNU Campus" 
                    className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-overlay"
                />
                
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900/50 w-full h-full pointer-events-none" />

                {/* Content over image - Top */}
                <div className="relative z-10 p-12">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                            <Shield className="text-white w-6 h-6" />
                        </div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">TNU PMS</h1>
                    </div>
                </div>

                {/* Content over image - Bottom */}
                <div className="relative z-10 p-12 pb-16">
                    <blockquote className="space-y-4 max-w-lg">
                        <p className="text-3xl font-medium text-white leading-tight">
                            "Empowering students and recruiters to connect effortlessly and shape the future."
                        </p>
                        <footer className="text-indigo-200">
                            <p className="font-semibold text-white">TNU Administration</p>
                            <p className="text-sm opacity-80">Placement Management System</p>
                        </footer>
                    </blockquote>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-hidden bg-slate-50 lg:bg-white text-slate-800">
                
                {/* Mobile Background Elements (Only visible on small screens) */}
                <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none lg:hidden">
                    <div className="absolute rounded-full blur-[80px] opacity-60 bg-indigo-100 w-[500px] h-[500px] -top-[10%] -left-[10%]"></div>
                    <div className="absolute rounded-full blur-[80px] opacity-60 bg-indigo-50 w-[400px] h-[400px] -bottom-[5%] -right-[5%]"></div>
                </div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="w-full max-w-[420px] relative z-10"
                >
                    {/* Mobile Logo Header */}
                    <div className="lg:hidden flex flex-col items-center justify-center mb-10">
                        <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md mb-4">
                            <Shield className="text-white w-7 h-7" />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">TNU PMS</h1>
                    </div>

                    <div className="mb-8 text-center lg:text-left">
                        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Welcome back</h2>
                        <p className="text-slate-500 text-[15px]">Sign in to your account</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        
                        {/* Custom Role Selector */}
                        <div className="bg-slate-100/70 p-1.5 rounded-xl flex mb-6 shadow-sm border border-slate-200/50 relative overflow-hidden">
                            {(['STUDENT', 'RECRUITER', 'ADMIN'] as const).map((role) => {
                                const isSelected = selectedRole === role;
                                return (
                                    <button
                                        key={role}
                                        type="button"
                                        onClick={() => handleRoleSelect(role)}
                                        className={`relative flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[13px] font-semibold transition-all duration-300 z-10 ${
                                            isSelected
                                            ? 'text-[#6C63FF]' 
                                            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
                                        }`}
                                    >
                                        {isSelected && (
                                            <motion.div
                                                layoutId="activeRoleTab"
                                                className="absolute inset-0 bg-white shadow-sm border border-slate-200/50 rounded-lg"
                                                initial={false}
                                                transition={{ type: "spring", stiffness: 350, damping: 30 }}
                                            />
                                        )}
                                        <div className="relative z-20 flex items-center gap-2">
                                            {role === 'STUDENT' && <User size={16} />}
                                            {role === 'RECRUITER' && <Briefcase size={16} />}
                                            {role === 'ADMIN' && <Shield size={16} />}
                                            <span className="capitalize hidden sm:inline">{role.toLowerCase()}</span>
                                            <span className="capitalize sm:hidden text-xs">{role === 'RECRUITER' ? 'Recruit' : role.toLowerCase()}</span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="space-y-4">
                            <Input
                                icon={Mail}
                                type="email"
                                label="Email address"
                                placeholder="name@domain.com"
                                className="bg-white/50 focus-within:bg-white"
                                {...register('email')}
                                error={errors.email?.message}
                            />

                            <Input
                                icon={Lock}
                                type="password"
                                label="Password"
                                placeholder="••••••••"
                                className="bg-white/50 focus-within:bg-white"
                                {...register('password')}
                                error={errors.password?.message}
                            />
                        </div>

                        <div className="flex justify-between items-center text-[14px] pt-1 pb-2">
                            <label className="flex items-center gap-2 text-slate-600 cursor-pointer group">
                                <div className="relative flex items-center justify-center w-4 h-4 rounded border border-slate-300 bg-white group-hover:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                                    <input 
                                        type="checkbox" 
                                        className="peer opacity-0 absolute inset-0 cursor-pointer" 
                                        {...register('rememberMe')}
                                    />
                                    <svg className="w-3 h-3 text-indigo-600 scale-0 peer-checked:scale-100 transition-transform duration-200" viewBox="0 0 14 14" fill="none">
                                        <path d="M3 8L6 11L11 3.5" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
                                    </svg>
                                </div>
                                <span className="font-medium group-hover:text-slate-900 transition-colors">Remember me</span>
                            </label>
                            <Link to="/forgot-password" className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                                Forgot password?
                            </Link>
                        </div>

                        <Button 
                            type="submit" 
                            isFullWidth 
                            isLoading={isSubmitting}
                            className="h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-500/20 transition-all font-semibold text-[15px]"
                        >
                            Sign in
                        </Button>
                    </form>

                    {selectedRole !== 'ADMIN' && (
                        <div className="mt-8 text-center pb-4">
                            <p className="text-[14px] text-slate-500 font-medium tracking-tight">
                                Don't have an account?{' '}
                                <Link to="/register" className="text-[#6C63FF] font-bold hover:text-[#5b54e0] transition-all hover:underline underline-offset-4">
                                    Create one
                                </Link>
                            </p>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default Login;
