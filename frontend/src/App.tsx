import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { NotificationProvider } from './context/NotificationContext';
import NotificationModal from './components/NotificationModal';
import { AuthProvider } from './context/AuthContext';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Help from './pages/Help';
import Dashboard from './pages/Dashboard';
import Support from './pages/student/Support';
import AlumniPortal from './pages/alumni/AlumniPortal';
import JobFeed from './pages/student/JobFeed';
import MyApplications from './pages/student/MyApplications';
import InterviewSchedule from './pages/student/InterviewSchedule';
import Notifications from './pages/student/Notifications';
import CareerResources from './pages/student/CareerResources';
import Settings from './pages/student/Settings';
import StudentProfile from './pages/student/Profile';

import MockInterviews from './pages/student/MockInterviews';
import HelpSupport from './pages/student/HelpSupport';
import ComingSoon from './pages/ComingSoon';
import InterviewHistory from './pages/student/InterviewHistory';
import ManageJobs from './pages/recruiter/ManageJobs';
import AdminManageJobs from './pages/admin/ManageJobs';
import Applicants from './pages/recruiter/Applicants';
import RecruiterProfile from './pages/recruiter/Profile';
import PostJob from './pages/recruiter/PostJob';
import CompareCandidates from './pages/recruiter/CompareCandidates';
import Shortlisted from './pages/recruiter/Shortlisted';
import RecruiterInterviews from './pages/recruiter/InterviewSchedule';
import RecruiterNotifications from './pages/recruiter/Notifications';
import RecruiterSettings from './pages/recruiter/Settings';
import ManageStudents from './pages/admin/ManageStudents';
import ManageRecruiters from './pages/admin/ManageRecruiters';
import AdminManageApplications from './pages/admin/ManageApplications';
import AdminManageInterviews from './pages/admin/ManageInterviews';
import AdminReports from './pages/admin/Reports';
import AdminManageNotifications from './pages/admin/ManageNotifications';
import AdminSettings from './pages/admin/Settings';
import AdminProfile from './pages/admin/Profile';
import Chat from './pages/Chat';
import ManageVerifications from './pages/admin/ManageVerifications';
import AuditLogs from './pages/admin/AuditLogs';
import ToastManager from './components/ToastManager';
const App: React.FC = () => {
  return (
    <NotificationProvider>
      <AuthProvider>
        <BrowserRouter>
          <NotificationModal />
          <ToastManager />
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
            <Route path="applications" element={<MyApplications />} />
            <Route path="interviews" element={<InterviewSchedule />} />
            <Route path="interview-history" element={<InterviewHistory />} />
            <Route path="resources" element={<CareerResources />} />

            <Route path="mock-interviews" element={<MockInterviews />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="announcements" element={<ComingSoon featureName="Announcements" />} />
            <Route path="resources/all" element={<ComingSoon featureName="All Resources" />} />
            <Route path="resources/technical" element={<ComingSoon featureName="Technical Preparation" />} />
            <Route path="resources/hr" element={<ComingSoon featureName="HR Interview Questions" />} />
            <Route path="resources/aptitude" element={<ComingSoon featureName="Aptitude Preparation" />} />
            <Route path="resources/gd" element={<ComingSoon featureName="Group Discussion" />} />
            <Route path="support" element={<Support />} />
            <Route path="help-support" element={<HelpSupport />} />
            <Route path="interview-guide" element={<ComingSoon featureName="Interview Guide" />} />
            <Route path="package-stats" element={<ComingSoon featureName="Package Stats" />} />
            <Route path="settings" element={<Settings />} />
            <Route path="chat" element={<Chat />} />
          </Route>

      <Route path="/recruiter" element={<DashboardLayout role="recruiter" />}>
        <Route path="dashboard" element={<Dashboard role="recruiter" />} />
        <Route path="profile" element={<RecruiterProfile />} />
        <Route path="post-job" element={<PostJob />} />
        <Route path="jobs" element={<ManageJobs />} />
        <Route path="applicants" element={<Applicants />} />
        <Route path="compare" element={<CompareCandidates />} />
        <Route path="shortlisted" element={<Shortlisted />} />
        <Route path="interviews" element={<RecruiterInterviews />} />
        <Route path="notifications" element={<RecruiterNotifications />} />
        <Route path="settings" element={<RecruiterSettings />} />
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
      </BrowserRouter>
    </AuthProvider>
    </NotificationProvider>
  );
}

export default App;
