import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, Search, FileText, Users, 
  Calendar, Settings, CreditCard, PlayCircle, ChevronDown, 
  MessageSquare, Download, Video, Send, 
  Upload, Loader2, CheckCircle2, Clock, AlertCircle, 
  ArrowUpRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import api from '../../api';

const RecruiterHelpSupport: React.FC = () => {
  const { user, profile } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [submitting, setSubmitting] = useState(false);
  const [tickets, setTickets] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    subject: '',
    category: 'Job Posting Help',
    priority: 'Medium',
    message: ''
  });
  const [screenshot, setScreenshot] = useState<File | null>(null);

  const categories = [
    { title: 'Job Posting Help', icon: FileText, desc: 'Master the art of creating impactful job listings and managing visibility settings.' },
    { title: 'Candidate Management', icon: Users, desc: 'Efficient screening workflows, shortlisting criteria, and applicant communication.' },
    { title: 'Interview Scheduling', icon: Calendar, desc: 'Syncing your calendar, creating meeting links, and automating reminders.' },
    { title: 'Technical Support', icon: Settings, desc: 'Troubleshoot platform access, performance issues, and integration errors.' },
    { title: 'Account & Billing', icon: CreditCard, desc: 'Manage recruiter profiles, update company details, and billing preferences.' },
    { title: 'Platform Tutorials', icon: PlayCircle, desc: 'Step-by-step video guides and interactive walkthroughs for the console.' },
  ];

  const faqs = [
    { q: 'How do I edit an active job posting?', a: 'To edit an active job, navigate to "Manage Jobs" from the sidebar, find your active listing, and click the three dots icon to select "Edit Posting". Changes go live immediately.' },
    { q: 'Can I download candidate resumes in bulk?', a: 'Yes! From the "Applicants" page, select multiple candidates and use the "Export Selected" button to download a ZIP file of all resumes.' },
    { q: 'How do I reschedule a confirmed interview?', a: 'Go to your "Interview Schedule", click on the specific interview, and select "Reschedule". A notification will be sent to the candidate for approval.' },
    { q: 'Where can I see the placement history for my company?', a: 'Placement Analytics (available in the sidebar) provides detailed reports on your previous hiring cycles and success rates.' }
  ];

  const fetchTickets = async () => {
    try {
      const { data } = await api.get('/tickets');
      setTickets(data);
    } catch (err) {
      console.error('Error fetching tickets:', err);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.message || !formData.subject) {
      showError('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    const data = new FormData();
    data.append('subject', formData.subject);
    data.append('issue_type', formData.category);
    data.append('message', formData.message);
    data.append('priority', formData.priority);
    if (screenshot) {
      data.append('screenshot', screenshot);
    }

    try {
      await api.post('/tickets', data);
      showSuccess('Support request submitted successfully!');
      setFormData({ subject: '', category: 'Job Posting Help', priority: 'Medium', message: '' });
      setScreenshot(null);
      fetchTickets();
    } catch (err) {
      showError('Failed to submit support request');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'resolved':
        return <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5"><CheckCircle2 size={10} /> Resolved</span>;
      case 'in-progress':
        return <span className="px-2.5 py-1 bg-blue-50 text-[#0060FF] rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5"><Clock size={10} /> In Progress</span>;
      default:
        return <span className="px-2.5 py-1 bg-orange-50 text-orange-600 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5"><AlertCircle size={10} /> Open</span>;
    }
  };

  return (
    <div className="max-w-[1500px] mx-auto pb-12 animate-in fade-in duration-700">
      {/* Sub Header */}
      <div className="flex items-center justify-between py-6 px-8 border-b border-gray-100 mb-8 bg-white/50 backdrop-blur-sm sticky top-0 z-20">
        <div className="flex items-center gap-12">
          <span className="text-xl font-black tracking-tight text-gray-900">The Academic Authority</span>
          <nav className="flex items-center gap-8">
            <button className="text-[11px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors">Help Center</button>
            <button className="text-[11px] font-black text-gray-900 border-b-2 border-gray-900 pb-1 uppercase tracking-widest">Support Tickets</button>
            <button className="text-[11px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors">Community</button>
          </nav>
        </div>
        <button className="bg-[#000613] text-white px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-black/10 hover:bg-blue-600 transition-all active:scale-95 leading-none">
          Contact Support
        </button>
      </div>

      <div className="px-8 space-y-12">
        {/* Header Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
          <span>Recruiter Support Center</span>
          <ChevronRight size={12} />
          <span className="text-gray-900">Get Assistance</span>
        </div>
        
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-[-0.03em] leading-tight">
            How can we assist your<br />recruitment today?
          </h1>
          
          <div className="relative w-full lg:w-[450px]">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search for documentation, FAQs, or tutorials..."
              className="w-full bg-white border border-gray-100 rounded-2xl py-5 pl-16 pr-24 text-sm font-medium shadow-xl shadow-black/5 outline-none focus:ring-2 focus:ring-[#0060FF]/20 focus:border-[#0060FF] transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#000613] text-white px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-[#1a202c] transition-colors">
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Help Categories Grid */}
      <div className="space-y-6 pt-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-black text-gray-900 tracking-tight">Help Categories</h2>
          <button className="text-[10px] font-black uppercase text-[#0060FF] tracking-widest hover:underline">View All Guides</button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, i) => (
            <div key={i} className="group bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 bg-gray-50 text-gray-500 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#000613] group-hover:text-white transition-colors">
                <cat.icon size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{cat.title}</h3>
              <p className="text-sm text-gray-400 font-medium leading-relaxed">{cat.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Main Content Area (FAQ) */}
        <div className="flex-1 space-y-12">
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Frequently Asked Questions</h2>
            
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                  <button 
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-sm font-bold text-gray-800 pr-4">{faq.q}</span>
                    <ChevronDown size={18} className={`text-gray-400 transition-transform duration-300 ${openFaq === i ? 'rotate-180 text-[#0060FF]' : ''}`} />
                  </button>
                  {openFaq === i && (
                    <div className="px-6 pb-6 text-sm text-gray-500 font-medium leading-relaxed animate-in slide-in-from-top-2 duration-300">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Active Support Tickets */}
          <div className="space-y-6 pt-12 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Active Support Tickets</h2>
                <p className="text-xs text-gray-400 font-medium mt-1">Status of your recent communication with the support team.</p>
              </div>
              <span className="px-3 py-1 bg-blue-50 text-[#0060FF] rounded-full text-[10px] font-black uppercase tracking-wider">
                {tickets.filter(t => t.status !== 'resolved').length} Pending Action
              </span>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[600px]">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Ticket ID</th>
                      <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Subject</th>
                      <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                      <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Last Update</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {tickets.length > 0 ? tickets.map((t) => (
                      <tr key={t._id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-8 py-6 text-xs font-black text-gray-400 group-hover:text-gray-900">#TK-{t._id.slice(-5).toUpperCase()}</td>
                        <td className="px-8 py-6 text-sm font-bold text-gray-900">{t.subject}</td>
                        <td className="px-8 py-6">{getStatusBadge(t.status)}</td>
                        <td className="px-8 py-6 text-xs font-bold text-gray-400">
                          {new Date(t.updatedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={4} className="px-8 py-12 text-center text-gray-400 text-sm font-medium italic">No active support tickets found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="lg:w-[400px] space-y-12">
          {/* Contact Form Panel */}
          <div className="bg-white p-8 rounded-3xl shadow-2xl shadow-black/5 border border-gray-100 space-y-8">
            <div className="space-y-2">
              <h3 className="text-xl font-black text-gray-900 tracking-tight">Contact Partner Success</h3>
              <p className="text-xs text-gray-400 font-medium leading-relaxed">Our dedicated success managers usually respond within 4 business hours.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                <input type="text" readOnly value={profile?.user?.name || user?.name || ''} className="w-full bg-gray-50 border border-transparent rounded-xl px-5 py-3 text-xs font-bold text-gray-400 outline-none" />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Work Email</label>
                <input type="email" readOnly value={profile?.user?.email || user?.email || ''} className="w-full bg-gray-50 border border-transparent rounded-xl px-5 py-3 text-xs font-bold text-gray-400 outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Priority</label>
                  <select 
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    className="w-full bg-gray-50 border border-transparent rounded-xl px-4 py-3 text-xs font-black text-gray-600 outline-none focus:bg-white focus:border-gray-200 transition-all cursor-pointer"
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Urgent</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Category</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full bg-gray-50 border border-transparent rounded-xl px-4 py-3 text-xs font-black text-gray-600 outline-none focus:bg-white focus:border-gray-200 transition-all cursor-pointer"
                  >
                    {categories.map(c => <option key={c.title}>{c.title}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Subject</label>
                <input 
                  type="text" 
                  placeholder="Brief summary of your request" 
                  className="w-full bg-gray-50 border border-transparent rounded-xl px-5 py-3 text-xs font-bold text-gray-900 outline-none focus:bg-white focus:border-gray-100 transition-all shadow-sm"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Message</label>
                <textarea 
                  rows={4} 
                  placeholder="How can we help you today?" 
                  className="w-full bg-gray-50 border border-transparent rounded-xl px-5 py-4 text-xs font-medium text-gray-900 outline-none focus:bg-white focus:border-gray-100 transition-all shadow-sm resize-none"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                ></textarea>
              </div>

              <div className="relative">
                <input 
                  type="file" 
                  id="screenshot" 
                  className="hidden" 
                  onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
                />
                <label 
                  htmlFor="screenshot"
                  className="w-full flex items-center justify-center gap-3 py-4 bg-gray-50 text-gray-400 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-gray-100 transition-all"
                >
                  <Upload size={14} /> 
                  {screenshot ? screenshot.name : 'Attach Logo/Screenshot'}
                </label>
              </div>

              <button 
                type="submit"
                disabled={submitting}
                className="w-full py-5 bg-[#000613] text-white rounded-xl text-xs font-black uppercase tracking-[0.2em] shadow-xl hover:bg-[#1a202c] transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={16} />}
                Submit Support Request
              </button>
            </form>
          </div>

          {/* Quick Links */}
          <div className="bg-[#000613] p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000"></div>
            
            <div className="relative z-10 space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-2 bg-[#0060FF] rounded-full"></div>
                <h3 className="text-xl font-black text-white tracking-tight">Quick Links</h3>
              </div>
              
              <div className="space-y-6">
                {[
                  { label: 'Download Recruitment Policy PDF', icon: Download },
                  { label: 'Join Recruiter Training Webinar', icon: Video },
                  { label: 'Contact University Registrar', icon: MessageSquare }
                ].map((link, i) => (
                  <button key={i} className="w-full flex items-center justify-between text-left group/link">
                    <span className="text-[11px] font-bold text-gray-400 group-hover/link:text-white transition-colors leading-relaxed">{link.label}</span>
                    <ArrowUpRight size={14} className="text-gray-600 group-hover/link:text-[#0060FF] transition-all group-hover/link:translate-x-1 group-hover/link:-translate-y-1" />
                  </button>
                ))}
              </div>

              <div className="pt-8 border-t border-white/10 space-y-2">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.15em]">Priority Hotline</p>
                <h4 className="text-2xl font-black text-white">+1 (800) ACAD-HLP</h4>
                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Available 24/7 for Enterprise Partners</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="pt-12 border-t border-gray-100 text-center pb-8">
        <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">
          © 2024 THE ACADEMIC AUTHORITY — PROFESSIONAL RECRUITMENT MANAGEMENT ECOSYSTEM
        </p>
      </footer>
      </div>
    </div>
  );
};

export default RecruiterHelpSupport;
