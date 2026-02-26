'use client';

import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { mockGrievances } from '@/mock-data';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Clock, AlertCircle, MessageSquare } from 'lucide-react';
import { useState } from 'react';

export default function GrievanceDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const grievance = mockGrievances.find((g) => g.id === id);
  const [reply, setReply] = useState('');
  const [replies, setReplies] = useState(grievance?.responses || []);

  if (!grievance) {
    return (
      <ProtectedRoute allowedRoles={['user']}>
        <DashboardLayout role="user">
          <div className="text-center py-12">
            <p className="text-gray-600">Grievance not found</p>
            <Link href="/user/dashboard" className="text-black hover:underline mt-4 inline-block">
              Back to Dashboard
            </Link>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reply.trim()) {
      const newReply = {
        id: `resp-${Date.now()}`,
        grievanceId: grievance.id,
        userId: 'user-1',
        userName: 'John Doe',
        userRole: 'user' as const,
        message: reply,
        createdAt: new Date().toISOString(),
      };
      setReplies([...replies, newReply]);
      setReply('');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Submitted':
        return <CheckCircle size={20} className="text-gray-600" />;
      case 'Assigned':
        return <CheckCircle size={20} className="text-gray-600" />;
      case 'In Progress':
        return <Clock size={20} className="text-blue-600" />;
      case 'Resolved':
        return <CheckCircle size={20} className="text-green-600" />;
      default:
        return <AlertCircle size={20} className="text-gray-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <ProtectedRoute allowedRoles={['user']}>
      <DashboardLayout role="user">
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Link
              href="/user/dashboard"
              className="flex items-center space-x-2 text-gray-700 hover:text-black"
            >
              <ArrowLeft size={20} />
              <span>Back</span>
            </Link>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-black">{grievance.title}</h1>
                <p className="text-gray-600 mt-1">ID: {grievance.id}</p>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <span
                  className={`px-3 py-1 text-sm border rounded ${
                    grievance.status === 'Solved'
                      ? 'bg-green-50 text-green-800 border-green-200'
                      : grievance.status === 'In Progress'
                      ? 'bg-blue-50 text-blue-800 border-blue-200'
                      : 'bg-gray-50 text-gray-800 border-gray-200'
                  }`}
                >
                  {grievance.status}
                </span>
                <span
                  className={`px-3 py-1 text-sm border rounded ${
                    grievance.urgency === 'High'
                      ? 'bg-red-50 text-red-800 border-red-200'
                      : grievance.urgency === 'Medium'
                      ? 'bg-yellow-50 text-yellow-800 border-yellow-200'
                      : 'bg-gray-50 text-gray-800 border-gray-200'
                  }`}
                >
                  {grievance.urgency} Priority
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 border-t border-b border-gray-200">
              <div>
                <p className="text-sm text-gray-600">Department</p>
                <p className="font-medium text-gray-900">{grievance.department}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Submitted On</p>
                <p className="font-medium text-gray-900">{formatDate(grievance.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Contact</p>
                <p className="font-medium text-gray-900">{grievance.userPhone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Address</p>
                <p className="font-medium text-gray-900">{grievance.userAddress}</p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700 leading-relaxed">{grievance.description}</p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-black mb-6">Timeline</h2>
            
            <div className="space-y-4">
              {grievance.timeline.map((entry, index) => (
                <div key={entry.id} className="flex items-start space-x-4">
                  <div className="flex flex-col items-center">
                    <div className="flex-shrink-0">{getStatusIcon(entry.status)}</div>
                    {index < grievance.timeline.length - 1 && (
                      <div className="w-px h-full bg-gray-300 mt-2 mb-2" style={{ minHeight: '30px' }} />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-gray-900">{entry.status}</h4>
                      <span className="text-sm text-gray-500">{formatDate(entry.timestamp)}</span>
                    </div>
                    <p className="text-gray-600 text-sm mt-1">{entry.description}</p>
                    {entry.userName && (
                      <p className="text-gray-500 text-xs mt-1">by {entry.userName}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-black mb-6">Communication</h2>
            
            <div className="space-y-4 mb-6">
              {replies.length === 0 && (
                <p className="text-gray-600 text-sm">No responses yet</p>
              )}
              
              {replies.map((response) => (
                <div
                  key={response.id}
                  className={`p-4 rounded-lg border ${
                    response.userRole === 'user'
                      ? 'bg-gray-50 border-gray-200'
                      : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900">{response.userName}</span>
                    <span className="text-xs text-gray-500">{formatDate(response.createdAt)}</span>
                  </div>
                  <p className="text-gray-700">{response.message}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleReplySubmit} className="space-y-4">
              <div>
                <label htmlFor="reply" className="block text-sm font-medium text-gray-700 mb-1">
                  Add a Reply
                </label>
                <textarea
                  id="reply"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                  placeholder="Type your message here..."
                />
              </div>
              <button
                type="submit"
                className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors flex items-center space-x-2"
              >
                <MessageSquare size={18} />
                <span>Send Reply</span>
              </button>
            </form>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
