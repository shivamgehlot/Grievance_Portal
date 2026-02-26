'use client';

import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { grievanceAPI, adminAPI, GrievanceResponse } from '@/lib/api';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DEPARTMENT_MAP, STATUS_DISPLAY, PRIORITY_DISPLAY, DepartmentId, Priority, GrievanceStatus } from '@/types';
import { ArrowLeft, Calendar, Building2, Flag, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';

export default function GrievanceDetailPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const grievanceId = params.id as string;
  
  const [grievance, setGrievance] = useState<GrievanceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadGrievance();
  }, [grievanceId]);

  const loadGrievance = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await grievanceAPI.getById(grievanceId);
      setGrievance(data);
    } catch (err: any) {
      console.error('Failed to load grievance:', err);
      setError(err.message || 'Failed to load grievance');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: 'in_progress' | 'resolved' | 'rejected') => {
    if (!confirm(`Are you sure you want to change status to ${STATUS_DISPLAY[newStatus]}?`)) {
      return;
    }

    try {
      setUpdating(true);
      await adminAPI.updateStatus(grievanceId, { status: newStatus });
      await loadGrievance();
    } catch (err: any) {
      alert('Failed to update status: ' + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-50 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'submitted':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      case 'rejected':
        return 'bg-red-50 text-red-800 border-red-200';
      default:
        return 'bg-gray-50 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-50 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-gray-50 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'submitted':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
      <DashboardLayout role={user?.role || 'admin'}>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-black">Grievance Details</h1>
                {grievance && (
                  <p className="text-gray-600 mt-1">ID: #{grievance.id.slice(-8)}</p>
                )}
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading grievance details...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
              <p className="text-red-800 font-medium">{error}</p>
              <button
                onClick={() => router.back()}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Go Back
              </button>
            </div>
          )}

          {/* Grievance Details */}
          {grievance && !loading && (
            <>
              {/* Status and Priority Card */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="text-sm text-gray-600 mb-2 block">Status</label>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(grievance.status)}
                      <span className={`px-3 py-1 text-sm border rounded-full ${getStatusColor(grievance.status)}`}>
                        {STATUS_DISPLAY[grievance.status as GrievanceStatus]}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-600 mb-2 block">Priority</label>
                    <div className="flex items-center space-x-2">
                      <Flag className={`w-5 h-5 ${
                        grievance.priority === 'high' ? 'text-red-600' :
                        grievance.priority === 'medium' ? 'text-yellow-600' :
                        'text-gray-600'
                      }`} />
                      <span className={`px-3 py-1 text-sm border rounded-full ${getPriorityColor(grievance.priority)}`}>
                        {PRIORITY_DISPLAY[grievance.priority as Priority]}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-600 mb-2 block">Department</label>
                    <div className="flex items-center space-x-2">
                      <Building2 className="w-5 h-5 text-gray-600" />
                      <span className="text-gray-900 font-medium">
                        {DEPARTMENT_MAP[grievance.predicted_department as DepartmentId]}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grievance Message */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Grievance Message</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {grievance.message}
                </p>
              </div>

              {/* Timestamps */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3">
                    <Calendar className="w-5 h-5 text-gray-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Created</p>
                      <p className="text-gray-900 font-medium">{formatDate(grievance.created_at)}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Calendar className="w-5 h-5 text-gray-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Last Updated</p>
                      <p className="text-gray-900 font-medium">{formatDate(grievance.updated_at)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
                <div className="flex flex-wrap gap-3">
                  {grievance.status === 'submitted' && (
                    <button
                      onClick={() => handleStatusChange('in_progress')}
                      disabled={updating}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 flex items-center space-x-2"
                    >
                      <Clock className="w-4 h-4" />
                      <span>Start Working</span>
                    </button>
                  )}

                  {grievance.status === 'in_progress' && (
                    <>
                      <button
                        onClick={() => handleStatusChange('resolved')}
                        disabled={updating}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 flex items-center space-x-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Mark as Resolved</span>
                      </button>
                      <button
                        onClick={() => handleStatusChange('rejected')}
                        disabled={updating}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 flex items-center space-x-2"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </>
                  )}

                  {(grievance.status === 'resolved' || grievance.status === 'rejected') && (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <AlertCircle className="w-5 h-5" />
                      <span>This grievance has been closed</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
