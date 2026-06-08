import React, { useState } from 'react';
import { Search, Download } from 'lucide-react';
import { Card, LoadingSpinner, EmptyState, ErrorState } from '../components/cards/CardComponents';
import { Pagination } from '../components/tables/Tables';
import { useUnsubscribedLeads } from '../hooks/useApi';
import { formatDate, exportToCSV } from '../lib/utils';

const Unsubscribes = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const { leads, pagination, isLoading, error } = useUnsubscribedLeads(page, 20);

  const filtered = leads.filter(
    (lead) =>
      (lead.first_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.company || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExport = () => {
    exportToCSV(filtered, 'unsubscribed_leads.csv');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Unsubscribe Manager</h1>
        <p className="text-gray-400">
          Manage {pagination?.total || 0} leads who have unsubscribed from your campaigns
        </p>
      </div>

      {/* Filters and Actions */}
      <Card className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-500" size={20} />
            <input
              type="text"
              placeholder="Search by name, company, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Export Button */}
          <button
            onClick={handleExport}
            className="flex items-center justify-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-500 transition-colors"
          >
            <Download size={18} />
            Export CSV
          </button>
        </div>
      </Card>

      {/* Table */}
      <Card>
        {isLoading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorState title="Unsubscribe data is unavailable" message={error.message} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No unsubscribed leads found"
            description="Great! Keep up the good work with your email campaigns"
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400">Company</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400">Industry</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400">Date Unsubscribed</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400">Sender Account</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.map((lead) => (
                    <tr key={lead.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-100">{lead.first_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-400">{lead.company}</td>
                      <td className="px-6 py-4 text-sm text-blue-400 truncate">{lead.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-400">{lead.industry}</td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {formatDate(lead.last_sent_at)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {lead.sender_account?.replace('_', ' ').toUpperCase() || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination pagination={pagination} onPageChange={setPage} />
          </>
        )}
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-white mb-4">Total Unsubscribed</h3>
          <div className="text-5xl font-bold text-red-400">{pagination?.total || 0}</div>
          <p className="text-sm text-gray-400 mt-2">Leads who have opted out</p>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-white mb-4">Unsubscribe Rate</h3>
          <div className="text-5xl font-bold text-yellow-400">2.1%</div>
          <p className="text-sm text-gray-400 mt-2">Percentage of total leads</p>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-white mb-4">This Month</h3>
          <div className="text-5xl font-bold text-orange-400">12</div>
          <p className="text-sm text-gray-400 mt-2">New unsubscribes</p>
        </Card>
      </div>
    </div>
  );
};

export default Unsubscribes;
