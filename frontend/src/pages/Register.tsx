import React, { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, ArrowRight, ShieldCheck, GraduationCap, Briefcase, CheckCircle, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import loginBg from '../assets/login_bg.png';
import { useNotification } from '../context/NotificationContext';

const Register: React.FC = () => {
  const { showError } = useNotification();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student' as 'student' | 'recruiter' | 'admin'
  });
  const [agree, setAgree] = useState<boolean>(false);
  const navigate = useNavigate();
  const { register } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!agree) {
      showError('Please agree to the Terms of Service and Privacy Policy.', 'Validation Error');
      return;
    }

    try {
      const user = await register(formData);
      navigate(`/${user.role}/dashboard`);
    } catch (err: any) {
      showError(err || 'Registration failed', 'Registration Error');
    }
  };

  return (
    <div className="flex min-h-screen w-full overflow-hidden font-body bg-surface">
      {/* Left Section: Compact Branding */}
      <div className="hidden md:flex relative w-1/2 flex-col justify-between p-10 lg:p-12 bg-gradient-to-br from-[#0B1E3F] via-[#0D2544] to-[#0E2A47] text-white">
        {/* Decorative Background Shapes */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/5 rounded-full blur-[100px] -mr-48 -mt-48 pointer-events-none"></div>
        
        {/* Header / Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-9 h-9 bg-white flex items-center justify-center rounded-lg shadow-lg">
             <ShieldCheck className="text-[#0B1E3F] w-5 h-5" />
          </div>
          <span className="text-xl font-display font-bold tracking-tight">Placement MS</span>
        </div>

        {/* Content Section - Reduced margins */}
        <div className="relative z-10 max-w-lg mt-4">
          <h1 className="text-3xl lg:text-4xl font-display font-bold mb-4 leading-tight tracking-tight">
            Join the <br />
            <span className="text-blue-300">Placement Management </span> 
            System.
          </h1>
          <p className="text-sm lg:text-base text-blue-100 leading-relaxed font-medium mb-8 opacity-80">
            The digital curator for career excellence. Start your journey with global opportunities and secure your future through our specialized portal.
          </p>
          
          {/* Image card with overlay and rounded-2xl - slightly smaller h */}
          <div className="relative group max-w-sm rounded-2xl overflow-hidden shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B1E3F]/80 to-transparent z-10 opacity-60"></div>
            <img 
              src={loginBg} 
              alt="Community" 
              className="w-full h-48 lg:h-52 object-cover rounded-2xl"
            />
          </div>
        </div>

        {/* Feature Icons */}
        <div className="relative z-10 flex gap-4">
           {[GraduationCap, Briefcase, CheckCircle].map((Icon, idx) => (
             <div key={idx} className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/5 backdrop-blur-sm hover:bg-white transition-all duration-300 group cursor-default">
                <Icon className="w-5 h-5 text-white group-hover:text-[#0B1E3F]" />
             </div>
           ))}
        </div>
      </div>

      {/* Right Section: Form Centered Vertically */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-8 bg-surface-container-lowest">
        <div className="w-full max-w-md space-y-6 animate-fade-in py-4">
          <div className="absolute top-8 right-8 z-50">
            <button 
              onClick={toggleTheme}
              type="button"
              className="p-3 bg-surface-container/80 backdrop-blur-md border border-outline-variant/30 rounded-2xl text-on-surface hover:bg-surface-container-high transition-all shadow-xl group"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? <Moon size={20} className="group-hover:rotate-12 transition-transform" /> : <Sun size={20} className="group-hover:rotate-90 transition-transform" />}
            </button>
          </div>

          <div className="text-center md:text-left">
              <span className="text-[10px] uppercase tracking-[0.2em] font-black text-surface-tint block mb-1.5 opacity-60">Registration</span>
              <h2 className="text-2xl lg:text-[1.75rem] font-display font-bold text-on-surface tracking-tight mb-1">Create Your Account</h2>
              <p className="text-sm text-on-surface-variant font-medium">Elevate your career trajectory with our specialized network.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Tracker - Reduced space-y */}
            <div className="space-y-2">
               <label className="text-[10px] uppercase tracking-widest font-black text-on-surface-variant ml-1">I am registering as a</label>
               <div className="flex p-1 bg-surface-container rounded-2xl gap-1">
                 {(['student', 'recruiter'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setFormData({...formData, role: r})}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all duration-300 capitalize ${formData.role === r ? 'bg-surface-container-lowest text-on-surface shadow-md' : 'text-on-surface-variant/60 hover:text-on-surface hover:bg-surface-container-high/50'}`}
                    >
                     {r}
                   </button>
                 ))}
               </div>
            </div>

            {/* Inputs - Space-y-3.5 */}
            <div className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface ml-1">Full Name</label>
                <div className="relative group">
                   <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-surface-tint transition-colors text-on-surface-variant/40">
                      <User className="w-4 h-4" />
                   </div>
                    <input 
                      type="text" 
                      value={formData.name} 
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-surface-container border border-outline-variant/30 rounded-xl px-4 py-2.5 pl-11 text-sm font-medium text-on-surface outline-none transition-all duration-300 focus:bg-surface-container-lowest focus:border-surface-tint focus:ring-4 focus:ring-surface-tint/5 placeholder:text-on-surface-variant/30 shadow-sm"
                      placeholder="e.g. Alexander Hamilton"
                      required
                    />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface ml-1">University Email / ID</label>
                <div className="relative group">
                   <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-surface-tint transition-colors text-on-surface-variant/40">
                      <Mail className="w-4 h-4" />
                   </div>
                    <input 
                      type="email" 
                      value={formData.email} 
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-surface-container border border-outline-variant/30 rounded-xl px-4 py-2.5 pl-11 text-sm font-medium text-on-surface outline-none transition-all duration-300 focus:bg-surface-container-lowest focus:border-surface-tint focus:ring-4 focus:ring-surface-tint/5 placeholder:text-on-surface-variant/30 shadow-sm"
                      placeholder="student.id@university.edu"
                      required
                    />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface ml-1">Password</label>
                <div className="relative group">
                   <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-surface-tint transition-colors text-on-surface-variant/40">
                      <Lock className="w-4 h-4" />
                   </div>
                    <input 
                      type="password" 
                      value={formData.password} 
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="w-full bg-surface-container border border-outline-variant/30 rounded-xl px-4 py-2.5 pl-11 text-sm font-medium text-on-surface outline-none transition-all duration-300 focus:bg-surface-container-lowest focus:border-surface-tint focus:ring-4 focus:ring-surface-tint/5 placeholder:text-on-surface-variant/30 shadow-sm"
                      placeholder="••••••••"
                      required
                    />
                </div>
                <p className="text-[10px] text-on-surface-variant/60 ml-1 font-medium">Minimum 8 characters with letters and numbers.</p>
              </div>
            </div>

            {/* Consent - Reduced space */}
            <div className="flex items-start px-1 gap-3 py-1">
               <input 
                 type="checkbox" 
                 id="agree" 
                 checked={agree}
                 onChange={(e) => setAgree(e.target.checked)}
                 className="mt-0.5 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500/10 cursor-pointer" 
               />
               <label htmlFor="agree" className="text-[11px] font-semibold text-on-surface-variant leading-tight">
                 I agree to the <Link to="/terms" className="text-surface-tint font-bold hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-surface-tint font-bold hover:underline">Privacy Policy</Link>.
               </label>
            </div>

            <div className="pt-1">
              <button 
                type="submit" 
                className="w-full py-3 bg-gradient-to-r from-blue-950 to-blue-800 hover:shadow-lg hover:scale-105 text-white text-sm font-bold rounded-lg shadow-md transition-all duration-300 flex items-center justify-center gap-2 group"
              >
                Create Account
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Alternate Link - Reduced spacing */}
            <div className="text-center pt-4 space-y-3">
              <p className="text-sm font-medium text-on-surface-variant">
                Already have an account? {' '}
                <Link to="/login" className="text-surface-tint font-bold hover:underline underline-offset-4">
                  Sign In
                </Link>
              </p>
              
              <div className="flex justify-center gap-6 text-[10px] uppercase tracking-widest text-on-surface-variant/40 font-black border-t border-outline-variant/30 pt-8 mt-4">
                 <Link to="/privacy" className="hover:text-blue-600 transition-colors cursor-pointer">Privacy</Link>
                 <Link to="/terms" className="hover:text-blue-600 transition-colors cursor-pointer">Terms</Link>
                 <Link to="/help" className="hover:text-blue-600 transition-colors cursor-pointer">Help</Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
