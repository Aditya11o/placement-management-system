import React from 'react';

const ProfileSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 pb-12 w-full animate-pulse">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="h-10 bg-gray-200 rounded-lg w-64 mb-3"></div>
          <div className="h-4 bg-gray-100 rounded-md w-96"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border text-transparent select-none border-gray-100 rounded-[32px] p-8 shadow-sm text-center flex flex-col items-center">
             <div className="w-32 h-32 bg-gray-200 rounded-full mb-6 border-4 border-white shadow-md"></div>
             <div className="h-6 bg-gray-200 rounded-md w-48 mb-3"></div>
             <div className="h-4 bg-gray-100 rounded-md w-32 mb-6"></div>
             
             <div className="w-full flex justify-center gap-4 mb-8">
               <div className="w-10 h-10 bg-gray-100 rounded-full"></div>
               <div className="w-10 h-10 bg-gray-100 rounded-full"></div>
               <div className="w-10 h-10 bg-gray-100 rounded-full"></div>
             </div>

             <div className="w-full h-12 bg-gray-100 rounded-xl"></div>
          </div>
        </div>

        {/* Right Column - Forms/Content */}
        <div className="lg:col-span-2 space-y-6">
           {[...Array(3)].map((_, i) => (
             <div key={i} className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm">
                <div className="h-6 bg-gray-200 rounded-md w-40 mb-8"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <div className="h-3 bg-gray-100 rounded w-24 mb-2"></div>
                    <div className="h-12 bg-gray-50 rounded-xl w-full border border-gray-100"></div>
                  </div>
                  <div>
                    <div className="h-3 bg-gray-100 rounded w-24 mb-2"></div>
                    <div className="h-12 bg-gray-50 rounded-xl w-full border border-gray-100"></div>
                  </div>
                  <div className="md:col-span-2">
                    <div className="h-3 bg-gray-100 rounded w-24 mb-2"></div>
                    <div className="h-24 bg-gray-50 rounded-xl w-full border border-gray-100"></div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="h-12 bg-gray-200 rounded-xl w-32"></div>
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileSkeleton;
