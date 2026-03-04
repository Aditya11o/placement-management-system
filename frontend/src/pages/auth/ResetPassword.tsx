import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const resetPasswordSchema = z.object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    passwordConfirm: z.string().min(6, 'Please confirm your password')
}).refine((data) => data.password === data.passwordConfirm, {
    message: "Passwords don't match",
    path: ["passwordConfirm"],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/Card/Card';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import { Lock, ArrowLeft } from 'lucide-react';
import api from '../../services/api';

const ResetPassword = () => {
    const { resetToken } = useParams();
    const { addToast } = useToast();
    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
        mode: 'onTouched'
    });

    const onSubmit = async (data: ResetPasswordFormData) => {
        try {
            await api.put(`/auth/reset-password/${resetToken}`, { password: data.password });
            addToast('Password successfully reset. You can now log in.', 'success');
            navigate('/login');
        } catch (error: any) {
            addToast(error.response?.data?.message || 'Invalid or expired token', 'error');
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
                    <h2 className="text-2xl font-bold text-center mb-2 text-slate-800">Create New Password</h2>
                    <p className="text-slate-500 text-center mb-8 text-sm">Enter your new strong password below.</p>

                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                        <Input
                            icon={Lock}
                            type="password"
                            placeholder="New Password"
                            {...register('password')}
                            error={errors.password?.message}
                        />

                        <Input
                            icon={Lock}
                            type="password"
                            placeholder="Confirm New Password"
                            {...register('passwordConfirm')}
                            error={errors.passwordConfirm?.message}
                        />

                        <div className="mt-2">
                            <Button type="submit" isFullWidth isLoading={isSubmitting}>
                                Save Password
                            </Button>
                        </div>
                    </form>

                    <div className="mt-8 text-center text-sm text-slate-500 pt-6 border-t border-slate-200">
                        <Link to="/login" className="flex items-center justify-center gap-2 font-medium text-indigo-600 hover:text-indigo-700">
                            <ArrowLeft size={16} /> Back to Sign In
                        </Link>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default ResetPassword;
