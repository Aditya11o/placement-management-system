import { motion } from 'framer-motion';
import { Eye, GraduationCap } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { Link } from 'react-router-dom';

const Accessibility = () => {
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
                        <Eye size={48} />
                        <h1 className="text-4xl font-manrope font-extrabold tracking-tight">Accessibility</h1>
                    </div>

                    <p className="text-lg text-[#43474e] mb-12 border-l-4 border-[#000613] pl-6 py-2">
                        We are committed to providing an inclusive and accessible digital experience for all students and recruiters.
                    </p>

                    <section className="space-y-12">
                        <div>
                            <h2 className="text-2xl font-manrope font-bold mb-4">Our Commitment</h2>
                            <p className="leading-relaxed text-[#43474e]">
                                The Placement Management System aims to adhere to WCAG 2.1 Level AA standards. We continuously work to improve the accessibility of our portal to ensure all students, regardless of ability, can effectively navigate their career paths.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-2xl font-manrope font-bold mb-4">Core Principles</h2>
                            <ul className="list-disc pl-6 space-y-4 text-[#43474e]">
                                <li>High color contrast ratios for better readability.</li>
                                <li>Keyboard-only navigation support for all interactive elements.</li>
                                <li>Screen-reader friendly semantic HTML structure.</li>
                                <li>Scalable typography for various visual needs.</li>
                            </ul>
                        </div>

                        <div className="bg-[#f0f1f3] p-8 rounded-2xl border border-[#e1e3e4]">
                            <h2 className="text-xl font-manrope font-bold mb-4">Feedback</h2>
                            <p className="text-sm text-[#43474e] leading-relaxed italic">
                                If you encounter any digital barriers while using this portal, please contact the University Accessibility Office or the Placement Cell for immediate assistance and to report the issue.
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

export default Accessibility;
