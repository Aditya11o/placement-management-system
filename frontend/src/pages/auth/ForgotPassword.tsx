import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft, RefreshCcw, GraduationCap } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';
import api from '../../services/api';
import './ForgotPassword.css';

const ForgotPassword = () => {
    const [role, setRole] = useState<'STUDENT' | 'RECRUITER' | 'ADMIN'>('STUDENT');
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { addToast } = useToast();
    const { institutionName, logoUrl } = useTheme();

    const validateEmail = (email: string, role: string) => {
        const personalDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'protonmail.com', 'zoho.com'];
        const domain = email.split('@')[1];

        if ((role === 'STUDENT' || role === 'ADMIN') && !email.endsWith('@tnu.in')) {
            return `Only university emails (@tnu.in) are allowed for ${role.toLowerCase()}s`;
        }

        if (role === 'RECRUITER' && personalDomains.includes(domain)) {
            return 'Please use your company/business email for password recovery.';
        }

        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            addToast('Please enter your email address', 'error');
            return;
        }

        const error = validateEmail(email, role);
        if (error) {
            addToast(error, 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await api.post('/auth/forgot-password', { email, role });
            if (res.data.success) {
                addToast('Reset link sent to your email!', 'success');
            }
        } catch (error: any) {
            addToast(error.response?.data?.message || 'Failed to send reset link', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="forgot-container">
            {/* Top Navigation Bar */}
            <header className="forgot-nav">
                <div className="forgot-nav-brand">
                    {logoUrl ? (
                        <img src={logoUrl} alt="Logo" className="nav-logo" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                    ) : (
                        <GraduationCap size={24} className="nav-logo-icon" />
                    )}
                    <span>{institutionName?.toUpperCase() || 'PLACEMENT MANAGEMENT SYSTEM'}</span>
                </div>
                <div className="forgot-nav-links">
                    <Link to="/help" className="nav-link-secondary">Help</Link>
                    <Link to="/login" className="nav-link-primary">Back to Login</Link>
                </div>
            </header>

            <div className="forgot-split">
                {/* Left Section - Hero */}
                <div className="forgot-hero">
                    <div className="forgot-hero-content">
                        <span className="hero-label">SECURITY PROTOCOL</span>
                        <h1 className="forgot-hero-title">
                            Secure<br />
                            Access<br />
                            Recovery.
                        </h1>
                        <p className="forgot-hero-description">
                            Your institutional integrity begins with secure access. 
                            We utilize advanced encryption to protect your professional 
                            profile and placement data throughout the recovery process.
                        </p>
                        
                        <div className="hero-footer-version">
                            <div className="version-line"></div>
                            <span>DIGITAL CURATOR V2.4</span>
                        </div>
                    </div>
                    <div className="forgot-hero-copyright">
                        © 2024 {institutionName?.toUpperCase() || 'UNIVERSITY'} PLACEMENT AUTHORITY. ALL RIGHTS RESERVED.
                    </div>
                </div>

                {/* Right Section - Form */}
                <div className="forgot-form-section">
                    <motion.div 
                        className="forgot-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="forgot-icon-wrapper">
                            <RefreshCcw size={24} className="forgot-icon" />
                        </div>
                        
                        <h2 className="forgot-card-title">Forgot Password?</h2>
                        <p className="forgot-card-description">
                            Enter your university email to receive a password reset link.
                        </p>

                        <form onSubmit={handleSubmit} className="forgot-form">
                            <div className="forgot-role-selector" style={{ display: 'flex', gap: '8px', marginBottom: '24px', background: 'rgba(0,0,0,0.03)', padding: '4px', borderRadius: '8px' }}>
                                {(['STUDENT', 'ADMIN', 'RECRUITER'] as const).map((r) => (
                                    <button
                                        key={r}
                                        type="button"
                                        onClick={() => setRole(r)}
                                        style={{
                                            flex: 1,
                                            padding: '8px 12px',
                                            borderRadius: '6px',
                                            border: 'none',
                                            fontSize: '12px',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            background: role === r ? 'var(--color-primary)' : 'transparent',
                                            color: role === r ? 'white' : 'var(--color-text-secondary)',
                                            boxShadow: role === r ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                                        }}
                                    >
                                        {r.charAt(0) + r.slice(1).toLowerCase()}
                                    </button>
                                ))}
                            </div>

                            <div className="forgot-form-group">
                                <label className="forgot-label">
                                    {role === 'RECRUITER' ? 'COMPANY EMAIL' : 'UNIVERSITY EMAIL'}
                                </label>
                                <div className="forgot-input-wrapper">
                                    <div className="input-icon-box">@</div>
                                    <input 
                                        type="email" 
                                        className="forgot-input" 
                                        placeholder={role === 'RECRUITER' ? 'name@company.com' : 'name@tnu.in'}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <button type="submit" className="forgot-submit-button" disabled={isSubmitting}>
                                {isSubmitting ? 'Sending...' : (
                                    <>
                                        Send Reset Link
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>

                        <Link to="/login" className="back-to-login-link">
                            <ArrowLeft size={16} />
                            Back to Login
                        </Link>
                    </motion.div>

                    <footer className="forgot-footer-links">
                        <Link to="/privacy">PRIVACY POLICY</Link>
                        <Link to="/terms">TERMS OF SERVICE</Link>
                        <Link to="/security">SECURITY STANDARDS</Link>
                        <Link to="/accessibility">ADA COMPLIANCE</Link>
                    </footer>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
