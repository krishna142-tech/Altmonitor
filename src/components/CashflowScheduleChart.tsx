import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface CashflowItem {
  date: string;
  principal: number;
  interest: number;
  'Interest Due'?: number;
  'Outstanding'?: number;
  'Interest Amount Due'?: number;
  'Amortisation Amount'?: number;
}

interface CashflowScheduleChartProps {
  cashflowData: CashflowItem[];
}

const CashflowScheduleChart: React.FC<CashflowScheduleChartProps> = ({ cashflowData }) => {
  // If no data, show empty state
  if (!cashflowData || cashflowData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <div className="text-lg font-medium mb-2">No Cashflow Data Available</div>
          <div className="text-sm">Generate cashflow schedule to view chart data</div>
        </div>
      </div>
    );
  }

  // Process cashflowData to extract Amortisation Amount and Interest Amount Due
  const chartData = cashflowData.map((item, index) => {
    // Try different possible field names for the data
    const amortisationAmount = item['Amortisation Amount'] || 
                              Math.abs(item.principal || 0) || 
                              Math.abs(item['Outstanding'] || 0) || 
                              0;
    
    const interestAmount = item['Interest Amount Due'] || 
                          item['Interest Due'] || 
                          item.interest || 
                          0;

    return {
      name: item.date || `Period ${index + 1}`,
      'Amortisation Amount': amortisationAmount,
      'Interest Amount Due': interestAmount,
    };
  });

  // If we still have no meaningful data, show empty state
  if (chartData.every(item => item['Amortisation Amount'] === 0 && item['Interest Amount Due'] === 0)) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <div className="text-lg font-medium mb-2">No Chart Data Available</div>
          <div className="text-sm">Cashflow data exists but contains no values for charting</div>
        </div>
      </div>
    );
  }

  // Take only the first 10 data points to match the screenshot if there are more
  const displayedChartData = chartData.slice(0, 10);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={displayedChartData}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 20,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="Amortisation Amount" fill="#3b82f6" />
        <Bar dataKey="Interest Amount Due" fill="#f59e0b" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default CashflowScheduleChart;