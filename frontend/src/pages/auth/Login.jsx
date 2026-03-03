import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/Card/Card';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import { Mail, Lock, User, Briefcase, Shield } from 'lucide-react';
import './Login.css';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '', role: 'STUDENT' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRoleSelect = (role) => {
        setFormData({ ...formData, role });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const role = await login(formData);
            addToast('Successfully logged in!', 'success');

            // Redirect based on role
            if (role === 'STUDENT') navigate('/student/dashboard');
            else if (role === 'RECRUITER') navigate('/recruiter/dashboard');
            else navigate('/admin/dashboard');

        } catch (error) {
            addToast(error.response?.data?.message || 'Login failed', 'error');
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
                    <p>Placement Management System</p>
                </div>

                <Card className="auth-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
                    <h2 className="auth-title">Welcome Back</h2>
                    <p className="auth-subtitle">Sign in to your account</p>

                    <form onSubmit={handleSubmit} className="auth-form">

                        <div className="role-selector">
                            <button
                                type="button"
                                className={`role-btn ${formData.role === 'STUDENT' ? 'active' : ''}`}
                                onClick={() => handleRoleSelect('STUDENT')}
                            >
                                <User size={18} /> Student
                            </button>
                            <button
                                type="button"
                                className={`role-btn ${formData.role === 'RECRUITER' ? 'active' : ''}`}
                                onClick={() => handleRoleSelect('RECRUITER')}
                            >
                                <Briefcase size={18} /> Recruiter
                            </button>
                            <button
                                type="button"
                                className={`role-btn ${formData.role === 'ADMIN' ? 'active' : ''}`}
                                onClick={() => handleRoleSelect('ADMIN')}
                            >
                                <Shield size={18} /> Admin
                            </button>
                        </div>

                        <Input
                            icon={Mail}
                            type="email"
                            name="email"
                            placeholder="Email address"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />

                        <Input
                            icon={Lock}
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />

                        <div className="auth-actions">
                            <label className="remember-me">
                                <input type="checkbox" /> Remember me
                            </label>
                            <Link to="/forgot-password" className="forgot-pass-link">Forgot password?</Link>
                        </div>

                        <Button type="submit" isFullWidth isLoading={isSubmitting}>
                            Sign In
                        </Button>
                    </form>

                    {formData.role !== 'ADMIN' && (
                        <div className="auth-footer">
                            <p>Don't have an account? <Link to="/register">Create one</Link></p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default Login;
