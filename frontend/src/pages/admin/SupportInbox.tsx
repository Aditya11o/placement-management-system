import React, { useState, useEffect } from 'react';
import { 
  Inbox, MessageSquare, CheckCircle2, 
  Loader2,
  X, Send, User, Search
} from 'lucide-react';
import api from '../../api';

const SupportInbox: React.FC = () => {
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
    if (!response) {
      alert('Please provide a response');
      return;
    }
    try {
      setUpdating(true);
      await api.patch(`/tickets/${ticketId}`, { status: 'resolved', response });
      alert('Ticket marked as resolved');
      setSelectedTicket(null);
      setResponse('');
      fetchTickets();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update ticket');
    } finally {
      setUpdating(false);
    }
  };

  const filteredTickets = tickets.filter(t => 
    t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.student?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-6 animate-fade-in">
      <div className="flex justify-between items-center px-2">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Support Inbox</h1>
          <p className="text-gray-500 text-sm font-medium mt-1">Manage and resolve student concerns.</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl font-bold text-xs outline-none focus:border-blue-200 transition-all w-64" 
              />
           </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex gap-8">
        {/* Ticket List */}
        <div className="w-1/3 overflow-y-auto pr-4 custom-scrollbar space-y-4">
          {loading ? (
             <div className="flex py-20 items-center justify-center"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>
          ) : filteredTickets.length === 0 ? (
             <div className="bg-white border border-gray-100 rounded-[32px] p-12 text-center text-gray-400 font-bold italic">No tickets in inbox.</div>
          ) : filteredTickets.map((ticket) => (
            <div 
              key={ticket._id} 
              onClick={() => setSelectedTicket(ticket)}
              className={`bg-white border transition-all cursor-pointer p-6 rounded-[32px] shadow-sm hover:shadow-md relative overflow-hidden ${
                selectedTicket?._id === ticket._id ? 'border-blue-200 ring-2 ring-blue-50' : 'border-gray-100'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest ${
                  ticket.priority === 'high' ? 'bg-rose-50 text-rose-600' : 
                  ticket.priority === 'medium' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                }`}>
                  {ticket.priority}
                </span>
                <span className={`text-[8px] font-black uppercase tracking-widest ${ticket.status === 'resolved' ? 'text-emerald-500' : 'text-blue-500'}`}>
                  {ticket.status}
                </span>
              </div>
              <h3 className="font-black text-gray-900 tracking-tight text-sm mb-1">{ticket.subject}</h3>
              <p className="text-[10px] font-bold text-gray-400 mb-4">{ticket.student?.name} • {new Date(ticket.createdAt).toLocaleDateString()}</p>
              <p className="text-xs text-gray-500 font-medium line-clamp-2 leading-relaxed">{ticket.description}</p>
            </div>
          ))}
        </div>

        {/* Ticket Detail & Resolution */}
        <div className="flex-1 bg-white border border-gray-100 rounded-[40px] shadow-sm flex flex-col overflow-hidden relative">
          {selectedTicket ? (
            <>
              <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                    <User size={24} className="text-gray-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-gray-900 tracking-tight">{selectedTicket.subject}</h2>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">From: {selectedTicket.student?.name} ({selectedTicket.student?.email})</p>
                  </div>
                </div>
                <button onClick={() => setSelectedTicket(null)} className="p-2 hover:bg-gray-50 rounded-full text-gray-400 transition-all"><X size={20} /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-10 space-y-8 scroll-smooth">
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Description</p>
                  <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
                    <p className="text-base text-gray-700 font-medium leading-relaxed italic">"{selectedTicket.description}"</p>
                  </div>
                </div>

                {selectedTicket.status !== 'resolved' ? (
                  <div className="space-y-4 pt-4 border-t border-gray-50">
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest px-2 flex items-center gap-2">
                       <MessageSquare size={12} /> Resolution Response
                    </p>
                    <textarea 
                      rows={6}
                      placeholder="Type your response to the student..."
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      className="w-full p-8 bg-blue-50/30 border-2 border-transparent focus:border-blue-100 focus:bg-white rounded-3xl font-bold text-sm outline-none transition-all resize-none shadow-inner" 
                    />
                    <button 
                      disabled={updating || !response}
                      onClick={() => handleResolve(selectedTicket._id)}
                      className="w-full py-4 bg-[#000613] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center justify-center gap-2 shadow-xl shadow-black/10 active:scale-95 disabled:opacity-50"
                    >
                      {updating ? <Loader2 size={16} className="animate-spin" /> : <><Send size={14} /> Resolve & Send Notification</>}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 pt-4 border-t border-emerald-50">
                    <div className="bg-emerald-50 rounded-3xl p-8 border border-emerald-100 space-y-2">
                       <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                          <CheckCircle2 size={12} /> Resolved at {new Date(selectedTicket.resolvedAt).toLocaleString()}
                       </p>
                       <p className="text-base text-emerald-800 font-black leading-relaxed">"{selectedTicket.response}"</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-20 text-center space-y-6">
              <div className="w-24 h-24 bg-gray-50 rounded-[40px] flex items-center justify-center text-gray-200">
                <Inbox size={48} />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900 tracking-tight">Select a ticket to respond</h3>
                <p className="text-gray-400 text-sm font-medium mt-2 max-w-xs mx-auto">Click on a helpdesk request from the list to view details and provide resolution.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupportInbox;
