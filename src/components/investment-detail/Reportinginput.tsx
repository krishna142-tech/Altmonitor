import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Facility } from '@/context/DataContext';

type ReportingRequirement = {
  id?: string | number;
  obligor?: string;
  role?: string;
  reportingRequirement?: string;
  previousReportingDate?: string;
  nextReportingDate?: string;
  daysToProvide?: number;
  reportingDueDate?: string;
  emailId?: string;
  maturityDate?: string;
  frequency?: string;
  businessDay?: string;
  displayName?: string;
};

type ScheduleEntry = {
  reportingDate: string;
  daysToProvide: number;
  dueDate: string;
};

type ReportingRequirementsInputProps = {
  selectedFacility?: Facility | null;
  newRequirement: ReportingRequirement;
  setNewRequirement: (req: ReportingRequirement) => void;
  onSave: () => void;
  onAutoGenerate: () => void;
  reportingRequirements: ReportingRequirement[];
};

const ReportingRequirementsInput: React.FC<ReportingRequirementsInputProps> = ({
  selectedFacility,
  newRequirement,
  setNewRequirement,
  onSave,
  reportingRequirements,
}) => {
  const [generatedSchedule, setGeneratedSchedule] = useState<ScheduleEntry[]>([]);

  const addBusinessDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    let addedDays = 0;
    
    while (addedDays < days) {
      result.setDate(result.getDate() + 1);
      const dayOfWeek = result.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        addedDays++;
      }
    }
    
    return result;
  };

  const generateSchedule = () => {
    if (!newRequirement.nextReportingDate || !newRequirement.maturityDate || !newRequirement.frequency) {
      alert("Please fill in Next Reporting Date, Maturity Date, and Frequency");
      return;
    }

    const schedule: ScheduleEntry[] = [];
  const currentDate = new Date(newRequirement.nextReportingDate);
    const maturityDate = new Date(newRequirement.maturityDate);
    const daysToProvide = newRequirement.daysToProvide || 0;
    const frequency = newRequirement.frequency.toLowerCase();

    while (currentDate <= maturityDate) {
      let dueDate: Date;
      
      if (newRequirement.businessDay === "Yes") {
        dueDate = addBusinessDays(currentDate, daysToProvide);
      } else {
        dueDate = new Date(currentDate);
        dueDate.setDate(dueDate.getDate() + daysToProvide);
      }

      schedule.push({
        reportingDate: currentDate.toISOString().split('T')[0],
        daysToProvide,
        dueDate: dueDate.toISOString().split('T')[0]
      });

      // Increment based on frequency
      if (frequency === "annual") {
        currentDate.setFullYear(currentDate.getFullYear() + 1);
      } else if (frequency === "semi-annual") {
        currentDate.setMonth(currentDate.getMonth() + 6);
      } else if (frequency === "quarterly") {
        currentDate.setMonth(currentDate.getMonth() + 3);
      } else if (frequency === "monthly") {
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
    }

    setGeneratedSchedule(schedule);
  };

  if (!selectedFacility)
    return (
      <div className="p-6 bg-white border rounded-lg">
        <p className="text-gray-600 text-sm">
          Select a facility to manage reporting requirements.
        </p>
      </div>
    );

  return (
    <div className="p-6 bg-white border rounded-lg space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          Reporting Requirements Input
        </h2>
        <p className="text-sm text-gray-600">
          Add or modify reporting obligations for this facility.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="obligor">Obligor Name</Label>
          <Input
            id="obligor"
            value={newRequirement.obligor || ''}
            onChange={(e) =>
              setNewRequirement({ ...newRequirement, obligor: e.target.value })
            }
          />
        </div>

        <div>
          <Label htmlFor="role">Role</Label>
          <Select
            value={newRequirement.role || ''}
            onValueChange={(value) =>
              setNewRequirement({ ...newRequirement, role: value })
            }
          >
            <SelectTrigger id="role">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Borrower">Borrower</SelectItem>
              <SelectItem value="Guarantor">Guarantor</SelectItem>
              <SelectItem value="Sponsor">Sponsor</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="reportingRequirement">Reporting Requirement</Label>
          <Input
            id="reportingRequirement"
            value={newRequirement.reportingRequirement || ''}
            onChange={(e) =>
              setNewRequirement({
                ...newRequirement,
                reportingRequirement: e.target.value,
              })
            }
          />
        </div>

        <div>
          <Label htmlFor="nextReportingDate">Reporting Date</Label>
          <Input
            type="date"
            id="nextReportingDate"
            value={newRequirement.nextReportingDate || ''}
            onChange={(e) =>
              setNewRequirement({
                ...newRequirement,
                nextReportingDate: e.target.value,
              })
            }
          />
        </div>

        <div>
          <Label htmlFor="daysToProvide">Days to Provide</Label>
          <Input
            type="number"
            id="daysToProvide"
            value={newRequirement.daysToProvide ?? ''}
            onChange={(e) =>
              setNewRequirement({
                ...newRequirement,
                daysToProvide: Number(e.target.value),
              })
            }
          />
        </div>

        <div>
          <Label htmlFor="reportingDueDate">Due Date</Label>
          <Input
            type="date"
            id="reportingDueDate"
            value={newRequirement.reportingDueDate || ''}
            onChange={(e) =>
              setNewRequirement({
                ...newRequirement,
                reportingDueDate: e.target.value,
              })
            }
          />
        </div>

        <div>
          <Label htmlFor="emailId">Email Id</Label>
          <Input
            id="emailId"
            type="email"
            value={newRequirement.emailId || ''}
            onChange={(e) =>
              setNewRequirement({
                ...newRequirement,
                emailId: e.target.value,
              })
            }
          />
        </div>

        <div>
          <Label htmlFor="maturityDate">Maturity Date</Label>
          <Input
            type="date"
            id="maturityDate"
            value={newRequirement.maturityDate || ''}
            onChange={(e) =>
              setNewRequirement({
                ...newRequirement,
                maturityDate: e.target.value,
              })
            }
          />
        </div>

        <div>
          <Label htmlFor="frequency">Frequency of the Requirement</Label>
          <Select
            value={newRequirement.frequency || ''}
            onValueChange={(value) =>
              setNewRequirement({ ...newRequirement, frequency: value })
            }
          >
            <SelectTrigger id="frequency">
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Annual">Annual</SelectItem>
              <SelectItem value="Semi-Annual">Semi-Annual</SelectItem>
              <SelectItem value="Quarterly">Quarterly</SelectItem>
              <SelectItem value="Monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="businessDay">Business Day</Label>
          <Select
            value={newRequirement.businessDay || ''}
            onValueChange={(value) =>
              setNewRequirement({ ...newRequirement, businessDay: value })
            }
          >
            <SelectTrigger id="businessDay">
              <SelectValue placeholder="Select option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Yes">Yes</SelectItem>
              <SelectItem value="No">No</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="displayName">Display Name</Label>
          <Input
            id="displayName"
            value={newRequirement.displayName || ''}
            onChange={(e) =>
              setNewRequirement({
                ...newRequirement,
                displayName: e.target.value,
              })
            }
          />
        </div>
      </div>

      <div className="flex justify-start gap-3">
        <Button variant="outline" onClick={generateSchedule}>
          Generate
        </Button>
      </div>

      {generatedSchedule.length > 0 && (
        <div>
          <h3 className="text-md font-semibold text-gray-800 mb-2">
            Reporting Schedule
          </h3>
          <div className="border rounded overflow-hidden">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left px-4 py-2">Reporting Date</th>
                  <th className="text-left px-4 py-2">Day to Provide</th>
                  <th className="text-left px-4 py-2">Due Date</th>
                </tr>
              </thead>
              <tbody>
                {generatedSchedule.map((entry, i) => (
                  <tr key={i} className="border-t">
                    <td className="px-4 py-2">{entry.reportingDate}</td>
                    <td className="px-4 py-2">{entry.daysToProvide}</td>
                    <td className="px-4 py-2">{entry.dueDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex justify-start gap-3">
        <Button onClick={onSave}>Save Button</Button>
      </div>

      {reportingRequirements.length > 0 && (
        <div>
          <h3 className="text-md font-semibold text-gray-800 mb-2">
            Existing Requirements
          </h3>
          <div className="border rounded overflow-hidden">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left px-4 py-2">S.No</th>
                  <th className="text-left px-4 py-2">Requirement</th>
                  <th className="text-left px-4 py-2">Next Date</th>
                  <th className="text-left px-4 py-2">Due</th>
                </tr>
              </thead>
              <tbody>
                {reportingRequirements.map((r, i) => (
                  <tr key={i} className="border-t">
                    <td className="px-4 py-2">{i + 1}</td>
                    <td className="px-4 py-2">{r.displayName || r.reportingRequirement}</td>
                    <td className="px-4 py-2">{r.nextReportingDate}</td>
                    <td className="px-4 py-2">{r.reportingDueDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportingRequirementsInput;