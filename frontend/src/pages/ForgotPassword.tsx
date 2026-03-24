import React, { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, ShieldCheck, RotateCcw, ArrowRight } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import api from '../api';

const ForgotPassword: React.FC = () => {
  const { showError, showSuccess } = useNotification();
  const [email, setEmail] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
      showSuccess('Reset link sent to your email', 'Email Sent');
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to send reset link', 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full overflow-hidden font-body bg-[#f8f9fa]">
      {/* Left Section: Recovery Branding */}
      <div className="hidden md:flex relative w-1/2 flex-col justify-between p-12 lg:p-16 bg-gradient-to-br from-[#020617] via-[#0B1E3F] to-[#0D2544] text-white">
        {/* Decorative Background Decoration */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] -mr-48 -mt-48 pointer-events-none"></div>
        
        {/* Header / Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-9 h-9 bg-white flex items-center justify-center rounded-lg shadow-lg">
             <ShieldCheck className="text-[#020617] w-5 h-5" />
          </div>
          <span className="text-xl font-display font-bold tracking-tight">Placement MS</span>
        </div>

        {/* Recovery Text Section */}
        <div className="relative z-10 max-w-lg">
          <h1 className="text-4xl lg:text-5xl font-display font-bold mb-6 leading-[1.15] tracking-tight">
            Secure Access <br />
            <span className="text-blue-400">Recovery.</span>
          </h1>
          <p className="text-base text-blue-100/70 leading-relaxed font-medium">
            Protecting your professional identity and ensuring placement integrity starts here. 
            We employ high-level encryption to safeguard your career milestones.
          </p>
        </div>

        {/* Version Info */}
        <div className="relative z-10 flex items-center gap-4 text-[10px] uppercase tracking-[0.2em] font-black text-white/20">
           <div className="w-8 h-[1px] bg-white/10"></div>
           <span>ACADEMIC INTEGRITY SYSTEM V4.2</span>
        </div>
      </div>

      {/* Right Section: Forgot Password Form */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-8 bg-white relative">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          
          {/* Form Card */}
          <div className="bg-white rounded-2xl p-2 md:p-0 transition-all duration-300">
            {!submitted ? (
              <>
                {/* Header with Icon */}
                <div className="text-center md:text-left mb-8">
                   <div className="w-12 h-12 bg-blue-50 flex items-center justify-center rounded-xl mb-6 shadow-sm">
                      <RotateCcw className="text-blue-600 w-6 h-6" />
                   </div>
                   <h2 className="text-2xl lg:text-3xl font-display font-bold text-primary tracking-tight mb-2">Forgot Password?</h2>
                   <p className="text-sm text-gray-400 font-medium">Enter your university email to receive a secure password reset link.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 ml-1">University Email</label>
                    <div className="relative group">
                       <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-blue-500 transition-colors text-gray-300">
                          <Mail className="w-4 h-4" />
                       </div>
                       <input 
                         type="email" 
                         value={email} 
                         onChange={(e) => setEmail(e.target.value)}
                         className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3.5 pl-11 text-sm font-medium text-primary outline-none transition-all duration-300 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 placeholder:text-gray-300"
                         placeholder="e.g. j.doe@university.edu"
                         required
                       />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full py-3.5 px-6 bg-gradient-to-r from-blue-950 to-blue-800 hover:shadow-lg hover:shadow-blue-950/10 hover:scale-[1.02] text-white text-sm font-bold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Sending link...' : 'Send Reset Link'}
                      {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                    </button>
                  </div>

                  <div className="text-center">
                     <Link to="/login" className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-blue-600 transition-colors group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Login
                     </Link>
                  </div>
                </form>
              </>
            ) : (
              <div className="text-center py-12 animate-fade-in">
                 <div className="w-20 h-20 bg-green-50 flex items-center justify-center rounded-full mb-8 shadow-sm mx-auto">
                    <ShieldCheck className="text-green-500 w-10 h-10" />
                 </div>
                 <h2 className="text-3xl font-display font-bold text-primary mb-4">Check your email</h2>
                 <p className="text-gray-400 font-medium mb-10 max-w-sm mx-auto">
                    We've sent a secure password reset link to <span className="text-primary font-bold">{email}</span>. Please check your inbox and spam folder.
                 </p>
                 <Link to="/login" className="btn-primary inline-flex items-center gap-2">
                    Return to Login
                    <ArrowRight className="w-4 h-4" />
                 </Link>
              </div>
            )}
          </div>
        </div>

        {/* Absolute Footer Links */}
        <div className="absolute bottom-8 flex gap-8 text-[10px] uppercase tracking-widest text-[#c4c6cf] font-black transition-all">
           <Link to="/help" className="hover:text-blue-600 transition-colors cursor-pointer">Help Center</Link>
           <Link to="/privacy" className="hover:text-blue-600 transition-colors cursor-pointer">Security Policies</Link>
           <Link to="/help" className="hover:text-blue-600 transition-colors cursor-pointer">Support</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
