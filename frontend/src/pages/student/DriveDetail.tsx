import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../api';
import { Calendar, Briefcase, ChevronLeft, MapPin, Building, GraduationCap, Clock, ExternalLink } from 'lucide-react';
import CountdownTimer from '../../components/CountdownTimer';

interface Job {
  id: string;
  title: string;
  companyName: string;
  location: string;
  salary: string;
  jobType: string;
  deadline: string;
  targetCourses: string[];
  status: string;
}

interface Drive {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
  jobs: Job[];
}

const DriveDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [drive, setDrive] = useState<Drive | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDriveDetails();
  }, [id]);

  const fetchDriveDetails = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get(`/drives/${id}`);
      if (data.success) {
        setDrive(data.data);
      } else {
        navigate('/student/dashboard');
      }
    } catch (error) {
      console.error('Error fetching drive details:', error);
      navigate('/student/dashboard');
    } finally {
      setIsLoading(false);
    }
  };


  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!drive) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="relative overflow-hidden bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-50 to-indigo-50 rounded-bl-full -z-10 opacity-70"></div>
        
        <button 
          onClick={() => navigate('/student/dashboard')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-medium mb-6 transition-colors w-fit"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <span className={`px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase shadow-sm ${
                drive.status === 'ACTIVE' ? 'bg-green-100 text-green-700 border border-green-200' :
                drive.status === 'UPCOMING' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                'bg-gray-100 text-gray-700 border border-gray-200'
              }`}>
                {drive.status}
              </span>
              <span className="flex items-center gap-2 text-sm font-semibold text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                <Calendar className="w-4 h-4 text-gray-400" />
                {new Date(drive.startDate).toLocaleDateString()} - {new Date(drive.endDate).toLocaleDateString()}
              </span>
            </div>
            
            <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-tight mb-4">
              {drive.name}
            </h1>
            
            <p className="text-lg text-gray-600 leading-relaxed max-w-3xl">
              {drive.description || 'Welcome to this placement drive. Explore the opportunities below and prepare your applications.'}
            </p>
          </div>

          {/* Highlights Card */}
          <div className="shrink-0 bg-gray-900 text-white p-6 rounded-2xl w-full md:w-64 relative overflow-hidden shadow-xl shadow-gray-900/10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full"></div>
            <div className="relative z-10 space-y-4">
              <div>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Total Opportunities</p>
                <div className="flex items-center gap-3">
                  <Briefcase className="w-6 h-6 text-blue-400" />
                  <span className="text-3xl font-black">{drive.jobs.length}</span>
                </div>
              </div>
              <div className="bg-white/10 h-px w-full" />
              <div>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Participating Companies</p>
                <span className="text-xl font-bold">{new Set(drive.jobs.map(j => j.companyName)).size}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            Available Positions
            <span className="bg-blue-100 text-blue-700 text-sm py-1 px-3 rounded-full">{drive.jobs.length}</span>
          </h2>
        </div>

        {drive.jobs.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
            <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">No jobs attached yet</h3>
            <p className="text-gray-500">Check back later for new opportunities in this drive.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {drive.jobs.map((job, index) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                key={job.id}
                className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col h-full relative"
              >
                {/* Time Left Badge */}
                <div className="absolute -top-3 right-6 z-10">
                  <CountdownTimer targetDate={job.deadline} showLabels={false} className="scale-90 origin-right" />
                </div>

                <div className="mb-4">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-center shrink-0 shrink-0">
                      <Building className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0 pt-1">
                      <h3 className="font-bold text-gray-900 truncate text-lg">{job.title}</h3>
                      <p className="font-medium text-blue-600 truncate">{job.companyName}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6 flex-1 text-sm">
                  <div className="flex items-center gap-2 text-gray-600 bg-gray-50 p-2 rounded-lg border border-gray-100">
                    <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="truncate font-medium">{job.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 bg-gray-50 p-2 rounded-lg border border-gray-100">
                    <Briefcase className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="truncate font-medium">{job.jobType.replace('_', ' ')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 bg-gray-50 p-2 rounded-lg border border-gray-100 col-span-2">
                    <GraduationCap className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="truncate font-medium">{job.targetCourses?.join(', ') || 'Any Degree'}</span>
                  </div>
                </div>

                <Link
                  to={`/student/jobs/${job.id}`}
                  className="w-full py-3 px-4 bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-700 border border-gray-200 hover:border-blue-200 rounded-xl font-bold transition-all flex items-center justify-center gap-2 group-hover:bg-gray-900 group-hover:text-white group-hover:border-gray-900"
                >
                  View full details
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DriveDetail;
