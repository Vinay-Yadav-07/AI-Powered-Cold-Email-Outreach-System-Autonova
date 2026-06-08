import React from 'react';
import { BarChart3, PieChart, TrendingUp, Users, Award } from 'lucide-react';
import { Card, LoadingSpinner } from '../components/cards/CardComponents';
import {
  LeadStatusChart,
  EmailTimelineChart,
  SenderPerformanceChart,
  IndustryChart,
} from '../components/charts/Charts';
import { useAnalytics } from '../hooks/useApi';

const Analytics = () => {
  const { analytics, isLoading, error } = useAnalytics();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  const analyticsData = analytics || {};

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Premium Header */}
      <div className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-600/20 to-pink-600/10 rounded-full blur-3xl -mr-48 -mt-48" />
        <div className="relative z-10">
          <h1 className="text-5xl font-bold text-white mb-2 tracking-tight">Analytics & Insights</h1>
          <p className="text-gray-400 text-lg">Deep dive into your email campaign performance metrics</p>
          {error && (
            <p className="text-sm text-yellow-300/80 mt-3">
              Google Sheets is not connected yet, so analytics are showing empty campaign metrics.
            </p>
          )}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead Status Breakdown */}
        <Card>
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <PieChart size={24} className="text-blue-400" />
              Lead Status Breakdown
            </h2>
            <p className="text-sm text-gray-400 mt-1">Distribution of leads across all statuses</p>
          </div>
          <LeadStatusChart data={analyticsData.statusBreakdown} />
        </Card>

        {/* Industry Distribution */}
        <Card>
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Users size={24} className="text-green-400" />
              Industry Distribution
            </h2>
            <p className="text-sm text-gray-400 mt-1">Top industries represented in leads</p>
          </div>
          <IndustryChart data={analyticsData.industryDistribution} />
        </Card>
      </div>

      {/* Sender Performance */}
      <Card>
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Award size={24} className="text-yellow-400" />
            Sender Account Performance
          </h2>
          <p className="text-sm text-gray-400 mt-1">Performance metrics by sender account</p>
        </div>
        <SenderPerformanceChart data={analyticsData.senderPerformance} />
      </Card>

      {/* Email Volume Timeline */}
      <Card>
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <TrendingUp size={24} className="text-purple-400" />
            Email Volume Timeline
          </h2>
          <p className="text-sm text-gray-400 mt-1">Emails and follow-ups sent over time</p>
        </div>
        <EmailTimelineChart />
      </Card>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 size={20} className="text-blue-400" />
            Status Summary
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Queued</span>
              <span className="text-white font-medium">{analyticsData.statusBreakdown?.queued || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Sent (Step 1)</span>
              <span className="text-white font-medium">{analyticsData.statusBreakdown?.sent_step_1 || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Follow-ups</span>
              <span className="text-white font-medium">{analyticsData.statusBreakdown?.sent_followup_1 || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Invalid</span>
              <span className="text-red-400 font-medium">{analyticsData.statusBreakdown?.invalid_email || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Bounced</span>
              <span className="text-red-400 font-medium">{analyticsData.statusBreakdown?.bounced || 0}</span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-white mb-4">Top Industries</h3>
          <div className="space-y-2 text-sm">
            {Object.entries(analyticsData.industryDistribution || {})
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([industry, count]) => (
                <div key={industry} className="flex justify-between">
                  <span className="text-gray-400">{industry}</span>
                  <span className="text-white font-medium">{count}</span>
                </div>
              ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-white mb-4">Sender Performance</h3>
          <div className="space-y-3 text-sm">
            {Object.entries(analyticsData.senderPerformance || {}).map(([sender, perf]) => (
              <div key={sender}>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-400 truncate">{sender}</span>
                  <span className="text-white font-medium">{perf.sent} sent</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1.5">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full"
                    style={{
                      width: `${perf.total > 0 ? (perf.sent / perf.total) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
