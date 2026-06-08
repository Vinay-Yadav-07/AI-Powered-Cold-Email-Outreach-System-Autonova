import React, { useState } from 'react';
import { Activity, Search } from 'lucide-react';
import { Card, LoadingSpinner, EmptyState, ErrorState } from '../components/cards/CardComponents';
import { Pagination } from '../components/tables/Tables';
import { useActivityLogs } from '../hooks/useApi';
import { formatDate } from '../lib/utils';

const LogBadge = ({ type }) => {
  const config = {
    EMAIL_SENT: { bg: 'bg-blue-900/30', text: 'text-blue-400', icon: '📧' },
    FOLLOWUP_SENT: { bg: 'bg-purple-900/30', text: 'text-purple-400', icon: '📤' },
    INVALID_EMAIL: { bg: 'bg-red-900/30', text: 'text-red-400', icon: '❌' },
    BOUNCE_DETECTED: { bg: 'bg-red-900/30', text: 'text-red-400', icon: '⚠️' },
    UNSUBSCRIBED: { bg: 'bg-yellow-900/30', text: 'text-yellow-400', icon: '🚫' },
  };

  const cfg = config[type] || config.EMAIL_SENT;
  return (
    <span className={`${cfg.bg} ${cfg.text} inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium`}>
      {cfg.icon} {type.replace('_', ' ')}
    </span>
  );
};

const Logs = () => {
  const [page, setPage] = useState(1);
  const [filterType, setFilterType] = useState('');

  const { logs, pagination, isLoading, error } = useActivityLogs(page, 20);

  const filtered = filterType ? logs.filter((log) => log.type === filterType) : logs;

  const logTypes = [...new Set(logs.map((log) => log.type))];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Activity Logs</h1>
        <p className="text-gray-400">Real-time activity timeline of your email campaign</p>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex gap-4">
          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
          >
            <option value="">All Activity Types</option>
            {logTypes.map((type) => (
              <option key={type} value={type}>
                {type.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Timeline */}
      <Card>
        {isLoading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorState title="Activity logs are unavailable" message={error.message} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Activity}
            title="No activity logs found"
            description="Activity will appear here as your campaign progresses"
          />
        ) : (
          <>
            <div className="space-y-6">
              {filtered.map((log, index) => (
                <div key={log.id} className="flex gap-4 relative">
                  {/* Timeline dot and line */}
                  <div className="flex flex-col items-center">
                    <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full border-2 border-dark-900 z-10" />
                    {index < filtered.length - 1 && (
                      <div className="w-0.5 bg-gradient-to-b from-white/20 to-transparent h-24 mt-2" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-1 pb-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <LogBadge type={log.type} />
                        <p className="text-sm text-white font-medium mt-2">{log.description}</p>
                      </div>
                      <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
                        {formatDate(log.timestamp)}
                      </span>
                    </div>

                    <div className="text-xs text-gray-500 space-y-1">
                      <p>
                        <span className="text-gray-600">ID:</span> {log.lead_id}
                      </p>
                      <p>
                        <span className="text-gray-600">Name:</span> {log.lead_name}
                      </p>
                      <p>
                        <span className="text-gray-600">Email:</span>
                        <a href={`mailto:${log.email}`} className="text-blue-400 hover:text-blue-300 ml-1">
                          {log.email}
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Pagination pagination={pagination} onPageChange={setPage} />
          </>
        )}
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-white mb-4">Total Events</h3>
          <div className="text-5xl font-bold text-blue-400">{pagination?.total || 0}</div>
          <p className="text-sm text-gray-400 mt-2">Activity events logged</p>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-white mb-4">Event Types</h3>
          <div className="text-5xl font-bold text-purple-400">{logTypes.length}</div>
          <p className="text-sm text-gray-400 mt-2">Different activity types</p>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-white mb-4">Last 24 Hours</h3>
          <div className="text-5xl font-bold text-green-400">
            {logs.filter((log) => {
              const logTime = new Date(log.timestamp);
              const now = new Date();
              return (now - logTime) < 24 * 60 * 60 * 1000;
            }).length}
          </div>
          <p className="text-sm text-gray-400 mt-2">Recent events</p>
        </Card>
      </div>
    </div>
  );
};

export default Logs;
