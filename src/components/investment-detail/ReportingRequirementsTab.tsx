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
  alter?: string;
}

interface ReportingRequirementsTabProps {
  selectedFacility: Facility | { issuerName?: string } | null;
  reportingRequirements: ReportingRequirement[];
  onAddClick: () => void;
  onAutoGenerate: () => void;
}

const ReportingRequirementsTab: React.FC<ReportingRequirementsTabProps> = ({
  selectedFacility,
  reportingRequirements,
  onAddClick,
  onAutoGenerate,
}) => {
  return (
    <div className="p-6 space-y-6 bg-white rounded-lg border">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-blue-600" />
          <h2 className="text-lg font-semibold">Reporting Requirements</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onAutoGenerate}
            className="px-3 py-2 border rounded hover:bg-gray-50 print:hidden"
          >
            Auto-Generate
          </button>
          <button
            onClick={onAddClick}
            className="px-3 py-2 border rounded hover:bg-gray-50 print:hidden"
          >
            Add Reporting Requirement
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-blue-600">
            <tr>
              {[
                "Obligor",
                "Role",
                "Reporting Requirement",
                "Previous Reporting Date",
                "Next Reporting Date",
                "Days to Provide",
                "Reporting Due Date",
                "Alter",
              ].map((header) => (
                <th
                  key={header}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {reportingRequirements.length > 0 ? (
              reportingRequirements.map((r, index) => (
                <tr key={r.id ?? index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {r.obligor || selectedFacility?.issuerName || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {r.role || "Borrower"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {r.reportingRequirement || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {r.previousReportingDate || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {r.nextReportingDate || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {r.daysToProvide || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {r.reportingDueDate || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {r.alter || ""}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={8}
                  className="px-6 py-8 text-center text-gray-500"
                >
                  No Reporting Requirements Found
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
