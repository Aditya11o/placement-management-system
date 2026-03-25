import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  CheckCircle, 
  Clock, 
  XCircle, 
  TrendingUp,
  Loader2
} from 'lucide-react';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';

import ProfileProgress from '../../components/student/ProfileProgress';
import StatCard from '../../components/student/StatCard';
import JobTable from '../../components/student/JobTable';
import InterviewPanel from '../../components/student/InterviewPanel';
import Pipeline from '../../components/student/Pipeline';
import CareerResources from '../../components/student/CareerResources';
import AnnouncementsBoard from '../../components/AnnouncementsBoard';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalJobs: 0,
    applied: 0,
    underReview: 0,
    shortlisted: 0,
    selected: 0,
    rejected: 0
  });
  const [jobs, setJobs] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/student/dashboard');
        
        setStats(data.stats);
        setJobs(data.jobs);
        setInterviews(data.interviews);
        setNotifications(data.notifications);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center flex-col gap-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-gray-500 font-medium animate-pulse">Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[60vh] items-center justify-center flex-col gap-4 text-center px-4">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-2">
           <XCircle className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">Oops! Something went wrong</h3>
        <p className="text-gray-500 max-w-xs">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* 1. Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 leading-tight">Academic Overview</h2>
          <p className="text-sm text-gray-500 mt-1">
            Welcome back, {user?.name?.split(' ')[0] || 'Student'}. Your placement journey is progressing well.
          </p>
        </div>
      </header>

      {/* 2. Main Dashboard Grid (12-col) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Row 0: Announcements (Full Width) */}
        <section className="md:col-span-12">
          <AnnouncementsBoard initialAnnouncements={notifications} />
        </section>
        
        {/* Row 1: Profile (4) + Stats (8) */}
        <section className="md:col-span-4 h-full">
          <ProfileProgress />
        </section>

        <section className="md:col-span-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 h-full">
             <StatCard label="Total Jobs" value={stats.totalJobs.toString()} icon={Briefcase} color="bg-blue-50 text-blue-600" />
             <StatCard label="Applied" value={stats.applied.toString()} icon={TrendingUp} color="bg-cyan-50 text-cyan-600" />
             <StatCard label="Under Review" value={stats.underReview.toString()} icon={Clock} color="bg-orange-50 text-orange-600" />
             <StatCard label="Shortlisted" value={stats.shortlisted.toString()} icon={CheckCircle} color="bg-purple-50 text-purple-600" />
             <StatCard label="Selected" value={stats.selected.toString()} icon={CheckCircle} color="bg-emerald-50 text-emerald-600" />
             <StatCard label="Rejected" value={stats.rejected.toString()} icon={XCircle} color="bg-rose-50 text-rose-600" />
          </div>
        </section>

        {/* Row 2: Job Table (8) + Upcoming Interviews (4) */}
        <section className="md:col-span-8">
          <JobTable initialJobs={jobs} />
        </section>

        <section className="md:col-span-4 h-full">
          <InterviewPanel initialInterviews={interviews} />
        </section>

        {/* Row 3: Pipeline (8) + Career Resources (4) */}
        <section className="md:col-span-8">
           <Pipeline stats={stats} />
        </section>

        <section className="md:col-span-4 h-full">
           <CareerResources />
        </section>

      </div>
    </div>
  );
};

export default StudentDashboard;
