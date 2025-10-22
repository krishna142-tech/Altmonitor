
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSupabaseData } from "@/context/SupabaseDataContext";
import ReportingRequirementsTab from "@/components/investment-detail/ReportingRequirementsTab";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const ReportingRequirementsPage: React.FC = () => {
  const { investmentId } = useParams<{ investmentId: string }>();
  const {
    facilities,
    getReportingRequirements,
    addReportingRequirement,
    getCashflowSchedulesForFacility,
  } = useSupabaseData();
  const [reportingRequirements, setReportingRequirements] = useState<any[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<any>(null);
  const [showAddReportDialog, setShowAddReportDialog] = useState(false);
  const [newRequirement, setNewRequirement] = useState<any>({
    obligor: "",
    role: "Borrower",
    reportingRequirement: "",
    previousReportingDate: "",
    nextReportingDate: "",
    daysToProvide: 20,
    reportingDueDate: "",
    alter: "",
  });

  const currentInvestmentName = investmentId
    ? decodeURIComponent(investmentId).trim()
    : "";
  const filteredFacilities = facilities.filter(
    (f) => f.investmentName === currentInvestmentName
  );

  useEffect(() => {
    if (filteredFacilities.length > 0) {
      setSelectedFacility(filteredFacilities[0]);
    }
  }, [investmentId, facilities]);

  useEffect(() => {
    (async () => {
      if (selectedFacility && selectedFacility.id) {
        try {
          const reqs = await getReportingRequirements(selectedFacility.id);
          setReportingRequirements(reqs || []);
        } catch {
          setReportingRequirements([]);
        }
      } else {
        setReportingRequirements([]);
      }
    })();
  }, [selectedFacility, getReportingRequirements]);

  const handleAddRequirement = async () => {
    if (!selectedFacility) return;
    try {
      await addReportingRequirement({
        ...newRequirement,
        obligor: newRequirement.obligor || selectedFacility?.investmentName || "",
        facility_id: selectedFacility.id,
      });
      const updated = await getReportingRequirements(selectedFacility.id);
      setReportingRequirements(updated || []);
      setNewRequirement({
        obligor: "",
        role: "Borrower",
        reportingRequirement: "",
        previousReportingDate: "",
        nextReportingDate: "",
        daysToProvide: 20,
        reportingDueDate: "",
        alter: "",
      });
      setShowAddReportDialog(false);
    } catch (err) {
      console.error("Error adding reporting requirement:", err);
    }
  };

  const generateReportingSchedule = () => {
    // This is a placeholder for the actual implementation
    console.log("generateReportingSchedule called");
  };

  return (
    <div className="p-6">
      <ReportingRequirementsTab
        selectedFacility={selectedFacility}
        reportingRequirements={reportingRequirements}
        onAddClick={() => setShowAddReportDialog(true)}
        onAutoGenerate={generateReportingSchedule}
      />
      <Dialog open={showAddReportDialog} onOpenChange={setShowAddReportDialog}>
        <DialogContent className="max-w-2xl">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Add Reporting Requirement
              </h2>
              <p className="text-sm text-gray-600">
                Add a new reporting requirement for this facility
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Obligor
                </label>
                <input
                  type="text"
                  value={newRequirement.obligor}
                  onChange={(e) =>
                    setNewRequirement({ ...newRequirement, obligor: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={newRequirement.role}
                  onChange={(e) =>
                    setNewRequirement({ ...newRequirement, role: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                >
                  {["Borrower", "Guarantor", "Sponsor", "Other"].map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reporting Requirement
                </label>
                <input
                  type="text"
                  value={newRequirement.reportingRequirement}
                  onChange={(e) =>
                    setNewRequirement({
                      ...newRequirement,
                      reportingRequirement: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="e.g., Annual statements"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Previous Reporting Date
                </label>
                <input
                  type="date"
                  value={newRequirement.previousReportingDate}
                  onChange={(e) =>
                    setNewRequirement({
                      ...newRequirement,
                      previousReportingDate: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Next Reporting Date
                </label>
                <input
                  type="date"
                  value={newRequirement.nextReportingDate}
                  onChange={(e) =>
                    setNewRequirement({
                      ...newRequirement,
                      nextReportingDate: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Days to Provide
                </label>
                <input
                  type="number"
                  value={newRequirement.daysToProvide}
                  onChange={(e) =>
                    setNewRequirement({
                      ...newRequirement,
                      daysToProvide: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reporting Due Date
                </label>
                <input
                  type="date"
                  value={newRequirement.reportingDueDate}
                  onChange={(e) =>
                    setNewRequirement({
                      ...newRequirement,
                      reportingDueDate: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowAddReportDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddRequirement}
                disabled={!newRequirement.reportingRequirement}
              >
                Add Requirement
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReportingRequirementsPage;
