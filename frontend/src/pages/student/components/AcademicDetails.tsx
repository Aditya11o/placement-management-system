import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import Card from '../../../components/Card/Card';
import Input from '../../../components/Input/Input';
import { BookOpen, Award, GraduationCap, MapPin } from 'lucide-react';

interface AcademicDetailsProps {
    register: UseFormRegister<any>;
    errors: FieldErrors<any>;
    isEditing: boolean;
}

const AcademicDetails: React.FC<AcademicDetailsProps> = ({ register, errors, isEditing }) => {
    return (
        <Card className="p-10 rounded-[3.5rem] border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 group">
            <div className="flex items-center gap-3 mb-10 pb-6 border-b border-slate-100 dark:border-slate-800">
                <BookOpen className="text-amber-500" size={24} />
                <h2 className="text-2xl m-0 font-black italic tracking-tight uppercase">Academic <br />Matrix.</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="col-span-1 sm:col-span-2">
                    <div className="relative group/field">
                        <GraduationCap className="absolute right-4 top-10 text-slate-200 group-focus-within/field:text-amber-500 transition-colors" size={24} />
                        <Input 
                            label="Institutional Branch / Department" 
                            error={errors.branch?.message as string} 
                            {...register('branch')} 
                            disabled={!isEditing}
                            className="h-16 rounded-2xl font-bold italic uppercase tracking-tight text-sm"
                        />
                    </div>
                </div>
                
                <div className="space-y-2">
                    <div className="relative">
                        <Award className="absolute right-4 top-10 text-slate-200" size={20} />
                        <Input 
                            label="Current CGPA" 
                            type="number" 
                            step="0.01" 
                            error={errors.cgpa?.message as string} 
                            {...register('cgpa')} 
                            disabled={!isEditing}
                            className="h-16 rounded-2xl font-black italic text-lg"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Input 
                        label="Graduation Year" 
                        type="number" 
                        error={errors.graduation_year?.message as string} 
                        {...register('graduation_year')} 
                        disabled={!isEditing}
                        className="h-16 rounded-2xl font-black italic text-lg"
                    />
                </div>

                <div className="space-y-2">
                    <Input 
                        label="10th Aggregate (%)" 
                        type="number" 
                        step="0.01" 
                        error={errors.marks_10th?.message as string} 
                        {...register('marks_10th')} 
                        disabled={!isEditing}
                        className="h-16 rounded-2xl font-bold italic"
                    />
                </div>

                <div className="space-y-2">
                    <Input 
                        label="12th Aggregate (%)" 
                        type="number" 
                        step="0.01" 
                        error={errors.marks_12th?.message as string} 
                        {...register('marks_12th')} 
                        disabled={!isEditing}
                        className="h-16 rounded-2xl font-bold italic"
                    />
                </div>
            </div>

            <div className="mt-10 p-6 bg-amber-500/5 rounded-3xl border border-amber-500/10 flex items-start gap-4">
                 <div className="p-2 bg-amber-500 text-white rounded-xl shadow-lg shadow-amber-500/20">
                      <MapPin size={18} />
                 </div>
                 <div>
                      <div className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest italic mb-1">Institutional Context</div>
                      <p className="text-[10px] text-slate-500 font-bold italic leading-relaxed m-0">Educational credentials are automatically validated against the central university controller database.</p>
                 </div>
            </div>
        </Card>
    );
};

export default AcademicDetails;
