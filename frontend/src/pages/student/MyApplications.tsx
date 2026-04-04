import React, { useState } from 'react';
import { 
  Briefcase, 
  RotateCcw,
  CheckCircle, Clock, Calendar, 
  Trophy, XCircle, Download, FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ListSkeleton from '../../components/skeletons/ListSkeleton';
import Dropdown from '../../components/Dropdown';
import api from '../../api';
import { useNotification } from '../../context/NotificationContext';
import { useQueryClient } from '@tanstack/react-query';
import { useMyApplications } from '../../hooks/useApplications';
import ResponsiveTable from '../../components/ResponsiveTable';
import EmptyState from '../../components/EmptyState';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import ConfirmModal from '../../components/ConfirmModal';

const MyApplications: React.FC = () => {
  const { showSuccess, showError } = useNotification();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: apps = [], isLoading: loading } = useMyApplications();
  const [statusFilter, setStatusFilter] = useState('Any Status');
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
    icon?: any;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: () => {}
  });

  const filteredApps = apps.filter((app: any) => 
    statusFilter === 'Any Status' || app.status === statusFilter
  );

  const exportToCSV = () => {
    if (apps.length === 0) return;
    const headers = ['Company', 'Job Title', 'Applied Date', 'Status', 'Interview Date'];
    const rows = apps.map((app: any) => [
      `"${app.job?.companyName || 'N/A'}"`,
      `"${app.job?.title || 'N/A'}"`,
      new Date(app.createdAt).toLocaleDateString(),
      app.status,
      app.interviewDate ? new Date(app.interviewDate).toLocaleDateString() : 'N/A'
    ]);
    const csvContent = [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Application_History_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showSuccess('Exported history to CSV!', 'Export Success');
  };

  const exportToPDF = () => {
    if (apps.length === 0) return;
    const doc = new jsPDF() as any;
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(0, 6, 19);
    doc.text('Placement Cell', 14, 20);
    doc.setFontSize(14);
    doc.text('Personal Application History Report', 14, 30);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 40);
    doc.text(`Total Applications: ${apps.length}`, 14, 45);

    const tableData = apps.map((app: any) => [
      app.job?.companyName || 'N/A',
      app.job?.title || 'N/A',
      new Date(app.createdAt).toLocaleDateString(),
      app.status,
      app.interviewDate ? new Date(app.interviewDate).toLocaleDateString() : '—'
    ]);

    doc.autoTable({
      startY: 55,
      head: [['Company', 'Job Title', 'Date Applied', 'Status', 'Interview']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [0, 6, 19], fontSize: 10, fontStyle: 'bold' },
      bodyStyles: { fontSize: 9 },
      alternateRowStyles: { fillColor: [245, 247, 250] }
    });

    doc.save(`PMS_Application_History_${new Date().toISOString().split('T')[0]}.pdf`);
    showSuccess('Exported history to PDF!', 'Export Success');
  };

  const handleOfferResponse = (id: string, response: 'Accepted' | 'Declined') => {
    const isAccept = response === 'Accepted';
    setConfirmState({
      isOpen: true,
      type: isAccept ? 'info' : 'danger',
      title: `${response} Job Offer?`,
      message: `Are you sure you want to ${response.toLowerCase()} this job offer? This action is formal and will be communicated to the recruiter immediately.`,
      icon: isAccept ? CheckCircle : XCircle,
      onConfirm: async () => {
        try {
          await api.patch(`/applications/${id}/offer`, { response });
          queryClient.invalidateQueries({ queryKey: ['applications'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard'] });
          showSuccess(`Offer ${response.toLowerCase()}ed successfully!`, 'Offer Response');
        } catch (err: any) {
          showError(err.response?.data?.message || `Failed to ${response.toLowerCase()} offer`, 'Response Error');
        }
      }
    });
  };

  const stats = [
    { label: 'Total', value: apps.length.toString().padStart(2, '0'), icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Reviewing', value: apps.filter((a: any) => a.status === 'Applied').length.toString().padStart(2, '0'), icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Shortlisted', value: apps.filter((a: any) => a.status === 'Shortlisted').length.toString().padStart(2, '0'), icon: Trophy, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Interview', value: apps.filter((a: any) => a.interviewDate).length.toString().padStart(2, '0'), icon: Calendar, color: 'text-cyan-600', bg: 'bg-cyan-50' },
    { label: 'Selected', value: apps.filter((a: any) => a.status === 'Selected' || a.status === 'Accepted').length.toString().padStart(2, '0'), icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Rejected', value: apps.filter((a: any) => a.status === 'Rejected').length.toString().padStart(2, '0'), icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase();
    switch (s) {
      case 'applied': return <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-black uppercase rounded tracking-tighter border border-blue-100 italic">● Applied</span>;
      case 'shortlisted': return <span className="px-2 py-0.5 bg-purple-50 text-purple-600 text-[10px] font-black uppercase rounded tracking-tighter border border-purple-100 italic">● Shortlisted</span>;
      case 'selected': return <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase rounded tracking-tighter border border-emerald-100 italic font-black">● OFFERED</span>;
      case 'accepted': return <span className="px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-black uppercase rounded tracking-tighter border border-emerald-700 italic">● Accepted</span>;
      case 'declined': return <span className="px-2 py-0.5 bg-rose-600 text-white text-[10px] font-black uppercase rounded tracking-tighter border border-rose-700 italic">● Declined</span>;
      case 'rejected': return <span className="px-2 py-0.5 bg-rose-50 text-rose-600 text-[10px] font-black uppercase rounded tracking-tighter border border-rose-100 italic">● Rejected</span>;
      default: return <span className="px-2 py-0.5 bg-gray-50 text-gray-500 text-[10px] font-black uppercase rounded tracking-tighter border border-gray-100">● {status}</span>;
    }
  };

  if (loading) return <ListSkeleton />;

  return (
    <div className="space-y-6 pb-12">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase tracking-tighter">My <span className="text-blue-600">Applications</span></h1>
          <p className="text-sm font-bold text-gray-400 mt-1 leading-relaxed">
            Strategic tracking of your professional journey & placement milestones.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-all"
          >
            <FileText size={14} /> CSV
          </button>
          <button 
            onClick={exportToPDF}
            className="flex items-center gap-2 px-6 py-3 bg-[#000613] text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-black/10 shadow-black/20"
          >
            <Download size={14} /> Export history
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-xl shadow-md border border-gray-200 p-4 flex flex-col items-center text-center hover:shadow-lg transition-all">
            <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
              <stat.icon size={20} />
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <h3 className="text-xl font-black text-gray-900">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="w-56">
            <Dropdown 
              label="Status Filter"
              value={statusFilter}
              onChange={(status) => {
                setStatusFilter(status);
              }}
              options={[
                'Any Status', 'Applied', 'Reviewing', 
                'Shortlisted', 'Interview', 'Selected', 'Rejected'
              ]}
              italic
            />
          </div>

          <button
            onClick={() => {
              setStatusFilter('Any Status');
            }}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-blue-900 transition-colors py-2 px-4 italic"
          >
            <RotateCcw size={14} />
            <span>Reset Filters</span>
          </button>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden min-h-[400px]">
        {filteredApps.length === 0 ? (
          <EmptyState 
            icon={Briefcase}
            title={statusFilter === 'Any Status' ? "No Applications Yet" : "No Matches Found"}
            description={statusFilter === 'Any Status' 
              ? "You haven't applied to any jobs yet. Start exploring active postings and land your dream role!" 
              : `No applications found with the status "${statusFilter}". Try adjusting your filters.`}
            actionText={statusFilter === 'Any Status' ? "Browse Open Jobs" : "Clear Filters"}
            onAction={() => statusFilter === 'Any Status' ? navigate('/student/jobs') : setStatusFilter('Any Status')}
          />
        ) : (
          <ResponsiveTable>
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Company & Role</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest italic text-center">Date Applied</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest italic text-center">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Next Step</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest italic text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredApps.map((app: any, i: number) => (
                  <tr key={i} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center font-bold text-xs group-hover:scale-110 transition-transform shadow-sm`}>
                          {app.job?.companyName?.[0] || 'C'}
                        </div>
                        <div>
                          <h4 className="text-[13px] font-black text-gray-900 leading-tight uppercase tracking-tight">{app.job?.companyName}</h4>
                          <p className="text-[11px] font-bold text-gray-400 mt-0.5">{app.job?.title}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center text-xs font-bold text-gray-500 italic">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-5 text-center">
                      {getStatusBadge(app.status)}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className={`text-[11px] font-black ${app.interviewDate ? 'text-blue-600' : 'text-gray-400'} leading-tight`}>
                          {app.interviewDate ? `Interview: ${new Date(app.interviewDate).toLocaleDateString()}` : 'Awaiting Update'}
                        </span>
                        {app.interviewLink && <span className="text-[10px] font-bold text-blue-400 mt-0.5 leading-none">Meeting Link Shared</span>}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                       <div className="flex justify-end gap-2 items-center">
                         {app.status === 'Selected' && (
                           <>
                             <button
                               onClick={() => handleOfferResponse(app._id, 'Accepted')}
                               className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-sm"
                             >
                               Accept Offer
                             </button>
                             <button
                               onClick={() => handleOfferResponse(app._id, 'Declined')}
                               className="px-3 py-1 border border-rose-200 text-rose-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 transition-all font-black"
                             >
                               Decline
                             </button>
                           </>
                         )}
                         {app.offerLetter && (
                           <a
                             href={app.offerLetter}
                             target="_blank"
                             rel="noreferrer"
                             className="px-3 py-1 bg-blue-950 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center gap-1.5 shadow-sm"
                           >
                             <Download size={10} /> Offer Letter
                           </a>
                         )}
                         <button className="px-4 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all">
                           View Details
                         </button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ResponsiveTable>
        )}
      </div>

      <ConfirmModal
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState(p => ({ ...p, isOpen: false }))}
        onConfirm={confirmState.onConfirm}
        title={confirmState.title}
        message={confirmState.message}
        type={confirmState.type}
        icon={confirmState.icon}
      />
    </div>
  );
};

export default MyApplications;
