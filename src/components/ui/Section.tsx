import React from 'react';

type SectionProps = {
  title: string;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
};

export default function Section({ title, children, className = '', headerClassName = '', bodyClassName = '' }: SectionProps) {
  return (
    <div className={`bg-white border rounded-lg shadow-sm ${className}`}>
      <div className={`px-4 py-2 border-b bg-gray-50 rounded-t-lg ${headerClassName}`}>
        <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
      </div>
      <div className={`p-4 ${bodyClassName}`}>
        {children}
      </div>
    </div>
  );
}


