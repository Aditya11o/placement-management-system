import React from 'react';
import { 
  Briefcase, 
  CheckCircle, 
  XCircle, 
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStudentDashboard, useSkillGap } from '../../hooks/useDashboard';
import DashboardSkeleton from '../../components/skeletons/DashboardSkeleton';

import ReadinessGauge from '../../components/student/ReadinessGauge';
import SkillGapRadar, { StrategicActionPlan } from '../../components/student/SkillGapRadar';
import StatCard from '../../components/student/StatCard';
import JobTable from '../../components/student/JobTable';
import InterviewPanel from '../../components/student/InterviewPanel';
import Pipeline from '../../components/student/Pipeline';
import CareerResources from '../../components/student/CareerResources';
import AnnouncementsBoard from '../../components/AnnouncementsBoard';
import StudentDrivesWidget from '../../components/student/StudentDrivesWidget';
import ActivityTimeline from '../../components/student/ActivityTimeline';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  
  const { data, isLoading: loading, error } = useStudentDashboard();
  const { data: skillGapData } = useSkillGap();

  const stats = data?.stats || {
    totalJobs: 0, applied: 0, underReview: 0, 
    shortlisted: 0, selected: 0, rejected: 0
  };
  const readiness = data?.readiness || {
    score: 0,
    breakdown: {
      profile: { score: 0, max: 25 },
      academic: { score: 0, max: 20 },
      skills: { score: 0, max: 20 },
      activity: { score: 0, max: 15 },
      placement: { score: 0, max: 20 }
    }
  };
  const jobs = data?.jobs || [];
  const interviews = data?.interviews || [];
  const notifications = data?.notifications || [];

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="flex h-[60vh] items-center justify-center flex-col gap-4 text-center px-4">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-2">
           <XCircle className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">Oops! Something went wrong</h3>
        <p className="text-gray-500 max-w-xs">{error instanceof Error ? error.message : 'Failed to load dashboard data. Please try again later.'}</p>
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
    <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-12">
      {/* 1. Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
        <div id="pms-tour-welcome">
          <h2 className="text-2xl font-black text-on-surface leading-tight tracking-tight italic uppercase">Placement Dashboard</h2>
          <p className="text-[11px] font-bold text-on-surface-variant/60 uppercase tracking-widest mt-1">
            Welcome back, <span className="text-primary font-black italic">{user?.name?.split(' ')[0] || 'Student'}</span>. Your profile is synchronized with active drives.
          </p>
        </div>
      </header>

      {/* 2. Top Stats Bar: Full Width for maximum visibility */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6" id="pms-tour-stats">
         <StatCard label="Total Jobs" value={stats.totalJobs.toString()} icon={Briefcase} color="text-blue-600" />
         <StatCard label="Applied" value={stats.applied.toString()} icon={TrendingUp} color="text-cyan-600" />
         <StatCard label="Shortlisted" value={stats.shortlisted.toString()} icon={CheckCircle} color="text-purple-600" />
         <StatCard label="Selected" value={stats.selected.toString()} icon={CheckCircle} color="text-emerald-600" />
      </section>

      {/* 3. Analytics Hero: Full Width side-by-side to prevent overlap */}
      <section className="space-y-4" id="pms-tour-analytics">
        <div className="flex flex-col min-[1400px]:flex-row gap-6 lg:gap-8 items-stretch">
          <div className="flex-1 min-w-0 relative">
            <ReadinessGauge 
              score={readiness.score} 
              previousScore={readiness.previousScore} 
              breakdown={readiness.breakdown} 
            />
          </div>
          <div className="flex-1 min-w-0 relative">
            <SkillGapRadar />
          </div>
        </div>

        {/* Strategic Action Plan: Integrated but full width */}
        <div id="pms-tour-action-plan">
           <StrategicActionPlan data={skillGapData || []} />
        </div>
      </section>

      {/* 4. Operational Split: 8 (Main Data) / 4 (Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Main Content Area: Span 8 */}
        <main className="lg:col-span-8 space-y-8">
          <div id="pms-tour-jobs">
            <JobTable initialJobs={jobs} />
          </div>

          <div id="pms-tour-pipeline">
             <Pipeline stats={stats} />
          </div>
        </main>

        {/* Right Sidebar: Span 4 (STAY STICKY RELATIVE TO CONTENT) */}
        <aside className="lg:col-span-4 self-start h-full">
           <div className="sticky top-24 space-y-6">
              <div id="pms-tour-announcements">
                 <AnnouncementsBoard initialAnnouncements={notifications} />
              </div>
              
              <InterviewPanel initialInterviews={interviews} />
              
              <ActivityTimeline />

              <div className="pt-6 border-t border-outline-variant/20 space-y-4">
                <StudentDrivesWidget />
                <CareerResources />
              </div>
           </div>
        </aside>
      </div>
    </div>
  );
};

export default StudentDashboard;
