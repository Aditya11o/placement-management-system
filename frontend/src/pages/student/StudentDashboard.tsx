import React from 'react';
import { 
  Briefcase, 
  CheckCircle, 
  Clock, 
  XCircle, 
  TrendingUp
} from 'lucide-react';

import ProfileProgress from '../../components/student/ProfileProgress';
import StatCard from '../../components/student/StatCard';
import JobTable from '../../components/student/JobTable';
import InterviewPanel from '../../components/student/InterviewPanel';
import Pipeline from '../../components/student/Pipeline';
import CareerResources from '../../components/student/CareerResources';

const StudentDashboard: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* 1. Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 leading-tight">Academic Overview</h2>
          <p className="text-sm text-gray-500 mt-1">
            Welcome back, Alex. Your placement journey is progressing well. You have 3 upcoming interviews this week.
          </p>
        </div>
      </header>

      {/* 2. Main Dashboard Grid (12-col) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Row 1: Profile (4) + Stats (8) */}
        <section className="md:col-span-4 h-full">
          <ProfileProgress />
        </section>

        <section className="md:col-span-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 h-full">
             <StatCard label="Total Jobs" value="124" icon={Briefcase} color="bg-blue-50 text-blue-600" />
             <StatCard label="Applied" value="18" icon={TrendingUp} color="bg-cyan-50 text-cyan-600" />
             <StatCard label="Under Review" value="12" icon={Clock} color="bg-orange-50 text-orange-600" />
             <StatCard label="Shortlisted" value="05" icon={CheckCircle} color="bg-purple-50 text-purple-600" />
             <StatCard label="Selected" value="01" icon={CheckCircle} color="bg-emerald-50 text-emerald-600" />
             <StatCard label="Rejected" value="02" icon={XCircle} color="bg-rose-50 text-rose-600" />
          </div>
        </section>

        {/* Row 2: Job Table (8) + Upcoming Interviews (4) */}
        <section className="md:col-span-8">
          <JobTable />
        </section>

        <section className="md:col-span-4 h-full">
          <InterviewPanel />
        </section>

        {/* Row 3: Pipeline (8) + Career Resources (4) */}
        <section className="md:col-span-8">
           <Pipeline />
        </section>

        <section className="md:col-span-4 h-full">
           <CareerResources />
        </section>

      </div>
    </div>
  );
};

export default StudentDashboard;
