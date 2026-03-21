import { motion } from 'framer-motion';
import { Shield, GraduationCap } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { Link } from 'react-router-dom';

const Privacy = () => {
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
                        <Shield size={48} />
                        <h1 className="text-4xl font-manrope font-extrabold tracking-tight">Privacy Policy</h1>
                    </div>

                    <p className="text-lg text-[#43474e] mb-12 border-l-4 border-[#000613] pl-6 py-2">
                        Last Updated: March 20, 2024. Your privacy and the security of your academic and professional data are our highest priorities.
                    </p>

                    <section className="space-y-12">
                        <div>
                            <h2 className="text-2xl font-manrope font-bold mb-4">1. Data Collection</h2>
                            <p className="leading-relaxed text-[#43474e]">
                                We collect academic and professional information provided during registration and profile creation. This includes full names, institutional email addresses, academic records, and professional portfolios used for placement purposes.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-2xl font-manrope font-bold mb-4">2. Use of Information</h2>
                            <p className="leading-relaxed text-[#43474e]">
                                Your data is used exclusively to facilitate recruitment processes, match candidates with prospective employers, and provide placement analytics to the institution. We do not sell or share your personal information with third-party marketing entities.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-2xl font-manrope font-bold mb-4">3. Data Security</h2>
                            <p className="leading-relaxed text-[#43474e]">
                                We implement industry-standard security measures, including encryption and secure campus access protocols, to protect your data from unauthorized access or disclosure.
                            </p>
                        </div>

                        <div className="bg-[#f0f1f3] p-8 rounded-2xl border border-[#e1e3e4]">
                            <h2 className="text-xl font-manrope font-bold mb-4 underline">Student Notice</h2>
                            <p className="text-sm text-[#43474e] leading-relaxed italic">
                                Information provided in your professional portfolio and resume is visible only to verified recruiters and institutional administrators. You maintain full control over your profile visibility within the 'Settings' panel after logging in.
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

export default Privacy;
