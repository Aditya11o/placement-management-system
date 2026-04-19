import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { Routes, Route, Navigate } from 'react-router-dom';
import GlobalLoader from './components/GlobalLoader';
import GlobalToastContainer from './components/GlobalToastContainer';
import ToastManager from './components/ToastManager';
import KeyboardShortcutsModal from './components/KeyboardShortcutsModal';
import OnboardingTour from './components/OnboardingTour';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import CommandPalette from './components/CommandPalette';
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const ForgotPassword = React.lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = React.lazy(() => import('./pages/ResetPassword'));
const Privacy = React.lazy(() => import('./pages/Privacy'));
const Terms = React.lazy(() => import('./pages/Terms'));
const Help = React.lazy(() => import('./pages/Help'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Support = React.lazy(() => import('./pages/student/Support'));
const JobFeed = React.lazy(() => import('./pages/student/JobFeed'));
const MyApplications = React.lazy(() => import('./pages/student/MyApplications'));
const InterviewSchedule = React.lazy(() => import('./pages/student/InterviewSchedule'));
const Notifications = React.lazy(() => import('./pages/student/Notifications'));
const Settings = React.lazy(() => import('./pages/student/Settings'));
const StudentProfile = React.lazy(() => import('./pages/student/Profile'));
const ResumeBuilder = React.lazy(() => import('./pages/student/ResumeBuilder'));
const ExploreCompanies = React.lazy(() => import('./pages/student/ExploreCompanies'));
const HelpSupport = React.lazy(() => import('./pages/student/HelpSupport'));
const Announcements = React.lazy(() => import('./pages/student/Announcements'));
const ResourceCategory = React.lazy(() => import('./pages/student/ResourceCategory'));
const PastPlacements = React.lazy(() => import('./pages/student/PastPlacements'));
const InterviewHistory = React.lazy(() => import('./pages/student/InterviewHistory'));
const ManageJobs = React.lazy(() => import('./pages/recruiter/ManageJobs'));
const AdminManageJobs = React.lazy(() => import('./pages/admin/ManageJobs'));
const InterviewPipeline = React.lazy(() => import('./pages/recruiter/InterviewPipeline'));
const Applicants = React.lazy(() => import('./pages/recruiter/Applicants'));
const RecruiterProfile = React.lazy(() => import('./pages/recruiter/Profile'));
const PostJob = React.lazy(() => import('./pages/recruiter/PostJob'));
const CompareCandidates = React.lazy(() => import('./pages/recruiter/CompareCandidates'));
const Shortlisted = React.lazy(() => import('./pages/recruiter/Shortlisted'));
const RecruiterInterviews = React.lazy(() => import('./pages/recruiter/InterviewSchedule'));
const RecruiterNotifications = React.lazy(() => import('./pages/recruiter/Notifications'));
const RecruiterSettings = React.lazy(() => import('./pages/recruiter/Settings'));
const RecruiterHelpSupport = React.lazy(() => import('./pages/recruiter/HelpSupport'));
const ManageStudents = React.lazy(() => import('./pages/admin/ManageStudents'));
const ManageRecruiters = React.lazy(() => import('./pages/admin/ManageRecruiters'));
const AdminManageApplications = React.lazy(() => import('./pages/admin/ManageApplications'));
const AdminManageInterviews = React.lazy(() => import('./pages/admin/ManageInterviews'));
const AdminReports = React.lazy(() => import('./pages/admin/Reports'));
const AdminManageNotifications = React.lazy(() => import('./pages/admin/ManageNotifications'));
const AdminSettings = React.lazy(() => import('./pages/admin/Settings'));
const AdminProfile = React.lazy(() => import('./pages/admin/Profile'));
const AdminManageDrives = React.lazy(() => import('./pages/admin/ManageDrives'));
const StudentDriveDetail = React.lazy(() => import('./pages/student/DriveDetail'));
const PlacementDrives = React.lazy(() => import('./pages/student/PlacementDrives'));

const App: React.FC = () => {
  const [isShortcutsOpen, setIsShortcutsOpen] = React.useState(false);

  useKeyboardShortcuts({
    onOpenHelp: () => setIsShortcutsOpen(true),
    onCloseAll: () => setIsShortcutsOpen(false)
  });

  return (
    <>
      <GlobalLoader />
      <GlobalToastContainer />
      <ToastManager />
      <CommandPalette />
      <OnboardingTour />
      <KeyboardShortcutsModal 
        isOpen={isShortcutsOpen} 
        onClose={() => setIsShortcutsOpen(false)} 
      />
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>}>
        <Routes>
          {/* Default Redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Public Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/help" element={<Help />} />
            <Route path="/chat" element={<Navigate to="/" replace />} />
          </Route>

          {/* Protected Dashboard Routes - Student */}
          <Route path="/student" element={<DashboardLayout role="student" />}>
            <Route path="dashboard" element={<Dashboard role="student" />} />
            <Route path="profile" element={<StudentProfile />} />
            <Route path="drives" element={<PlacementDrives />} />
            <Route path="drives/:id" element={<StudentDriveDetail />} />
            <Route path="jobs" element={<JobFeed />} />
            <Route path="applications" element={<MyApplications />} />
            <Route path="interviews" element={<InterviewSchedule />} />
            <Route path="interview-history" element={<InterviewHistory />} />
            <Route path="past-placements" element={<PastPlacements />} />
            <Route path="companies" element={<ExploreCompanies />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="announcements" element={<Announcements />} />
            <Route path="resources/:category" element={<ResourceCategory />} />
            <Route path="support" element={<Support />} />
            <Route path="help-support" element={<HelpSupport />} />
            <Route path="settings" element={<Settings />} />
            <Route path="resumes" element={<Navigate to="/student/settings?tab=resumes" replace />} />
            <Route path="resume-builder" element={<ResumeBuilder />} />
          </Route>

          <Route path="/recruiter" element={<DashboardLayout role="recruiter" />}>
            <Route path="dashboard" element={<Dashboard role="recruiter" />} />
            <Route path="profile" element={<RecruiterProfile />} />
            <Route path="post-job" element={<PostJob />} />
            <Route path="jobs" element={<ManageJobs />} />
            <Route path="pipeline" element={<InterviewPipeline />} />
            <Route path="applicants" element={<Applicants />} />
            <Route path="compare" element={<CompareCandidates />} />
            <Route path="shortlisted" element={<Shortlisted />} />
            <Route path="interviews" element={<RecruiterInterviews />} />
            <Route path="notifications" element={<RecruiterNotifications />} />
            <Route path="settings" element={<RecruiterSettings />} />
            <Route path="help-support" element={<RecruiterHelpSupport />} />
          </Route>

          {/* Protected Dashboard Routes - Admin */}
          <Route path="/admin" element={<DashboardLayout role="admin" />}>
            <Route path="dashboard" element={<Dashboard role="admin" />} />
            <Route path="profile" element={<AdminProfile />} />
            <Route path="students" element={<ManageStudents />} />
            <Route path="recruiters" element={<ManageRecruiters />} />
            <Route path="drives" element={<AdminManageDrives />} />
            <Route path="jobs" element={<AdminManageJobs />} />
            <Route path="applications" element={<AdminManageApplications />} />
            <Route path="interviews" element={<AdminManageInterviews />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="notifications" element={<AdminManageNotifications />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
