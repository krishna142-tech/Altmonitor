import React from 'react';

type Item = { label: string; value?: React.ReactNode };

type IdentifierStripProps = {
  items: Item[];
  className?: string;
};

export default function IdentifierStrip({ items, className = '' }: IdentifierStripProps) {
  return (
    <div className={`grid grid-cols-6 gap-3 p-3 bg-blue-50 rounded-md border border-blue-100 ${className}`}>
      {items.map((it, idx) => (
        <div className="text-center" key={idx}>
          <div className="text-xs font-semibold text-blue-900 mb-1">{it.label}</div>
          <div className="text-sm text-gray-700 font-medium">{it.value ?? 'N/A'}</div>
        </div>
      ))}
    </div>
  );
}


