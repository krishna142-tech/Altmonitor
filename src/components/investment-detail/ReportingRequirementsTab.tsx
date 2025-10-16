import React from 'react';

type ReportingRequirementsTabProps = {
  selectedFacility: any | null;
  reportingRequirements: any[];
  onAddClick: () => void;
  onAutoGenerate: () => void;
};

const ReportingRequirementsTab: React.FC<ReportingRequirementsTabProps> = ({ selectedFacility, reportingRequirements, onAddClick, onAutoGenerate }) => {
  return (
    <div className="p-6 space-y-6 bg-white rounded-lg border">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-blue-600" />
          <h2 className="text-lg font-semibold">Reporting Requirements</h2>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onAutoGenerate} className="px-3 py-2 border rounded print:hidden">Auto-Generate</button>
          <button onClick={onAddClick} className="px-3 py-2 border rounded print:hidden">Add Reporting Requirement</button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-blue-600">
            <tr>
              {['Obligor','Role','Reporting Requirement','Previous reporting Date','Next Reporting date','Days to provide','Reporting Due Date','Alter'].map(h => (
                <th key={h} className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reportingRequirements.length > 0 ? reportingRequirements.map((r:any) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{r.obligor || (selectedFacility as any)?.issuerName || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.role || 'Borrower'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.reportingRequirement || r.reporting_requirement || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.previousReportingDate || r.previous_reporting_date || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.nextReportingDate || r.next_reporting_date || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.daysToProvide || r.days_to_provide || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.reportingDueDate || r.reporting_due_date || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.alter || ''}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-gray-500">No Reporting Requirements Found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportingRequirementsTab;

