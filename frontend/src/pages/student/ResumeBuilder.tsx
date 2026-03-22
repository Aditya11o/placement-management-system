import React, { useRef, useState, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { 
  Printer, 
  GraduationCap, Briefcase, 
  Award, Mail, Phone, MapPin, Loader2
} from 'lucide-react';
import api from '../../api';

const ResumeBuilder: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: 'Student_Resume',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/profile/me');
        setProfile(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  const student = profile?.studentDetails || {};

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 animate-fade-in">
      {/* Header with Actions */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Resume Builder</h1>
          <p className="text-gray-500 text-sm font-medium mt-1">Generate a professional standardized resume from your profile.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handlePrint}
            className="bg-blue-950 text-white px-6 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-black/10 flex items-center gap-2 active:scale-95"
          >
            <Printer size={16} /> Print / Save PDF
          </button>
        </div>
      </div>

      {/* Resume Preview Container */}
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        <div ref={componentRef} className="p-12 min-h-[1100px] text-gray-800 font-serif leading-relaxed">
          {/* Resume Header */}
          <div className="text-center border-b-2 border-gray-900 pb-8 mb-8">
            <h1 className="text-4xl font-black uppercase tracking-tighter text-gray-900 mb-4">{profile?.user?.name}</h1>
            <div className="flex justify-center flex-wrap gap-4 text-sm font-medium text-gray-600">
              <span className="flex items-center gap-1.5"><Mail size={14} /> {profile?.user?.email}</span>
              <span className="flex items-center gap-1.5"><Phone size={14} /> {student.phone}</span>
              <span className="flex items-center gap-1.5"><MapPin size={14} /> {student.city}, {student.state}</span>
            </div>
            <div className="mt-4 flex justify-center gap-4">
               {student.linkedin && <span className="text-blue-700 font-bold hover:underline cursor-pointer">LinkedIn</span>}
               {student.github && <span className="font-bold hover:underline cursor-pointer">GitHub</span>}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-10">
            {/* Education */}
            <section>
              <div className="flex items-center gap-2 border-b border-gray-200 pb-2 mb-4">
                <GraduationCap size={20} className="text-gray-900" />
                <h2 className="text-lg font-black uppercase tracking-widest text-gray-900">Education</h2>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{student.course} - {student.branch}</h3>
                    <p className="text-gray-600 italic">Expected Graduation: {student.passingYear}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-gray-900">CGPA: {student.cgpa}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Class XII</p>
                      <p className="font-bold">{student.twelfthPercent}%</p>
                   </div>
                   <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Class X</p>
                      <p className="font-bold">{student.tenthPercent}%</p>
                   </div>
                </div>
              </div>
            </section>

            {/* Skills */}
            <section>
              <div className="flex items-center gap-2 border-b border-gray-200 pb-2 mb-4">
                <Award size={20} className="text-gray-900" />
                <h2 className="text-lg font-black uppercase tracking-widest text-gray-900">Skills & Expertise</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {student.skills?.map((skill: string, i: number) => (
                  <span key={i} className="px-3 py-1.5 border border-gray-200 rounded text-sm font-medium bg-gray-50">
                    {skill}
                  </span>
                ))}
              </div>
            </section>

            {/* Projects */}
            <section>
              <div className="flex items-center gap-2 border-b border-gray-200 pb-2 mb-4">
                <Briefcase size={20} className="text-gray-900" />
                <h2 className="text-lg font-black uppercase tracking-widest text-gray-900">Projects</h2>
              </div>
              <div className="space-y-6">
                {student.projects?.map((project: any, i: number) => (
                  <div key={i}>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-black text-gray-900">{project.title}</h3>
                      <span className="text-[10px] font-bold text-gray-400 uppercase">{project.technologies?.join(' • ')}</span>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">{project.description}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Experience Placeholder */}
            {student.experience && student.experience.length > 0 && (
            <section>
              <div className="flex items-center gap-2 border-b border-gray-200 pb-2 mb-4">
                <Briefcase size={20} className="text-gray-900" />
                <h2 className="text-lg font-black uppercase tracking-widest text-gray-900">Experience</h2>
              </div>
              <div className="space-y-6">
                {student.experience.map((exp: any, i: number) => (
                  <div key={i}>
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="font-black text-gray-900">{exp.role} @ {exp.company}</h3>
                      <span className="text-sm text-gray-500 italic">{exp.duration}</span>
                    </div>
                    <p className="text-gray-600 text-sm">{exp.description}</p>
                  </div>
                ))}
              </div>
            </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;
