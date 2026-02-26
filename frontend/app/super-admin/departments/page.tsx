'use client';

import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { adminAPI } from '@/lib/api';
import { useState, useEffect } from 'react';
import { Grievance, DEPARTMENT_MAP, DepartmentId } from '@/types';
import { Building2, TrendingUp, Clock, CheckCircle, Users } from 'lucide-react';

export default function SuperAdminDepartmentsPage() {
  const { user } = useAuth();
  const [grievances, setGrievances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGrievances();
  }, []);

  const loadGrievances = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getGrievances(undefined, undefined, 0, 1000);
      setGrievances(data);
    } catch (err) {
      console.error('Failed to load grievances:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate department statistics
  const departmentStats = (Object.keys(DEPARTMENT_MAP) as DepartmentId[]).map(deptId => {
    const deptGrievances = grievances.filter(g => g.predicted_department === deptId);
    const resolved = deptGrievances.filter(g => g.status === 'resolved').length;
    const pending = deptGrievances.filter(g => g.status === 'submitted' || g.status === 'in_progress').length;
    const rejected = deptGrievances.filter(g => g.status === 'rejected').length;
    
    return {
      id: deptId,
      name: DEPARTMENT_MAP[deptId],
      total: deptGrievances.length,
      resolved,
      pending,
      rejected,
      resolutionRate: deptGrievances.length > 0 ? ((resolved / deptGrievances.length) * 100).toFixed(1) : '0.0',
      highPriority: deptGrievances.filter(g => g.priority === 'high').length,
    };
  }).sort((a, b) => b.total - a.total);

  const totalGrievances = grievances.length;
  const totalResolved = grievances.filter(g => g.status === 'resolved').length;
  const totalPending = grievances.filter(g => g.status === 'submitted' || g.status === 'in_progress').length;
  const overallResolutionRate = totalGrievances > 0 
    ? ((totalResolved / totalGrievances) * 100).toFixed(1)
    : '0.0';

  return (
    <ProtectedRoute allowedRoles={['superadmin']}>
      <DashboardLayout role="superadmin">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-black">Department Overview</h1>
            <p className="text-gray-600 mt-1">Performance metrics across all departments</p>
          </div>

          {/* Overall Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Departments</p>
                  <p className="text-3xl font-bold text-black mt-2">
                    {Object.keys(DEPARTMENT_MAP).length}
                  </p>
                </div>
                <Building2 size={32} className="text-gray-400" />
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Grievances</p>
                  <p className="text-3xl font-bold text-black mt-2">{totalGrievances}</p>
                </div>
                <Users size={32} className="text-gray-400" />
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Resolution Rate</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">{overallResolutionRate}%</p>
                </div>
                <TrendingUp size={32} className="text-green-400" />
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-3xl font-bold text-yellow-600 mt-2">{totalPending}</p>
                </div>
                <Clock size={32} className="text-yellow-400" />
              </div>
            </div>
          </div>

          {/* Department Performance Table */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-black">Department Performance</h2>
            </div>
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading department data...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Resolved
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pending
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rejected
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        High Priority
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Resolution Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {departmentStats.map((dept) => (
                      <tr key={dept.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Building2 size={16} className="text-gray-400 mr-2" />
                            <span className="text-sm font-medium text-gray-900">{dept.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {dept.total}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                          {dept.resolved}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600 font-medium">
                          {dept.pending}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                          {dept.rejected}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {dept.highPriority > 0 && (
                            <span className="px-2 py-1 bg-red-50 text-red-800 border border-red-200 rounded-full text-xs font-medium">
                              {dept.highPriority}
                            </span>
                          )}
                          {dept.highPriority === 0 && (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  parseFloat(dept.resolutionRate) >= 70
                                    ? 'bg-green-500'
                                    : parseFloat(dept.resolutionRate) >= 40
                                    ? 'bg-yellow-500'
                                    : 'bg-red-500'
                                }`}
                                style={{ width: `${dept.resolutionRate}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900 w-12">
                              {dept.resolutionRate}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Department Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-black mb-4">Top Performing Departments</h2>
              <div className="space-y-3">
                {departmentStats
                  .filter(d => d.total > 0)
                  .sort((a, b) => parseFloat(b.resolutionRate) - parseFloat(a.resolutionRate))
                  .slice(0, 5)
                  .map((dept) => (
                    <div key={dept.id} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{dept.name}</span>
                      <span className="text-sm font-semibold text-green-600">
                        {dept.resolutionRate}%
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-black mb-4">Most Active Departments</h2>
              <div className="space-y-3">
                {departmentStats
                  .slice(0, 5)
                  .map((dept) => (
                    <div key={dept.id} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{dept.name}</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {dept.total} grievances
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
