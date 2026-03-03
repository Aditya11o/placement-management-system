import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/Card/Card';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import './Login.css'; // Reusing auth-layout styles
import api from '../../services/api';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const { addToast } = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await api.post('/auth/forgot-password', { email });
            setIsSent(true);
            addToast('Password reset link sent to your email', 'success');
        } catch (error) {
            addToast(error.response?.data?.message || 'Failed to send reset link', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="auth-layout">
            <div className="auth-background-shapes">
                <div className="shape shape-1"></div>
                <div className="shape shape-2"></div>
            </div>

            <div className="auth-container">
                <div className="auth-brand animate-fade-in">
                    <h1>Nexus</h1>
                </div>

                <Card className="auth-card animate-fade-in" style={{ animationDelay: '0.1s' }}>

                    {isSent ? (
                        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                            <CheckCircle size={48} color="var(--color-success)" style={{ margin: '0 auto 1rem' }} />
                            <h2 className="auth-title">Check your email</h2>
                            <p className="auth-subtitle" style={{ marginBottom: '1.5rem' }}>
                                We've sent password reset instructions to <strong>{email}</strong>
                            </p>
                            <Link to="/login" style={{ textDecoration: 'none' }}>
                                <Button isFullWidth variant="secondary">Return to Login</Button>
                            </Link>
                        </div>
                    ) : (
                        <>
                            <h2 className="auth-title">Reset Password</h2>
                            <p className="auth-subtitle">Enter your email and we'll send a reset link.</p>

                            <form onSubmit={handleSubmit} className="auth-form">
                                <Input
                                    icon={Mail}
                                    type="email"
                                    name="email"
                                    placeholder="Email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />

                                <Button type="submit" isFullWidth isLoading={isSubmitting} style={{ marginTop: '0.5rem' }}>
                                    Send Reset Link
                                </Button>
                            </form>

                            <div className="auth-footer" style={{ marginTop: '2rem' }}>
                                <Link to="/login" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
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
