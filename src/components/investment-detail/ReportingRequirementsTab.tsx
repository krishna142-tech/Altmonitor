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
      <div className="bg-white border rounded-lg shadow-sm">
        <div className="px-4 py-2 border-b bg-gray-50 rounded-t-lg flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Reporting Requirements</h2>
          <button
            onClick={onAutoGenerate}
            className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-medium"
          >
            Auto-Generate
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b">
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
                  className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
            <tbody>
              {reportingRequirements.length > 0 ? (
                reportingRequirements.map((r, index) => (
                  <tr key={r.id ?? index} className="border-b hover:bg-gray-50">
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
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    </div>
  );
};

export default ReportingRequirementsTab;
