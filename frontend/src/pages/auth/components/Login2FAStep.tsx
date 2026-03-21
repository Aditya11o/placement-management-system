import React from 'react';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft } from 'lucide-react';
import Button from '../../../components/Button/Button';
import Input from '../../../components/Input/Input';
import { useForm } from 'react-hook-form';

interface Login2FAStepProps {
    onVerify: (otp: string) => Promise<void>;
    onBack: () => void;
    isLoading: boolean;
}

const Login2FAStep: React.FC<Login2FAStepProps> = ({ onVerify, onBack, isLoading }) => {
    const { register, handleSubmit, formState: { errors } } = useForm<{ otp: string }>();

    const onSubmit = (data: { otp: string }) => {
        onVerify(data.otp);
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
        >
            <div className="text-center lg:text-left">
                <button 
                    onClick={onBack}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-4 text-sm font-medium"
                >
                    <ArrowLeft size={16} />
                    Back to login
                </button>
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4 mx-auto lg:mx-0">
                    <Shield className="text-indigo-600 w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2 font-sans">Two-Factor Authentication</h2>
                <p className="text-slate-500 text-[15px]">Enter the 6-digit code from your authenticator app.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <Input
                    label="Verification Code"
                    placeholder="000000"
                    maxLength={6}
                    className="text-center tracking-[1em] font-mono text-xl"
                    {...register('otp', { 
                        required: 'Code is required',
                        pattern: { value: /^\d{6}$/, message: 'Must be 6 digits' }
                    })}
                    error={errors.otp?.message}
                />

                <Button 
                    type="submit" 
                    isFullWidth 
                    isLoading={isLoading}
                    className="h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition-all font-semibold"
                >
                    Verify & Sign In
                </Button>
            </form>
        </motion.div>
    );
};

export default Login2FAStep;
