import React from 'react';

interface CardSkeletonProps {
  cards?: number;
  hideHeader?: boolean;
}

const CardSkeleton: React.FC<CardSkeletonProps> = ({ cards = 6, hideHeader = false }) => {
  return (
    <div className="space-y-6 pb-12 w-full animate-pulse">
      {!hideHeader && (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
          <div>
            <div className="h-10 bg-gray-200 rounded-lg w-64 mb-3"></div>
            <div className="h-4 bg-gray-100 rounded-md w-96 max-w-full"></div>
          </div>
          <div className="flex gap-3">
             <div className="h-12 bg-gray-100 rounded-xl w-32"></div>
             <div className="h-12 bg-gray-200 rounded-xl w-40 border border-gray-100"></div>
          </div>
        </div>
      )}

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[...Array(cards)].map((_, i) => (
          <div key={i} className="bg-white border select-none border-gray-100 rounded-[32px] p-8 shadow-sm flex flex-col h-full">
            <div className="flex justify-between items-start mb-6">
              <div className="w-16 h-16 bg-gray-100 rounded-[20px]"></div>
              <div className="w-24 h-8 bg-gray-50 rounded-full"></div>
            </div>
            
            <div className="h-6 bg-gray-200 rounded-lg w-3/4 mb-3"></div>
            <div className="h-4 bg-gray-100 rounded-md w-1/2 mb-6"></div>
            
            <div className="flex flex-wrap gap-2 mb-8">
               <div className="h-6 bg-gray-50 rounded-md w-20"></div>
               <div className="h-6 bg-gray-50 rounded-md w-24"></div>
               <div className="h-6 bg-gray-50 rounded-md w-16"></div>
            </div>
            
            <div className="mt-auto pt-6 border-t border-gray-100 flex justify-between items-center">
              <div className="h-5 bg-gray-200 rounded-md w-24"></div>
              <div className="h-10 bg-gray-100 rounded-xl w-28"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CardSkeleton;
