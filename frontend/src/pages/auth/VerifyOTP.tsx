import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowRight, Shield, HelpCircle } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import api from '../../services/api';
import './VerifyOTP.css';

const VerifyOTP = () => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const navigate = useNavigate();
    const location = useLocation();
    const { addToast } = useToast();
    const { verify2FA } = useAuth();
    
    const email = location.state?.email || 'j.doe@university.edu';
    const tempToken = location.state?.tempToken;

    useEffect(() => {
        if (!tempToken && !location.state?.fromSignup) {
            navigate('/login');
        }
    }, [tempToken, navigate, location.state]);

    const handleChange = (index: number, value: string) => {
        if (isNaN(Number(value))) return;
        
        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async () => {
        const otpString = otp.join('');
        if (otpString.length < 6) {
            addToast('Please enter the 6-digit code', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            if (tempToken) {
                const { role: verifiedRole } = await verify2FA(otpString, tempToken);
                addToast('Verification successful!', 'success');
                if (verifiedRole === 'STUDENT') navigate('/student/dashboard');
                else if (verifiedRole === 'RECRUITER') navigate('/recruiter/dashboard');
                else navigate('/admin/dashboard');
            } else {
                const res = await api.post('/auth/verify-email', {
                    email,
                    role: location.state?.role,
                    otp: otpString
                });
                
                if (res.data.success) {
                    addToast('Email verified successfully! Please login.', 'success');
                    navigate('/login');
                }
            }
        } catch (error: any) {
            addToast(error.response?.data?.message || 'Invalid code', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="verify-container">
            <div className="verify-split">
                {/* Left Section - Hero */}
                <div className="verify-hero">
                    <div className="verify-hero-top">
                        <Shield size={24} />
                        <span>Placement Portal</span>
                    </div>

                    <div className="verify-hero-main">
                        <h1 className="verify-hero-title">
                            Verify Your<br />
                            Identity.
                        </h1>
                        <p className="verify-hero-description">
                            Protecting the integrity of our academic network through multi-factor authentication.
                        </p>
                    </div>

                    <div className="hero-bottom-badge">
                        <div className="badge-icon-box">
                            <Shield size={20} />
                        </div>
                        <div className="badge-text">
                            <span className="badge-title">Institutional Grade Security</span>
                            <span className="badge-subtitle">Standard encryption protocols active</span>
                        </div>
                    </div>
                </div>

                {/* Right Section - Content */}
                <div className="verify-form-section">
                    <motion.div 
                        className="verify-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h2 className="verify-card-title">Check your email</h2>
                        <p className="verify-card-description">
                            We've sent a 6-digit verification code to <strong>{email}</strong>. 
                            Please enter it below to continue.
                        </p>

                        <div className="otp-input-group">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    type="text"
                                    maxLength={1}
                                    className="otp-digit-input"
                                    value={digit}
                                    ref={(el) => { inputRefs.current[index] = el; }}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                />
                            ))}
                        </div>

                        <button 
                            className="verify-submit-btn" 
                            onClick={handleVerify}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Verifying...' : (
                                <>
                                    Verify Email
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>

                        <div className="resend-text">
                            Didn't receive a code? <button className="resend-btn">Resend Code</button>
                        </div>

                        <div className="it-support-footer">
                            <HelpCircle size={14} />
                            HAVING TROUBLE? CONTACT UNIVERSITY IT SUPPORT.
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Global Footer */}
            <footer className="verify-global-footer">
                <div>© 2024 UNIVERSITY PLACEMENT AUTHORITY. ALL RIGHTS RESERVED.</div>
                <div className="footer-nav">
                    <Link to="/privacy">PRIVACY POLICY</Link>
                    <Link to="/terms">TERMS OF SERVICE</Link>
                    <Link to="/accessibility">ACCESSIBILITY</Link>
                </div>
            </footer>
        </div>
    );
};

export default VerifyOTP;
