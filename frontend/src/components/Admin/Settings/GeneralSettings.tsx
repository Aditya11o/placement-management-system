import { ToggleRight } from 'lucide-react';
import Card from '../../Card/Card';
import { AdminSettingsType } from '../../../types/admin';


interface GeneralSettingsProps {
    settings: AdminSettingsType;
    toggleSetting: (key: keyof AdminSettingsType) => void;
}

const GeneralSettings: React.FC<GeneralSettingsProps> = ({ settings, toggleSetting }) => {
    return (
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
    );
};

export default GeneralSettings;
