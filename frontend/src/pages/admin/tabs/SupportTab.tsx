import React, { useState, useEffect } from 'react';
import { 
  Inbox, MessageSquare, CheckCircle2, 
  Loader2,
  X, Send, User, Search
} from 'lucide-react';
import api from '../../../api';

const SupportTab: React.FC = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [response, setResponse] = useState('');
  const [updating, setUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tickets');
      setTickets(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleResolve = async (ticketId: string) => {
    if (!response) return;
    try {
      setUpdating(true);
      await api.patch(`/tickets/${ticketId}`, { status: 'resolved', response });
      setSelectedTicket(null);
      setResponse('');
      fetchTickets();
    } catch (err: any) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const filteredTickets = tickets.filter(t => 
    t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.student?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-[750px] flex gap-8 animate-fade-in">
      {/* Sidebar List */}
      <div className="w-1/3 flex flex-col gap-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Filter requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl font-bold text-xs outline-none focus:border-[#000613] transition-all" 
          />
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
          {loading ? (
             <div className="flex py-20 items-center justify-center"><Loader2 className="w-8 h-8 text-[#000613] animate-spin" /></div>
          ) : filteredTickets.map((ticket) => (
            <div 
              key={ticket._id} 
              onClick={() => setSelectedTicket(ticket)}
              className={`bg-white border transition-all cursor-pointer p-6 rounded-[2rem] shadow-sm hover:shadow-md ${
                selectedTicket?._id === ticket._id ? 'border-[#000613] bg-gray-50/50' : 'border-gray-100'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest ${
                  ticket.priority === 'high' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'
                }`}>
                  {ticket.priority}
                </span>
                <span className="text-[8px] font-black text-gray-300 uppercase italic">
                  {new Date(ticket.createdAt).toLocaleDateString()}
                </span>
              </div>
              <h4 className="font-black text-gray-900 tracking-tight text-xs mb-1 truncate">{ticket.subject}</h4>
              <p className="text-[10px] font-bold text-gray-400 truncate">From: {ticket.student?.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Area */}
      <div className="flex-1 bg-white border border-gray-100 rounded-[2.5rem] shadow-sm flex flex-col overflow-hidden relative">
        {selectedTicket ? (
          <>
            <div className="p-8 border-b border-gray-50 flex justify-between items-center">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                  <User size={24} className="text-gray-400" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900 tracking-tight">{selectedTicket.subject}</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Request ID: #{selectedTicket._id.slice(-6)}</p>
                </div>
              </div>
              <button onClick={() => setSelectedTicket(null)} className="p-2 hover:bg-gray-50 rounded-full transition-all text-gray-300"><X size={20} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-10">
              <div className="bg-gray-50 rounded-[2rem] p-8 border border-gray-100 space-y-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Student Narrative</p>
                <p className="text-base text-gray-700 font-medium italic leading-relaxed">"{selectedTicket.description}"</p>
              </div>

              {selectedTicket.status !== 'resolved' ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest">
                    <MessageSquare size={12} /> Institutional Response
                  </div>
                  <textarea 
                    rows={6}
                    placeholder="Provide resolution details..."
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    className="w-full p-8 bg-blue-50/20 border border-blue-50 focus:border-blue-100 focus:bg-white rounded-[2rem] font-bold text-sm outline-none transition-all resize-none" 
                  />
                  <button 
                    disabled={updating || !response}
                    onClick={() => handleResolve(selectedTicket._id)}
                    className="w-full py-5 bg-[#000613] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:scale-[1.01] transition-all flex items-center justify-center gap-2 shadow-xl disabled:opacity-50"
                  >
                    {updating ? <Loader2 size={16} className="animate-spin" /> : <><Send size={14} /> Resolve Ticket</>}
                  </button>
                </div>
              ) : (
                <div className="bg-emerald-50 rounded-[2rem] p-8 border border-emerald-100 space-y-4">
                   <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                      <CheckCircle2 size={12} /> Resolution Archive
                   </div>
                   <p className="text-base text-emerald-900 font-black leading-relaxed">"{selectedTicket.response}"</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-20 text-center opacity-30">
            <Inbox size={64} className="mb-6" />
            <h3 className="text-xl font-black text-gray-900 tracking-tight">Select a ticket</h3>
            <p className="text-sm font-bold text-gray-400 mt-2">Choose a support request to begin resolution.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportTab;
