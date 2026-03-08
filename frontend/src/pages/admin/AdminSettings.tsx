import { useState, useEffect } from 'react';
import Card from '../../components/Card/Card';
import { ToggleRight, Bell, Shield, Save, AlertTriangle, Loader2, FileText, Edit2, Palette, Image as ImageIcon, History, Lock, Zap, Send, Trash2, Database, Sparkles, X } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../../services/api';
import EmailTemplateEditor from '../../components/EmailTemplateEditor/EmailTemplateEditor';
import AdminAuditLogs from './AdminAuditLogs';
import LottieSuccessModal from '../../components/LottieSuccessModal/LottieSuccessModal';

interface AdminSettingsType {
    allowStudentRegistration: boolean;
    allowRecruiterRegistration: boolean;
    requireApprovalForStudents: boolean;
    requireApprovalForRecruiters: boolean;
    emailNotifications: boolean;
    maintenanceMode: boolean;
    primaryColor: string;
    logoUrl: string;
    sessionExpirationHours: number;
    maxFailedLoginAttempts: number;
    enforcePasswordComplexity: boolean;
    systemWebhookUrl: string;
    tier1SalaryThreshold: number;
    adminIpWhitelist: string[];
    googleCalendarApiKey: string;
    googleCalendarClientId: string;
    microsoftCalendarApiKey: string;
    calendarSyncEnabled: boolean;
    autoScheduleInterviews: boolean;
    faviconUrl: string;
    meshGradientColors: string[];
}

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

    const logoMutation = useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData();
            formData.append('logo', file);
            return api.post('/admin/settings/logo', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        },
        onSuccess: (res) => {
            setSettings(prev => ({ ...prev, logoUrl: res.data.data.logoUrl }));
            setLogoFile(null);
            addToast('Logo uploaded successfully.', 'success');
            setTimeout(() => window.location.reload(), 1000);
        },
        onError: () => {
            addToast('Failed to upload logo. Ensure it is < 5MB.', 'error');
        }
    });

    const faviconMutation = useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData();
            formData.append('favicon', file);
            return api.post('/admin/settings/favicon', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        },
        onSuccess: (res) => {
            setSettings(prev => ({ ...prev, faviconUrl: res.data.data.faviconUrl }));
            setFaviconFile(null);
            addToast('Favicon updated successfully.', 'success');
            setTimeout(() => window.location.reload(), 1000);
        },
        onError: () => {
            addToast('Failed to upload favicon. Ensure it is < 1MB.', 'error');
        }
    });

    const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                addToast('File too large. Maximum size is 5MB.', 'error');
                return;
            }
            setLogoFile(file);
            // Create local preview URL
            const reader = new FileReader();
            reader.onloadend = () => setLogoPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleFaviconSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 1 * 1024 * 1024) {
                addToast('Favicon too large. Maximum size is 1MB.', 'error');
                return;
            }
            setFaviconFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setFaviconPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const testWebhookMutation = useMutation({
        mutationFn: async (url: string) => {
            // Because we don't have a dedicated "test webhook" backend route yet,
            // we will try to blindly POST to the webhook directly from client.
            // Slack/Discord webhooks typically support unauthenticated POSTs with a JSON payload.
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: '🚀 *Success!* The Placement Management System webhook integration is active and working correctly.'
                })
            });
            if (!response.ok) {
                throw new Error('Webhook failed');
            }
            return response;
        },
        onSuccess: () => {
            addToast('Test payload successfully delivered to webhook!', 'success');
        },
        onError: () => {
            addToast('Failed to reach webhook. Ensure CORS allows client requests, or check the URL.', 'error');
        }
    });

    const handleTestWebhook = () => {
        if (!settings.systemWebhookUrl) {
            addToast('Please enter a webhook URL first.', 'info');
            return;
        }
        testWebhookMutation.mutate(settings.systemWebhookUrl);
    };

    const handleSave = () => {
        saveMutation.mutate(settings);
    };

    const handleLogoUpload = () => {
        if (logoFile) {
            logoMutation.mutate(logoFile);
        }
    };

    const handleFaviconUpload = () => {
        if (faviconFile) {
            faviconMutation.mutate(faviconFile);
        }
    };



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

                    {/* General Settings */}
                    {activeTab === 'general' && (
                        <div className="flex flex-col gap-6 animate-fade-in">
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

                            {/* Branding & Theming */}
                            <Card className="flex flex-col gap-4">
                                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3 mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                                            <Palette size={22} />
                                        </div>
                                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 m-0">Branding & Theming</h2>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-6">
                                    {/* Primary Color Picker */}
                                    <div className="flex flex-col gap-2">
                                        <h4 className="font-semibold text-slate-800 dark:text-slate-200">Primary Theme Color</h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Select the main accent color that represents your institution.</p>
                                        <div className="flex items-center gap-4 mt-2">
                                            <input
                                                type="color"
                                                value={settings.primaryColor}
                                                onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                                                className="w-12 h-12 p-1 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 cursor-pointer shadow-sm"
                                            />
                                            <div className="text-sm font-mono bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700">
                                                {settings.primaryColor}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Logo Upload */}
                                    <div className="flex flex-col gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                                        <h4 className="font-semibold text-slate-800 dark:text-slate-200">Institution Logo</h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Upload a crisp PNG or JPG to appear in the sidebar.</p>

                                        <div className="flex items-center gap-6 mt-3">
                                            {/* Current/Preview Logo Frame */}
                                            <div className="w-24 h-24 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/50 relative overflow-hidden shrink-0">
                                                {logoPreview || settings.logoUrl ? (
                                                    <img
                                                        src={logoPreview || settings.logoUrl}
                                                        alt="Logo Preview"
                                                        className="w-full h-full object-contain p-2"
                                                    />
                                                ) : (
                                                    <ImageIcon size={32} className="text-slate-400" />
                                                )}
                                            </div>

                                            {/* Upload Controls */}
                                            <div className="flex flex-col gap-3 flex-1">
                                                <label className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:border-brand-500 hover:text-brand-600 transition-colors cursor-pointer w-max lg:w-full max-w-[200px] justify-center shadow-sm">
                                                    <ImageIcon size={16} />
                                                    <span>Select Logo Image...</span>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={handleLogoSelect}
                                                    />
                                                </label>

                                                <div className="flex items-center gap-3">
                                                    {logoFile && (
                                                        <button
                                                            onClick={handleLogoUpload}
                                                            disabled={logoMutation.isPending}
                                                            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors shadow-md flex items-center gap-2"
                                                        >
                                                            {logoMutation.isPending && <Loader2 size={14} className="animate-spin" />}
                                                            Upload Now
                                                        </button>
                                                    )}
                                                    {logoFile && <span className="text-xs text-slate-500 truncate max-w-[150px]">{logoFile.name}</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Favicon Upload */}
                                    <div className="flex flex-col gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                                        <h4 className="font-semibold text-slate-800 dark:text-slate-200">Browser Favicon</h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Upload an icon (ICO, PNG) to appear in browser tabs.</p>

                                        <div className="flex items-center gap-6 mt-3">
                                            <div className="w-16 h-16 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center bg-white dark:bg-slate-900 shadow-inner shrink-0">
                                                {faviconPreview || settings.faviconUrl ? (
                                                    <img
                                                        src={faviconPreview || settings.faviconUrl}
                                                        alt="Favicon Preview"
                                                        className="w-10 h-10 object-contain"
                                                    />
                                                ) : (
                                                    <ImageIcon size={24} className="text-slate-300" />
                                                )}
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <label className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:border-brand-500 transition-all cursor-pointer">
                                                    Choose Icon...
                                                    <input type="file" accept="image/*" className="hidden" onChange={handleFaviconSelect} />
                                                </label>
                                                {faviconFile && (
                                                    <button
                                                        onClick={handleFaviconUpload}
                                                        className="text-xs font-bold text-brand-600 hover:underline flex items-center gap-1"
                                                    >
                                                        {faviconMutation.isPending && <Loader2 size={10} className="animate-spin" />}
                                                        Upload Favicon
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Mesh Gradient Customizer */}
                                    <div className="flex flex-col gap-4 pt-6 mt-4 border-t border-slate-100 dark:border-slate-800">
                                        <div className="flex items-center gap-2">
                                            <Sparkles size={18} className="text-amber-500" />
                                            <h4 className="font-semibold text-slate-800 dark:text-slate-200">Ambient Background Layout</h4>
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Customize the four-color mesh gradient used in the dashboard background.</p>

                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
                                            {settings.meshGradientColors.map((color, idx) => (
                                                <div key={idx} className="flex flex-col gap-2 bg-slate-50 dark:bg-slate-800/30 p-3 rounded-xl border border-slate-100 dark:border-slate-800/50">
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Color {idx + 1}</label>
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="color"
                                                            value={color}
                                                            onChange={(e) => {
                                                                const newColors = [...settings.meshGradientColors];
                                                                newColors[idx] = e.target.value;
                                                                setSettings({ ...settings, meshGradientColors: newColors });
                                                            }}
                                                            className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent"
                                                        />
                                                        <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400">{color}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* Security & Verification */}
                    {activeTab === 'security' && (
                        <div className="flex flex-col gap-6 animate-fade-in">
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
                                </div>
                            </Card>

                            <Card className="flex flex-col gap-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                                        <Lock size={22} />
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 m-0">Inbound Access Control</h2>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <h4 className="font-semibold text-slate-800 dark:text-slate-200">Admin IP Whitelist</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Restricts Admin Panel access to these IP addresses only. Leave empty to allow all IPs. Enter one IP per line.</p>
                                    <textarea
                                        value={settings.adminIpWhitelist?.join('\n') || ''}
                                        onChange={(e) => setSettings({ ...settings, adminIpWhitelist: e.target.value.split('\n').filter(ip => ip.trim()) })}
                                        placeholder="e.g. 192.168.1.1&#10;110.22.33.44"
                                        className="w-full h-32 px-3 py-2 text-sm font-mono border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all resize-none mt-1"
                                    />
                                    <div className="flex items-center gap-2 text-[11px] text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 p-2 rounded-md border border-orange-100 dark:border-orange-800/30">
                                        <AlertTriangle size={12} />
                                        <span>Warning: Incorrect IP whitelisting can lock you out of the admin panel. Ensure your current IP is included.</span>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* Notifications */}
                    {activeTab === 'integrations' && (
                        <div className="flex flex-col gap-6 animate-fade-in">
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

                            {/* Integrations & Webhooks */}
                            <Card className="flex flex-col gap-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                                        <Zap size={22} />
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 m-0">Integrations</h2>
                                </div>

                                <div className="flex flex-col gap-5">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">System Webhook URL (Slack/Discord)</label>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="url"
                                                value={settings.systemWebhookUrl}
                                                onChange={(e) => setSettings({ ...settings, systemWebhookUrl: e.target.value })}
                                                placeholder="https://hooks.slack.com/services/..."
                                                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-mono"
                                            />
                                            <button
                                                onClick={handleTestWebhook}
                                                disabled={testWebhookMutation.isPending || !settings.systemWebhookUrl}
                                                className="shrink-0 flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                                            >
                                                {testWebhookMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                                Test Connection
                                            </button>
                                        </div>
                                        <p className="text-xs text-slate-500 italic">Get instant alerts for new companies and high-tier placements.</p>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Tier-1 Salary Threshold (LPA)</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                            <input
                                                type="number"
                                                value={settings.tier1SalaryThreshold}
                                                onChange={(e) => setSettings({ ...settings, tier1SalaryThreshold: parseInt(e.target.value) })}
                                                className="w-full pl-7 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono"
                                            />
                                        </div>
                                        <p className="text-xs text-slate-500">Jobs above this CTC are classified as Tier-1 for celebratory alerts.</p>
                                    </div>

                                    {/* Calendar Integration */}
                                    <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center">
                                                <History size={18} />
                                            </div>
                                            <h3 className="text-md font-bold text-slate-800 dark:text-slate-100 italic">Calendar & Scheduling (Beta)</h3>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Google Calendar API Key</label>
                                                <input
                                                    type="password"
                                                    value={settings.googleCalendarApiKey}
                                                    onChange={(e) => setSettings({ ...settings, googleCalendarApiKey: e.target.value })}
                                                    placeholder="AIzaSy..."
                                                    className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-xs font-mono"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Google Client ID</label>
                                                <input
                                                    type="text"
                                                    value={settings.googleCalendarClientId}
                                                    onChange={(e) => setSettings({ ...settings, googleCalendarClientId: e.target.value })}
                                                    placeholder="12345-abcde.apps.googleusercontent.com"
                                                    className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-xs font-mono"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between p-3 rounded-lg bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/30">
                                            <div>
                                                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Auto-Schedule Interviews</h4>
                                                <p className="text-[11px] text-slate-500 dark:text-slate-400">Automatically reserve calendar slots when students are moved to INTERVIEW stage</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" checked={settings.autoScheduleInterviews} onChange={() => setSettings({ ...settings, autoScheduleInterviews: !settings.autoScheduleInterviews })} className="sr-only peer" />
                                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* Security & Compliance */}
                    {activeTab === 'security' && (
                        <div className="flex flex-col gap-6 animate-fade-in">
                            <Card className="flex flex-col gap-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                                        <Lock size={22} />
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 m-0">Security & Compliance</h2>
                                </div>

                                <div className="flex flex-col gap-5">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Session Timeout (Hours)</label>
                                        <input
                                            type="number"
                                            value={settings.sessionExpirationHours}
                                            onChange={(e) => setSettings({ ...settings, sessionExpirationHours: parseInt(e.target.value) })}
                                            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                        />
                                        <p className="text-xs text-slate-500">Force logout after inactivity. Default is 168 hours (7 days).</p>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Max Login Attempts</label>
                                        <input
                                            type="number"
                                            value={settings.maxFailedLoginAttempts}
                                            onChange={(e) => setSettings({ ...settings, maxFailedLoginAttempts: parseInt(e.target.value) })}
                                            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                        />
                                        <p className="text-xs text-slate-500">Number of failed logins before IP is temporarily banned.</p>
                                    </div>

                                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                                        <div>
                                            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Strong Passwords</h4>
                                            <p className="text-xs text-slate-500">Enforce uppercase, numbers, and symbols</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" checked={settings.enforcePasswordComplexity} onChange={() => setSettings({ ...settings, enforcePasswordComplexity: !settings.enforcePasswordComplexity })} className="sr-only peer" />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                </div>
                            </Card>
                        </div>
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
                        <div className="flex flex-col gap-6 animate-fade-in">
                            {/* Maintenance Overview */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                                    <div className="flex items-center gap-2 text-slate-500 mb-1">
                                        <History size={14} />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">Obsolete Logs</span>
                                    </div>
                                    <div className="text-2xl font-black text-slate-800 dark:text-slate-100">
                                        {healthData?.data?.obsoleteLogs || 0}
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-1 italic">Older than 90 days</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                                    <div className="flex items-center gap-2 text-slate-500 mb-1">
                                        <Zap size={14} />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">Prunable Apps</span>
                                    </div>
                                    <div className="text-2xl font-black text-slate-800 dark:text-slate-100">
                                        {healthData?.data?.obsoleteApplications || 0}
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-1 italic">Rejected/Withdrawn {'>'} 6mo</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                                    <div className="flex items-center gap-2 text-slate-500 mb-1">
                                        <Shield size={14} />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">Inactive Students</span>
                                    </div>
                                    <div className="text-2xl font-black text-slate-800 dark:text-slate-100">
                                        {healthData?.data?.inactiveStudents || 0}
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-1 italic">Pending {'>'} 3 months</p>
                                </div>
                            </div>

                            <Card className="flex flex-col gap-6 border-red-200 dark:border-red-900 bg-red-50/30 dark:bg-red-900/5 backdrop-blur-md">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                                        <AlertTriangle size={22} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-red-800 dark:text-red-400 m-0">Danger Zone</h2>
                                        <p className="text-xs text-red-500/70 font-medium italic">High-impact destructive actions. All purges are logged for audit.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    {/* Maintenance Tasks */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-4 rounded-xl border border-red-100 dark:border-red-900/30 bg-white/50 dark:bg-slate-900/50 flex flex-col gap-3 group">
                                            <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                                                <Database size={18} />
                                                <h4 className="font-bold text-sm">Prune Obsolete Logs</h4>
                                            </div>
                                            <p className="text-xs text-slate-500 leading-relaxed">Remove audit logs older than 90 days to optimize database storage and performance.</p>
                                            <button
                                                onClick={() => setPurgeConfig({ isOpen: true, type: 'LOGS' })}
                                                className="mt-2 w-full flex items-center justify-center gap-2 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white rounded-lg text-xs font-bold transition-all border border-red-100 dark:border-red-900/30"
                                            >
                                                <Trash2 size={14} /> Purge Records
                                            </button>
                                        </div>

                                        <div className="p-4 rounded-xl border border-red-100 dark:border-red-900/30 bg-white/50 dark:bg-slate-900/50 flex flex-col gap-3">
                                            <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                                                <Sparkles size={18} />
                                                <h4 className="font-bold text-sm">Cleanup Registrations</h4>
                                            </div>
                                            <p className="text-xs text-slate-500 leading-relaxed">Delete student accounts that remained in 'PENDING' status for over 90 days without approval.</p>
                                            <button
                                                onClick={() => setPurgeConfig({ isOpen: true, type: 'STUDENTS' })}
                                                className="mt-2 w-full flex items-center justify-center gap-2 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white rounded-lg text-xs font-bold transition-all border border-red-100 dark:border-red-900/30"
                                            >
                                                <Trash2 size={14} /> Prune Inactive
                                            </button>
                                        </div>
                                    </div>

                                    {/* Critical System Actions */}
                                    <div className="p-4 rounded-xl border border-red-200 dark:border-red-800/50 bg-red-100/20 dark:bg-red-900/10 flex flex-col gap-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <h4 className="font-bold text-sm text-red-800 dark:text-red-400">Maintenance Mode</h4>
                                                <p className="text-[10px] text-red-600/70 font-medium">Immediately disconnects all active non-admin sessions.</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" checked={settings.maintenanceMode} onChange={() => toggleSetting('maintenanceMode')} className="sr-only peer" />
                                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-red-600"></div>
                                            </label>
                                        </div>

                                        <div className="pt-4 border-t border-red-200/50 dark:border-red-800/30 flex items-center justify-between gap-4">
                                            <div className="flex flex-col flex-1">
                                                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                                    Compliance Export
                                                    <span className="py-0.5 px-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[8px] rounded uppercase">Safe</span>
                                                </h4>
                                                <p className="text-[10px] text-slate-500">Download a full JSON archive of all system data excluding passwords.</p>
                                            </div>
                                            <button
                                                onClick={() => masterExportMutation.mutate()}
                                                disabled={masterExportMutation.isPending}
                                                className="shrink-0 flex items-center gap-2 py-2 px-4 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-all shadow-md disabled:opacity-50"
                                            >
                                                {masterExportMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <History size={14} />}
                                                Export System State
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
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
                                onClick={handleSave}
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
