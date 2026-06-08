import React, { useState } from 'react';
import { Search, Download, Plus, X, Loader } from 'lucide-react';
import { Card, LoadingSpinner, EmptyState, ErrorState } from '../components/cards/CardComponents';
import { CSVImporter } from '../components/csvimport/CSVImporter';
import { LeadsTable, Pagination } from '../components/tables/Tables';
import { LeadDetailDrawer } from '../components/layout/LeadDetailDrawer';
import { useLeads } from '../hooks/useApi';
import { exportToCSV } from '../lib/utils';

const Leads = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [showImporter, setShowImporter] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState('');
  const [newLead, setNewLead] = useState({
    first_name: '',
    company: '',
    email: '',
    industry: '',
    notes: '',
    sender_account: '',
  });

  const filters = {
    ...(searchTerm && { search: searchTerm }),
    ...(statusFilter && { status: statusFilter }),
    ...(industryFilter && { industry: industryFilter }),
  };

  const { leads, pagination, isLoading, error, refetch } = useLeads(page, 20, filters);

  const handleExport = () => {
    exportToCSV(leads, 'leads.csv');
  };

  const handleImportSuccess = (result) => {
    setShowImporter(false);
    refetch();
  };

  const handleLeadChange = (event) => {
    const { name, value } = event.target;
    setNewLead((current) => ({ ...current, [name]: value }));
  };

  const handleAddLead = async (event) => {
    event.preventDefault();
    setIsAdding(true);
    setAddError('');
    setAddSuccess('');

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLead),
      });
      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(result?.error || 'Failed to add lead');
      }

      setAddSuccess(result.message || 'Lead added successfully');
      setNewLead({
        first_name: '',
        company: '',
        email: '',
        industry: '',
        notes: '',
        sender_account: '',
      });
      await refetch();
    } catch (addLeadError) {
      setAddError(addLeadError.message);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Lead Management</h1>
        <p className="text-gray-400">View and manage all leads in your campaign</p>
      </div>

      {/* Filters and Actions */}
      <Card className="space-y-4">
        <div className="flex flex-col gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-500" size={20} />
            <input
              type="text"
              placeholder="Search by name, company, or email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="">All Statuses</option>
              <option value="queued">Queued</option>
              <option value="sent_step_1">Email Sent</option>
              <option value="sent_followup_1">Follow-up Sent</option>
              <option value="invalid_email">Invalid Email</option>
              <option value="bounced">Bounced</option>
            </select>

            <input
              type="text"
              placeholder="Filter by industry..."
              value={industryFilter}
              onChange={(e) => {
                setIndustryFilter(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
            />

            <button
              onClick={handleExport}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-500 transition-colors"
            >
              <Download size={18} />
              Export CSV
            </button>
          </div>
        </div>
      </Card>

      {/* CSV Importer Section */}
      {showImporter && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Import Leads from CSV</h2>
              <p className="text-gray-400 text-sm mt-1">Upload a CSV file to add new leads to your database</p>
            </div>
            <button
              onClick={() => setShowImporter(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
          <CSVImporter onSuccess={handleImportSuccess} />
        </div>
      )}

      {/* Lead Actions */}
      {!showImporter && !showAddForm && (
        <div className="flex flex-wrap justify-end gap-3">
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-500 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30"
          >
            <Plus size={18} />
            Add New Lead
          </button>
          <button
            onClick={() => setShowImporter(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-400 text-white rounded-lg font-medium hover:from-purple-700 hover:to-purple-500 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/30"
          >
            <Download size={18} />
            Import CSV
          </button>
        </div>
      )}

      {showAddForm && (
        <Card>
          <div className="mb-5 flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Add New Lead</h2>
              <p className="mt-1 text-sm text-gray-400">
                The lead will be added to Google Sheets with queued status.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                setAddError('');
                setAddSuccess('');
              }}
              className="text-gray-400 hover:text-white"
              aria-label="Close add lead form"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleAddLead} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {[
                ['first_name', 'First name', 'Asha'],
                ['company', 'Company', 'Acme Labs'],
                ['email', 'Email', 'asha@example.com'],
                ['industry', 'Industry', 'Technology'],
                ['sender_account', 'Sender account (optional)', 'sender@example.com'],
              ].map(([name, label, placeholder]) => (
                <label key={name} className="space-y-2 text-sm text-gray-300">
                  <span>{label}</span>
                  <input
                    name={name}
                    type={name === 'email' ? 'email' : 'text'}
                    value={newLead[name]}
                    onChange={handleLeadChange}
                    placeholder={placeholder}
                    required={!['sender_account'].includes(name)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </label>
              ))}
            </div>

            <label className="block space-y-2 text-sm text-gray-300">
              <span>Notes (optional)</span>
              <textarea
                name="notes"
                value={newLead.notes}
                onChange={handleLeadChange}
                rows={3}
                placeholder="Context about this lead"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </label>

            {addError && <p className="text-sm text-red-400">{addError}</p>}
            {addSuccess && <p className="text-sm text-green-400">{addSuccess}</p>}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isAdding}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-400 px-6 py-3 font-medium text-white hover:from-blue-700 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isAdding ? <Loader size={18} className="animate-spin" /> : <Plus size={18} />}
                {isAdding ? 'Adding Lead...' : 'Add Lead'}
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Table */}
      <Card>
        {isLoading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorState title="Lead data is unavailable" message={error.message} />
        ) : leads.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No leads found"
            description="Try adjusting your filters or search term"
          />
        ) : (
          <>
            <LeadsTable
              leads={leads}
              pagination={pagination}
              isLoading={isLoading}
              onRowClick={setSelectedLeadId}
            />
            <Pagination pagination={pagination} onPageChange={setPage} />
          </>
        )}
      </Card>

      {/* Lead Detail Drawer */}
      <LeadDetailDrawer
        leadId={selectedLeadId}
        onClose={() => setSelectedLeadId(null)}
      />
    </div>
  );
};

export default Leads;
