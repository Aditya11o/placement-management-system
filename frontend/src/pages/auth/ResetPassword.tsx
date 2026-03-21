import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ShieldCheck, Check, GraduationCap } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';
import api from '../../services/api';
import './ResetPassword.css';

const ResetPassword = () => {
    const { resetToken } = useParams();
    const navigate = useNavigate();
    const { addToast } = useToast();
    const { institutionName, logoUrl } = useTheme();

    const [passwords, setPasswords] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (passwords.newPassword !== passwords.confirmPassword) {
            addToast('Passwords do not match', 'error');
            return;
        }

        if (passwords.newPassword.length < 6) {
            addToast('Password must be at least 6 characters', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await api.post(`/auth/reset-password/${resetToken}`, {
                password: passwords.newPassword
            });
            
            if (res.data.success) {
                addToast('Password reset successful!', 'success');
                setTimeout(() => navigate('/login'), 2000);
            }
        } catch (error: any) {
            addToast(error.response?.data?.message || 'Failed to reset password', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="reset-container">
            {/* Top Navigation */}
            <header className="reset-nav">
                <div className="reset-nav-brand">
                    <span>{institutionName || 'Placement Portal'}</span>
                </div>
                <div className="reset-nav-links">
                    <Link to="/help" className="reset-nav-link">Help Center</Link>
                    <Link to="/support" className="support-btn">Support</Link>
                </div>
            </header>

            <div className="reset-split">
                {/* Left Section - Hero */}
                <div className="reset-hero">
                    <div className="secure-badge">
                        <ShieldCheck size={14} />
                        SECURE ACCESS
                    </div>
                    
                    <h1 className="reset-hero-title">
                        Update Your<br />
                        Credentials.
                    </h1>
                    
                    <p className="reset-hero-description">
                        Maintain the integrity of your academic profile with professional-grade 
                        security protocols. Your new credentials ensure continued access 
                        to global placement opportunities.
                    </p>

                    <div className="graduates-stat">
                        <div className="avatar-group">
                            <div className="avatar"><img src="https://i.pravatar.cc/150?u=1" alt="Avatar" /></div>
                            <div className="avatar"><img src="https://i.pravatar.cc/150?u=2" alt="Avatar" /></div>
                            <div className="avatar"><img src="https://i.pravatar.cc/150?u=3" alt="Avatar" /></div>
                        </div>
                        <span className="stat-text">Joined by <strong>12,000+</strong> graduates this year.</span>
                    </div>
                </div>

                {/* Right Section - Form */}
                <div className="reset-form-section">
                    <motion.div 
                        className="reset-card"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <h2 className="reset-card-title">Reset Password</h2>
                        <p className="reset-card-description">
                            Please choose a unique password to secure your university account.
                        </p>

                        <form onSubmit={handleSubmit}>
                            <div className="reset-form-group">
                                <label className="reset-label">NEW PASSWORD</label>
                                <div className="reset-input-wrapper">
                                    <input 
                                        type={showPassword ? 'text' : 'password'} 
                                        className="reset-input"
                                        placeholder="••••••••••••"
                                        value={passwords.newPassword}
                                        onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                                        required
                                    />
                                    <button 
                                        type="button" 
                                        className="visibility-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className="reset-form-group">
                                <label className="reset-label">CONFIRM NEW PASSWORD</label>
                                <div className="reset-input-wrapper">
                                    <input 
                                        type={showConfirmPassword ? 'text' : 'password'} 
                                        className="reset-input"
                                        placeholder="••••••••••••"
                                        value={passwords.confirmPassword}
                                        onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                                        required
                                    />
                                    <button 
                                        type="button" 
                                        className="visibility-toggle"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <button type="submit" className="reset-submit-btn" disabled={isSubmitting}>
                                {isSubmitting ? 'Updating...' : 'Reset Password'}
                            </button>
                        </form>

                        <div className="divider"></div>

                        <div className="security-standards">
                            <h3 className="security-title">SECURITY STANDARDS</h3>
                            <div className="standard-item">
                                <div className="check-icon"><Check size={10} /></div>
                                At least 12 characters recommended
                            </div>
                            <div className="standard-item">
                                <div className="check-icon"><Check size={10} /></div>
                                Include numbers and special symbols
                            </div>
                        </div>

                        <Link to="/login" className="back-to-login-centered">Back to Login</Link>
                    </motion.div>
                </div>
            </div>

            {/* Sticky Footer */}
            <footer className="reset-footer">
                <div className="footer-left">
                    <span className="footer-brand">{institutionName || 'Placement Portal'}</span>
                    <span className="footer-copyright">© 2024 University Placement Authority. ISO 27001 Certified Security.</span>
                </div>
                <div className="footer-right">
                    <Link to="/privacy" className="footer-link">Privacy Policy</Link>
                    <Link to="/security" className="footer-link">Security Standards</Link>
                    <Link to="/terms" className="footer-link">Terms of Service</Link>
                </div>
            </footer>
        </div>
    );
};

export default ResetPassword;
