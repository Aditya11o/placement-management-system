import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';
import { Mail, Lock, User, GraduationCap } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import * as z from 'zod';
import api from '../../services/api';
import './Register.css';

const registerSchema = z.object({
    name: z.string().min(2, 'Full name is required'),
    email: z.string().min(1, 'Email is required').email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Please confirm your password'),
    role: z.enum(['STUDENT', 'RECRUITER']),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
}).superRefine((data, ctx) => {
    const personalDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'protonmail.com', 'zoho.com'];
    const domain = data.email.split('@')[1];

    if (data.role === 'STUDENT' && !data.email.endsWith('@tnu.in')) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Only university emails (@tnu.in) are allowed for students',
            path: ['email'],
        });
    }

    if (data.role === 'RECRUITER' && personalDomains.includes(domain)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Please use a company/business email. Personal domains are not allowed.',
            path: ['email'],
        });
    }
});

type RegisterFormData = z.infer<typeof registerSchema>;

const ROLES = ['STUDENT', 'RECRUITER'] as const;

const Register = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { addToast } = useToast();
    const { logoUrl, institutionName } = useTheme();
    const navigate = useNavigate();

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        mode: 'onTouched',
        defaultValues: { role: 'STUDENT' }
    });

    const selectedRole = watch('role');

    const handleRoleSelect = (role: 'STUDENT' | 'RECRUITER') => {
        setValue('role', role, { shouldValidate: true });
    };

    const onSubmit = async (data: RegisterFormData) => {
        setIsSubmitting(true);
        try {
            const endpoint = `/auth/register/${data.role.toLowerCase()}`;
            // Simplify data for backend (excluding confirmPassword)
            const { confirmPassword, ...submitData } = data;
            
            const res = await api.post(endpoint, submitData);

            if (res.data.success) {
                addToast('Registration successful! Please verify your email.', 'success');
                navigate('/verify-email', { 
                    state: { 
                        email: data.email, 
                        role: data.role,
                        fromSignup: true 
                    } 
                });
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
        <div className="register-container">
            {/* Left Section - Hero */}
            <div className="register-hero">
                <div className="register-hero-logo">
                    {logoUrl ? (
                        <img src={logoUrl} alt="Logo" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                    ) : (
                        <GraduationCap size={40} color="white" />
                    )}
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '24px', color: 'white' }}>
                        {institutionName || 'ACADEMIC AUTHORITY'}
                    </span>
                </div>

                <div style={{ position: 'relative', zIndex: 10 }}>
                    <h1 className="register-hero-title">
                        Join the<br />
                        Placement<br />
                        Management<br />
                        System.
                    </h1>
                    <div className="register-hero-divider"></div>
                    <p className="register-hero-description">
                        The digital curator for career excellence. Start your journey with 
                        global opportunities and secure your future.
                    </p>
                    <div className="register-hero-footer">
                        EST. 2024 &nbsp; • &nbsp; SECURE CAMPUS ACCESS
                    </div>
                </div>
            </div>

            {/* Right Section - Form */}
            <div className="register-form-section">
                <div className="register-role-section">
                    <span className="select-role-label">Select your role</span>
                    <div className="register-role-selector">
                        {ROLES.map((r) => (
                            <button
                                key={r}
                                type="button"
                                className={`register-role-tab ${selectedRole === r ? 'active' : ''}`}
                                onClick={() => handleRoleSelect(r)}
                            >
                                {r.charAt(0) + r.slice(1).toLowerCase()}
                            </button>
                        ))}
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div 
                        key="register-card"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="register-card"
                    >
                        <h2 className="register-card-title">Create your profile</h2>
                        <p className="register-card-description">Enter your details to begin your academic career path.</p>

                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="register-form-group">
                                <label className="register-form-label">{selectedRole === 'RECRUITER' ? 'Contact Person Name' : 'Full Name'}</label>
                                <div className="register-input-wrapper">
                                    <User className="register-input-icon" />
                                    <input 
                                        type="text" 
                                        className="register-input" 
                                        placeholder={selectedRole === 'RECRUITER' ? 'e.g. John Smith' : 'Dr. Jane Doe'}
                                        {...register('name')}
                                    />
                                </div>
                                {errors.name && <span className="error-text">{errors.name.message}</span>}
                            </div>

                            <div className="register-form-group">
                                <label className="register-form-label">{selectedRole === 'RECRUITER' ? 'Company Email' : 'University Email / ID'}</label>
                                <div className="register-input-wrapper">
                                    <Mail className="register-input-icon" />
                                    <input 
                                        type="email" 
                                        className="register-input" 
                                        placeholder={selectedRole === 'RECRUITER' ? 'j.doe@company.com' : 'j.doe@university.edu'}
                                        {...register('email')}
                                    />
                                </div>
                                {errors.email && <span className="error-text">{errors.email.message}</span>}
                            </div>

                            <div className="register-form-group">
                                <label className="register-form-label">Password</label>
                                <div className="register-input-wrapper">
                                    <Lock className="register-input-icon" />
                                    <input 
                                        type="password" 
                                        className="register-input" 
                                        placeholder="••••••••••••"
                                        {...register('password')}
                                    />
                                </div>
                                {errors.password && <span className="error-text">{errors.password.message}</span>}
                            </div>

                            <div className="register-form-group">
                                <label className="register-form-label">Confirm Password</label>
                                <div className="register-input-wrapper">
                                    <Lock className="register-input-icon" />
                                    <input 
                                        type="password" 
                                        className="register-input" 
                                        placeholder="••••••••••••"
                                        {...register('confirmPassword')}
                                    />
                                </div>
                                {errors.confirmPassword && <span className="error-text">{errors.confirmPassword.message}</span>}
                            </div>

                            <button type="submit" className="register-button" disabled={isSubmitting}>
                                {isSubmitting ? 'Creating account...' : 'Create Account'}
                            </button>
                        </form>



                        <div className="signin-prompt">
                            Already have an account? 
                            <Link to="/login" className="signin-link">Sign In</Link>
                        </div>
                    </motion.div>
                </AnimatePresence>

                <footer className="register-footer">
                    <div className="register-copyright">
                        © 2024 UNIVERSITY PLACEMENT MANAGEMENT SYSTEM.
                    </div>
                    <div className="register-footer-links">
                        <Link to="/privacy" className="register-footer-link">PRIVACY POLICY</Link>
                        <Link to="/guidelines" className="register-footer-link">UNIVERSITY GUIDELINES</Link>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default Register;
