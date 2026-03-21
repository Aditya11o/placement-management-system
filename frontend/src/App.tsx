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
const VerifyOTP = lazy(() => import('./pages/auth/VerifyOTP'));


const StudentDashboard = lazy(() => import('./pages/student/StudentDashboard'));
const StudentProfile = lazy(() => import('./pages/student/StudentProfile'));
const Resumes = lazy(() => import('./pages/student/Resumes'));
const JobBoard = lazy(() => import('./pages/student/JobBoard'));
const StudentApplications = lazy(() => import('./pages/student/StudentApplications'));
const PeerInsights = lazy(() => import('./pages/student/PeerInsights'));
const CompanyPrepKit = lazy(() => import('./pages/student/CompanyPrepKit'));
const ChatInbox = lazy(() => import('./pages/student/ChatInbox'));
const AlumniDirectory = lazy(() => import('./pages/student/AlumniDirectory'));
const PrepRooms = lazy(() => import('./pages/student/PrepRooms'));
const PrepRoomSession = lazy(() => import('./components/PrepRoom/PrepRoomSession'));
const LiveEvents = lazy(() => import('./pages/student/LiveEvents'));
const PublicPortfolio = lazy(() => import('./pages/public/PublicPortfolio'));

const RecruiterDashboard = lazy(() => import('./pages/recruiter/RecruiterDashboard'));
const RecruiterJobs = lazy(() => import('./pages/recruiter/RecruiterJobs'));
const ApplicantReview = lazy(() => import('./pages/recruiter/ApplicantReview'));
const RecruiterProfile = lazy(() => import('./pages/recruiter/RecruiterProfile'));
const RecruiterInterviews = lazy(() => import('./pages/recruiter/RecruiterInterviews'));
const CandidateDatabase = lazy(() => import('./pages/recruiter/CandidateDatabase'));
const RecruiterTeam = lazy(() => import('./pages/recruiter/RecruiterTeam'));


const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminStudents = lazy(() => import('./pages/admin/AdminStudents'));
const AdminRecruiters = lazy(() => import('./pages/admin/AdminRecruiters'));
const AdminApprovals = lazy(() => import('./pages/admin/AdminApprovals'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));
const AdminAnnouncements = lazy(() => import('./pages/admin/AdminAnnouncements'));
const AdminAuditLogs = lazy(() => import('./pages/admin/AdminAuditLogs'));
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'));
const AdminJobs = lazy(() => import('./pages/admin/AdminJobs'));
const AdminKanban = lazy(() => import('./pages/admin/AdminKanban'));
const AdminCalendar = lazy(() => import('./pages/admin/AdminCalendar'));
const AdminCampaigns = lazy(() => import('./pages/admin/AdminCampaigns'));
const AdminRBAC = lazy(() => import('./pages/admin/AdminRBAC'));
const AdminReportBuilder = lazy(() => import('./pages/admin/AdminReportBuilder'));
const AdminDocVerification = lazy(() => import('./pages/admin/AdminDocVerification'));
const AdminSystemHealth = lazy(() => import('./pages/admin/AdminSystemHealth'));
const AdminCommunication = lazy(() => import('./pages/admin/AdminCommunication'));
const AdminAnalyticsDeepDive = lazy(() => import('./pages/admin/AdminAnalyticsDeepDive'));
const AdminSessions = lazy(() => import('./pages/admin/AdminSessions'));
const AdminSecurityHub = lazy(() => import('./pages/admin/AdminSecurityHub'));

const InterviewRoom = lazy(() => import('./pages/shared/InterviewRoom'));
const NotificationCenter = lazy(() => import('./pages/shared/NotificationCenter'));
const NotFound = lazy(() => import('./pages/shared/NotFound'));
const Unauthorized = lazy(() => import('./pages/shared/Unauthorized'));

// Info Pages
const Privacy = lazy(() => import('./pages/info/Privacy'));
const Terms = lazy(() => import('./pages/info/Terms'));
const Accessibility = lazy(() => import('./pages/info/Accessibility'));
const Guidelines = lazy(() => import('./pages/info/Guidelines'));



const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Don't refetch on tab switch by default
      retry: 1, // Retry failed requests once before showing error
      staleTime: 1000 * 60 * 5, // Data is fresh for 5 minutes
      gcTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
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
                      <Route path="/verify-email" element={<VerifyOTP />} />
                      <Route path="/portfolio/:slug" element={<PublicPortfolio />} />
                      <Route path="/unauthorized" element={<Unauthorized />} />

                      {/* Info Routes */}
                      <Route path="/privacy" element={<Privacy />} />
                      <Route path="/terms" element={<Terms />} />
                      <Route path="/accessibility" element={<Accessibility />} />
                      <Route path="/guidelines" element={<Guidelines />} />

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
                            <Route path="/student/peer-insights" element={<PeerInsights />} />
                            <Route path="/student/prep-kits" element={<CompanyPrepKit />} />
                            <Route path="/student/messages" element={<ChatInbox />} />
                            <Route path="/student/alumni" element={<AlumniDirectory />} />
                            <Route path="/student/prep-rooms" element={<PrepRooms />} />
                            <Route path="/student/prep-rooms/:id" element={<PrepRoomSession />} />
                            <Route path="/student/live-events" element={<LiveEvents />} />
                          </Route>

                          {/* Recruiter Routes */}
                          <Route element={<RoleRoute allowedRoles={['RECRUITER']} />}>
                            <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
                            <Route path="/recruiter/profile" element={<RecruiterProfile />} />
                            <Route path="/recruiter/jobs" element={<RecruiterJobs />} />
                            <Route path="/recruiter/applicants" element={<ApplicantReview />} />
                            <Route path="/recruiter/interviews" element={<RecruiterInterviews />} />
                            <Route path="/recruiter/database" element={<CandidateDatabase />} />
                            <Route path="/recruiter/team" element={<RecruiterTeam />} />
                          </Route>

                          {/* Admin Routes */}
                          <Route element={<RoleRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']} />}>
                            <Route path="/admin/dashboard" element={<AdminDashboard />} />
                            <Route path="/admin/students" element={<AdminStudents />} />
                            <Route path="/admin/recruiters" element={<AdminRecruiters />} />
                            <Route path="/admin/approvals" element={<AdminApprovals />} />
                            <Route path="/admin/settings" element={<AdminSettings />} />
                            <Route path="/admin/announcements" element={<AdminAnnouncements />} />
                            <Route path="/admin/audit-logs" element={<AdminAuditLogs />} />
                            <Route path="/admin/analytics" element={<AdminAnalytics />} />
                            <Route path="/admin/jobs" element={<AdminJobs />} />
                            <Route path="/admin/kanban" element={<AdminKanban />} />
                            <Route path="/admin/calendar" element={<AdminCalendar />} />
                            <Route path="/admin/campaigns" element={<AdminCampaigns />} />
                            <Route path="/admin/rbac" element={<AdminRBAC />} />
                            <Route path="/admin/report-builder" element={<AdminReportBuilder />} />
                            <Route path="/admin/doc-verification" element={<AdminDocVerification />} />
                            <Route path="/admin/system-health" element={<AdminSystemHealth />} />
                            <Route path="/admin/communication" element={<AdminCommunication />} />
                            <Route path="/admin/analytics-deep-dive" element={<AdminAnalyticsDeepDive />} />
                            <Route path="/admin/sessions" element={<AdminSessions />} />
                            <Route path="/admin/security-hub" element={<AdminSecurityHub />} />
                          </Route>

                          {/* Shared Activity Routes */}
                          <Route path="/interviews/:id/room" element={<InterviewRoom />} />
                          <Route path="/notifications" element={<NotificationCenter />} />

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
