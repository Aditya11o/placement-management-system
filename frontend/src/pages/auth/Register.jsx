import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/Card/Card';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import { Mail, Lock, User, Briefcase, Phone, BookOpen, Building, MapPin } from 'lucide-react';
import './Login.css'; // Reusing auth-layout styles
import api from '../../services/api';

const Register = () => {
    const [role, setRole] = useState('STUDENT');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { addToast } = useToast();
    const navigate = useNavigate();

    // Unified state for both branch forms
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', phone: '',
        // Student specifics
        branch: '', cgpa: '', graduation_year: '', marks_10th: '', marks_12th: '', gender: 'MALE',
        // Recruiter specifics
        company_name: '', contact_person: '', industry: '', location: '', website: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRoleSelect = (selectedRole) => {
        setRole(selectedRole);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const endpoint = role === 'STUDENT' ? '/auth/register/student' : '/auth/register/recruiter';

            // Clean payload based on role
            const payload = { ...formData };
            if (role === 'STUDENT') {
                delete payload.company_name; delete payload.contact_person; delete payload.industry; delete payload.location; delete payload.website;
                payload.cgpa = parseFloat(payload.cgpa);
                payload.graduation_year = parseInt(payload.graduation_year, 10);
                payload.marks_10th = parseFloat(payload.marks_10th);
                payload.marks_12th = parseFloat(payload.marks_12th);
            } else {
                delete payload.name; delete payload.branch; delete payload.cgpa; delete payload.graduation_year; delete payload.marks_10th; delete payload.marks_12th; delete payload.gender;
            }

            const res = await api.post(endpoint, payload);

            if (res.data.success) {
                addToast('Registration successful! Please login pending approval.', 'success');
                navigate('/login');
            }
        } catch (error) {
            let errorMsg = error.response?.data?.message || 'Registration failed. Check inputs.';
            if (error.response?.data?.errors && error.response.data.errors.length > 0) {
                errorMsg = error.response.data.errors[0]; // Show the first specific validation error
            }
            addToast(errorMsg, 'error');
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

            <div className="auth-container" style={{ maxWidth: '600px' }}>
                <div className="auth-brand animate-fade-in">
                    <h1>Nexus</h1>
                    <p>Join the Placement Management System</p>
                </div>

                <Card className="auth-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
                    <h2 className="auth-title">Create Account</h2>
                    <p className="auth-subtitle">Select your account type to continue</p>

                    <form onSubmit={handleSubmit} className="auth-form">

                        <div className="role-selector">
                            <button
                                type="button"
                                className={`role-btn ${role === 'STUDENT' ? 'active' : ''}`}
                                onClick={() => handleRoleSelect('STUDENT')}
                            >
                                <User size={18} /> Student
                            </button>
                            <button
                                type="button"
                                className={`role-btn ${role === 'RECRUITER' ? 'active' : ''}`}
                                onClick={() => handleRoleSelect('RECRUITER')}
                            >
                                <Briefcase size={18} /> Recruiter
                            </button>
                        </div>

                        <div className="register-grid">
                            {/* ── COMMON FIELDS ── */}
                            <div className="form-group grid-full">
                                <Input icon={Mail} type="email" name="email" placeholder="Work/College Email address" value={formData.email} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <Input icon={Lock} type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required minLength={6} />
                            </div>
                            <div className="form-group">
                                <Input icon={Phone} type="text" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} required />
                            </div>

                            {/* ── STUDENT FIELDS ── */}
                            {role === 'STUDENT' && (
                                <>
                                    <div className="form-group grid-full">
                                        <Input icon={User} type="text" name="name" placeholder="Full Legal Name" value={formData.name} onChange={handleChange} required />
                                    </div>
                                    <div className="form-group">
                                        <Input icon={BookOpen} type="text" name="branch" placeholder="Branch (e.g. CSE)" value={formData.branch} onChange={handleChange} required />
                                    </div>
                                    <div className="form-group">
                                        <Input type="number" step="0.01" name="cgpa" placeholder="Current CGPA" value={formData.cgpa} onChange={handleChange} required />
                                    </div>
                                    <div className="form-group">
                                        <Input type="number" name="graduation_year" placeholder="Graduation Year" value={formData.graduation_year} onChange={handleChange} required />
                                    </div>
                                    <div className="form-group">
                                        <select name="gender" className="input-field" value={formData.gender} onChange={handleChange} style={{ height: '42px', marginBottom: '1rem' }} required>
                                            <option value="MALE">Male</option>
                                            <option value="FEMALE">Female</option>
                                            <option value="OTHER">Other</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <Input type="number" step="0.01" name="marks_10th" placeholder="10th Marks (%)" value={formData.marks_10th} onChange={handleChange} required />
                                    </div>
                                    <div className="form-group">
                                        <Input type="number" step="0.01" name="marks_12th" placeholder="12th Marks (%)" value={formData.marks_12th} onChange={handleChange} required />
                                    </div>
                                </>
                            )}

                            {/* ── RECRUITER FIELDS ── */}
                            {role === 'RECRUITER' && (
                                <>
                                    <div className="form-group grid-full">
                                        <Input icon={Building} type="text" name="company_name" placeholder="Company Name" value={formData.company_name} onChange={handleChange} required />
                                    </div>
                                    <div className="form-group">
                                        <Input icon={User} type="text" name="contact_person" placeholder="Contact Person Name" value={formData.contact_person} onChange={handleChange} required />
                                    </div>
                                    <div className="form-group">
                                        <Input type="text" name="industry" placeholder="Industry (e.g. IT, Auto)" value={formData.industry} onChange={handleChange} required />
                                    </div>
                                    <div className="form-group grid-full">
                                        <Input icon={MapPin} type="text" name="location" placeholder="HQ Location" value={formData.location} onChange={handleChange} required />
                                    </div>
                                    <div className="form-group grid-full">
                                        <Input type="url" name="website" placeholder="Company Website URL" value={formData.website} onChange={handleChange} required />
                                    </div>
                                </>
                            )}
                        </div>

                        <Button type="submit" isFullWidth isLoading={isSubmitting} style={{ marginTop: '1rem' }}>
                            Register Account
                        </Button>
                    </form>

                    <div className="auth-footer">
                        <p>Already have an account? <Link to="/login">Sign in here</Link></p>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Register;
