import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';
import { Mail, Lock, GraduationCap } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Login2FAStep from './components/Login2FAStep';
import './Login.css';

const loginSchema = z.object({
    email: z.string().min(1, 'Email is required').email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['STUDENT', 'RECRUITER', 'ADMIN']),
    rememberMe: z.boolean()
}).superRefine((data, ctx) => {
    const personalDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'protonmail.com', 'zoho.com'];
    const domain = data.email.split('@')[1];

    if ((data.role === 'STUDENT' || data.role === 'ADMIN') && !data.email.endsWith('@tnu.in')) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Only university emails (@tnu.in) are allowed for ${data.role.toLowerCase()}s`,
            path: ['email'],
        });
    }

    if (data.role === 'RECRUITER' && personalDomains.includes(domain)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Please use your company/business email for login.',
            path: ['email'],
        });
    }
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login = () => {
    const [show2FA, setShow2FA] = React.useState(false);
    const [tempToken, setTempToken] = React.useState<string | null>(null);
    const [isVerifying, setIsVerifying] = React.useState(false);

    const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: '', password: '', role: 'STUDENT', rememberMe: false },
        mode: 'onTouched'
    });

    const selectedRole = watch('role');
    const { login, verify2FA } = useAuth();
    const { addToast } = useToast();
    const { logoUrl, institutionName } = useTheme();
    const navigate = useNavigate();

    const handleRoleSelect = (role: 'STUDENT' | 'RECRUITER' | 'ADMIN') => {
        setValue('role', role, { shouldValidate: true });
    };

    const handleLoginSuccess = (role: string) => {
        addToast('Successfully logged in!', 'success');
        if (role === 'STUDENT') navigate('/student/dashboard');
        else if (role === 'RECRUITER') navigate('/recruiter/dashboard');
        else navigate('/admin/dashboard');
    };

    const onSubmit = async (data: LoginFormData) => {
        try {
            const result = await login(data);
            
            if (result.requires2FA) {
                setTempToken(result.tempToken!);
                setShow2FA(true);
                return;
            }

            handleLoginSuccess(result.role!);
        } catch (error: any) {
            if (error.response?.data?.unverified) {
                addToast('Please verify your email to continue.', 'info');
                navigate('/verify-email', { 
                    state: { 
                        email: watch('email'), 
                        role: watch('role') 
                    } 
                });
                return;
            }
            addToast(error.response?.data?.message || 'Login failed', 'error');
        }
    };

    const onVerify2FA = async (otp: string) => {
        if (!tempToken) return;
        setIsVerifying(true);
        try {
            const { role } = await verify2FA(otp, tempToken);
            handleLoginSuccess(role);
        } catch (error: any) {
            addToast(error.response?.data?.message || 'Invalid code', 'error');
        } finally {
            setIsVerifying(false);
        }
    };



    return (
        <div className="login-container">
            {/* Left Section - Hero */}
            <div className="login-hero">
                <div className="login-hero-pattern"></div>
                
                <div className="login-hero-content">
                    <div className="login-logo-container">
                        {logoUrl ? (
                            <img src={logoUrl} alt="Logo" className="login-logo-icon" />
                        ) : (
                            <GraduationCap className="login-logo-icon" color="white" />
                        )}
                        <span className="login-logo-text">{institutionName || 'Academic Authority'}</span>
                    </div>

                    <h1 className="login-hero-title">
                        Welcome to<br />
                        the Placement<br />
                        Management<br />
                        System.
                    </h1>

                    <p className="login-hero-description">
                        The digital curator for career excellence. Connect with global opportunities, 
                        manage your professional portfolio, and secure your future.
                    </p>
                </div>

                <div className="login-hero-stats">
                    <div className="stat-item">
                        <span className="stat-value">98%</span>
                        <span className="stat-label">Placement Rate</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-value">500+</span>
                        <span className="stat-label">Global Partners</span>
                    </div>
                </div>
            </div>

            {/* Right Section - Login Form */}
            <div className="login-form-section">
                <AnimatePresence mode="wait">
                    {!show2FA ? (
                        <motion.div 
                            key="login-form"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="login-card"
                        >
                            <div className="portal-access-label">Portal Access</div>
                            <h2 className="login-title">Sign In</h2>

                            <form onSubmit={handleSubmit(onSubmit)}>
                                <div className="role-selector">
                                    {(['STUDENT', 'ADMIN', 'RECRUITER'] as const).map((role) => (
                                        <button
                                            key={role}
                                            type="button"
                                            className={`role-tab ${selectedRole === role ? 'active' : ''}`}
                                            onClick={() => handleRoleSelect(role)}
                                        >
                                            {role.charAt(0) + role.slice(1).toLowerCase()}
                                        </button>
                                    ))}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">{selectedRole === 'RECRUITER' ? 'Company Email' : 'University Email / ID'}</label>
                                    <div className="input-wrapper">
                                        <Mail className="input-icon" />
                                        <input 
                                            type="email" 
                                            className="login-input" 
                                            placeholder={selectedRole === 'RECRUITER' ? 'e.g. j.doe@company.com' : 'e.g. s12345@university.edu'}
                                            {...register('email')}
                                        />
                                    </div>
                                    {errors.email && <span className="error-text">{errors.email.message}</span>}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Password</label>
                                    <div className="input-wrapper">
                                        <Lock className="input-icon" />
                                        <input 
                                            type="password" 
                                            className="login-input" 
                                            placeholder="••••••••"
                                            {...register('password')}
                                        />
                                    </div>
                                    {errors.password && <span className="error-text">{errors.password.message}</span>}
                                </div>

                                <div className="form-options">
                                    <label className="remember-me">
                                        <input 
                                            type="checkbox" 
                                            hidden 
                                            {...register('rememberMe')}
                                        />
                                        <div className="checkbox-custom">
                                            {watch('rememberMe') && (
                                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                                    <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                            )}
                                        </div>
                                        Remember me
                                    </label>
                                    <Link to="/forgot-password" title="Forgot Password?" className="forgot-password">
                                        Forgot Password?
                                    </Link>
                                </div>

                                <button 
                                    type="submit" 
                                    className="login-button" 
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Signing in...' : 'Log In'}
                                </button>
                            </form>



                            <div className="signup-text">
                                Don't have an account? 
                                <Link to="/register" title="Request access." className="signup-link">
                                    Request access.
                                </Link>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="2fa-step"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="login-card"
                        >
                            <Login2FAStep 
                                onVerify={onVerify2FA}
                                onBack={() => setShow2FA(false)}
                                isLoading={isVerifying}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="login-footer">
                    <div className="footer-links">
                        <Link to="/privacy" className="footer-link">Privacy</Link>
                        <Link to="/terms" className="footer-link">Terms</Link>
                        <Link to="/accessibility" className="footer-link">Accessibility</Link>
                    </div>
                    <div className="copyright">
                        © 2024 UNIVERSITY PLACEMENT OFFICE
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
