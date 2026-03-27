import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, Send, 
  CheckCircle2, AlertCircle, Loader2,
  HelpCircle, History
} from 'lucide-react';
import api from '../../api';
import { useNotification } from '../../context/NotificationContext';

const Support: React.FC = () => {
  const { showSuccess, showError } = useNotification();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    priority: 'low'
  });

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tickets');
      setTickets(res.data);
    } catch (err: any) {
      console.error(err);
      showError('Failed to fetch your support tickets', 'Fetch Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.post('/tickets', formData);
      showSuccess('Support ticket submitted successfully!', 'Success');
      setFormData({ subject: '', description: '', priority: 'low' });
      fetchTickets();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to submit ticket', 'Submission Error');
    } finally {
      setSubmitting(false);
    }
  };



  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Help & Support</h1>
          <p className="text-gray-500 text-sm font-medium mt-1">Need assistance? Our admin team is here to help.</p>
        </div>
        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
            <HelpCircle size={24} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* New Ticket Form */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-100 rounded-[32px] shadow-sm p-8 space-y-6">
            <h2 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
              <MessageSquare size={18} className="text-blue-600" /> Open New Ticket
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Subject</label>
                <input 
                  type="text" 
                  placeholder="Summarize your issue..."
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className="w-full px-5 py-3.5 bg-gray-50 border-transparent focus:bg-white focus:border-gray-200 rounded-2xl font-bold text-sm outline-none transition-all" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Priority</label>
                <div className="flex p-1 bg-gray-100 rounded-xl gap-1">
                  {['low', 'medium', 'high'].map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setFormData({...formData, priority: p})}
                      className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all ${formData.priority === p ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Description</label>
                <textarea 
                  rows={4}
                  placeholder="Provide detailed information..."
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-5 py-3.5 bg-gray-50 border-transparent focus:bg-white focus:border-gray-200 rounded-2xl font-bold text-sm outline-none transition-all resize-none" 
                />
              </div>
              <button 
                disabled={submitting}
                className="w-full py-4 bg-[#000613] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center justify-center gap-2 shadow-xl shadow-black/10 active:scale-95 disabled:opacity-50"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <><Send size={14} /> Submit Ticket</>}
              </button>
            </form>
          </div>
        </div>

        {/* Previous Tickets */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
              <History size={18} className="text-blue-600" /> Your Support History
            </h2>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-full">{tickets.length} Tickets</span>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="flex py-20 items-center justify-center"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>
            ) : tickets.length === 0 ? (
               <div className="bg-white border border-gray-100 rounded-[32px] p-12 text-center text-gray-400 font-bold italic">No tickets found. Need help? Open a ticket on the left.</div>
            ) : tickets.map((ticket) => (
              <div key={ticket._id} className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${ticket.status === 'resolved' ? 'bg-emerald-50 text-emerald-500' : 'bg-blue-50 text-blue-500'}`}>
                      {ticket.status === 'resolved' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    </div>
                    <div>
                      <h3 className="font-black text-gray-900 tracking-tight">{ticket.subject}</h3>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Ticket ID: #{ticket._id.slice(-6)} • {new Date(ticket.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                    ticket.status === 'resolved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                  }`}>
                    {ticket.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 font-medium leading-relaxed pl-14">{ticket.description}</p>
                {ticket.response && (
                  <div className="mt-4 ml-14 p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
                    <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1">
                      <MessageSquare size={10} /> Admin Response
                    </p>
                    <p className="text-sm text-gray-700 font-bold leading-relaxed">"{ticket.response}"</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
