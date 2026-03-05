import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { SocketProvider } from './context/SocketContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute, RoleRoute } from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import MainLayout from './layouts/MainLayout';
import Loader from './components/Loader/Loader';
import AxiosSetup from './components/AxiosSetup/AxiosSetup';

// Lazy Loaded Pages
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));

const StudentDashboard = lazy(() => import('./pages/student/StudentDashboard'));
const StudentProfile = lazy(() => import('./pages/student/StudentProfile'));
const Resumes = lazy(() => import('./pages/student/Resumes'));
const JobBoard = lazy(() => import('./pages/student/JobBoard'));
const StudentApplications = lazy(() => import('./pages/student/StudentApplications'));

const RecruiterDashboard = lazy(() => import('./pages/recruiter/RecruiterDashboard'));
const RecruiterJobs = lazy(() => import('./pages/recruiter/RecruiterJobs'));
const ApplicantReview = lazy(() => import('./pages/recruiter/ApplicantReview'));
const RecruiterProfile = lazy(() => import('./pages/recruiter/RecruiterProfile'));

const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminStudents = lazy(() => import('./pages/admin/AdminStudents'));
const AdminRecruiters = lazy(() => import('./pages/admin/AdminRecruiters'));
const AdminApprovals = lazy(() => import('./pages/admin/AdminApprovals'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));
const AdminAnnouncements = lazy(() => import('./pages/admin/AdminAnnouncements'));

// Provisional Page imports
const Unauthorized = () => <div style={{ padding: '2rem' }}><h1>403 - Unauthorized Access</h1></div>;
const NotFound = () => <div style={{ padding: '2rem' }}><h1>404 - Page Not Found</h1></div>;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Don't refetch on tab switch by default
      retry: 1, // Retry failed requests once before showing error
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Router>
          <ToastProvider>
            <AuthProvider>
              <SocketProvider>
                <AxiosSetup />
                <ErrorBoundary>
                  <Suspense fallback={<Loader />}>
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
                            <Route path="/admin/approvals" element={<AdminApprovals />} />
                            <Route path="/admin/settings" element={<AdminSettings />} />
                            <Route path="/admin/announcements" element={<AdminAnnouncements />} />
                          </Route>

                        </Route>
                      </Route>

                      {/* Fallback */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </ErrorBoundary>
              </SocketProvider>
            </AuthProvider>
          </ToastProvider>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
