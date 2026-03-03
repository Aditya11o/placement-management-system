import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/Card/Card';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import { Lock, ArrowLeft } from 'lucide-react';
import './Login.css'; // Reusing auth-layout styles
import api from '../../services/api';

const ResetPassword = () => {
    const { resetToken } = useParams();
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { addToast } = useToast();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== passwordConfirm) {
            addToast('Passwords do not match', 'warning');
            return;
        }

        setIsSubmitting(true);
        try {
            // Typically backend handles this via PUT to /auth/reset-password/:token
            await api.put(`/auth/reset-password/${resetToken}`, { password });
            addToast('Password successfully reset. You can now log in.', 'success');
            navigate('/login');
        } catch (error) {
            addToast(error.response?.data?.message || 'Invalid or expired token', 'error');
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
                    <h2 className="auth-title">Create New Password</h2>
                    <p className="auth-subtitle">Enter your new strong password below.</p>

                    <form onSubmit={handleSubmit} className="auth-form">
                        <Input
                            icon={Lock}
                            type="password"
                            name="password"
                            placeholder="New Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                        />

                        <Input
                            icon={Lock}
                            type="password"
                            name="passwordConfirm"
                            placeholder="Confirm New Password"
                            value={passwordConfirm}
                            onChange={(e) => setPasswordConfirm(e.target.value)}
                            required
                            minLength={6}
                        />

                        <Button type="submit" isFullWidth isLoading={isSubmitting} style={{ marginTop: '0.5rem' }}>
                            Save Password
                        </Button>
                    </form>

                    <div className="auth-footer" style={{ marginTop: '2rem' }}>
                        <Link to="/login" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            <ArrowLeft size={16} /> Back to Sign In
                        </Link>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default ResetPassword;
