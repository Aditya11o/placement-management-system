import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ProtectedRoute, RoleRoute } from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentProfile from './pages/student/StudentProfile';
import Resumes from './pages/student/Resumes';
import JobBoard from './pages/student/JobBoard';
import StudentApplications from './pages/student/StudentApplications';
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';
import RecruiterJobs from './pages/recruiter/RecruiterJobs';
import ApplicantReview from './pages/recruiter/ApplicantReview';
import RecruiterProfile from './pages/recruiter/RecruiterProfile';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminStudents from './pages/admin/AdminStudents';
import AdminRecruiters from './pages/admin/AdminRecruiters';

// Provisional Page imports
const Unauthorized = () => <div style={{ padding: '2rem' }}><h1>403 - Unauthorized Access</h1></div>;
const NotFound = () => <div style={{ padding: '2rem' }}><h1>404 - Page Not Found</h1></div>;

const App = () => {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:resetToken" element={<ResetPassword />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Protected Routes (Must be logged in) */}
            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>

                {/* Student Routes */}
                <Route element={<RoleRoute allowedRoles={['STUDENT']} />}>
                  <Route path="/student/dashboard" element={<StudentDashboard />} />
                  <Route path="/student/profile" element={<StudentProfile />} />
                  <Route path="/student/resumes" element={<Resumes />} />
                  <Route path="/student/jobs" element={<JobBoard />} />
                  <Route path="/student/applications" element={<StudentApplications />} />
                </Route>

                {/* Recruiter Routes */}
                <Route element={<RoleRoute allowedRoles={['RECRUITER']} />}>
                  <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
                  <Route path="/recruiter/profile" element={<RecruiterProfile />} />
                  <Route path="/recruiter/jobs" element={<RecruiterJobs />} />
                  <Route path="/recruiter/applicants" element={<ApplicantReview />} />
                </Route>

                {/* Admin Routes */}
                <Route element={<RoleRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']} />}>
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/students" element={<AdminStudents />} />
                  <Route path="/admin/recruiters" element={<AdminRecruiters />} />
                </Route>

              </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
};

export default App;
