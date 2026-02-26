'use client';

import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { adminAPI } from '@/lib/api';
import { useState, useEffect } from 'react';
import { Grievance, DEPARTMENT_MAP, DepartmentId } from '@/types';
import { BarChart3, TrendingUp, Clock, CheckCircle, PieChart, Users, Activity } from 'lucide-react';

export default function SuperAdminAnalyticsPage() {
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

  // Calculate statistics
  const stats = {
    total: grievances.length,
    submitted: grievances.filter((g) => g.status === 'submitted').length,
    inProgress: grievances.filter((g) => g.status === 'in_progress').length,
    resolved: grievances.filter((g) => g.status === 'resolved').length,
    rejected: grievances.filter((g) => g.status === 'rejected').length,
  };

  const priorityStats = {
    high: grievances.filter((g) => g.priority === 'high').length,
    medium: grievances.filter((g) => g.priority === 'medium').length,
    low: grievances.filter((g) => g.priority === 'low').length,
  };

  // Department-wise statistics
  const departmentStats = (Object.keys(DEPARTMENT_MAP) as DepartmentId[]).map(deptId => {
    const deptGrievances = grievances.filter(g => g.predicted_department === deptId);
    return {
      id: deptId,
      name: DEPARTMENT_MAP[deptId],
      total: deptGrievances.length,
      resolved: deptGrievances.filter(g => g.status === 'resolved').length,
      pending: deptGrievances.filter(g => g.status === 'submitted' || g.status === 'in_progress').length,
    };
  }).sort((a, b) => b.total - a.total);

  const resolutionRate = stats.total > 0 
    ? ((stats.resolved / stats.total) * 100).toFixed(1)
    : '0.0';

  const pendingRate = stats.total > 0 
    ? (((stats.submitted + stats.inProgress) / stats.total) * 100).toFixed(1)
    : '0.0';

  return (
    <ProtectedRoute allowedRoles={['superadmin']}>
      <DashboardLayout role="superadmin">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-black">Global Analytics</h1>
            <p className="text-gray-600 mt-1">System-wide performance metrics and insights</p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Grievances</p>
                  <p className="text-3xl font-bold text-black mt-2">{stats.total}</p>
                </div>
                <BarChart3 size={32} className="text-gray-400" />
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Resolution Rate</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">{resolutionRate}%</p>
                </div>
                <TrendingUp size={32} className="text-green-400" />
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-3xl font-bold text-yellow-600 mt-2">
                    {stats.submitted + stats.inProgress}
                  </p>
                </div>
                <Clock size={32} className="text-yellow-400" />
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Resolved</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">{stats.resolved}</p>
                </div>
                <CheckCircle size={32} className="text-green-400" />
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Departments</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">
                    {Object.keys(DEPARTMENT_MAP).length}
                  </p>
                </div>
                <Activity size={32} className="text-blue-400" />
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Status Breakdown */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
                <PieChart size={20} />
                Status Distribution
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Submitted</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-500 h-2 rounded-full"
                        style={{ width: `${stats.total > 0 ? (stats.submitted / stats.total) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 w-16 text-right">
                      {stats.submitted} ({stats.total > 0 ? ((stats.submitted / stats.total) * 100).toFixed(1) : 0}%)
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">In Progress</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${stats.total > 0 ? (stats.inProgress / stats.total) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 w-16 text-right">
                      {stats.inProgress} ({stats.total > 0 ? ((stats.inProgress / stats.total) * 100).toFixed(1) : 0}%)
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Resolved</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${stats.total > 0 ? (stats.resolved / stats.total) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 w-16 text-right">
                      {stats.resolved} ({stats.total > 0 ? ((stats.resolved / stats.total) * 100).toFixed(1) : 0}%)
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Rejected</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full"
                        style={{ width: `${stats.total > 0 ? (stats.rejected / stats.total) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 w-16 text-right">
                      {stats.rejected} ({stats.total > 0 ? ((stats.rejected / stats.total) * 100).toFixed(1) : 0}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Priority Breakdown */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
                <BarChart3 size={20} />
                Priority Distribution
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">High Priority</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full"
                        style={{ width: `${stats.total > 0 ? (priorityStats.high / stats.total) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 w-16 text-right">
                      {priorityStats.high} ({stats.total > 0 ? ((priorityStats.high / stats.total) * 100).toFixed(1) : 0}%)
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Medium Priority</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-500 h-2 rounded-full"
                        style={{ width: `${stats.total > 0 ? (priorityStats.medium / stats.total) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 w-16 text-right">
                      {priorityStats.medium} ({stats.total > 0 ? ((priorityStats.medium / stats.total) * 100).toFixed(1) : 0}%)
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Low Priority</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gray-500 h-2 rounded-full"
                        style={{ width: `${stats.total > 0 ? (priorityStats.low / stats.total) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 w-16 text-right">
                      {priorityStats.low} ({stats.total > 0 ? ((priorityStats.low / stats.total) * 100).toFixed(1) : 0}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Department Performance Table */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-black">Department Performance Overview</h2>
            </div>
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading analytics data...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Grievances
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Resolved
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pending
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Resolution Rate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        % of Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {departmentStats.map((dept) => (
                      <tr key={dept.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {dept.name}
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {dept.total > 0 ? ((dept.resolved / dept.total) * 100).toFixed(1) : 0}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {stats.total > 0 ? ((dept.total / stats.total) * 100).toFixed(1) : 0}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* System Insights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Top Performing Department</h3>
              {departmentStats.filter(d => d.total > 0).length > 0 ? (
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {departmentStats
                      .filter(d => d.total > 0)
                      .sort((a, b) => (b.resolved / b.total) - (a.resolved / a.total))[0]?.name}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {departmentStats
                      .filter(d => d.total > 0)
                      .sort((a, b) => (b.resolved / b.total) - (a.resolved / a.total))[0]
                      ? ((departmentStats
                          .filter(d => d.total > 0)
                          .sort((a, b) => (b.resolved / b.total) - (a.resolved / a.total))[0].resolved /
                          departmentStats
                          .filter(d => d.total > 0)
                          .sort((a, b) => (b.resolved / b.total) - (a.resolved / a.total))[0].total) * 100).toFixed(1)
                      : 0}% resolution rate
                  </p>
                </div>
              ) : (
                <p className="text-gray-500">No data available</p>
              )}
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Most Active Department</h3>
              {departmentStats.length > 0 && departmentStats[0].total > 0 ? (
                <div>
                  <p className="text-2xl font-bold text-blue-600">{departmentStats[0].name}</p>
                  <p className="text-sm text-gray-500 mt-1">{departmentStats[0].total} total grievances</p>
                </div>
              ) : (
                <p className="text-gray-500">No data available</p>
              )}
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">High Priority Alerts</h3>
              <div>
                <p className="text-2xl font-bold text-red-600">{priorityStats.high}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Require immediate attention
                </p>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
