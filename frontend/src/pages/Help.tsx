import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ArrowLeft, UserPlus, Briefcase, Key, Send } from 'lucide-react';

const Help: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-6 font-body">
      <div className="max-w-4xl mx-auto">
        <Link to="/login" className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-blue-600 transition-colors mb-8 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Portal
        </Link>
        
        <div className="bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 bg-blue-50 flex items-center justify-center rounded-xl text-blue-600">
               <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold text-primary tracking-tight">Help Center</h1>
              <p className="text-sm text-gray-400 font-medium">Support Resource Hub for Placement Management</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="p-6 bg-gray-50 rounded-xl hover:shadow-md transition-shadow">
               <div className="flex items-center gap-3 mb-4">
                  <UserPlus className="text-blue-500 w-5 h-5" />
                  <h2 className="text-lg font-display font-bold text-primary">How to Register</h2>
               </div>
               <p className="text-sm text-gray-500 leading-relaxed font-medium">
                  Students and recruiters can register by choosing their respective roles on the registration page and providing 
                  university-verified credentials.
               </p>
            </div>

            <div className="p-6 bg-gray-50 rounded-xl hover:shadow-md transition-shadow">
               <div className="flex items-center gap-3 mb-4">
                  <Briefcase className="text-blue-500 w-5 h-5" />
                  <h2 className="text-lg font-display font-bold text-primary">How to Apply for Jobs</h2>
               </div>
               <p className="text-sm text-gray-500 leading-relaxed font-medium">
                  Once registered, students can navigate to the job feed, view eligibility criteria, and submit their resumes 
                  directly to recruiters.
               </p>
            </div>

            <div className="p-6 bg-gray-50 rounded-xl hover:shadow-md transition-shadow">
               <div className="flex items-center gap-3 mb-4">
                  <Key className="text-blue-500 w-5 h-5" />
                  <h2 className="text-lg font-display font-bold text-primary">Password Reset</h2>
               </div>
               <p className="text-sm text-gray-500 leading-relaxed font-medium">
                  If you've lost access, use the Forgot Password link to receive a secure recovery link via your registered 
                  university email.
               </p>
            </div>

            <div className="p-6 bg-gray-50 rounded-xl hover:shadow-md transition-shadow">
               <div className="flex items-center gap-3 mb-4">
                  <Send className="text-blue-500 w-5 h-5" />
                  <h2 className="text-lg font-display font-bold text-primary">Contact Support</h2>
               </div>
               <p className="text-sm text-gray-500 leading-relaxed font-medium">
                  For technical issues or account inquiries, please email support@pms-portal.org or visit the campus 
                  Tech Support office.
               </p>
            </div>
          </div>

          <div className="prose prose-slate max-w-none border-t border-gray-100 pt-10">
            <h2 className="text-xl font-display font-bold text-primary mb-6">Frequently Asked Questions</h2>
            <div className="space-y-6">
               <div>
                  <h3 className="text-sm font-bold text-primary mb-2">Can I update my CGPA after registering?</h3>
                  <p className="text-xs text-gray-500 font-medium">Yes, profile details can be updated through your dashboard settings under "Academic Profile".</p>
               </div>
               <div>
                  <h3 className="text-sm font-bold text-primary mb-2">What happens if I miss a job deadline?</h3>
                  <p className="text-xs text-gray-500 font-medium">Late applications are generally not accepted unless approved directly by the recruiter or placement office.</p>
               </div>
            </div>
          </div>
        </div>
        
        <div className="mt-12 text-center text-[10px] uppercase tracking-widest text-gray-300 font-black">
           © 2026 Placement Management System • Global Help Resource
        </div>
      </div>
    </div>
  );
};

export default Help;
