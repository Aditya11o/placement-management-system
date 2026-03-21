import StudentDashboard from './student/StudentDashboard';

interface DashboardProps {
  role: 'student' | 'recruiter' | 'admin';
}

const Dashboard: React.FC<DashboardProps> = ({ role }) => {
  if (role === 'student') {
    return <StudentDashboard />;
  }

  return (
    <div>
      <h2 className="display-md mb-6">{role === 'admin' ? 'Global Command Center' : role === 'recruiter' ? 'Recruitment Hub' : 'My Placement Journey'}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="academic-card">
          <h3 className="label-sm mb-2">Total Application Updates</h3>
          <p className="display-md">0</p>
        </div>
        <div className="academic-card">
          <h3 className="label-sm mb-2">Upcoming Interviews</h3>
          <p className="display-md">0</p>
        </div>
        <div className="academic-card">
          <h3 className="label-sm mb-2">Unread Messages</h3>
          <p className="display-md">0</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
