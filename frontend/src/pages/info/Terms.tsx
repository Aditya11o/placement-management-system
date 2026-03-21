import { motion } from 'framer-motion';
import { FileText, GraduationCap } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { Link } from 'react-router-dom';

const Terms = () => {
    const { institutionName, logoUrl } = useTheme();

    return (
        <div className="min-h-screen bg-[#f8f9fa] font-inter text-[#191c1d] flex flex-col">
            <header className="bg-[#000613] text-white p-6 flex justify-between items-center">
                <Link to="/login" className="flex items-center gap-3">
                    {logoUrl ? (
                        <img src={logoUrl} alt="Logo" className="w-10 h-10 object-contain" />
                    ) : (
                        <GraduationCap size={32} />
                    )}
                    <span className="font-manrope font-bold text-xl">{institutionName || 'Academic Authority'}</span>
                </Link>
                <Link to="/login" className="text-sm font-semibold opacity-80 hover:opacity-100 transition-opacity">Back to Login</Link>
            </header>

            <main className="flex-1 max-w-4xl mx-auto w-full p-8 md:p-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex items-center gap-4 mb-8 text-[#000613]">
                        <FileText size={48} />
                        <h1 className="text-4xl font-manrope font-extrabold tracking-tight">Terms of Service</h1>
                    </div>

                    <p className="text-lg text-[#43474e] mb-12 border-l-4 border-[#000613] pl-6 py-2">
                        Participation in the institutional placement program is governed by the following terms and guidelines.
                    </p>

                    <section className="space-y-12">
                        <div>
                            <h2 className="text-2xl font-manrope font-bold mb-4">1. Eligibility</h2>
                            <p className="leading-relaxed text-[#43474e]">
                                Use of this portal is restricted to currently enrolled students, verified alumni, and authorized recruiters. Users must maintain academic integrity and professional conduct at all times.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-2xl font-manrope font-bold mb-4">2. Accurate Representation</h2>
                            <p className="leading-relaxed text-[#43474e]">
                                Students must provide accurate academic records and professional information. Misrepresentation of grades, achievements, or experience may result in disqualification from the placement process.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-2xl font-manrope font-bold mb-4">3. Professional Conduct</h2>
                            <p className="leading-relaxed text-[#43474e]">
                                Recruiters and students must maintain a professional decorum during interviews and communications. Unauthorized sharing of internal institutional data or recruiter information is strictly prohibited.
                            </p>
                        </div>

                        <div className="bg-[#f0f1f3] p-8 rounded-2xl border border-[#e1e3e4]">
                            <h2 className="text-xl font-manrope font-bold mb-4">Institutional Oversight</h2>
                            <p className="text-sm text-[#43474e] leading-relaxed italic">
                                The Placement Office reserves the right to suspend or terminate portal access for users who violate these terms or institutional codes of conduct.
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

export default Terms;
