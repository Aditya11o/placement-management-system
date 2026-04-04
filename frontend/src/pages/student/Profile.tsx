import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, ArrowLeft, Save, 
  User, BookOpen, Cpu, ShieldCheck
} from 'lucide-react';
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
import FormStepper from '../../components/FormStepper';

const Profile: React.FC = () => {
  const { showSuccess, showError } = useNotification();
  const { refreshUser, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
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

  const steps = [
    { id: 1, label: 'Identity', description: 'Basic overview' },
    { id: 2, label: 'Academic', description: 'Education details' },
    { id: 3, label: 'Portfolio', description: 'Skills & projects' },
    { id: 4, label: 'Assets', description: 'Documents & security' }
  ];

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
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase tracking-tighter italic">
            Student <span className="text-blue-600">Profile</span>
          </h1>
          <p className="text-[13px] font-bold text-gray-400 mt-1 uppercase tracking-widest italic opacity-70">
            Lifecycle management of your academic and professional credentials.
          </p>
        </div>
        <button 
          onClick={handleUpdate}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/10 active:scale-95 disabled:opacity-50"
        >
          <Save size={16} /> Save Changes
        </button>
      </div>

      {/* Stepper Navigation */}
      <div className="bg-white border border-gray-100 rounded-[2rem] p-4 shadow-sm mb-8">
        <FormStepper steps={steps} currentStep={currentStep} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Wizard Main Content */}
        <div className="col-span-1 md:col-span-12 space-y-8">
          
          <div className="bg-white border border-gray-100 rounded-[2.5rem] p-6 md:p-10 shadow-sm relative overflow-hidden">
            
            {/* Step Header */}
            <div className="mb-10 flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-900 shadow-inner">
                {currentStep === 1 && <User size={24} />}
                {currentStep === 2 && <BookOpen size={24} />}
                {currentStep === 3 && <Cpu size={24} />}
                {currentStep === 4 && <ShieldCheck size={24} />}
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">{steps[currentStep-1].label}</h2>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{steps[currentStep-1].description}</p>
              </div>
            </div>

            {/* Steps Mapping */}
            <div className="min-h-[400px]">
              {currentStep === 1 && (
                <div className="grid grid-cols-12 gap-8 animate-in fade-in slide-in-from-right-4 duration-500">
                  <ProfileHeader
                    profile={profile}
                    previewUrl={previewUrl}
                    skills={skills}
                    fileInputRef={fileInputRef}
                    onFileChange={handleFileChange}
                    onSave={handleUpdate}
                    className="col-span-12"
                  />
                  <div className="col-span-12">
                    <PersonalInfoSection
                      profile={profile}
                      student={student}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="grid grid-cols-12 gap-8 animate-in fade-in slide-in-from-right-4 duration-500">
                  <AcademicCard student={student} className="col-span-12" />
                  <div className="col-span-12">
                    <AcademicInfoSection
                      student={student}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
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
                </div>
              )}

              {currentStep === 4 && (
                <div className="grid grid-cols-12 gap-8 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="col-span-12 lg:col-span-7">
                    <ResumeSection
                      student={student}
                      onUploadClick={() => setIsResumeModalOpen(true)}
                    />
                  </div>
                  <div className="col-span-12 lg:col-span-5">
                    <SecuritySection />
                  </div>
                  <div className="col-span-12">
                    <AlumniBanner
                      student={student}
                      onJoinAlumni={handleJoinAlumni}
                      onApplyMentor={handleApplyMentor}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Controls */}
            <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-50 gap-4">
              <button
                disabled={currentStep === 1}
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="flex items-center gap-2 px-6 py-3 border-2 border-gray-100 text-gray-400 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
              >
                <ArrowLeft size={16} /> Previous
              </button>
              
              {currentStep < steps.length ? (
                <button
                  onClick={() => {
                    setCurrentStep(prev => prev + 1);
                    window.scrollTo(0, 0);
                  }}
                  className="flex items-center gap-2 px-8 py-3.5 bg-blue-600 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 active:scale-95"
                >
                  Next Step <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  onClick={handleUpdate}
                  disabled={loading}
                  className="flex items-center gap-2 px-10 py-3.5 bg-[#000613] text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl shadow-black/20 active:scale-95"
                >
                  Confirm Profile Updates <Save size={16} />
                </button>
              )}
            </div>

          </div>
        </div>
      </div>
      
      {/* Bottom Padding */}
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
