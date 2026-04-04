import React from 'react';
import { Square, CheckSquare, CheckCircle2, XCircle } from 'lucide-react';
import Avatar from '../../Avatar';
import ListSkeleton from '../../skeletons/ListSkeleton';

interface ApplicantsTableProps {
  loading: boolean;
  filteredApplicants: any[];
  selectedApplicants: string[];
  toggleSelect: (id: string) => void;
  toggleSelectAll: () => void;
  getStatusBadge: (status: string) => React.ReactNode;
  openScheduleModal: (applicant: any) => void;
  handleUpdateStatus: (id: string, status: string, data?: any) => void;
}

const ApplicantsTable: React.FC<ApplicantsTableProps> = ({
  loading,
  filteredApplicants,
  selectedApplicants,
  toggleSelect,
  toggleSelectAll,
  getStatusBadge,
  openScheduleModal,
  handleUpdateStatus
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden text-[13px]">
      {loading ? (
        <ListSkeleton hideHeader={true} rows={8} />
      ) : (
        <div className="w-full overflow-x-auto custom-scrollbar">
          <table className="w-full text-left min-w-[900px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-6 py-4 w-12">
                  <button 
                    onClick={toggleSelectAll}
                    className="text-gray-300 hover:text-gray-900 transition-colors"
                  >
                    {selectedApplicants.length === filteredApplicants.length && filteredApplicants.length > 0 
                      ? <CheckSquare size={18} className="text-blue-600" /> 
                      : <Square size={18} />
                    }
                  </button>
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Student Name</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">CGPA</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredApplicants.map((applicant) => (
                <tr key={applicant._id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-5">
                    <button 
                      onClick={() => toggleSelect(applicant._id)}
                      className={`${selectedApplicants.includes(applicant._id) ? 'text-blue-600' : 'text-gray-200 group-hover:text-gray-300'}`}
                    >
                      {selectedApplicants.includes(applicant._id) ? <CheckSquare size={18} /> : <Square size={18} />}
                    </button>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <Avatar 
                        name={applicant.student?.name} 
                        profilePhoto={applicant.studentProfile?.profile_photo} 
                        size="sm" 
                        className="rounded-full" 
                      />
                      <div className="flex flex-col">
                        <span className="font-black text-gray-900 tracking-tight text-[14px]">{applicant.student?.name}</span>
                        <span className="text-[10px] font-bold text-gray-400 mt-0.5">{applicant.student?.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center font-black text-blue-600">
                    {applicant.studentProfile?.studentDetails?.cgpa || 'N/A'}
                  </td>
                  <td className="px-6 py-5 text-center">
                    {getStatusBadge(applicant.status)}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-end gap-3">
                      {applicant.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => openScheduleModal(applicant)}
                            className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all border border-transparent hover:border-emerald-100" title="Shortlist & Schedule">
                            <CheckCircle2 size={18} />
                          </button>
                          <button 
                            onClick={() => handleUpdateStatus(applicant._id, 'rejected')}
                            className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all border border-transparent hover:border-rose-100" title="Reject">
                            <XCircle size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredApplicants.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center font-bold text-gray-400">No applicants found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ApplicantsTable;
