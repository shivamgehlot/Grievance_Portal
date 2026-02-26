'use client';

import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { grievanceAPI } from '@/lib/api';
import { Grievance, DEPARTMENT_MAP, STATUS_DISPLAY, PRIORITY_DISPLAY } from '@/types';
import Link from 'next/link';

export default function UserDashboard() {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGrievances();
  }, []);

  const loadGrievances = async () => {
    try {
      const data = await grievanceAPI.getMyGrievances(0, 50);
      setGrievances(data);
    } catch (err: any) {
      console.error('Failed to load grievances:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await grievanceAPI.create({ message });
      setSubmitted(true);
      setMessage('');
      
      // Reload grievances
      await loadGrievances();
      
      setTimeout(() => {
        setSubmitted(false);
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit grievance');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
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

  return (
    <ProtectedRoute allowedRoles={['citizen']}>
      <DashboardLayout role="citizen">
        <div className="space-y-8">
          <div>
            <h1 className="text-2xl font-bold text-black">Dashboard</h1>
            <p className="text-gray-600 mt-1">Submit and track your grievances</p>
          </div>

          {submitted && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-md text-green-800">
              ✓ Grievance submitted successfully! It has been automatically classified and assigned.
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-800">
              {error}
            </div>
          )}

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-black mb-4">Submit New Grievance</h2>
            <p className="text-sm text-gray-600 mb-6">
              Describe your grievance in detail. Our AI will automatically classify it and route it to the appropriate department.
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Grievance Description *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                  placeholder="Example: Water main burst on Main Street, multiple houses flooded..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-gray-900"
                  required
                  minLength={10}
                  maxLength={2000}
                />
                <p className="mt-1 text-xs text-gray-500">
                  {message.length}/2000 characters (minimum 10)
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:bg-gray-400 transition-colors"
              >
                {submitting ? 'Submitting...' : 'Submit Grievance'}
              </button>
            </form>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-black mb-6">My Grievances</h2>
            
            {loading ? (
              <p className="text-gray-600">Loading...</p>
            ) : grievances.length === 0 ? (
              <p className="text-gray-600">No grievances submitted yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Message</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Department</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Priority</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Confidence</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Created</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grievances.map((grievance) => (
                      <tr key={grievance.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-900 max-w-xs truncate">
                          {grievance.message}
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {DEPARTMENT_MAP[grievance.predicted_department]}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 text-xs border rounded ${getPriorityColor(grievance.priority)}`}>
                            {PRIORITY_DISPLAY[grievance.priority]}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 text-xs border rounded ${getStatusColor(grievance.status)}`}>
                            {STATUS_DISPLAY[grievance.status]}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {(grievance.confidence * 100).toFixed(0)}%
                        </td>
                        <td className="py-3 px-4 text-gray-700">{formatDate(grievance.created_at)}</td>
                        <td className="py-3 px-4">
                          <Link
                            href={`/user/grievances/${grievance.id}`}
                            className="text-black hover:underline font-medium"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
