import React from 'react';

const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 pb-12 w-full animate-pulse">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="h-10 bg-gray-200 rounded-lg w-64 mb-3"></div>
          <div className="h-4 bg-gray-100 rounded-md w-96"></div>
        </div>
        <div className="h-12 bg-gray-200 rounded-xl w-32 border border-gray-100"></div>
      </div>

      {/* Stat Cards - 4 Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white border text-transparent select-none border-gray-100 rounded-[24px] p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-gray-100 rounded-xl"></div>
              <div className="w-16 h-6 bg-gray-50 rounded-md"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded-lg w-2/3 mb-2"></div>
            <div className="h-4 bg-gray-100 rounded-md w-1/2"></div>
          </div>
        ))}
      </div>

      {/* Main Content Area - 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Large Chart Area */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-[28px] p-6 shadow-sm min-h-[400px]">
          <div className="flex justify-between items-center mb-8">
            <div className="h-6 bg-gray-200 rounded-md w-48"></div>
            <div className="h-10 bg-gray-100 rounded-xl w-32"></div>
          </div>
          <div className="w-full h-64 bg-gray-50 rounded-2xl border border-gray-100/50"></div>
        </div>

        {/* List/Activity Feed Area */}
        <div className="bg-white border border-gray-100 rounded-[28px] p-6 shadow-sm min-h-[400px]">
          <div className="h-6 bg-gray-200 rounded-md w-40 mb-8"></div>
          <div className="space-y-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex-shrink-0"></div>
                <div className="w-full">
                  <div className="h-4 bg-gray-200 rounded-md w-full mb-2"></div>
                  <div className="h-3 bg-gray-100 rounded-md w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
