import React, { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowRight, ShieldCheck, CheckCircle2, ArrowLeft } from 'lucide-react';

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    // Simulate API call
    setSubmitted(true);
    setTimeout(() => {
      navigate('/login');
    }, 3000);
  };

  return (
    <div className="flex min-h-screen w-full overflow-hidden font-body bg-[#f8f9fa]">
      {/* Left Section: Security Branding */}
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

        {/* Branding Text Section */}
        <div className="relative z-10 max-w-lg">
          <h1 className="text-4xl lg:text-5xl font-display font-bold mb-6 leading-[1.15] tracking-tight">
            Update Your <br />
            <span className="text-blue-400">Credentials.</span>
          </h1>
          <p className="text-base text-blue-100/70 leading-relaxed font-medium mb-4">
            Maintain the integrity of your academic profile with professional-grade security protocols.
          </p>
          <p className="text-base text-blue-100/70 leading-relaxed font-medium">
            Your new credentials ensure continued access to global placement opportunities through our secure gateway.
          </p>
        </div>

        {/* Security Info */}
        <div className="relative z-10 flex items-center gap-4 text-[10px] uppercase tracking-[0.2em] font-black text-white/20">
           <div className="w-8 h-[1px] bg-white/10"></div>
           <span>Security Protocol v2.1 • Authorized Access Only</span>
        </div>
      </div>

      {/* Right Section: Reset Form */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-8 bg-white relative">
        {/* Back Link at top right */}
        <Link to="/login" className="absolute top-12 right-12 text-xs font-bold text-gray-400 hover:text-blue-600 transition-colors flex items-center gap-2">
           <ArrowLeft className="w-4 h-4" />
           Back to login
        </Link>

        <div className="w-full max-w-md space-y-8 animate-fade-in py-8">
          <div className="bg-white rounded-2xl transition-all duration-300">
            {!submitted ? (
              <>
                <div className="text-center md:text-left mb-10">
                   <h2 className="text-2xl lg:text-3xl font-display font-bold text-primary tracking-tight mb-2">Reset Password</h2>
                   <p className="text-sm text-gray-400 font-medium">Please choose a unique password to secure your university account.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg text-xs font-bold">
                      {error}
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* New Password */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700 ml-1 uppercase tracking-wider">New Password</label>
                      <div className="relative group">
                         <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-blue-500 transition-colors text-gray-300">
                            <Lock className="w-4 h-4" />
                         </div>
                         <input 
                           type={showPassword ? "text" : "password"} 
                           value={password} 
                           onChange={(e) => setPassword(e.target.value)}
                           className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3.5 pl-11 pr-11 text-sm font-medium text-primary outline-none transition-all duration-300 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 placeholder:text-gray-300"
                           placeholder="••••••••••••"
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

                    {/* Confirm Password */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700 ml-1 uppercase tracking-wider">Confirm New Password</label>
                      <div className="relative group">
                         <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-blue-500 transition-colors text-gray-300">
                            <Lock className="w-4 h-4" />
                         </div>
                         <input 
                           type={showConfirmPassword ? "text" : "password"} 
                           value={confirmPassword} 
                           onChange={(e) => setConfirmPassword(e.target.value)}
                           className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3.5 pl-11 pr-11 text-sm font-medium text-primary outline-none transition-all duration-300 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 placeholder:text-gray-300"
                           placeholder="••••••••••••"
                           required
                         />
                         <button 
                           type="button"
                           onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                           className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-300 hover:text-blue-500 transition-colors"
                         >
                           {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                         </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button 
                      type="submit" 
                      className="w-full py-3.5 px-6 bg-gradient-to-r from-blue-950 to-blue-800 hover:shadow-lg hover:scale-[1.02] text-white text-sm font-bold rounded-lg shadow-md transition-all duration-300 flex items-center justify-center gap-2 group"
                    >
                      Reset Password
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>

                  {/* Security Standards */}
                  <div className="pt-6 space-y-3">
                     <p className="text-[10px] uppercase tracking-widest font-black text-gray-400 ml-1">Security Standards</p>
                     <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                           <CheckCircle2 className={`w-4 h-4 ${password.length >= 12 ? 'text-green-500' : 'text-gray-300'}`} />
                           <span>At least 12 characters recommended</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                           <CheckCircle2 className={`w-4 h-4 ${/[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password) ? 'text-green-500' : 'text-gray-300'}`} />
                           <span>Include numbers and special symbols</span>
                        </div>
                     </div>
                  </div>
                </form>
              </>
            ) : (
              <div className="text-center py-12 animate-fade-in">
                 <div className="w-20 h-20 bg-green-50 flex items-center justify-center rounded-full mb-8 shadow-sm mx-auto">
                    <ShieldCheck className="text-green-500 w-10 h-10" />
                 </div>
                 <h2 className="text-3xl font-display font-bold text-primary mb-4">Password reset!</h2>
                 <p className="text-gray-400 font-medium mb-10 max-w-sm mx-auto">
                    Your credentials have been updated successfully. You will be redirected to the login page in a few moments.
                 </p>
                 <div className="w-12 h-1 bg-gray-100 rounded-full mx-auto relative overflow-hidden">
                    <div className="absolute inset-0 bg-blue-600 animate-progress"></div>
                 </div>
              </div>
            )}
          </div>
        </div>

        {/* Institutional Footer */}
        <div className="absolute bottom-10 flex flex-col items-center gap-4">
           <div className="flex gap-8 text-[10px] uppercase tracking-widest text-[#c4c6cf] font-black">
              <Link to="/privacy" className="hover:text-blue-600 transition-colors cursor-pointer">Privacy</Link>
              <Link to="/terms" className="hover:text-blue-600 transition-colors cursor-pointer">Terms</Link>
              <Link to="/help" className="hover:text-blue-600 transition-colors cursor-pointer">Help</Link>
           </div>
           <div className="text-[10px] uppercase tracking-[0.15em] text-[#c4c6cf] font-black opacity-60">
              © 2024 Placement Management System • University Registrar
           </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
