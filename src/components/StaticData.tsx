/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from './ui/dialog';
import { FileText, Plus } from 'lucide-react';

type Props = {
  reportingRequirements: any[];
  generateReportingSchedule: () => void;
  showAddReportDialog: boolean;
  setShowAddReportDialog: (v: boolean) => void;
  newRequirement: any;
  setNewRequirement: (v: any) => void;
  handleAddRequirement: () => Promise<void>;
  selectedFacility: any;
};

export default function StaticData({ reportingRequirements, generateReportingSchedule, showAddReportDialog, setShowAddReportDialog, newRequirement, setNewRequirement, handleAddRequirement, selectedFacility }: Props) {
  return (
    <div className="p-6 space-y-6 bg-white rounded-lg border">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold">Reporting Requirements</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={generateReportingSchedule} className="print:hidden">Auto-Generate</Button>
          <Button onClick={() => setShowAddReportDialog(true)} className="flex items-center gap-2 print:hidden">
            <Plus className="w-4 h-4" /> Add Reporting Requirement
          </Button>
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

      <Dialog open={showAddReportDialog} onOpenChange={setShowAddReportDialog}>
        <DialogContent className="max-w-2xl">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Add Reporting Requirement</h2>
              <p className="text-sm text-gray-600">Add a new reporting requirement for this facility</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Obligor</label>
                <input type="text" value={newRequirement.obligor || (selectedFacility as any)?.issuerName || ''} onChange={(e)=> setNewRequirement({ ...newRequirement, obligor: e.target.value })} className="w-full px-3 py-2 border rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select value={newRequirement.role} onChange={(e)=> setNewRequirement({ ...newRequirement, role: e.target.value })} className="w-full px-3 py-2 border rounded-md">
                  {['Borrower','Guarantor','Sponsor','Other'].map(o=> <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Reporting Requirement</label>
                <input type="text" value={newRequirement.reportingRequirement} onChange={(e)=> setNewRequirement({ ...newRequirement, reportingRequirement: e.target.value })} className="w-full px-3 py-2 border rounded-md" placeholder="e.g., Annual statements" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Previous Reporting Date</label>
                <input type="date" value={newRequirement.previousReportingDate} onChange={(e)=> setNewRequirement({ ...newRequirement, previousReportingDate: e.target.value })} className="w-full px-3 py-2 border rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Next Reporting Date</label>
                <input type="date" value={newRequirement.nextReportingDate} onChange={(e)=> setNewRequirement({ ...newRequirement, nextReportingDate: e.target.value })} className="w-full px-3 py-2 border rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Days to Provide</label>
                <input type="number" value={newRequirement.daysToProvide} onChange={(e)=> setNewRequirement({ ...newRequirement, daysToProvide: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 border rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reporting Due Date</label>
                <input type="date" value={newRequirement.reportingDueDate} onChange={(e)=> setNewRequirement({ ...newRequirement, reportingDueDate: e.target.value })} className="w-full px-3 py-2 border rounded-md" />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={()=> setShowAddReportDialog(false)}>Cancel</Button>
              <Button onClick={handleAddRequirement} disabled={!newRequirement.reportingRequirement}>Add Requirement</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
