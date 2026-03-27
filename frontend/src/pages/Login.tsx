import React, { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';
import loginBg from '../assets/login_bg.png';
import { useNotification } from '../context/NotificationContext';

const Login: React.FC = () => {
  const { showError } = useNotification();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [role, setRole] = useState<'student' | 'admin' | 'recruiter'>('student');
  const [otp, setOtp] = useState<string>('');
  const [requireOTP, setRequireOTP] = useState<boolean>(false);
  const navigate = useNavigate();
  const { login, verifyOTP } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (requireOTP) {
        const user = await verifyOTP(email, otp);
        navigate(`/${user.role}/dashboard`);
        return;
      }

      const res = await login(email, password);
      
      if (res.requireOTP) {
        setRequireOTP(true);
        return;
      }

      const user = res;
      // Explicitly store token as requested
      if (user.token) {
        localStorage.setItem("token", user.token);
      }
      
      if (user.role !== role) {
        showError(`Access denied. You are registered as a ${user.role}.`, 'Access Denied');
        return;
      }
      navigate(`/${user.role}/dashboard`);
    } catch (err: any) {
      showError(err || 'Invalid credentials', 'Login Error');
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden font-body bg-surface">
      {/* Left Section: Compact Editorial */}
      <div className="hidden md:flex relative w-1/2 flex-col justify-between p-12 lg:p-16 bg-gradient-to-br from-[#0B1E3F] via-[#0D2544] to-[#0E2A47] text-white overflow-hidden">
        {/* Abstract Background Decoration */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/5 rounded-full blur-[100px] -mr-48 -mt-48 pointer-events-none"></div>
        
        {/* Header / Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-9 h-9 bg-white flex items-center justify-center rounded-lg shadow-lg">
             <ShieldCheck className="text-[#0B1E3F] w-5 h-5" />
          </div>
          <span className="text-xl font-display font-bold tracking-tight">Placement MS</span>
        </div>

        {/* Welcome Text Section - Compact width */}
        <div className="relative z-10 max-w-lg mt-8">
          <h1 className="text-4xl lg:text-5xl font-display font-bold mb-6 leading-tight tracking-tight">
            Welcome to the <br />
            <span className="text-blue-300">Placement Management </span> 
            System.
          </h1>
          <p className="text-base text-gray-300 leading-relaxed font-medium">
            Empowering career growth and academic excellence through our professional placement portal. 
            Connect with industry leaders and secure your future.
          </p>
          
          {/* Smaller image card with overlay */}
          <div className="mt-12 relative group max-w-sm">
            <div className="absolute inset-0 bg-[#0B1E3F]/50 rounded-2xl group-hover:bg-[#0B1E3F]/30 transition-all duration-500 z-10"></div>
            <img 
              src={loginBg} 
              alt="Professional Collaboration" 
              className="w-full h-56 object-cover rounded-2xl shadow-xl border border-white/10"
            />
          </div>
        </div>

        {/* Footer info links - Tiny and muted */}
        <div className="relative z-10 flex gap-6 text-[10px] uppercase tracking-widest font-bold text-white/20">
           <span>© 2026 Placement Portal</span>
        </div>
      </div>

      {/* Right Section: Centered Form */}
      <div className="w-full md:w-1/2 relative flex items-center justify-center p-8 bg-surface-container-lowest overflow-y-auto min-h-screen">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          <div className="text-center md:text-left">
             <span className="text-[10px] uppercase tracking-[0.2em] font-black text-blue-600/60 block mb-2">Authentication</span>
             <h2 className="text-2xl lg:text-3xl font-display font-bold text-primary tracking-tight mb-2">Login to your account</h2>
             <p className="text-sm text-on-surface-variant font-medium">Please enter your university credentials to continue.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Tab Selector */}
            <div className="space-y-3">
               <label className="text-[10px] uppercase tracking-widest font-black text-on-surface-variant ml-1">Select Role</label>
               <div className="flex p-1 bg-surface-container rounded-xl gap-1">
                 {(['student', 'admin', 'recruiter'] as const).map((r) => (
                   <button
                     key={r}
                     type="button"
                     onClick={() => setRole(r)}
                     className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all duration-300 capitalize ${role === r ? 'bg-white text-primary shadow-sm' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200/50'}`}
                   >
                     {r}
                   </button>
                 ))}
               </div>
            </div>

            {/* User Inputs - text-sm */}
            <div className="space-y-4">
              {!requireOTP ? (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-on-surface ml-1">University Email / ID</label>
                    <div className="relative group">
                       <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-blue-500 transition-colors text-gray-300">
                          <Mail className="w-4 h-4" />
                       </div>
                       <input 
                         type="email" 
                         value={email} 
                         onChange={(e) => setEmail(e.target.value)}
                         className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 pl-11 text-sm font-medium text-primary outline-none transition-all duration-300 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 placeholder:text-gray-300"
                         placeholder="name@university.edu"
                         required
                       />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center px-1">
                       <label className="text-xs font-bold text-on-surface">Password</label>
                       <Link to="/forgot-password" className="text-xs font-bold text-blue-600 hover:underline transition-all">Forgot?</Link>
                    </div>
                    <div className="relative group">
                       <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-blue-500 transition-colors text-gray-300">
                          <Lock className="w-4 h-4" />
                       </div>
                       <input 
                         type={showPassword ? "text" : "password"} 
                         value={password} 
                         onChange={(e) => setPassword(e.target.value)}
                         className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 pl-11 pr-11 text-sm font-medium text-primary outline-none transition-all duration-300 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 placeholder:text-gray-300"
                         placeholder="••••••••"
                         required
                       />
                       <button 
                         type="button"
                         onClick={() => setShowPassword(!showPassword)}
                         className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-300 hover:text-blue-500 transition-colors"
                       >
                         {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                       </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-1.5 animate-fade-in">
                  <label className="text-xs font-bold text-on-surface ml-1">Verification Code (sent to {email})</label>
                  <div className="relative group">
                     <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-blue-500 transition-colors text-gray-300">
                        <Lock className="w-4 h-4" />
                     </div>
                     <input 
                       type="text" 
                       value={otp} 
                       onChange={(e) => setOtp(e.target.value)}
                       className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 pl-11 text-sm font-black tracking-[0.5em] text-center text-primary outline-none transition-all duration-300 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 placeholder:text-gray-300"
                       placeholder="000000"
                       maxLength={6}
                       required
                     />
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setRequireOTP(false)}
                    className="text-[10px] font-black uppercase text-blue-600 hover:text-blue-800 transition-colors ml-1"
                  >
                    ← Back to Login
                  </button>
                </div>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center px-1">
               <input 
                 type="checkbox" 
                 id="remember" 
                 className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500/10 cursor-pointer" 
               />
               <label htmlFor="remember" className="ml-2.5 text-xs font-semibold text-on-surface-variant cursor-pointer select-none">
                 Remember this device for 30 days
               </label>
            </div>

            {/* Submit Button - text-sm font-medium */}
            <div className="pt-2">
              <button 
                type="submit" 
                className="w-full py-3 bg-gradient-to-r from-blue-950 to-blue-800 hover:shadow-lg hover:scale-105 text-white text-sm font-bold rounded-lg shadow-md transition-all duration-300 flex items-center justify-center gap-2 group"
              >
                {requireOTP ? 'Verify Account' : 'Log In'}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Bottom CTA */}
            <div className="text-center pt-6 border-t border-gray-50">
              <p className="text-xs text-on-surface-variant font-bold">
                Don't have an account? {' '}
                <Link to="/register" className="text-blue-600 font-bold hover:underline underline-offset-4">
                  Request access
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Footer Area - Pinned to bottom */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-8 text-[10px] uppercase tracking-widest text-[#c4c6cf] font-black">
           <Link to="/privacy" className="hover:text-blue-600 transition-colors cursor-pointer">Privacy</Link>
           <Link to="/terms" className="hover:text-blue-600 transition-colors cursor-pointer">Terms</Link>
           <Link to="/help" className="hover:text-blue-600 transition-colors cursor-pointer">Help</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
