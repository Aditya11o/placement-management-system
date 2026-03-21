import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';

const Privacy: React.FC = () => {
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
               <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold text-primary tracking-tight">Privacy Policy</h1>
              <p className="text-sm text-gray-400 font-medium">Last updated: March 2026</p>
            </div>
          </div>

          <div className="prose prose-slate max-w-none space-y-8">
            <section>
              <h2 className="text-xl font-display font-bold text-primary mb-3">Information We Collect</h2>
              <p className="text-gray-600 leading-relaxed font-medium">
                We collect personal information that you provide to us when registering for the Placement Management System, 
                including your name, university email, academic records, and career preferences. We also collect technical data such 
                as IP addresses and browser information to improve system performance.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-display font-bold text-primary mb-3">How We Use Information</h2>
              <p className="text-gray-600 leading-relaxed font-medium">
                Your data is used primarily to facilitate the placement process. This includes matching students with relevant 
                job opportunities, allowing recruiters to review candidate profiles, and generating placement analytics 
                for university administration.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-display font-bold text-primary mb-3">Data Security</h2>
              <p className="text-gray-600 leading-relaxed font-medium">
                We implement robust encryption and multi-factor authentication protocols to protect your personal identity and 
                career milestones. Access to student data is strictly controlled based on role-based authorization levels.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-display font-bold text-primary mb-3">User Rights</h2>
              <p className="text-gray-600 leading-relaxed font-medium">
                You have the right to access, correct, or delete your personal data. Students can update their academic 
                profiles through the settings dashboard, and requests for full account deletion can be made through the 
                University Registrar.
              </p>
            </section>

            <section className="pt-6 border-t border-gray-100">
              <h2 className="text-xl font-display font-bold text-primary mb-3">Contact Information</h2>
              <p className="text-gray-600 leading-relaxed font-medium">
                If you have any questions regarding this Privacy Policy, please reach out to the 
                <span className="text-blue-600 font-bold ml-1">Office of Career Services</span> at support@university.edu.
              </p>
            </section>
          </div>
        </div>
        
        <div className="mt-12 text-center text-[10px] uppercase tracking-widest text-gray-300 font-black">
           © 2026 Placement Management System • Academic Integrity Portal
        </div>
      </div>
    </div>
  );
};

export default Privacy;
