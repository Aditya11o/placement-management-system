import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '../../context/ToastContext';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import { Mail, ArrowLeft, CheckCircle, Shield } from 'lucide-react';
import api from '../../services/api';

const forgotPasswordSchema = z.object({
    email: z.string().min(1, 'Email is required').email('Invalid email address')
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

const ForgotPassword = () => {
    const { register, handleSubmit, getValues, formState: { errors, isSubmitting } } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: { email: '' },
        mode: 'onTouched'
    });

    const [isSent, setIsSent] = useState(false);
    const { addToast } = useToast();

    const onSubmit = async (data: ForgotPasswordFormData) => {
        try {
            await api.post('/auth/forgot-password', data);
            setIsSent(true);
            addToast('Password reset link sent to your email', 'success');
        } catch (error: any) {
            addToast(error.response?.data?.message || 'Failed to send reset link', 'error');
        }
    };

    return (
        <div className="h-screen w-full flex bg-white font-sans overflow-hidden">
            {/* Left Side - Branding (Hidden on mobile) */}
            <div className="hidden lg:flex w-[40%] xl:w-[45%] relative flex-col justify-between overflow-hidden bg-slate-900 sticky top-0 h-full">
                <img 
                    src="/assets/images/login_hero.jpg" 
                    alt="Reset Password Hero" 
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

            {/* Right Side - Form */}
            <div className="w-full lg:w-[60%] xl:w-[55%] flex flex-col items-center justify-center px-6 lg:px-12 relative bg-white text-slate-800 h-full overflow-hidden">
                
                <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none lg:hidden">
                    <div className="absolute rounded-full blur-[100px] opacity-40 bg-indigo-100 w-[600px] h-[600px] -top-[10%] -left-[10%]"></div>
                    <div className="absolute rounded-full blur-[100px] opacity-40 bg-indigo-50 w-[500px] h-[500px] -bottom-[10%] -right-[10%]"></div>
                </div>

                <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="w-full max-w-[420px] relative z-10 flex flex-col justify-center h-full max-h-screen pt-4 pb-4"
                >
                    {/* Mobile Logo Header */}
                    <div className="lg:hidden flex flex-col items-center justify-center mb-6">
                        <div className="w-10 h-10 bg-[#6C63FF] rounded-xl flex items-center justify-center shadow-md mb-2">
                            <Shield className="text-white w-6 h-6" />
                        </div>
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight">TNU PMS</h1>
                    </div>

                    {isSent ? (
                        <div className="text-center py-4">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                            >
                                <CheckCircle size={56} className="text-green-500 mx-auto mb-6" />
                            </motion.div>
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">Check your email</h2>
                            <p className="text-slate-500 mb-8 text-[14px]">
                                We've sent password reset instructions to <strong className="text-slate-700">{getValues('email')}</strong>
                            </p>
                            <Link to="/login" className="block">
                                <Button isFullWidth className="h-12 rounded-xl bg-[#6C63FF] font-bold">Return to Sign In</Button>
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="mb-8 text-center lg:text-left">
                                <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2">Reset Password</h2>
                                <p className="text-slate-500 font-medium text-[14px]">
                                    Enter your email address and we will send you a password reset link.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <Input
                                    compact
                                    icon={Mail}
                                    type="email"
                                    label="Email address"
                                    placeholder="name@domain.com"
                                    {...register('email')}
                                    error={errors.email?.message}
                                />

                                <div className="pt-2">
                                    <Button 
                                        type="submit" 
                                        isFullWidth 
                                        isLoading={isSubmitting}
                                        className="h-12 bg-[#6C63FF] hover:bg-[#5b54e0] text-white rounded-xl shadow-lg shadow-indigo-500/10 transition-all font-bold text-[15px]"
                                    >
                                        Send Reset Link
                                    </Button>
                                </div>
                            </form>

                            <div className="mt-8 text-center">
                                <Link to="/login" className="inline-flex items-center gap-2 font-bold text-[#6C63FF] hover:text-[#5b54e0] transition-colors group">
                                    <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" /> 
                                    <span>Back to Sign In</span>
                                </Link>
                            </div>
                        </>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default ForgotPassword;
