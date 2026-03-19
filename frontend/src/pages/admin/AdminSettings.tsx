import { useState, useEffect } from 'react';
import Card from '../../components/Card/Card';
import { Shield, Save, AlertTriangle, Loader2, FileText, Edit2, Palette, History, Zap, Send, X } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../../services/api';
import EmailTemplateEditor from '../../components/EmailTemplateEditor/EmailTemplateEditor';
import AdminAuditLogs from './AdminAuditLogs';
import LottieSuccessModal from '../../components/LottieSuccessModal/LottieSuccessModal';
import { AdminSettingsType } from '../../types/admin';

// Modular Settings Components
import GeneralSettings from '../../components/Admin/Settings/GeneralSettings';
import BrandingSettings from '../../components/Admin/Settings/BrandingSettings';
import SecuritySettings from '../../components/Admin/Settings/SecuritySettings';
import IntegrationSettings from '../../components/Admin/Settings/IntegrationSettings';
import AdvancedTools from '../../components/Admin/Settings/AdvancedTools';


interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText: string;
    requiredString: string;
    isLoading?: boolean;
}

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, requiredString, isLoading }: ConfirmationModalProps) => {
    const [input, setInput] = useState('');

    useEffect(() => {
        if (!isOpen) setInput('');
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-[200] p-4">
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md animate-fade-in" onClick={onClose} />
            <div className="glass-panel border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-8 w-full max-w-md relative z-[201] animate-scale-in">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3 text-red-600">
                        <AlertTriangle size={24} />
                        <h3 className="text-xl font-bold">{title}</h3>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400">
                        <X size={20} />
                    </button>
                </div>

                <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 leading-relaxed">
                    {message}
                </p>

                <div className="flex flex-col gap-2 mb-6 p-4 bg-red-50/50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/20">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Type <span className="text-red-600 font-mono select-all">{requiredString}</span> to confirm
                    </label>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={`Type ${requiredString}...`}
                        className="w-full px-3 py-2 rounded-lg border border-red-200 dark:border-red-900 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-red-500/20 transition-all font-mono text-sm"
                        autoFocus
                    />
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 px-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-sm"
                    >
                        Cancel
                    </button>
                    <button
                        disabled={input !== requiredString || isLoading}
                        onClick={() => { onConfirm(); }}
                        className="flex-[1.5] py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold shadow-lg shadow-red-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
                    >
                        {isLoading ? <Loader2 size={16} className="animate-spin" /> : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

const AdminSettings = () => {
    const { addToast } = useToast();
    const [editingTemplate, setEditingTemplate] = useState<any>(null);
    const [activeTab, setActiveTab] = useState('general');

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
    const [settings, setSettings] = useState<AdminSettingsType>({
        allowStudentRegistration: true,
        allowRecruiterRegistration: true,
        requireApprovalForStudents: false,
        requireApprovalForRecruiters: true,
        emailNotifications: true,
        maintenanceMode: false,
        primaryColor: '#4f46e5',
        logoUrl: '',
        sessionExpirationHours: 168,
        maxFailedLoginAttempts: 5,
        enforcePasswordComplexity: true,
        systemWebhookUrl: '',
        tier1SalaryThreshold: 1000000,
        adminIpWhitelist: [],
        googleCalendarApiKey: '',
        googleCalendarClientId: '',
        microsoftCalendarApiKey: '',
        calendarSyncEnabled: false,
        autoScheduleInterviews: false,
        faviconUrl: '',
        meshGradientColors: ['#6366f1', '#8b5cf6', '#d946ef', '#3b82f6']
    });

    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [faviconFile, setFaviconFile] = useState<File | null>(null);
    const [faviconPreview, setFaviconPreview] = useState<string | null>(null);

    // Sync remote data to local state when loaded
    useEffect(() => {
        if (queryData?.data) {
            setSettings(queryData.data);
        }
    }, [queryData]);

    // Compute if there are unsaved modifications
    const hasUnsavedChanges = (queryData?.data ? Object.keys(settings).some(
        key => settings[key as keyof typeof settings] !== queryData.data[key]
    ) : false) || logoFile !== null;

    const resetSettings = () => {
        if (queryData?.data) setSettings(queryData.data);
        setLogoFile(null);
        setLogoPreview(null);
        setFaviconFile(null);
        setFaviconPreview(null);
    };

    const toggleSetting = (key: keyof typeof settings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const saveMutation = useMutation({
        mutationFn: async (newSettings: typeof settings) => {
            return api.put('/admin/settings', newSettings);
        },
        onSuccess: () => {
            addToast('System settings saved successfully to database.', 'success');
            // Hard reload after saving settings to immediately apply ThemeContext changes across the whole app
            setTimeout(() => window.location.reload(), 1000);
        },
        onError: () => {
            addToast('Failed to save settings. Please try again.', 'error');
        }
    });

    const sendTestEmailMutation = useMutation({
        mutationFn: async (templateId: string) => {
            return api.post(`/admin/email-templates/${templateId}/test`);
        },
        onSuccess: (res) => {
            addToast(res.data.message || 'Test email queued successfully.', 'success');
            setSuccessModal({
                isOpen: true,
                title: 'Test Email Sent',
                description: res.data.message || 'A preview email has been dispatched to your inbox.'
            });
        },
        onError: (err: any) => {
            addToast(err.response?.data?.message || 'Failed to send test email.', 'error');
        }
    });

    // --- Maintenance & Health ---
    const { data: healthData, refetch: refetchHealth } = useQuery({
        queryKey: ['systemHealth'],
        queryFn: async () => {
            const res = await api.get('/admin/system-health');
            return res.data;
        },
        enabled: activeTab === 'advanced'
    });

    const [purgeConfig, setPurgeConfig] = useState<{ isOpen: boolean; type: 'LOGS' | 'APPLICATIONS' | 'STUDENTS' | null }>({
        isOpen: false,
        type: null
    });

    const [successModal, setSuccessModal] = useState<{ isOpen: boolean; title: string; description: string }>({
        isOpen: false,
        title: '',
        description: ''
    });

    const purgeMutation = useMutation({
        mutationFn: async (type: string) => {
            return api.post('/admin/purge', { type });
        },
        onSuccess: (res) => {
            addToast(res.data.message, 'success');
            setSuccessModal({
                isOpen: true,
                title: 'Data Purge Complete',
                description: res.data.message
            });
            refetchHealth();
        },
        onError: (err: any) => {
            addToast(err.response?.data?.message || 'Purge failed.', 'error');
        }
    });

    const masterExportMutation = useMutation({
        mutationFn: async () => {
            const res = await api.get('/admin/export-master', { responseType: 'blob' });
            return res;
        },
        onSuccess: (res) => {
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `pms-master-export-${new Date().toISOString().split('T')[0]}.json`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            setSuccessModal({
                isOpen: true,
                title: 'Master Export Generated',
                description: 'The platform data has been securely archived and downloaded to your device.'
            });
            addToast('Master export generated and downloaded.', 'success');
        },
        onError: (err: any) => {
            addToast(err.response?.data?.message || 'Failed to generate master export.', 'error');
        }
    });

    if (settingsLoading || templatesLoading) {
        return (
            <div className="flex flex-col gap-6 animate-pulse max-w-4xl mx-auto w-full">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex flex-col gap-2">
                        <div className="w-48 h-8 rounded-lg bg-slate-200 dark:bg-slate-800"></div>
                        <div className="w-72 h-4 rounded-lg bg-slate-100 dark:bg-slate-800/50"></div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-8 items-start">
                    {/* Sidebar Skeleton */}
                    <Card className="w-full md:w-[260px] flex flex-col gap-2 p-3 shrink-0 border-slate-200 dark:border-slate-800 border-0 shadow-sm">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="w-full h-11 rounded-lg bg-slate-100 dark:bg-slate-800/50"></div>
                        ))}
                    </Card>

                    {/* Content Area Skeleton */}
                    <div className="flex-1 w-full flex flex-col gap-6 min-w-0">
                        <Card className="flex flex-col gap-4 border-0 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-800"></div>
                                <div className="w-32 h-6 rounded-lg bg-slate-200 dark:bg-slate-800"></div>
                            </div>
                            <div className="flex flex-col gap-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/20">
                                        <div className="flex flex-col gap-2">
                                            <div className="w-32 h-4 rounded bg-slate-200 dark:bg-slate-700"></div>
                                            <div className="w-48 h-3 rounded bg-slate-100 dark:bg-slate-800"></div>
                                        </div>
                                        <div className="w-11 h-6 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                </div>
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
                {/* The top save button is removed since we are getting a floating action bar for unsaved changes */}
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-start">

                {/* Categorized Navigation Sidebar */}
                <Card className="w-full md:w-[260px] flex flex-col gap-1 p-3 shrink-0 md:sticky md:top-8 border-slate-200 dark:border-slate-800">
                    {[
                        { id: 'general', label: 'General & Branding', icon: Palette },
                        { id: 'security', label: 'Security & Access', icon: Shield },
                        { id: 'integrations', label: 'Integrations & Alerts', icon: Zap },
                        { id: 'templates', label: 'Email Templates', icon: FileText },
                        { id: 'audit', label: 'Audit Logs', icon: History },
                        { id: 'advanced', label: 'Danger Zone', icon: AlertTriangle }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all text-left ${activeTab === tab.id ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'}`}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </Card>

                {/* Content Area */}
                <div className="flex-1 w-full flex flex-col gap-6 min-w-0">

                    {/* General & Branding */}
                    {activeTab === 'general' && (
                        <div className="flex flex-col gap-6 animate-fade-in">
                            <GeneralSettings 
                                settings={settings} 
                                toggleSetting={toggleSetting} 
                            />
                            <BrandingSettings 
                                settings={settings}
                                setSettings={setSettings}
                                logoFile={logoFile}
                                setLogoFile={setLogoFile}
                                logoPreview={logoPreview}
                                setLogoPreview={setLogoPreview}
                                faviconFile={faviconFile}
                                setFaviconFile={setFaviconFile}
                                faviconPreview={faviconPreview}
                                setFaviconPreview={setFaviconPreview}
                            />
                        </div>
                    )}

                    {/* Security & Access */}
                    {activeTab === 'security' && (
                        <SecuritySettings 
                            settings={settings}
                            setSettings={setSettings}
                            toggleSetting={toggleSetting}
                        />
                    )}

                    {/* Integrations & Alerts */}
                    {activeTab === 'integrations' && (
                        <IntegrationSettings 
                            settings={settings}
                            setSettings={setSettings}
                            toggleSetting={toggleSetting}
                        />
                    )}


                    {/* Audit Logs */}
                    {activeTab === 'audit' && (
                        <div className="flex flex-col animate-fade-in w-full">
                            <AdminAuditLogs embedded />
                        </div>
                    )}

                    {/* Email Templates */}
                    {activeTab === 'templates' && (
                        <div className="flex flex-col gap-6 animate-fade-in">
                            <Card className="flex flex-col gap-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                                        <FileText size={22} />
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 m-0">Email Templates</h2>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {templatesData?.data?.map((template: any) => (
                                        <div key={template._id} className="flex flex-col p-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 relative group hover:border-indigo-400 dark:hover:border-indigo-600 transition-all shadow-sm hover:shadow-xl animate-fade-in glass-card">
                                            <div className="flex items-start justify-between gap-4 mb-4">
                                                <div className="flex items-start gap-4 min-w-0">
                                                    <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm shrink-0">
                                                        <FileText size={20} />
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base m-0 leading-tight truncate">
                                                            {template.name}
                                                        </h3>
                                                        <p className="text-[10px] text-slate-400 font-mono mt-1 uppercase tracking-widest">{template._id.slice(-8)}</p>
                                                    </div>
                                                </div>
                                                <div className="px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 flex items-center gap-1.5 shrink-0">
                                                    <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 leading-none">{template.variables.length}</span>
                                                    <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">Vars</span>
                                                </div>
                                            </div>

                                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 line-clamp-3 min-h-[48px] leading-relaxed">
                                                {template.description}
                                            </p>

                                            <div className="mt-auto grid grid-cols-2 gap-3 pt-5 border-t border-slate-100 dark:border-slate-800/50">
                                                <button
                                                    onClick={() => setEditingTemplate(template)}
                                                    className="flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all border border-slate-200 dark:border-slate-700 shadow-sm"
                                                >
                                                    <Edit2 size={14} />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => sendTestEmailMutation.mutate(template._id)}
                                                    disabled={sendTestEmailMutation.isPending}
                                                    className="flex items-center justify-center gap-2 py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50"
                                                >
                                                    {sendTestEmailMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                                                    Test
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* Danger Zone */}
                    {activeTab === 'advanced' && (
                        <AdvancedTools 
                            settings={settings}
                            toggleSetting={toggleSetting}
                            healthData={healthData}
                            setPurgeConfig={setPurgeConfig}
                            masterExportMutation={masterExportMutation}
                        />
                    )}

                </div>
            </div >

            {/* Modals & Overlays */}
            {
                editingTemplate && (
                    <>
                        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100]" onClick={() => setEditingTemplate(null)} />
                        <div className="fixed inset-0 flex items-center justify-center p-4 z-[101]">
                            <div className="glass-panel border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative animate-scale-in max-w-5xl w-full">
                                <EmailTemplateEditor
                                    template={editingTemplate}
                                    onClose={() => setEditingTemplate(null)}
                                />
                            </div>
                        </div>
                    </>
                )
            }

            <ConfirmationModal
                isOpen={purgeConfig.isOpen}
                onClose={() => setPurgeConfig({ isOpen: false, type: null })}
                onConfirm={() => {
                    if (purgeConfig.type) purgeMutation.mutate(purgeConfig.type);
                    setPurgeConfig({ isOpen: false, type: null });
                }}
                title={`Purge ${purgeConfig.type === 'LOGS' ? 'Audit Logs' : 'Inactive Registrations'}?`}
                message={purgeConfig.type === 'LOGS'
                    ? "This will permanently delete all system audit logs older than 90 days. This action cannot be undone and may affect compliance tracking."
                    : "This will permanently delete all PENDING student accounts that were created more than 90 days ago. This is used to clean up unverified or abandoned registrations."
                }
                confirmText={`Confirm Permanent Purge`}
                requiredString={purgeConfig.type === 'LOGS' ? 'PURGE_LOGS' : 'PRUNE_STUDENTS'}
                isLoading={purgeMutation.isPending}
            />

            <LottieSuccessModal
                isOpen={successModal.isOpen}
                onClose={() => setSuccessModal(prev => ({ ...prev, isOpen: false }))}
                title={successModal.title}
                description={successModal.description}
                autoCloseDelay={5000}
            />



            {/* Unsaved Changes Floating Action Bar */}
            {
                hasUnsavedChanges && (
                    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 text-white px-5 py-3.5 rounded-2xl shadow-2xl z-50 flex items-center justify-between gap-8 animate-fade-in w-[90%] sm:w-auto min-w-[320px]">
                        <div className="flex flex-col">
                            <span className="font-bold text-slate-100 text-sm">Unsaved settings</span>
                            <span className="text-xs text-slate-400">Please save your changes to apply them.</span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                            <button
                                onClick={resetSettings}
                                disabled={saveMutation.isPending}
                                className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
                            >
                                Reset
                            </button>
                            <button
                                onClick={() => saveMutation.mutate(settings)}
                                disabled={saveMutation.isPending}
                                className="flex items-center gap-2 px-5 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-bold transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-70 disabled:cursor-not-allowed active:scale-95"
                            >
                                {saveMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                {saveMutation.isPending ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default AdminSettings;
