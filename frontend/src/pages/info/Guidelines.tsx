import { motion } from 'framer-motion';
import { BookOpen, GraduationCap } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { Link } from 'react-router-dom';

const Guidelines = () => {
    const { institutionName, logoUrl } = useTheme();

    return (
        <div className="min-h-screen bg-[#f8f9fa] font-inter text-[#191c1d] flex flex-col">
            <header className="bg-[#000613] text-white p-6 flex justify-between items-center">
                <Link to="/register" className="flex items-center gap-3">
                    {logoUrl ? (
                        <img src={logoUrl} alt="Logo" className="w-10 h-10 object-contain" />
                    ) : (
                        <GraduationCap size={32} />
                    )}
                    <span className="font-manrope font-bold text-xl">{institutionName || 'Academic Authority'}</span>
                </Link>
                <Link to="/register" className="text-sm font-semibold opacity-80 hover:opacity-100 transition-opacity">Back to Register</Link>
            </header>

            <main className="flex-1 max-w-4xl mx-auto w-full p-8 md:p-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex items-center gap-4 mb-8 text-[#000613]">
                        <BookOpen size={48} />
                        <h1 className="text-4xl font-manrope font-extrabold tracking-tight">University Guidelines</h1>
                    </div>

                    <p className="text-lg text-[#43474e] mb-12 border-l-4 border-[#000613] pl-6 py-2">
                        Essential protocols for students and recruiters participating in the Placement Program.
                    </p>

                    <section className="space-y-12">
                        <div>
                            <h2 className="text-2xl font-manrope font-bold mb-4">1. Placement Process</h2>
                            <p className="leading-relaxed text-[#43474e]">
                                All students must register on the portal within the stipulated time frame. Resumes must be uploaded in PDF format and verified by respective department heads before application to companies.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-2xl font-manrope font-bold mb-4">2. Interview Protocols</h2>
                            <p className="leading-relaxed text-[#43474e]">
                                Students must attend all scheduled interviews. Absence without prior institutional approval may lead to debarment from future placement drives. Formal attire is mandatory for both physical and virtual interviews.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-2xl font-manrope font-bold mb-4">3. Offer Acceptance</h2>
                            <p className="leading-relaxed text-[#43474e]">
                                Upon receiving an offer, students are generally expected to withdraw from other active applications as per the institution's "One-Student One-Offer" policy (unless specified otherwise for Dream Offers).
                            </p>
                        </div>

                        <div className="bg-[#f0f1f3] p-8 rounded-2xl border border-[#e1e3e4]">
                            <h2 className="text-xl font-manrope font-bold mb-4">Recruiter Notice</h2>
                            <p className="text-sm text-[#43474e] leading-relaxed italic">
                                Recruiters must adhere to the recruitment schedule shared by the Placement Office. Changes in schedule must be communicated at least 48 hours in advance.
                            </p>
                        </div>
                    </section>
                </motion.div>
            </main>

            <footer className="bg-[#e7e8e9] p-8 text-center text-xs font-bold uppercase tracking-widest text-[#c4c6cf]">
                © 2024 {institutionName?.toUpperCase() || 'UNIVERSITY'} PLACEMENT MANAGEMENT SYSTEM. ALL RIGHTS RESERVED.
            </footer>
        </div>
    );
};

export default Guidelines;
