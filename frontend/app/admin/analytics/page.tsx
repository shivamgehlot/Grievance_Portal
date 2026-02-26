'use client';

import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { adminAPI } from '@/lib/api';
import { useState, useEffect } from 'react';
import { Grievance } from '@/types';
import { BarChart3, TrendingUp, Clock, CheckCircle, PieChart, AlertCircle } from 'lucide-react';

export default function AdminAnalyticsPage() {
  const { user } = useAuth();
  const [grievances, setGrievances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGrievances();
  }, []);

  const loadGrievances = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminAPI.getGrievances(undefined, undefined, 0, 1000);
      console.log('Fetched grievances:', data);
      console.log('Number of grievances:', data?.length);
      console.log('User:', user);
      setGrievances(data);
    } catch (err: any) {
      console.error('Failed to load grievances:', err);
      setError(err.message || 'Failed to load grievances');
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

  const resolutionRate = stats.total > 0 
    ? ((stats.resolved / stats.total) * 100).toFixed(1)
    : 0;

  const avgResponseTime = "2.3 days"; // Placeholder

  return (
    <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
      <DashboardLayout role={user?.role || 'admin'}>
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading analytics...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
              <p className="text-red-800 font-medium">{error}</p>
              <button
                onClick={loadGrievances}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          </div>
        ) : grievances.length === 0 ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">No grievances found</p>
              <p className="text-gray-500 text-sm mt-2">
                {user?.role === 'admin' 
                  ? 'No grievances have been submitted to your departments yet.'
                  : 'No grievances have been submitted yet.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-black">Analytics Dashboard</h1>
              <p className="text-gray-600 mt-1">
                {user?.role === 'superadmin' ? 'All Departments' : 'Department Performance Metrics'}
              </p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          </div>

          {/* Status Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
                <PieChart size={20} />
                Status Breakdown
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
                    <span className="text-sm font-semibold text-gray-900 w-12 text-right">
                      {stats.submitted}
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
                    <span className="text-sm font-semibold text-gray-900 w-12 text-right">
                      {stats.inProgress}
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
                    <span className="text-sm font-semibold text-gray-900 w-12 text-right">
                      {stats.resolved}
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
                    <span className="text-sm font-semibold text-gray-900 w-12 text-right">
                      {stats.rejected}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Priority Breakdown */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
                <BarChart3 size={20} />
                Priority Breakdown
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
                    <span className="text-sm font-semibold text-gray-900 w-12 text-right">
                      {priorityStats.high}
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
                    <span className="text-sm font-semibold text-gray-900 w-12 text-right">
                      {priorityStats.medium}
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
                    <span className="text-sm font-semibold text-gray-900 w-12 text-right">
                      {priorityStats.low}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
