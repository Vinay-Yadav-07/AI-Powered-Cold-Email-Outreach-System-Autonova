import React, { useState } from 'react';
import { X, Mail, MessageSquare, Calendar, AlertCircle } from 'lucide-react';
import { useLead } from '../../hooks/useApi';
import { formatDate, getStatusColor, getStatusLabel } from '../../lib/utils';
import { LoadingSpinner } from '../cards/CardComponents';

export const LeadDetailDrawer = ({ leadId, onClose }) => {
  const { lead, isLoading, error } = useLead(leadId);

  if (!leadId) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-screen w-96 glass border-l border-white/10 p-6 z-50 overflow-y-auto animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Lead Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-100 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : error ? (
          <div className="text-red-400 text-sm">{error.message}</div>
        ) : lead ? (
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-white mb-4">Basic Information</h3>
              <div>
                <p className="text-sm text-gray-400">Name</p>
                <p className="text-white font-medium">{lead.first_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Company</p>
                <p className="text-white font-medium">{lead.company}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Email</p>
                <p className="text-blue-400 font-medium break-all">{lead.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Industry</p>
                <p className="text-white font-medium">{lead.industry}</p>
              </div>
            </div>

            {/* Status Info */}
            <div className="border-t border-white/10 pt-6 space-y-4">
              <h3 className="font-semibold text-white mb-4">Status Information</h3>
              <div>
                <p className="text-sm text-gray-400">Current Status</p>
                <div className="mt-2">
                  <span className={`badge ${getStatusColor(lead.status)}`}>
                    {getStatusLabel(lead.status)}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-400">Sender Account</p>
                <p className="text-white font-medium">
                  {lead.sender_account?.replace('_', ' ').toUpperCase() || 'Not assigned'}
                </p>
              </div>
              {lead.validation_reason && (
                <div>
                  <p className="text-sm text-gray-400">Validation Reason</p>
                  <p className="text-yellow-400 text-sm">{lead.validation_reason}</p>
                </div>
              )}
            </div>

            {/* Email History */}
            <div className="border-t border-white/10 pt-6 space-y-4">
              <h3 className="font-semibold text-white mb-4">Email History</h3>
              <div>
                <p className="text-sm text-gray-400">Last Sent At</p>
                <p className="text-white font-medium">{formatDate(lead.last_sent_at)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Follow-ups Sent</p>
                <p className="text-white font-medium">{lead.followup_count}</p>
              </div>
              {lead.last_email_content && (
                <div>
                  <p className="text-sm text-gray-400 mb-2">Last Email Content</p>
                  <div className="bg-white/5 rounded p-3 text-sm text-gray-300 max-h-32 overflow-y-auto">
                    {lead.last_email_content}
                  </div>
                </div>
              )}
            </div>

            {/* Response Info */}
            <div className="border-t border-white/10 pt-6 space-y-4">
              <h3 className="font-semibold text-white mb-4">Response</h3>
              <div>
                <p className="text-sm text-gray-400">Last Response</p>
                {lead.last_response ? (
                  <span className="inline-block badge badge-warning mt-2">
                    {lead.last_response.toUpperCase()}
                  </span>
                ) : (
                  <p className="text-gray-500 text-sm">No response</p>
                )}
              </div>
            </div>

            {/* Notes */}
            {lead.notes && (
              <div className="border-t border-white/10 pt-6 space-y-4">
                <h3 className="font-semibold text-white mb-4">Notes</h3>
                <div className="bg-white/5 rounded p-3 text-sm text-gray-300">
                  {lead.notes}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </>
  );
};
