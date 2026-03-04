
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/Card/Card';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import { Mail, Lock, User, Briefcase, Shield } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const loginSchema = z.object({
    email: z.string().min(1, 'Email is required').email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['STUDENT', 'RECRUITER', 'ADMIN'])
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login = () => {
    const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: '', password: '', role: 'STUDENT' },
        mode: 'onTouched'
    });

    const selectedRole = watch('role');
    const { login } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();

    const handleRoleSelect = (role: 'STUDENT' | 'RECRUITER' | 'ADMIN') => {
        setValue('role', role);
    };

    const onSubmit = async (data: LoginFormData) => {
        try {
            const role = await login(data);
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
        <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute rounded-full blur-[80px] opacity-60 bg-indigo-100 w-[500px] h-[500px] -top-[10%] -left-[10%]"></div>
                <div className="absolute rounded-full blur-[80px] opacity-60 bg-indigo-50 w-[400px] h-[400px] -bottom-[5%] -right-[5%]"></div>
            </div>

            <div className="relative z-10 w-full max-w-[440px] p-4">
                <div className="text-center mb-8 animate-fade-in">
                    <h1 className="text-4xl text-indigo-600 tracking-tight font-bold mb-1">Nexus</h1>
                    <p className="text-slate-500 text-base m-0">Placement Management System</p>
                </div>

                <Card className="!p-8 sm:!p-10 shadow-xl animate-fade-in" style={{ animationDelay: '0.1s' }}>
                    <h2 className="text-2xl font-bold text-center mb-2 text-slate-800">Welcome Back</h2>
                    <p className="text-slate-500 text-center mb-8 text-sm">Sign in to your account</p>

                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

                        <div className="flex bg-slate-100 rounded-md p-1 mb-2">
                            <button
                                type="button"
                                className={`flex-1 flex items-center justify-center gap-1.5 p-2 rounded text-[13px] font-medium transition-all ${selectedRole === 'STUDENT' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                                onClick={() => handleRoleSelect('STUDENT')}
                            >
                                <User size={18} /> Student
                            </button>
                            <button
                                type="button"
                                className={`flex-1 flex items-center justify-center gap-1.5 p-2 rounded text-[13px] font-medium transition-all ${selectedRole === 'RECRUITER' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                                onClick={() => handleRoleSelect('RECRUITER')}
                            >
                                <Briefcase size={18} /> Recruiter
                            </button>
                            <button
                                type="button"
                                className={`flex-1 flex items-center justify-center gap-1.5 p-2 rounded text-[13px] font-medium transition-all ${selectedRole === 'ADMIN' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                                onClick={() => handleRoleSelect('ADMIN')}
                            >
                                <Shield size={18} /> Admin
                            </button>
                        </div>

                        <Input
                            icon={Mail}
                            type="email"
                            placeholder="Email address"
                            {...register('email')}
                            error={errors.email?.message}
                        />

                        <Input
                            icon={Lock}
                            type="password"
                            placeholder="Password"
                            {...register('password')}
                            error={errors.password?.message}
                        />

                        <div className="flex justify-between items-center -mt-1 text-sm">
                            <label className="flex items-center gap-2 text-slate-500 cursor-pointer">
                                <input type="checkbox" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" /> Remember me
                            </label>
                            <Link to="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-700">Forgot password?</Link>
                        </div>

                        <div className="mt-2">
                            <Button type="submit" isFullWidth isLoading={isSubmitting}>
                                Sign In
                            </Button>
                        </div>
                    </form>

                    {selectedRole !== 'ADMIN' && (
                        <div className="mt-6 text-center text-sm text-slate-500 pt-6 border-t border-slate-200">
                            <p>Don't have an account? <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-700 ml-1">Create one</Link></p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default Login;
