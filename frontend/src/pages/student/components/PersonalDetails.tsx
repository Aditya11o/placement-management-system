import React from 'react';
import Card from '../../../components/Card/Card';
import { User as UserIcon } from 'lucide-react';
import { User } from '../../../types';

interface PersonalDetailsProps {
    user: User | null;
}

const PersonalDetails: React.FC<PersonalDetailsProps> = ({ user }) => {
    return (
        <Card>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200">
                <UserIcon className="text-sky-500" size={24} />
                <h2 className="text-lg m-0 font-bold">Personal Details</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                <div className="col-span-1 sm:col-span-2">
                    <label className="text-slate-500 text-sm block mb-1">Full Name</label>
                    <p className="font-semibold text-slate-800 text-base mb-4 mt-0">{user?.name}</p>
                </div>
                <div className="col-span-1 sm:col-span-2">
                    <label className="text-slate-500 text-sm block mb-1">Email Address</label>
                    <p className="font-semibold text-slate-800 text-base mb-4 mt-0">{user?.email}</p>
                </div>
            </div>
        </Card>
    );
};

export default PersonalDetails;
