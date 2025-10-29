import React from 'react';

type Segment = { percent: number; color: string };

type DonutChartProps = {
  segments: Segment[];
  size?: number;
  stroke?: number;
  centerLabel?: React.ReactNode;
  className?: string;
};

export default function DonutChart({ segments, size = 120, stroke = 18, centerLabel, className = '' }: DonutChartProps) {
  const radius = (size / 2) - stroke;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#e5e7eb" strokeWidth={stroke} />
        {segments.map((seg, i) => {
          const dash = circumference * (Math.max(0, Math.min(100, seg.percent)) / 100);
          const gap = circumference - dash;
          const el = (
            <circle
              key={i}
              cx={size/2}
              cy={size/2}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={stroke}
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-offset}
            />
          );
          offset += dash;
          return el;
        })}
      </svg>
      {centerLabel && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-700">
          {centerLabel}
        </div>
      )}
    </div>
  );
}


