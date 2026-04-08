import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import ErrorBoundary from './components/ErrorBoundary';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { NotificationProvider } from './context/NotificationContext';
import { LoadingProvider } from './context/LoadingContext';
import GlobalLoader from './components/GlobalLoader';
import NotificationModal from './components/NotificationModal';
import { AuthProvider } from './context/AuthContext';
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
const AlumniPortal = React.lazy(() => import('./pages/alumni/AlumniPortal'));
const JobFeed = React.lazy(() => import('./pages/student/JobFeed'));
const MyApplications = React.lazy(() => import('./pages/student/MyApplications'));
const Watchlist = React.lazy(() => import('./pages/student/Watchlist'));
const InterviewSchedule = React.lazy(() => import('./pages/student/InterviewSchedule'));
const Notifications = React.lazy(() => import('./pages/student/Notifications'));
const CareerResources = React.lazy(() => import('./pages/student/CareerResources'));
const Settings = React.lazy(() => import('./pages/student/Settings'));
const StudentProfile = React.lazy(() => import('./pages/student/Profile'));
const ResumeBuilder = React.lazy(() => import('./pages/student/ResumeBuilder'));

const MockInterviews = React.lazy(() => import('./pages/student/MockInterviews'));
const HelpSupport = React.lazy(() => import('./pages/student/HelpSupport'));
const Announcements = React.lazy(() => import('./pages/student/Announcements'));
const ResourceCategory = React.lazy(() => import('./pages/student/ResourceCategory'));
const InterviewHistory = React.lazy(() => import('./pages/student/InterviewHistory'));
const ExperienceForum = React.lazy(() => import('./pages/student/ExperienceForum'));
const CreateExperience = React.lazy(() => import('./pages/student/CreateExperience'));
const ExperienceDetail = React.lazy(() => import('./pages/student/ExperienceDetail'));
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
const Chat = React.lazy(() => import('./pages/Chat'));
const ManageVerifications = React.lazy(() => import('./pages/admin/ManageVerifications'));
const AuditLogs = React.lazy(() => import('./pages/admin/AuditLogs'));
const AdminManageExperiences = React.lazy(() => import('./pages/admin/ManageExperiences'));
import ToastManager from './components/ToastManager';
const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <LoadingProvider>
        <NotificationProvider>
          <AuthProvider>
            <BrowserRouter>
              <GlobalLoader />
              <NotificationModal />
              <ToastManager />
              <CommandPalette />
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
            <Route path="jobs" element={<JobFeed />} />
            <Route path="watchlist" element={<Watchlist />} />
            <Route path="applications" element={<MyApplications />} />
            <Route path="interviews" element={<InterviewSchedule />} />
            <Route path="interview-history" element={<InterviewHistory />} />
            <Route path="resources" element={<CareerResources />} />

            <Route path="mock-interviews" element={<MockInterviews />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="announcements" element={<Announcements />} />
            <Route path="resources/:category" element={<ResourceCategory />} />
            <Route path="alumni" element={<Navigate to="/student/settings?tab=alumni" replace />} />
            <Route path="support" element={<Support />} />
            <Route path="help-support" element={<HelpSupport />} />
            <Route path="settings" element={<Settings />} />
            <Route path="resumes" element={<Navigate to="/student/settings?tab=resumes" replace />} />
            <Route path="resume-builder" element={<ResumeBuilder />} />
            <Route path="experiences" element={<ExperienceForum />} />
            <Route path="experiences/create" element={<CreateExperience />} />
            <Route path="experiences/:id" element={<ExperienceDetail />} />
            <Route path="chat" element={<Chat />} />
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
        <Route path="chat" element={<Chat />} />
      </Route>

          {/* Protected Dashboard Routes - Admin */}
          <Route path="/admin" element={<DashboardLayout role="admin" />}>
            <Route path="dashboard" element={<Dashboard role="admin" />} />
            <Route path="profile" element={<AdminProfile />} />
            <Route path="students" element={<ManageStudents />} />
            <Route path="verifications" element={<ManageVerifications />} />
            <Route path="recruiters" element={<ManageRecruiters />} />
            <Route path="jobs" element={<AdminManageJobs />} />
            <Route path="applications" element={<AdminManageApplications />} />
            <Route path="interviews" element={<AdminManageInterviews />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="notifications" element={<AdminManageNotifications />} />
            <Route path="audit" element={<AuditLogs />} />
            <Route path="experiences" element={<AdminManageExperiences />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="chat" element={<Chat />} />
          </Route>

      {/* Protected Dashboard Routes - Alumni & Mentor */}
      <Route path="/alumni" element={<DashboardLayout role="alumni" />}>
        <Route path="dashboard" element={<AlumniPortal />} />
        <Route path="settings" element={<Settings />} />
        <Route path="chat" element={<Chat />} />
      </Route>

      <Route path="/mentor" element={<DashboardLayout role="mentor" />}>
        <Route path="dashboard" element={<AlumniPortal />} />
        <Route path="settings" element={<Settings />} />
        <Route path="chat" element={<Chat />} />
      </Route>
            </Routes>
          </Suspense>
              </BrowserRouter>
            </AuthProvider>
          </NotificationProvider>
        </LoadingProvider>
      </ErrorBoundary>
  );
}

export default App;
