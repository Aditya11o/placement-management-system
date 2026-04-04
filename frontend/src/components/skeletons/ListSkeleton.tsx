import React from 'react';

interface ListSkeletonProps {
  rows?: number;
  hideHeader?: boolean;
}

const ListSkeleton: React.FC<ListSkeletonProps> = ({ rows = 6, hideHeader = false }) => {
  return (
    <div className="space-y-6 pb-12 w-full animate-pulse">
      {!hideHeader && (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
          <div>
            <div className="h-10 bg-gray-200 rounded-lg w-72 mb-3"></div>
            <div className="h-4 bg-gray-100 rounded-md w-96 max-w-full"></div>
          </div>
          <div className="h-12 bg-gray-200 rounded-xl w-40 border border-gray-100"></div>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
        {/* Search & Filter Bar */}
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="w-full md:w-96 h-12 bg-gray-100 rounded-2xl"></div>
          <div className="flex gap-3 w-full md:w-auto">
            <div className="w-12 h-12 bg-gray-100 rounded-xl"></div>
            <div className="w-12 h-12 bg-gray-100 rounded-xl"></div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                {[...Array(5)].map((_, i) => (
                  <th key={i} className="px-6 py-5 border-b border-gray-100">
                    <div className={`h-3 bg-gray-200 rounded w-20 ${i === 4 ? 'ml-auto' : ''}`}></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[...Array(rows)].map((_, rowIndex) => (
                <tr key={rowIndex}>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex-shrink-0"></div>
                      <div className="flex flex-col gap-2 w-full">
                        <div className="h-4 bg-gray-200 rounded-md w-32"></div>
                        <div className="h-3 bg-gray-100 rounded-md w-24"></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5"><div className="h-4 bg-gray-100 rounded-md w-28"></div></td>
                  <td className="px-6 py-5"><div className="h-6 bg-gray-50 rounded-full w-20 border border-gray-100"></div></td>
                  <td className="px-6 py-5"><div className="h-4 bg-gray-100 rounded-md w-24"></div></td>
                  <td className="px-6 py-5">
                    <div className="flex justify-end gap-2">
                       <div className="w-8 h-8 bg-gray-100 rounded-lg"></div>
                       <div className="w-8 h-8 bg-gray-100 rounded-lg"></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ListSkeleton;
