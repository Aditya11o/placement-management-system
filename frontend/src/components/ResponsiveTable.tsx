import React from 'react';

interface ResponsiveTableProps {
  children: React.ReactNode;
}

const ResponsiveTable: React.FC<ResponsiveTableProps> = ({ children }) => {
  return (
    <div className="w-full overflow-x-auto custom-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
      <div className="min-w-[800px] lg:min-w-full inline-block align-middle">
        {children}
      </div>
    </div>
  );
};

export default ResponsiveTable;
