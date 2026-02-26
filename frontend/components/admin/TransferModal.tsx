'use client';

import { Grievance, Department } from '@/types';
import { departments } from '@/mock-data';
import { useState } from 'react';
import { X } from 'lucide-react';

interface TransferModalProps {
  grievance: Grievance;
  currentDepartment: string;
  onClose: () => void;
  onTransfer: (grievanceId: string, newDepartment: Department) => void;
}

export default function TransferModal({
  grievance,
  currentDepartment,
  onClose,
  onTransfer,
}: TransferModalProps) {
  const [selectedDepartment, setSelectedDepartment] = useState<Department | ''>('');

  const availableDepartments = departments.filter((dept) => dept !== currentDepartment);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDepartment) {
      onTransfer(grievance.id, selectedDepartment);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-black">Transfer Grievance</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600">Grievance ID: {grievance.id}</p>
          <p className="text-sm text-gray-900 font-medium mt-1">{grievance.title}</p>
          <p className="text-sm text-gray-600 mt-2">
            Current Department: <span className="font-medium">{currentDepartment}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
              Transfer to Department
            </label>
            <select
              id="department"
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value as Department)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
              required
            >
              <option value="">Select Department</option>
              {availableDepartments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
            >
              Transfer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
