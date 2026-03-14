import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import Card from '../../../components/Card/Card';
import Input from '../../../components/Input/Input';
import { BookOpen } from 'lucide-react';

interface AcademicDetailsProps {
    register: UseFormRegister<any>;
    errors: FieldErrors<any>;
    isEditing: boolean;
}

const AcademicDetails: React.FC<AcademicDetailsProps> = ({ register, errors, isEditing }) => {
    return (
        <Card>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200">
                <BookOpen className="text-purple-500" size={24} />
                <h2 className="text-lg m-0 font-bold">Academic History</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                <div className="col-span-1 sm:col-span-2 mb-2">
                    <Input label="Branch" error={errors.branch?.message as string} {...register('branch')} disabled={!isEditing} />
                </div>
                <div className="mb-2">
                    <Input label="Current CGPA" type="number" step="0.01" error={errors.cgpa?.message as string} {...register('cgpa')} disabled={!isEditing} />
                </div>
                <div className="mb-2">
                    <Input label="Graduation Year" type="number" error={errors.graduation_year?.message as string} {...register('graduation_year')} disabled={!isEditing} />
                </div>
                <div className="mb-2">
                    <Input label="10th Marks (%)" type="number" step="0.01" error={errors.marks_10th?.message as string} {...register('marks_10th')} disabled={!isEditing} />
                </div>
                <div className="mb-2">
                    <Input label="12th Marks (%)" type="number" step="0.01" error={errors.marks_12th?.message as string} {...register('marks_12th')} disabled={!isEditing} />
                </div>
            </div>
        </Card>
    );
};

export default AcademicDetails;
