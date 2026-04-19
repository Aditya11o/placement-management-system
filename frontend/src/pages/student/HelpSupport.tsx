import React, { useState, useEffect } from 'react';
import { 
  ChevronDown, ChevronUp, User, 
  MessageSquare, Briefcase, Users, 
  FileText, Monitor, MoreHorizontal, Send, Upload, 
  RefreshCw, Key, Download, Map, Smartphone, ShieldCheck, 
  CheckCircle, Clock, AlertCircle, ExternalLink
} from 'lucide-react';
import Dropdown from '../../components/Dropdown';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import api from '../../api';

interface FAQ {
  _id: string;
  question: string;
  answer: string;
  category: string;
}

interface Ticket {
  _id: string;
  subject: string;
  issue_type: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  createdAt: string;
}

const HelpSupport: React.FC = () => {
  const { user, profile } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketType, setTicketType] = useState('General Inquiry');
  const [ticketMessage, setTicketMessage] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const categories = [
    { title: 'Account Management', icon: User, desc: 'Update your profile, change passwords, and manage notification settings.' },
    { title: 'Job Applications', icon: Briefcase, desc: 'Guidelines on applying for positions and tracking your application flow.' },
    { title: 'Interview Support', icon: Users, desc: 'Preparation tips, resource recommendations, and virtual technical setup guides.' },
    { title: 'Resume & Profile', icon: FileText, desc: 'Manage your professional identity, upload resumes, and optimize your student profile.' },
    { title: 'Technical Issues', icon: Monitor, desc: 'Help with platform glitches, login errors, or system compatibility.' },
    { title: 'Other Queries', icon: MoreHorizontal, desc: "Anything else that doesn't fit the categories above? We're here." },
  ];

  const fetchData = async () => {
    try {
      setLoading(true);
      const [faqRes, ticketRes] = await Promise.all([
        api.get('/faqs'),
        api.get('/tickets')
      ]);
      setFaqs(faqRes.data);
      setTickets(ticketRes.data);
    } catch (err) {
      console.error('Error fetching help data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketMessage) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('subject', ticketSubject || ticketType);
      formData.append('issue_type', ticketType);
      formData.append('message', ticketMessage);
      if (screenshot) {
        formData.append('screenshot', screenshot);
      }

      await api.post('/tickets', formData);
      showSuccess('Support request sent successfully!', 'Ticket Created');
      setTicketMessage('');
      setTicketSubject('');
      setScreenshot(null);
      fetchData();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to send support request', 'Submission Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-emerald-100 text-emerald-700';
      case 'in-progress': return 'bg-blue-100 text-blue-700';
      case 'open': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const statusIcons = {
    resolved: <CheckCircle size={12} />,
    'in-progress': <Clock size={12} />,
    open: <AlertCircle size={12} />,
    closed: <ShieldCheck size={12} />
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <RefreshCw size={40} className="animate-spin text-blue-600 opacity-20" />
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto pb-20 animate-fade-in">
      {/* Search Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-tight">How can we help?</h1>
        <p className="text-gray-500 mt-2 font-medium">Navigate through our support resources or get in touch with our team for personalized assistance.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-12">
          
          {/* Support Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300 cursor-pointer group">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center p-3 mb-6 group-hover:bg-blue-950 group-hover:text-white transition-colors duration-300">
                  <cat.icon size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{cat.title}</h3>
                <p className="text-sm text-gray-400 font-medium leading-relaxed">{cat.desc}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* FAQ Section */}
            <div className="flex-1 space-y-6">
              <div className="flex justify-between items-end mb-2">
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Frequently Asked Questions</h2>
                <button className="text-[10px] font-black uppercase text-blue-600 tracking-widest hover:text-blue-800 transition-colors">View All</button>
              </div>
              
              <div className="space-y-4">
                {(faqs.length > 0 ? faqs : [
                  { _id: '1', question: 'How do I apply for a specific job opening?', answer: 'Navigate to the jobs section, click on the desired job, and use the "Apply Now" button.' },
                  { _id: '2', question: 'Can I upload multiple versions of my resume?', answer: 'Yes, you can manage multiple resumes in your profile settings.' },
                  { _id: '3', question: 'How can I check my application status?', answer: 'Go to the "Applications" tab to track your status in real-time.' },
                  { _id: '4', question: 'Where do I find my interview schedule?', answer: 'Interviews are visible in both the dashboard and the "Interview Prep" section.' }
                ]).map((faq) => (
                  <div key={faq._id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <button 
                      onClick={() => setOpenFaq(openFaq === faq._id ? null : faq._id)}
                      className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-sm font-bold text-gray-800 pr-4">{faq.question}</span>
                      {openFaq === faq._id ? <ChevronUp size={18} className="text-blue-600" /> : <ChevronDown size={18} className="text-gray-400" />}
                    </button>
                    {openFaq === faq._id && (
                      <div className="p-5 pt-0 text-sm text-gray-500 font-medium leading-relaxed border-t border-gray-50 bg-gray-50/30">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Support Form Section */}
            <div className="lg:w-[400px]">
              <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 flex flex-col relative h-full">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Message Support</h2>
                  <p className="text-xs text-gray-400 font-medium">Can't find what you need? We'll get back to you within 24 hours.</p>
                </div>

                <form onSubmit={handleSubmitTicket} className="space-y-5 flex-1">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Full Name</label>
                      <input type="text" value={profile?.user?.name || user?.name || ''} readOnly className="w-full bg-gray-50 border border-transparent rounded-xl px-4 py-2.5 text-xs font-bold text-gray-500 outline-none" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Role</label>
                      <input type="text" value="Student" readOnly className="w-full bg-gray-50 border border-transparent rounded-xl px-4 py-2.5 text-xs font-bold text-gray-500 outline-none" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Email Address</label>
                    <input type="email" value={profile?.user?.email || user?.email || ''} readOnly className="w-full bg-gray-50 border border-transparent rounded-xl px-4 py-2.5 text-xs font-bold text-gray-500 outline-none" />
                  </div>

                  <div>
                    <Dropdown 
                      label="Issue Type"
                      value={ticketType}
                      onChange={(val) => setTicketType(val)}
                      options={[
                        'Account Management', 'Job Applications', 'Interview Preparation',
                        'Resume & Profile', 'Technical Issues', 'Other Queries'
                      ]}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Message</label>
                    <textarea 
                      value={ticketMessage}
                      onChange={(e) => setTicketMessage(e.target.value)}
                      rows={5}
                      placeholder="Describe your issue in detail..."
                      className="w-full bg-gray-100/50 border border-transparent rounded-xl px-4 py-3 text-xs font-medium text-gray-900 outline-none focus:bg-white focus:border-blue-500 transition-all resize-none"
                    ></textarea>
                  </div>

                  <div className="relative group">
                    <input 
                      type="file" 
                      onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
                      className="hidden" 
                      id="screenshot-upload"
                      accept="image/*"
                    />
                    <label 
                      htmlFor="screenshot-upload"
                      className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-100 rounded-2xl hover:border-blue-500 hover:bg-blue-50/50 transition-all cursor-pointer bg-gray-50/50"
                    >
                      <Upload className="w-6 h-6 text-gray-300 mb-2" />
                      <span className="text-[10px] font-black text-gray-400 uppercase">{screenshot ? screenshot.name : 'Upload Screenshot (Optional)'}</span>
                    </label>
                  </div>

                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-blue-950 text-white rounded-xl text-sm font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {isSubmitting ? <RefreshCw size={20} className="animate-spin" /> : <Send size={18} />}
                    Send Support Request
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Ticket History Section */}
          <div className="bg-gray-50/50 p-8 rounded-3xl border border-gray-100 overflow-hidden">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Your Support Tickets</h2>
                <p className="text-xs text-gray-400 font-medium mt-1">History of your recent communication with the support team.</p>
              </div>
              <button 
                onClick={() => fetchData()}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all active:scale-95"
              >
                <RefreshCw size={14} /> Refresh Status
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Ticket ID</th>
                    <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest w-[40%]">Subject</th>
                    <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                    <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {tickets.length > 0 ? tickets.map((ticket) => (
                    <tr key={ticket._id} className="group hover:bg-white transition-colors duration-200">
                      <td className="py-5">
                        <span className="text-xs font-black text-gray-400 group-hover:text-blue-600">#PL-{ticket._id.slice(-4).toUpperCase()}</span>
                      </td>
                      <td className="py-5">
                        <p className="text-sm font-bold text-gray-900 line-clamp-1">{ticket.subject}</p>
                      </td>
                      <td className="py-5">
                        <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1.5 w-fit ${getStatusColor(ticket.status)}`}>
                          {(statusIcons as any)[ticket.status]} {ticket.status}
                        </span>
                      </td>
                      <td className="py-5">
                        <span className="text-xs font-bold text-gray-400">{new Date(ticket.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-gray-400 text-sm font-medium">No active support tickets found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar Panel Area */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Quick Actions Panel */}
          <div className="bg-[#0f172a] p-8 rounded-3xl text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000"></div>
            <h3 className="text-xl font-black mb-8 relative z-10">Quick Actions</h3>
            <div className="space-y-3">
              {[
                { label: 'Reset Password', icon: Key },
                { label: 'Download Resume Guide', icon: Download },
                { label: 'Platform Tour', icon: Map },
                { label: 'Update Phone Number', icon: Smartphone }
              ].map((action, i) => (
                <button key={i} className="w-full flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all group/btn">
                  <div className="flex items-center gap-3">
                    <action.icon size={18} className="text-blue-400" />
                    <span className="text-sm font-bold opacity-80 group-hover/btn:opacity-100">{action.label}</span>
                  </div>
                  <ChevronDown size={14} className="opacity-30 group-hover/btn:opacity-100 -rotate-90" />
                </button>
              ))}
            </div>
          </div>

          {/* Counselor Section */}
          <div className="bg-orange-50 p-8 rounded-3xl border border-orange-100 shadow-sm">
            <div className="mb-6">
              <h3 className="text-xl font-black text-gray-900 tracking-tight">Academic Counselor</h3>
              <p className="text-xs text-gray-500 font-medium mt-1">Need career-specific advice instead of technical support?</p>
            </div>
            
            <div className="flex items-center gap-4 mb-8 bg-white p-4 rounded-2xl shadow-sm border border-orange-100/50">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop" alt="Counselor" className="w-full h-full object-cover" />
              </div>
              <div>
                <h4 className="text-sm font-black text-gray-900">Dr. Sarah Jenkins</h4>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Career Placement Lead</p>
              </div>
              <div className="ml-auto w-8 h-8 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center">
                <ExternalLink size={14} />
              </div>
            </div>

            <button className="w-full py-4 bg-orange-950 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-black transition-all shadow-lg active:scale-95">
              Schedule a Meeting
            </button>
          </div>

          {/* Contact Support Bubble */}
          <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100 flex items-center gap-4 relative group cursor-pointer hover:bg-blue-100/50 transition-colors">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <MessageSquare size={20} fill="white" />
            </div>
            <div>
               <p className="text-sm font-black text-gray-900">Live Chat Support</p>
               <p className="text-[10px] font-bold text-gray-500">Typical response time: 5 mins</p>
            </div>
            <div className="ml-auto w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default HelpSupport;
