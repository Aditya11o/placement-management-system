import React, { useState, useEffect } from 'react';
import { Archive, MapPin, Building2, TrendingUp, Users, Loader2 } from 'lucide-react';
import api from '../../api';
import Navbar from '../../components/Navbar';
import ResponsiveTable from '../../components/ResponsiveTable';

const PastPlacements = () => {
  const [archives, setArchives] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArchives = async () => {
      try {
        const { data } = await api.get('/student/archives');
        setArchives(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchArchives();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto space-y-8 p-6 pb-12">
        <div>
          <div className="flex items-center gap-3 text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-3">
            <div className="w-8 h-px bg-blue-600" />
            <span>Alumni Success</span>
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase leading-none">Past <span className="text-blue-600">Placements</span></h1>
          <p className="text-gray-500 text-[14px] mt-3 font-medium">Historical statistics from previous academic years to guide your expectations.</p>
        </div>

        {archives.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <Archive className="mx-auto w-12 h-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-bold text-gray-900">No Historical Data</h3>
            <p className="text-gray-500 mt-2">Past placement statistics have not been published yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {archives.map((year: any, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-black text-blue-900">Academic Year {year.academicYear}</h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                    <div className="flex items-center gap-2 mb-2">
                       <Users size={16} className="text-blue-600" />
                       <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Total Placed</span>
                    </div>
                    <p className="text-2xl font-black text-gray-900">{year.placedStudents}</p>
                  </div>
                  <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                    <div className="flex items-center gap-2 mb-2">
                       <TrendingUp size={16} className="text-emerald-600" />
                       <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Avg Package</span>
                    </div>
                    <p className="text-2xl font-black text-gray-900">₹{year.averageSalary?.toLocaleString()}</p>
                  </div>
                  <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100">
                    <div className="flex items-center gap-2 mb-2">
                       <Building2 size={16} className="text-purple-600" />
                       <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Companies</span>
                    </div>
                    <p className="text-2xl font-black text-gray-900">{year.totalJobs || 'N/A'}</p>
                  </div>
                  <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100">
                    <div className="flex items-center gap-2 mb-2">
                       <MapPin size={16} className="text-orange-600" />
                       <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Applications</span>
                    </div>
                    <p className="text-2xl font-black text-gray-900">{year.totalApplications}</p>
                  </div>
                </div>

                {year.topCompanies && year.topCompanies.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-3">Top Companies that Visited:</h3>
                    <div className="flex flex-wrap gap-2">
                      {year.topCompanies.map((c: string, idx: number) => (
                        <span key={idx} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-md text-xs font-semibold">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default PastPlacements;
