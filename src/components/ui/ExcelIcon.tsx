import React from 'react';

type ExcelIconProps = {
  className?: string;
  size?: number;
};

// Colored Microsoft Excel-like icon in green with a white X
export default function ExcelIcon({ className = '', size = 16 }: ExcelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="excelGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#21A366" />
          <stop offset="100%" stopColor="#107C41" />
        </linearGradient>
      </defs>
      <rect x="3" y="3" width="18" height="18" rx="2.5" fill="url(#excelGrad)" />
      <path
        d="M9.2 8l2.1 3.1L13.4 8h2.1l-2.8 4 2.9 4h-2.1l-2-3.1-2 3.1H7.3l2.9-4L7.4 8h1.8z"
        fill="#FFFFFF"
      />
    </svg>
  );
}


