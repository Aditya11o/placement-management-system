import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowLeft } from 'lucide-react';

const Terms: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-6 font-body">
      <div className="max-w-4xl mx-auto">
        <Link to="/login" className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-blue-600 transition-colors mb-8 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Portal
        </Link>
        
        <div className="bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-blue-50 flex items-center justify-center rounded-xl text-blue-600">
               <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold text-primary tracking-tight">Terms of Service</h1>
              <p className="text-sm text-gray-400 font-medium">Last updated: March 2026</p>
            </div>
          </div>

          <div className="prose prose-slate max-w-none space-y-8">
            <section>
              <h2 className="text-xl font-display font-bold text-primary mb-3">Account Responsibility</h2>
              <p className="text-gray-600 leading-relaxed font-medium">
                By creating an account, you agree to provide accurate, current, and complete information. You are solely 
                responsible for maintaining the confidentiality of your account credentials and for all activities that 
                occur under your authorized access.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-display font-bold text-primary mb-3">Acceptable Use</h2>
              <p className="text-gray-600 leading-relaxed font-medium">
                The Placement Management System must be used solely for legitimate academic and professional placement purposes. 
                Any attempt to misrepresent academic records, bypass security protocols, or engage in unauthorized data 
                extraction is strictly prohibited.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-display font-bold text-primary mb-3">Privacy Policy Reference</h2>
              <p className="text-gray-600 leading-relaxed font-medium">
                Your use of this platform is also governed by our Privacy Policy, which describes how we collect, use, and 
                disclose information about you. By agreeing to these Terms, you acknowledge that you have read and understood 
                our privacy practices.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-display font-bold text-primary mb-3">Termination of Account</h2>
              <p className="text-gray-600 leading-relaxed font-medium">
                University administration reserves the right to suspend or terminate any account found to be in violation of 
                these terms or university codes of conduct. Termination may result in the immediate forfeiture of placement 
                opportunities and system access.
              </p>
            </section>

            <section className="pt-6 border-t border-gray-100">
              <h2 className="text-xl font-display font-bold text-primary mb-3">Limitation of Liability</h2>
              <p className="text-gray-600 leading-relaxed font-medium font-bold">
                The Placement Management System is provided "as is" without any warranties. The university is not 
                liable for any direct or indirect damages resulting from the use or inability to use the platform.
              </p>
            </section>
          </div>
        </div>
        
        <div className="mt-12 text-center text-[10px] uppercase tracking-widest text-gray-300 font-black">
           © 2026 Placement Management System • Terms of Service Agreement
        </div>
      </div>
    </div>
  );
};

export default Terms;
