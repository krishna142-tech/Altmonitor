import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Facility } from "@/context/DataContext";

type ScheduleEntry = {
  reportingDate: string; // ISO yyyy-mm-dd
  daysToProvide: number;
  dueDate: string; // ISO yyyy-mm-dd
};

type ModalForm = {
  type: string;
  obligor?: string;
  role?: string;
  reportingRequirement?: string;
  nextReportingDate?: string;
  daysToProvide?: number;
  reportingDueDate?: string;
  emailId?: string;
  maturityDate?: string;
  frequency?: "Monthly" | "Quarterly" | "Semi-Annual" | "Annual";
  businessDay?: "Yes" | "No";
  displayName?: string;
};

type ReportingRequirementRecord = ModalForm & {
  schedule?: ScheduleEntry[];
  received_at?: string;
  // backend allows arbitrary fields; we don't include any here
};

type Props = {
  selectedFacility?: Facility | null;
  // parent can still pass initial list; component will re-fetch on mount
  reportingRequirements?: ReportingRequirementRecord[];
  // optional callback after save
  onSaved?: () => void;
};

const defaultForm: ModalForm = {
  type: "Compliance Certificate",
  obligor: "",
  role: "Borrower",
  reportingRequirement: "",
  nextReportingDate: "",
  daysToProvide: 0,
  reportingDueDate: "",
  emailId: "",
  maturityDate: "",
  frequency: "Monthly",
  businessDay: "No",
  displayName: "",
};

function addBusinessDays(date: Date, days: number): Date {
  const res = new Date(date);
  let added = 0;
  while (added < days) {
    res.setDate(res.getDate() + 1);
    const d = res.getDay();
    if (d !== 0 && d !== 6) added++;
  }
  return res;
}

function isoDate(d: Date) {
  return d.toISOString().split("T")[0];
}

const ReportingRequirementsInput: React.FC<Props> = ({
  selectedFacility,
  reportingRequirements: reportingRequirementsProp,
  onSaved,
}) => {
  // fetched list from backend
  const [requirements, setRequirements] = useState<ReportingRequirementRecord[]>(
    reportingRequirementsProp || []
  );
  useEffect(() => {
    if (reportingRequirementsProp) setRequirements(reportingRequirementsProp);
  }, [reportingRequirementsProp]);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<ModalForm>({ ...defaultForm });
  const [generatedSchedule, setGeneratedSchedule] = useState<ScheduleEntry[]>([]);
  const [loadingFetch, setLoadingFetch] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchRequirements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showMessage = (type: "success" | "error", text: string, ms = 3500) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), ms);
  };

  const fetchRequirements = async () => {
    setLoadingFetch(true);
    try {
      const res = await fetch("/api/reporting");
      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data)) setRequirements(data);
      else setRequirements([]);
    } catch (err) {
      console.error("Failed to fetch reporting requirements", err);
      showMessage("error", "Failed to load reporting requirements");
    } finally {
      setLoadingFetch(false);
    }
  };

  const resetModal = () => {
    setForm({ ...defaultForm });
    setGeneratedSchedule([]);
  };

  const openModal = () => {
    resetModal();
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const generateSchedule = () => {
    if (!form.nextReportingDate || !form.maturityDate || !form.frequency) {
      showMessage("error", "Please enter Next Reporting Date, Maturity Date and Frequency");
      return;
    }

    const schedule: ScheduleEntry[] = [];
    let current = new Date(form.nextReportingDate);
    const maturity = new Date(form.maturityDate);
    const daysToProvide = form.daysToProvide || 0;
    const freq = (form.frequency || "Monthly").toLowerCase();

    // guard for safety
    let guard = 0;
    while (current <= maturity && guard < 1000) {
      guard++;
      let due: Date;
      if (form.businessDay === "Yes") {
        due = addBusinessDays(current, daysToProvide);
      } else {
        due = new Date(current);
        due.setDate(due.getDate() + daysToProvide);
      }

      schedule.push({
        reportingDate: isoDate(current),
        daysToProvide,
        dueDate: isoDate(due),
      });

      // increment current based on frequency (create a new Date to avoid mutation problems)
      if (freq.startsWith("annual")) {
        current = new Date(current.getFullYear() + 1, current.getMonth(), current.getDate());
      } else if (freq.startsWith("semi")) {
        current = new Date(current.getFullYear(), current.getMonth() + 6, current.getDate());
      } else if (freq.startsWith("quarter")) {
        current = new Date(current.getFullYear(), current.getMonth() + 3, current.getDate());
      } else {
        // monthly
        current = new Date(current.getFullYear(), current.getMonth() + 1, current.getDate());
      }
    }

    setGeneratedSchedule(schedule);
  };

  const updateScheduleRow = (index: number, key: keyof ScheduleEntry, value: string | number) => {
    setGeneratedSchedule((prev) => prev.map((r, i) => (i === index ? { ...r, [key]: value as any } : r)));
  };

  const handleSave = async () => {
    if (generatedSchedule.length === 0) {
      showMessage("error", "Generate schedule before saving");
      return;
    }
    setLoadingSave(true);
    try {
      const payload: ReportingRequirementRecord = {
        ...form,
        schedule: generatedSchedule,
      };
      // backend appends received_at and stores anything
      const res = await fetch("/api/reporting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Save failed: ${res.status} ${txt}`);
      }
      // success - refresh list
      showMessage("success", "Saved successfully");
      await fetchRequirements();
      setLoadingSave(false);
      closeModal();
      if (onSaved) onSaved();
    } catch (err) {
      console.error("Save failed", err);
      showMessage("error", "Failed to save requirement");
      setLoadingSave(false);
    }
  };

  return (
    <div className="p-6 bg-white border rounded-lg space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Reporting Requirements</h2>
          <p className="text-sm text-gray-600">Manage reporting obligations for this facility.</p>
        </div>

        <div>
          <Dialog open={modalOpen} onOpenChange={(v) => setModalOpen(v)}>
            <DialogTrigger asChild>
              <Button onClick={openModal}>+ Add Requirement</Button>
            </DialogTrigger>

            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Add Reporting Requirement</DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Requirement Type</Label>
                  <Select value={form.type} onValueChange={(v) => setForm((s) => ({ ...s, type: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Compliance Certificate">Compliance Certificate</SelectItem>
                      <SelectItem value="Annual Certificate">Annual Certificate</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Obligor</Label>
                  <Input value={form.obligor} onChange={(e) => setForm((s) => ({ ...s, obligor: e.target.value }))} />
                </div>

                <div>
                  <Label>Role</Label>
                  <Select value={form.role} onValueChange={(v) => setForm((s) => ({ ...s, role: v }))}>
                    <SelectTrigger>
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
                  <Label>Display Name</Label>
                  <Input value={form.displayName} onChange={(e) => setForm((s) => ({ ...s, displayName: e.target.value }))} />
                </div>

                <div>
                  <Label>Next Reporting Date</Label>
                  <Input type="date" value={form.nextReportingDate} onChange={(e) => setForm((s) => ({ ...s, nextReportingDate: e.target.value }))} />
                </div>

                <div>
                  <Label>Maturity Date</Label>
                  <Input type="date" value={form.maturityDate} onChange={(e) => setForm((s) => ({ ...s, maturityDate: e.target.value }))} />
                </div>

                <div>
                  <Label>Days to Provide</Label>
                  <Input type="number" value={form.daysToProvide ?? 0} onChange={(e) => setForm((s) => ({ ...s, daysToProvide: Number(e.target.value) }))} />
                </div>

                <div>
                  <Label>Frequency</Label>
                  <Select value={form.frequency} onValueChange={(v) => setForm((s) => ({ ...s, frequency: v as ModalForm["frequency"] }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Monthly">Monthly</SelectItem>
                      <SelectItem value="Quarterly">Quarterly</SelectItem>
                      <SelectItem value="Semi-Annual">Semi-Annual</SelectItem>
                      <SelectItem value="Annual">Annual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Business Day Adjustment</Label>
                  <Select value={form.businessDay} onValueChange={(v) => setForm((s) => ({ ...s, businessDay: v as ModalForm["businessDay"] }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Email Id</Label>
                  <Input type="email" value={form.emailId} onChange={(e) => setForm((s) => ({ ...s, emailId: e.target.value }))} />
                </div>

                <div>
                  <Label>Reporting Requirement (description)</Label>
                  <Input value={form.reportingRequirement} onChange={(e) => setForm((s) => ({ ...s, reportingRequirement: e.target.value }))} />
                </div>
              </div>

              <div className="mt-4 flex gap-3">
                <Button variant="outline" onClick={generateSchedule}>
                  Generate
                </Button>
                <div className="text-sm text-gray-500 self-center">
                  {generatedSchedule.length > 0 ? `${generatedSchedule.length} entries` : ""}
                </div>
              </div>

              {generatedSchedule.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-md font-semibold">Generated Schedule</h3>
                  <div className="border rounded overflow-hidden">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="text-left px-4 py-2">#</th>
                          <th className="text-left px-4 py-2">Reporting Date</th>
                          <th className="text-left px-4 py-2">Days to Provide</th>
                          <th className="text-left px-4 py-2">Due Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {generatedSchedule.map((row, idx) => (
                          <tr key={idx} className="border-t">
                            <td className="px-4 py-2">{idx + 1}</td>
                            <td className="px-4 py-2">
                              <Input
                                type="date"
                                value={row.reportingDate}
                                onChange={(e) => updateScheduleRow(idx, "reportingDate", e.target.value)}
                              />
                            </td>
                            <td className="px-4 py-2">
                              <Input
                                type="number"
                                value={row.daysToProvide}
                                onChange={(e) => updateScheduleRow(idx, "daysToProvide", Number(e.target.value))}
                              />
                            </td>
                            <td className="px-4 py-2">
                              <Input
                                type="date"
                                value={row.dueDate}
                                onChange={(e) => updateScheduleRow(idx, "dueDate", e.target.value)}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-3 flex items-center gap-3">
                    <Button onClick={handleSave} disabled={loadingSave}>
                      {loadingSave ? "Saving..." : "Save"}
                    </Button>
                    <Button variant="ghost" onClick={() => { /* Keep editing */ }}>
                      Keep Editing
                    </Button>
                    <div className="text-sm text-gray-500">{loadingFetch ? "Refreshing..." : ""}</div>
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button variant="destructive" onClick={() => { resetModal(); closeModal(); }}>
                  Cancel
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {message && (
        <div className={`p-2 rounded ${message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
          {message.text}
        </div>
      )}

      <div>
        <h3 className="text-md font-semibold text-gray-800 mb-2">Existing Requirements</h3>
        <div className="border rounded overflow-hidden">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left px-4 py-2">S.No</th>
                <th className="text-left px-4 py-2">Type / Name</th>
                <th className="text-left px-4 py-2">Next Date</th>
                <th className="text-left px-4 py-2">Due</th>
              </tr>
            </thead>
            <tbody>
              {requirements.length === 0 && !loadingFetch && (
                <tr>
                  <td className="px-4 py-2" colSpan={4}>
                    No reporting requirements found.
                  </td>
                </tr>
              )}
              {requirements.map((r, i) => (
                <tr key={i} className="border-t">
                  <td className="px-4 py-2">{i + 1}</td>
                  <td className="px-4 py-2">{r.displayName || r.reportingRequirement || r.type}</td>
                  <td className="px-4 py-2">{r.nextReportingDate || (r.schedule && r.schedule[0]?.reportingDate) || ""}</td>
                  <td className="px-4 py-2">{r.reportingDueDate || (r.schedule && r.schedule[0]?.dueDate) || ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportingRequirementsInput;
