import { Palette, Image as ImageIcon, Loader2, Sun } from 'lucide-react';
import Card from '../../Card/Card';
import ThemePreview from '../../Dashboard/ThemePreview';
import { useMutation } from '@tanstack/react-query';
import api from '../../../services/api';
import { useToast } from '../../../context/ToastContext';
import { AdminSettingsType } from '../../../types/admin';


interface BrandingSettingsProps {
    settings: AdminSettingsType;
    setSettings: React.Dispatch<React.SetStateAction<AdminSettingsType>>;
    logoFile: File | null;
    setLogoFile: (file: File | null) => void;
    logoPreview: string | null;
    setLogoPreview: (preview: string | null) => void;
    faviconFile: File | null;
    setFaviconFile: (file: File | null) => void;
    faviconPreview: string | null;
    setFaviconPreview: (preview: string | null) => void;
}

const BrandingSettings: React.FC<BrandingSettingsProps> = ({
    settings,
    setSettings,
    logoFile,
    setLogoFile,
    logoPreview,
    setLogoPreview,
    faviconFile,
    setFaviconFile,
    faviconPreview,
    setFaviconPreview
}) => {
    const { addToast } = useToast();

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

    const handleLogoUpload = () => {
        if (logoFile) logoMutation.mutate(logoFile);
    };

    const handleFaviconUpload = () => {
        if (faviconFile) faviconMutation.mutate(faviconFile);
    };

    return (
        <Card className="flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3 mb-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                        <Palette size={22} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 m-0">Branding & Theming</h2>
                </div>
                <div className="hidden lg:block w-64">
                    <ThemePreview primaryColor={settings.primaryColor} meshColors={settings.meshGradientColors} />
                </div>
            </div>

            <div className="flex flex-col gap-6">
                {/* Institution Name */}
                <div className="flex flex-col gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <h4 className="font-semibold text-slate-800 dark:text-slate-200">Institution Name</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">The name that appears in titles, emails, and the sidebar.</p>
                    <input
                        type="text"
                        value={settings.institutionName}
                        onChange={(e) => setSettings({ ...settings, institutionName: e.target.value })}
                        placeholder="e.g. Techno Main Salt Lake"
                        className="mt-2 w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-brand-500/20 transition-all font-medium"
                    />
                </div>

                {/* Color Palette */}
                <div className="flex flex-col gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <h4 className="font-semibold text-slate-800 dark:text-slate-200">Brand Color Palette</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Define your university's core colors for a consistent look and feel.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
                        {/* Primary Color */}
                        <div className="flex flex-col gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/50">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Primary Color</label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={settings.primaryColor}
                                    onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                                    className="w-10 h-10 rounded-lg cursor-pointer border-none bg-transparent"
                                />
                                <span className="text-sm font-mono font-bold text-slate-600 dark:text-slate-300">{settings.primaryColor}</span>
                            </div>
                        </div>

                        {/* Secondary Color */}
                        <div className="flex flex-col gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/50">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Secondary Color</label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={settings.brandSecondaryColor}
                                    onChange={(e) => setSettings({ ...settings, brandSecondaryColor: e.target.value })}
                                    className="w-10 h-10 rounded-lg cursor-pointer border-none bg-transparent"
                                />
                                <span className="text-sm font-mono font-bold text-slate-600 dark:text-slate-300">{settings.brandSecondaryColor}</span>
                            </div>
                        </div>

                        {/* Accent Color */}
                        <div className="flex flex-col gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/50">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Accent Color</label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={settings.brandAccentColor}
                                    onChange={(e) => setSettings({ ...settings, brandAccentColor: e.target.value })}
                                    className="w-10 h-10 rounded-lg cursor-pointer border-none bg-transparent"
                                />
                                <span className="text-sm font-mono font-bold text-slate-600 dark:text-slate-300">{settings.brandAccentColor}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Logo Upload */}
                <div className="flex flex-col gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <h4 className="font-semibold text-slate-800 dark:text-slate-200">Institution Logo</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Upload a crisp PNG or JPG to appear in the sidebar.</p>

                    <div className="flex items-center gap-6 mt-3">
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
                        <Sun size={18} className="text-amber-500" />
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
    );
};

export default BrandingSettings;
