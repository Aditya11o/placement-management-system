import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar, ChevronRight, Briefcase, Clock } from 'lucide-react';
import api from '../../api';

interface Drive {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
  _count: { jobs: number };
}

const StudentDrivesWidget: React.FC = () => {
  const [drives, setDrives] = useState<Drive[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDrives();
  }, []);

  const fetchDrives = async () => {
    try {
      const [{ data: dataActive }, { data: dataUpcoming }] = await Promise.all([
        api.get('/drives?status=ACTIVE'),
        api.get('/drives?status=UPCOMING')
      ]);
      
      let allDrives: Drive[] = [];
      if (dataActive.success) allDrives = [...allDrives, ...dataActive.data];
      if (dataUpcoming.success) allDrives = [...allDrives, ...dataUpcoming.data];
      
      setDrives(allDrives.slice(0, 3)); // Show top 3
    } catch (error) {
      console.error('Error fetching drives:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTimeLeft = (dateString: string) => {
    const total = Date.parse(dateString) - Date.parse(new Date().toString());
    const days = Math.floor( total/(1000*60*60*24) );
    if (days < 0) return 'Started';
    if (days === 0) return 'Starts Today';
    return `${days} days away`;
  };

  if (isLoading) {
    return (
      <div className="bg-surface-container-lowest rounded-3xl p-6 border border-outline-variant/30 shadow-sm animate-pulse h-64">
        <div className="h-6 bg-surface-container-high rounded w-1/3 mb-6"></div>
        <div className="space-y-4">
          <div className="h-16 bg-surface-container rounded-xl"></div>
          <div className="h-16 bg-surface-container rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (drives.length === 0) {
    return null; // Don't show the widget if there are no active/upcoming drives
  }

  return (
    <div className="bg-surface-container-lowest rounded-3xl p-6 border border-outline-variant/30 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-surface-tint/5 to-primary/5 rounded-bl-full -z-10 opacity-70"></div>
      
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[13px] font-black text-on-surface tracking-tight flex items-center gap-2 uppercase italic">
          <Calendar className="w-4 h-4 text-surface-tint" />
          Campus Placement Drives
        </h3>
      </div>

      <div className="space-y-4">
        {drives.map((drive, i) => (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            key={drive.id}
          >
            <Link 
              to={`/student/drives/${drive.id}`}
              className="block flex items-center justify-between p-4 bg-gray-50 hover:bg-blue-50 rounded-2xl border border-gray-100 hover:border-blue-100 transition-colors group"
            >
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-sm ${
                    drive.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {drive.status}
                  </span>
                  {drive.status === 'UPCOMING' && (
                    <span className="text-xs font-semibold text-on-surface-variant/50 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {getTimeLeft(drive.startDate)}
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-on-surface text-sm truncate">{drive.name}</h4>
                <p className="text-xs text-gray-500 font-medium mt-1 flex items-center gap-1">
                  <Briefcase className="w-3 h-3" />
                  {drive._count?.jobs || 0} Opportunities
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0 group-hover:border-blue-300 group-hover:bg-blue-600 transition-colors shadow-sm">
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default StudentDrivesWidget;
