import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/Card/Card';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import Loader from '../../components/Loader/Loader';
import { User, BookOpen, Edit2, Code, Plus, X } from 'lucide-react';
import './Profile.css';
import api from '../../services/api';

const StudentProfile = () => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [profile, setProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [newSkill, setNewSkill] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/students/profile');
            setProfile(res.data.data);
        } catch (error) {
            addToast('Failed to load profile details', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleAddSkill = () => {
        if (!newSkill.trim()) return;
        if (profile.skills.includes(newSkill.trim())) {
            addToast('Skill already added', 'info');
            return;
        }
        setProfile({ ...profile, skills: [...profile.skills, newSkill.trim()] });
        setNewSkill('');
    };

    const handleRemoveSkill = (skillToRemove) => {
        setProfile({ ...profile, skills: profile.skills.filter(s => s !== skillToRemove) });
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Clean up fields that shouldn't be updated directly via this endpoint
            const { _id, user: userId, createdAt, updatedAt, __v, is_approved, ...updateData } = profile;
            await api.put('/students/profile', updateData);

            addToast('Profile updated successfully!', 'success');
            setIsEditing(false);
            fetchProfile(); // refresh data
        } catch (error) {
            addToast(error.response?.data?.message || 'Failed to update profile', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <Loader />;

    return (
        <div className="profile-container animate-fade-in">

            <div className="profile-header-flex">
                <div>
                    <h1 className="page-heading">My Profile</h1>
                    <p className="page-subheading">Manage your academic details and skill sets.</p>
                </div>
                {!isEditing ? (
                    <Button icon={Edit2} onClick={() => setIsEditing(true)}>Edit Profile</Button>
                ) : (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Button variant="ghost" onClick={() => { setIsEditing(false); fetchProfile(); }}>Cancel</Button>
                        <Button variant="primary" onClick={handleSave} isLoading={isSaving}>Save Changes</Button>
                    </div>
                )}
            </div>

            <div className="profile-grid">
                {/* Personal Details */}
                <Card className="profile-card">
                    <div className="card-header-icon">
                        <User className="icon-blue" size={24} />
                        <h2>Personal Details</h2>
                    </div>

                    <div className="form-grid">
                        {/* Name is locked to User model mostly, but showing for context */}
                        <div className="form-group grid-full">
                            <label className="text-muted">Full Name</label>
                            <p className="fw-600">{user?.name}</p>
                        </div>
                        <div className="form-group grid-full">
                            <label className="text-muted">Email Address</label>
                            <p className="fw-600">{user?.email}</p>
                        </div>
                    </div>
                </Card>

                {/* Academic Details */}
                <Card className="profile-card">
                    <div className="card-header-icon">
                        <BookOpen className="icon-purple" size={24} />
                        <h2>Academic History</h2>
                    </div>

                    <div className="form-grid">
                        <div className="form-group grid-full">
                            <Input label="Branch" name="branch" value={profile?.branch || ''} onChange={handleChange} disabled={!isEditing} />
                        </div>
                        <div className="form-group">
                            <Input label="Current CGPA" type="number" step="0.01" name="cgpa" value={profile?.cgpa || ''} onChange={handleChange} disabled={!isEditing} />
                        </div>
                        <div className="form-group">
                            <Input label="Graduation Year" type="number" name="graduation_year" value={profile?.graduation_year || ''} onChange={handleChange} disabled={!isEditing} />
                        </div>
                        <div className="form-group">
                            <Input label="10th Marks (%)" type="number" step="0.01" name="marks_10th" value={profile?.marks_10th || ''} onChange={handleChange} disabled={!isEditing} />
                        </div>
                        <div className="form-group">
                            <Input label="12th Marks (%)" type="number" step="0.01" name="marks_12th" value={profile?.marks_12th || ''} onChange={handleChange} disabled={!isEditing} />
                        </div>
                    </div>
                </Card>

                {/* Skills Management */}
                <Card className="profile-card grid-full-col">
                    <div className="card-header-icon">
                        <Code className="icon-orange" size={24} />
                        <h2>Technical Skills</h2>
                    </div>
                    <p className="text-muted mb-4">Add relevant skills to improve your AI Job Matching score.</p>

                    <div className="skills-container">
                        {profile?.skills?.map((skill, index) => (
                            <div key={index} className="skill-pill">
                                {skill}
                                {isEditing && (
                                    <button className="skill-remove" onClick={() => handleRemoveSkill(skill)}>
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                        ))}
                        {profile?.skills?.length === 0 && !isEditing && (
                            <p className="text-muted">No skills added yet.</p>
                        )}
                    </div>

                    {isEditing && (
                        <div className="add-skill-wrapper mt-4">
                            <Input
                                placeholder="e.g. React.js, Python, AWS"
                                value={newSkill}
                                onChange={(e) => setNewSkill(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                                fullWidth={false}
                                style={{ width: '250px' }}
                            />
                            <Button type="button" variant="secondary" onClick={handleAddSkill} icon={Plus}>Add</Button>
                        </div>
                    )}
                </Card>

            </div>
        </div>
    );
};

export default StudentProfile;
