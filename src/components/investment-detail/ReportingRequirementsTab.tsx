import React from "react";
import { Facility } from '@/context/DataContext';

interface ReportingRequirement {
  id: string | number;
  obligor?: string;
  role?: string;
  reportingRequirement?: string;
  previousReportingDate?: string;
  nextReportingDate?: string;
  daysToProvide?: string | number;
  reportingDueDate?: string;
}

interface ReportingRequirementsTabProps {
  selectedFacility: Facility | { issuerName?: string } | null;
  reportingRequirements: ReportingRequirement[];
  onAutoGenerate: () => void;
}

const ReportingRequirementsTab: React.FC<ReportingRequirementsTabProps> = ({
  selectedFacility,
  reportingRequirements,
  onAutoGenerate,
}) => {
  return (
    <div className="p-4 space-y-3">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-100 to-green-50 border-2 border-green-200 rounded-lg px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-green-600 flex items-center justify-center shadow-sm">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm6 6H7v2h6v-2z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-green-900">Reporting Requirements</h2>
          </div>
          <button
            onClick={onAutoGenerate}
            className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm font-medium shadow-sm print:hidden transition-colors"
          >
            Auto-Generate
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-gradient-to-b from-green-50 to-white rounded-lg border-2 border-green-200 shadow-sm">
        <table className="min-w-full divide-y divide-green-200">
          <thead className="bg-green-100 border-b-2 border-green-300">
            <tr>
              {[
                "Obligor",
                "Role",
                "Reporting Requirement",
                "Previous Reporting Date",
                "Next Reporting Date",
                "Days to Provide",
                "Reporting Due Date",
              ].map((header) => (
                <th
                  key={header}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-semibold text-green-900 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-green-100">
            {reportingRequirements.length > 0 ? (
              reportingRequirements.map((r, index) => (
                <tr key={r.id ?? index} className="hover:bg-green-50/30 border-b border-green-100">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {r.obligor || selectedFacility?.issuerName || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {r.role || "Borrower"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {r.reportingRequirement || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {r.previousReportingDate || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {r.nextReportingDate || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {r.daysToProvide || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                    {r.reportingDueDate || "N/A"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-12 text-center text-gray-500 bg-green-50"
                >
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <svg className="w-12 h-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="font-medium text-gray-700">No Reporting Requirements Found</p>
                    <p className="text-xs text-gray-500">Use "Auto-Generate" to create requirements</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportingRequirementsTab;
