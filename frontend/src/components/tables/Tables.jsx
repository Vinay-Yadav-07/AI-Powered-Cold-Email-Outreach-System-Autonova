import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { getStatusColor, getStatusLabel, formatDate } from '../../lib/utils';

export const LeadsTable = ({ leads, pagination, isLoading, onRowClick, onSort, sortBy, sortOrder }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="loader w-8 h-8" />
      </div>
    );
  }

  if (!leads || leads.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No leads found</p>
      </div>
    );
  }

  const SortHeader = ({ label, field, children }) => (
    <button
      onClick={() => onSort?.(field)}
      className="flex items-center gap-2 hover:text-gray-100 transition-colors"
    >
      {children || label}
      {sortBy === field && (
        sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
      )}
    </button>
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10">
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400">
              <SortHeader label="ID" field="id" />
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400">
              <SortHeader label="Name" field="first_name" />
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400">
              <SortHeader label="Company" field="company" />
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400">
              <SortHeader label="Industry" field="industry" />
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400">
              <SortHeader label="Status" field="status" />
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400">
              Sender
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400">
              <SortHeader label="Last Sent" field="last_sent_at" />
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {leads.map((lead) => (
            <tr
              key={lead.id}
              onClick={() => onRowClick?.(lead.id)}
              className="hover:bg-white/5 transition-colors cursor-pointer"
            >
              <td className="px-6 py-4 text-sm text-gray-300 font-mono">{lead.id}</td>
              <td className="px-6 py-4 text-sm text-gray-100">{lead.first_name}</td>
              <td className="px-6 py-4 text-sm text-gray-400">{lead.company}</td>
              <td className="px-6 py-4 text-sm text-gray-400">{lead.industry}</td>
              <td className="px-6 py-4 text-sm text-blue-400 truncate">{lead.email}</td>
              <td className="px-6 py-4">
                <span className={`badge ${getStatusColor(lead.status)}`}>
                  {getStatusLabel(lead.status)}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-400">
                {lead.sender_account?.replace('_', ' ').toUpperCase() || '-'}
              </td>
              <td className="px-6 py-4 text-sm text-gray-400">
                {formatDate(lead.last_sent_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const Pagination = ({ pagination, onPageChange }) => {
  if (!pagination) return null;

  const { page, totalPages } = pagination;

  return (
    <div className="flex items-center justify-between mt-6">
      <p className="text-sm text-gray-400">
        Page {page} of {totalPages}
      </p>
      <div className="flex gap-2">
        <button
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          className="px-4 py-2 glass rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/5 transition-colors"
        >
          Previous
        </button>
        <button
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
          className="px-4 py-2 glass rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/5 transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
};
