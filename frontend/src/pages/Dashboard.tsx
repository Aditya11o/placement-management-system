import React from 'react';
import StudentDashboard from './student/StudentDashboard';
import RecruiterDashboard from './recruiter/RecruiterDashboard';
import AdminDashboard from './admin/AdminDashboard';

interface DashboardProps {
  role: 'student' | 'recruiter' | 'admin';
}

const Dashboard: React.FC<DashboardProps> = ({ role }) => {
  if (role === 'student') {
    return <StudentDashboard />;
  }

  if (role === 'recruiter') {
    return <RecruiterDashboard />;
  }

  if (role === 'admin') {
    return <AdminDashboard />;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-6">
        {role === 'admin' ? 'Global Command Center' : 'Welcome'}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Application Updates</h3>
          <p className="text-3xl font-black text-gray-900">0</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Upcoming Interviews</h3>
          <p className="text-3xl font-black text-gray-900">0</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Unread Messages</h3>
          <p className="text-3xl font-black text-gray-900">0</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
