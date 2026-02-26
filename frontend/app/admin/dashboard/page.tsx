'use client';

import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { mockGrievances } from '@/mock-data';
import { useState } from 'react';
import { format } from '@/lib/date-fns';
import { MoreVertical, TrendingUp, CheckCircle, Clock, XCircle } from 'lucide-react';
import TransferModal from '@/components/admin/TransferModal';
import ResponseModal from '@/components/admin/ResponseModal';
import { Grievance, GrievanceStatus, Urgency } from '@/types';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [selectedGrievance, setSelectedGrievance] = useState<Grievance | null>(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const [grievances, setGrievances] = useState(
    mockGrievances.filter((g) => g.department === user?.department)
  );

  const departmentGrievances = grievances;

  const stats = {
    total: departmentGrievances.length,
    solved: departmentGrievances.filter((g) => g.status === 'Solved').length,
    unsolved: departmentGrievances.filter((g) => g.status === 'Unsolved').length,
    inProgress: departmentGrievances.filter((g) => g.status === 'In Progress').length,
  };

  const urgencyCount = {
    high: departmentGrievances.filter((g) => g.urgency === 'High').length,
    medium: departmentGrievances.filter((g) => g.urgency === 'Medium').length,
    low: departmentGrievances.filter((g) => g.urgency === 'Low').length,
  };

  const handleStatusChange = (id: string, status: GrievanceStatus) => {
    setGrievances((prev) =>
      prev.map((g) => (g.id === id ? { ...g, status, updatedAt: new Date().toISOString() } : g))
    );
    setActionMenuOpen(null);
  };

  const handleUrgencyChange = (id: string, urgency: Urgency) => {
    setGrievances((prev) =>
      prev.map((g) => (g.id === id ? { ...g, urgency, updatedAt: new Date().toISOString() } : g))
    );
    setActionMenuOpen(null);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Solved':
        return 'bg-green-50 text-green-800 border-green-200';
      case 'In Progress':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Unsolved':
        return 'bg-gray-50 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-800 border-gray-200';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'High':
        return 'bg-red-50 text-red-800 border-red-200';
      case 'Medium':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      case 'Low':
        return 'bg-gray-50 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-800 border-gray-200';
    }
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <DashboardLayout role="admin">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-black">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">
              {user?.department} Department
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Complaints</p>
                  <p className="text-3xl font-bold text-black mt-2">{stats.total}</p>
                </div>
                <TrendingUp size={32} className="text-gray-400" />
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Solved</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">{stats.solved}</p>
                </div>
                <CheckCircle size={32} className="text-green-400" />
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">In Progress</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{stats.inProgress}</p>
                </div>
                <Clock size={32} className="text-blue-400" />
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Unsolved</p>
                  <p className="text-3xl font-bold text-gray-600 mt-2">{stats.unsolved}</p>
                </div>
                <XCircle size={32} className="text-gray-400" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-black mb-6">Department Analytics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Status Distribution</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-700">Solved</span>
                      <span className="text-sm font-medium text-gray-900">{stats.solved}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${stats.total > 0 ? (stats.solved / stats.total) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-700">In Progress</span>
                      <span className="text-sm font-medium text-gray-900">{stats.inProgress}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${stats.total > 0 ? (stats.inProgress / stats.total) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-700">Unsolved</span>
                      <span className="text-sm font-medium text-gray-900">{stats.unsolved}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gray-600 h-2 rounded-full"
                        style={{ width: `${stats.total > 0 ? (stats.unsolved / stats.total) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Urgency Distribution</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-700">High</span>
                      <span className="text-sm font-medium text-gray-900">{urgencyCount.high}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-600 h-2 rounded-full"
                        style={{ width: `${stats.total > 0 ? (urgencyCount.high / stats.total) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-700">Medium</span>
                      <span className="text-sm font-medium text-gray-900">{urgencyCount.medium}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-600 h-2 rounded-full"
                        style={{ width: `${stats.total > 0 ? (urgencyCount.medium / stats.total) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-700">Low</span>
                      <span className="text-sm font-medium text-gray-900">{urgencyCount.low}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gray-600 h-2 rounded-full"
                        style={{ width: `${stats.total > 0 ? (urgencyCount.low / stats.total) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Average Resolution Time</span>
                <span className="font-semibold text-gray-900">3.2 days</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-black mb-6">Manage Grievances</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Title</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">User Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Urgency</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Created</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {departmentGrievances.map((grievance) => (
                    <tr key={grievance.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-900">{grievance.id}</td>
                      <td className="py-3 px-4 text-gray-900">{grievance.title}</td>
                      <td className="py-3 px-4 text-gray-700">{grievance.userName}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs border rounded ${getUrgencyColor(grievance.urgency)}`}>
                          {grievance.urgency}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs border rounded ${getStatusColor(grievance.status)}`}>
                          {grievance.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-700">{formatDate(grievance.createdAt)}</td>
                      <td className="py-3 px-4 relative">
                        <button
                          onClick={() => setActionMenuOpen(actionMenuOpen === grievance.id ? null : grievance.id)}
                          className="p-2 hover:bg-gray-100 rounded-md"
                        >
                          <MoreVertical size={18} />
                        </button>
                        
                        {actionMenuOpen === grievance.id && (
                          <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                            <div className="py-1">
                              <button
                                onClick={() => handleStatusChange(grievance.id, 'Solved')}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                Mark as Solved
                              </button>
                              <button
                                onClick={() => handleStatusChange(grievance.id, 'In Progress')}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                Mark as In Progress
                              </button>
                              <button
                                onClick={() => handleStatusChange(grievance.id, 'Unsolved')}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                Mark as Unsolved
                              </button>
                              <div className="border-t border-gray-200 my-1" />
                              <button
                                onClick={() => handleUrgencyChange(grievance.id, 'High')}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                Set High Urgency
                              </button>
                              <button
                                onClick={() => handleUrgencyChange(grievance.id, 'Medium')}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                Set Medium Urgency
                              </button>
                              <button
                                onClick={() => handleUrgencyChange(grievance.id, 'Low')}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                Set Low Urgency
                              </button>
                              <div className="border-t border-gray-200 my-1" />
                              <button
                                onClick={() => {
                                  setSelectedGrievance(grievance);
                                  setShowTransferModal(true);
                                  setActionMenuOpen(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                Transfer to Another Department
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedGrievance(grievance);
                                  setShowResponseModal(true);
                                  setActionMenuOpen(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                Add Response to User
                              </button>
                              <button
                                onClick={() => {
                                  alert('AI Summarization feature coming soon!');
                                  setActionMenuOpen(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                AI Summarize Complaint
                              </button>
                              <div className="border-t border-gray-200 my-1" />
                              <button
                                onClick={() => {
                                  window.open(`/admin/grievances/${grievance.id}`, '_blank');
                                  setActionMenuOpen(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                View Details
                              </button>
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {showTransferModal && selectedGrievance && (
          <TransferModal
            grievance={selectedGrievance}
            currentDepartment={user?.department || ''}
            onClose={() => {
              setShowTransferModal(false);
              setSelectedGrievance(null);
            }}
            onTransfer={(grievanceId, newDepartment) => {
              setGrievances((prev) => prev.filter((g) => g.id !== grievanceId));
              setShowTransferModal(false);
              setSelectedGrievance(null);
            }}
          />
        )}

        {showResponseModal && selectedGrievance && (
          <ResponseModal
            grievance={selectedGrievance}
            onClose={() => {
              setShowResponseModal(false);
              setSelectedGrievance(null);
            }}
            onSubmit={(message) => {
              setShowResponseModal(false);
              setSelectedGrievance(null);
            }}
          />
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
