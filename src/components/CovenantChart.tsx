import React from 'react';

interface CovenantChartProps {
  data: any[];
  title?: string;
}

const CovenantChart: React.FC<CovenantChartProps> = ({ data, title = "Covenant Graph" }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <div className="text-lg font-medium mb-2">{title}</div>
        <div className="text-sm">No data available for chart visualization</div>
      </div>
    );
  }

  // Sample DSCR data for the line chart (2020-2023)
  const dscrData = [
    { year: 2020, value: 3.00 },
    { year: 2021, value: 2.00 },
    { year: 2022, value: 1.90 },
    { year: 2023, value: 2.50 }
  ];

  // Calculate chart dimensions and scaling
  const maxValue = Math.max(...dscrData.map(d => d.value));
  const minValue = Math.min(...dscrData.map(d => d.value));
  const range = maxValue - minValue;
  const padding = range * 0.1;
  const chartMin = Math.max(0, minValue - padding);
  const chartMax = maxValue + padding;

  // Chart dimensions
  const chartWidth = 400;
  const chartHeight = 200;
  const paddingX = 40;
  const paddingY = 20;

  // Convert data points to SVG coordinates
  const getX = (year: number) => {
    const years = dscrData.map(d => d.year);
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);
    const yearRange = maxYear - minYear;
    const x = ((year - minYear) / yearRange) * (chartWidth - 2 * paddingX) + paddingX;
    return x;
  };

  const getY = (value: number) => {
    const y = chartHeight - paddingY - ((value - chartMin) / (chartMax - chartMin)) * (chartHeight - 2 * paddingY);
    return y;
  };

  // Create path for the line
  const pathData = dscrData.map((point, index) => {
    const x = getX(point.year);
    const y = getY(point.value);
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  return (
    <div className="space-y-4">
      {/* Chart Title */}
      <div className="text-left">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      
      {/* Line Chart */}
      <div className="bg-white border rounded-lg p-6">
        <div className="mb-4">
          <h4 className="text-md font-medium text-gray-800">Dscr</h4>
        </div>
        
        <div className="relative">
          <svg width={chartWidth} height={chartHeight} className="border border-gray-200 rounded">
            {/* Grid lines */}
            {[0, 1, 2, 3, 4].map(value => {
              const y = getY(value);
              return (
                <g key={value}>
                  <line
                    x1={paddingX}
                    y1={y}
                    x2={chartWidth - paddingX}
                    y2={y}
                    stroke="#e5e7eb"
                    strokeWidth={1}
                  />
                  <text
                    x={paddingX - 10}
                    y={y + 4}
                    textAnchor="end"
                    className="text-xs fill-gray-500"
                  >
                    {value.toFixed(2)}
                  </text>
                </g>
              );
            })}
            
            {/* Year labels */}
            {dscrData.map(point => {
              const x = getX(point.year);
              return (
                <text
                  key={point.year}
                  x={x}
                  y={chartHeight - 5}
                  textAnchor="middle"
                  className="text-xs fill-gray-600"
                >
                  {point.year}
                </text>
              );
            })}
            
            {/* Line path */}
            <path
              d={pathData}
              fill="none"
              stroke="#3b82f6"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {/* Data points */}
            {dscrData.map((point, index) => {
              const x = getX(point.year);
              const y = getY(point.value);
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r={4}
                  fill="#3b82f6"
                  stroke="white"
                  strokeWidth={2}
                />
              );
            })}
            
            {/* Data point labels */}
            {dscrData.map((point, index) => {
              const x = getX(point.year);
              const y = getY(point.value);
              return (
                <text
                  key={`label-${index}`}
                  x={x}
                  y={y - 10}
                  textAnchor="middle"
                  className="text-xs fill-gray-700 font-medium"
                >
                  {point.value.toFixed(2)}
                </text>
              );
            })}
          </svg>
          
          {/* Plot Area label */}
          <div className="absolute bottom-2 right-2 text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
            Plot Area
          </div>
        </div>
      </div>

      {/* Alert Features */}
      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex items-center">
          <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
          <span>Real-time alerts for covenant breaches.</span>
        </div>
        <div className="flex items-center">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
          <span>Email notifications for significant changes.</span>
        </div>
      </div>
    </div>
  );
};

export default CovenantChart;