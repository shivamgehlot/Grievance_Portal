'use client';

import { Grievance } from '@/types';
import { useState } from 'react';
import { X } from 'lucide-react';

interface ResponseModalProps {
  grievance: Grievance;
  onClose: () => void;
  onSubmit: (message: string) => void;
}

export default function ResponseModal({ grievance, onClose, onSubmit }: ResponseModalProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSubmit(message);
      alert('Response sent to user successfully!');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-black">Add Response</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600">Grievance ID: {grievance.id}</p>
          <p className="text-sm text-gray-900 font-medium mt-1">{grievance.title}</p>
          <p className="text-sm text-gray-600 mt-2">User: {grievance.userName}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
              Your Response
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
              placeholder="Type your response to the user..."
              required
            />
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
              Send Response
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
