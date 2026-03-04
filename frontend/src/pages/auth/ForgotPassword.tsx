import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const forgotPasswordSchema = z.object({
    email: z.string().min(1, 'Email is required').email('Invalid email address')
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
import { Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/Card/Card';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import api from '../../services/api';

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
        <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute rounded-full blur-[80px] opacity-60 bg-indigo-100 w-[500px] h-[500px] -top-[10%] -left-[10%]"></div>
                <div className="absolute rounded-full blur-[80px] opacity-60 bg-indigo-50 w-[400px] h-[400px] -bottom-[5%] -right-[5%]"></div>
            </div>

            <div className="relative z-10 w-full max-w-[440px] p-4">
                <div className="text-center mb-8 animate-fade-in">
                    <h1 className="text-4xl text-indigo-600 tracking-tight font-bold mb-1">Nexus</h1>
                </div>

                <Card className="!p-8 sm:!p-10 shadow-xl animate-fade-in" style={{ animationDelay: '0.1s' }}>

                    {isSent ? (
                        <div className="text-center py-4">
                            <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-center mb-2 text-slate-800">Check your email</h2>
                            <p className="text-slate-500 text-center mb-6 text-sm">
                                We've sent password reset instructions to <strong className="text-slate-700">{getValues('email')}</strong>
                            </p>
                            <Link to="/login" className="block outline-none">
                                <Button isFullWidth variant="secondary">Return to Login</Button>
                            </Link>
                        </div>
                    ) : (
                        <>
                            <h2 className="text-2xl font-bold text-center mb-2 text-slate-800">Reset Password</h2>
                            <p className="text-slate-500 text-center mb-8 text-sm">Enter your email and we'll send a reset link.</p>

                            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                                <Input
                                    icon={Mail}
                                    type="email"
                                    placeholder="Email address"
                                    {...register('email')}
                                    error={errors.email?.message}
                                />

                                <div className="mt-2">
                                    <Button type="submit" isFullWidth isLoading={isSubmitting}>
                                        Send Reset Link
                                    </Button>
                                </div>
                            </form>

                            <div className="mt-8 text-center text-sm text-slate-500 pt-6 border-t border-slate-200">
                                <Link to="/login" className="flex items-center justify-center gap-2 font-medium text-indigo-600 hover:text-indigo-700">
                                    <ArrowLeft size={16} /> Back to Sign In
                                </Link>
                            </div>
                        </>
                    )}

                </Card>
            </div>
        </div>
    );
};

export default ForgotPassword;
