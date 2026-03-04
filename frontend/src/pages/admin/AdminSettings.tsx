import { useState, useEffect } from 'react';
import Card from '../../components/Card/Card';
import { ToggleRight, Bell, Shield, Save, AlertTriangle, Loader2, FileText, Edit2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../../services/api';
import EmailTemplateEditor from '../../components/EmailTemplateEditor/EmailTemplateEditor';

const AdminSettings = () => {
    const { addToast } = useToast();
    const [editingTemplate, setEditingTemplate] = useState<any>(null);

    // Fetch live settings from backend
    const { data: queryData, isLoading: settingsLoading } = useQuery({
        queryKey: ['adminSettings'],
        queryFn: async () => {
            const res = await api.get('/admin/settings');
            return res.data;
        }
    });

    // Fetch email templates
    const { data: templatesData, isLoading: templatesLoading } = useQuery({
        queryKey: ['emailTemplates'],
        queryFn: async () => {
            const res = await api.get('/admin/email-templates');
            return res.data;
        }
    });

    // Local state to mirror DB for optimistic toggling before save
    const [settings, setSettings] = useState({
        allowStudentRegistration: true,
        allowRecruiterRegistration: true,
        requireApprovalForStudents: false,
        requireApprovalForRecruiters: true,
        emailNotifications: true,
        maintenanceMode: false,
    });

    // Sync remote data to local state when loaded
    useEffect(() => {
        if (queryData?.data) {
            setSettings(queryData.data);
        }
    }, [queryData]);

    const toggleSetting = (key: keyof typeof settings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const saveMutation = useMutation({
        mutationFn: async (newSettings: typeof settings) => {
            return api.put('/admin/settings', newSettings);
        },
        onSuccess: () => {
            addToast('System settings saved successfully to database.', 'success');
        },
        onError: () => {
            addToast('Failed to save settings. Please try again.', 'error');
        }
    });

    const handleSave = () => {
        saveMutation.mutate(settings);
    };

    if (settingsLoading || templatesLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="animate-spin text-indigo-600" size={32} />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 animate-fade-in max-w-4xl mx-auto w-full">
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white m-0 leading-tight">System Settings</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-base m-0 mt-1">Configure global platform behavior and security rules.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saveMutation.isPending}
                    className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
                >
                    <Save size={18} />
                    {saveMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* General Settings */}
                <Card className="flex flex-col gap-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                            <ToggleRight size={22} />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 m-0">General Access</h2>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <div>
                                <h4 className="font-semibold text-slate-800 dark:text-slate-200">Student Registration</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Allow new students to sign up</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={settings.allowStudentRegistration} onChange={() => toggleSetting('allowStudentRegistration')} className="sr-only peer" />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
                            </label>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <div>
                                <h4 className="font-semibold text-slate-800 dark:text-slate-200">Recruiter Registration</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Allow new companies to sign up</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={settings.allowRecruiterRegistration} onChange={() => toggleSetting('allowRecruiterRegistration')} className="sr-only peer" />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
                            </label>
                        </div>
                    </div>
                </Card>

                {/* Security & Verification */}
                <Card className="flex flex-col gap-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
                            <Shield size={22} />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 m-0">Security & Approvals</h2>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <div>
                                <h4 className="font-semibold text-slate-800 dark:text-slate-200">Student Manual Approval</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Require admin verification for students</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={settings.requireApprovalForStudents} onChange={() => toggleSetting('requireApprovalForStudents')} className="sr-only peer" />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-green-500"></div>
                            </label>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <div>
                                <h4 className="font-semibold text-slate-800 dark:text-slate-200">Recruiter Manual Approval</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Require admin verification for companies</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={settings.requireApprovalForRecruiters} onChange={() => toggleSetting('requireApprovalForRecruiters')} className="sr-only peer" />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-green-500"></div>
                            </label>
                        </div>
                    </div>
                </Card>

                {/* Notifications */}
                <Card className="flex flex-col gap-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                            <Bell size={22} />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 m-0">Notifications</h2>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <div>
                                <h4 className="font-semibold text-slate-800 dark:text-slate-200">Email Alerts</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Receive daily digest of platform activity</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={settings.emailNotifications} onChange={() => toggleSetting('emailNotifications')} className="sr-only peer" />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-orange-500"></div>
                            </label>
                        </div>
                    </div>
                </Card>

                {/* Email Templates */}
                <Card className="flex flex-col gap-4 md:col-span-2">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                            <FileText size={22} />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 m-0">Email Templates</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {templatesData?.data?.map((template: any) => (
                            <div key={template._id} className="flex flex-col p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 relative group hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
                                <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-1">{template.name}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 min-h-[40px]">{template.description}</p>
                                <div className="mt-auto flex items-center justify-between">
                                    <span className="text-xs font-medium px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-md">
                                        {template.variables.length} Variables
                                    </span>
                                    <button
                                        onClick={() => setEditingTemplate(template)}
                                        className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                                    >
                                        <Edit2 size={14} /> Edit
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Danger Zone */}
                <Card className="flex flex-col gap-4 border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-900/10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                            <AlertTriangle size={22} />
                        </div>
                        <h2 className="text-xl font-bold text-red-800 dark:text-red-400 m-0">Danger Zone</h2>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 transition-colors border border-red-100 dark:border-red-800/50">
                            <div>
                                <h4 className="font-semibold text-slate-800 dark:text-slate-200">Maintenance Mode</h4>
                                <p className="text-xs text-red-500 dark:text-red-400 mt-0.5">Locks out all non-admin users immediately</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={settings.maintenanceMode} onChange={() => toggleSetting('maintenanceMode')} className="sr-only peer" />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-red-600"></div>
                            </label>
                        </div>
                    </div>
                </Card>

            </div>

            {/* Email Template Editor Modal overlay */}
            {editingTemplate && (
                <>
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40" onClick={() => setEditingTemplate(null)} />
                    <EmailTemplateEditor
                        template={editingTemplate}
                        onClose={() => setEditingTemplate(null)}
                    />
                </>
            )}
        </div>
    );
};

export default AdminSettings;
