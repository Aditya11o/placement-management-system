import React, { useState, useEffect } from 'react';

import api from '../../api';
import { useAutosave } from '../../hooks/useAutosave';
import ProfileSkeleton from '../../components/skeletons/ProfileSkeleton';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

// Sub-components
import ProfileHeader from '../../components/profile/ProfileHeader';
import AcademicCard from '../../components/profile/AcademicCard';
import PersonalInfoSection from '../../components/profile/PersonalInfoSection';
import AcademicInfoSection from '../../components/profile/AcademicInfoSection';
import SkillsProjectsSection from '../../components/profile/SkillsProjectsSection';
import ResumeSection from '../../components/profile/ResumeSection';
import SecuritySection from '../../components/profile/SecuritySection';
import AlumniBanner from '../../components/profile/AlumniBanner';
import AddProjectModal from '../../components/profile/AddProjectModal';
import UploadResumeModal from '../../components/profile/UploadResumeModal';

const Profile: React.FC = () => {
  const { showSuccess, showError } = useNotification();
  const { refreshUser, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const { clearAutosave } = useAutosave('student-profile', profile, setProfile);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/profile/me');
      setProfile(data);
      setSkills(data.skills || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      const profileData = { ...profile, skills };
      formData.append('studentDetails', JSON.stringify(profileData));
      
      if (selectedFile) {
        formData.append('avatar', selectedFile);
      }

      const response = await api.put('/profile', formData);

      if (response.data.success) {
        showSuccess(response.data.message || 'Profile updated successfully!', 'Profile Update');
        setSelectedFile(null);
        setPreviewUrl(null);
        clearAutosave();
        await refreshUser();
        await fetchProfile();
      } else {
        showError(response.data.message || 'Failed to update profile', 'Update Error');
      }
    } catch (err: any) {
      console.error(err);
      showError(err.response?.data?.message || 'Failed to update profile', 'Update Error');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showError('File size must be less than 2MB', 'File Too Large');
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newSkill.trim()) {
      e.preventDefault();
      if (!skills.includes(newSkill.trim())) {
        setSkills([...skills, newSkill.trim()]);
      }
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleInputChange = (field: string, value: any) => {
    setProfile({ ...profile, [field]: value });
  };

  const handleRequestVerification = async (skill: string) => {
    const certificateUrl = prompt(`Enter certificate URL for ${skill}:`);
    if (!certificateUrl) return;
    try {
      await api.post('/profile/verify-skill', { skill, certificateUrl });
      fetchProfile();
      showSuccess('Verification request sent successfully!', 'Verification');
    } catch (err: any) {
      console.error(err);
      showError('Failed to send verification request.', 'Verification Error');
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await api.delete(`/profile/projects/${projectId}`);
        showSuccess('Project deleted successfully!', 'Success');
        fetchProfile();
      } catch (err: any) {
        showError(err.response?.data?.message || 'Failed to delete project', 'Error');
      }
    }
  };

  const handleJoinAlumni = async () => {
    if (confirm('Join the Alumni program to share your industry experience?')) {
      try {
        await api.put('/profile', { role: 'alumni' });
        showSuccess('Welcome to the Alumni Network! Please relogin to access your new portal.', 'Program Joined');
        setTimeout(async () => {
          await logout();
          window.location.href = '/login';
        }, 2000);
      } catch (err: any) {
        showError(err.response?.data?.message || 'Failed to join program', 'Enrollment Error');
      }
    }
  };

  const handleApplyMentor = async () => {
    if (confirm('Become a Certified Mentor? This requires a quick profile review by admins.')) {
      try {
        await api.put('/profile', { role: 'mentor' });
        showSuccess('Mentor request sent! Our team will review your profile shortly.', 'Request Submitted');
      } catch (err: any) {
        showError(err.response?.data?.message || 'Failed to submit request', 'Request Error');
      }
    }
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  const student = profile || {};

  return (
    <div className="animate-fade-in pb-12">
      <div className="grid grid-cols-12 gap-6">
        
        {/* Row 1: Profile Header & Performance */}
        <ProfileHeader
          profile={profile}
          previewUrl={previewUrl}
          skills={skills}
          fileInputRef={fileInputRef}
          onFileChange={handleFileChange}
          onSave={handleUpdate}
        />
        <AcademicCard student={student} />

        {/* Row 2: Personal & Academic Info */}
        <PersonalInfoSection
          profile={profile}
          student={student}
          onChange={handleInputChange}
        />
        <AcademicInfoSection
          student={student}
          onChange={handleInputChange}
        />

        {/* Row 3: Skills & Projects */}
        <SkillsProjectsSection
          skills={skills}
          newSkill={newSkill}
          student={student}
          onNewSkillChange={setNewSkill}
          onAddSkill={addSkill}
          onRemoveSkill={removeSkill}
          onVerify={handleRequestVerification}
          onEditProject={(project) => {
            setEditingProject(project);
            setIsProjectModalOpen(true);
          }}
          onDeleteProject={handleDeleteProject}
          onAddProject={() => setIsProjectModalOpen(true)}
        />

        {/* Row 4: Resume & Security */}
        <ResumeSection
          student={student}
          onUploadClick={() => setIsResumeModalOpen(true)}
        />
        <SecuritySection />

        {/* Graduation & Mentorship (Conditional) */}
        <AlumniBanner
          student={student}
          onJoinAlumni={handleJoinAlumni}
          onApplyMentor={handleApplyMentor}
        />

      </div>
      
      {/* Bottom Padding for scroll space */}
      <div className="h-12"></div>

      {/* Modals */}
      <AddProjectModal 
        isOpen={isProjectModalOpen} 
        onClose={() => {
          setIsProjectModalOpen(false);
          setEditingProject(null);
        }} 
        onSuccess={fetchProfile} 
        project={editingProject}
      />
      <UploadResumeModal 
        isOpen={isResumeModalOpen} 
        onClose={() => setIsResumeModalOpen(false)} 
        onSuccess={fetchProfile} 
      />
    </div>
  );
};

export default Profile;
