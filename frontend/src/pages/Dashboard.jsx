import React from 'react';
import { TrendingUp, Mail, Send, AlertCircle, LogOut, Users, Activity, Zap, Target, Clock } from 'lucide-react';
import { Card, KPICard, LoadingSpinner, PremiumStatCard } from '../components/cards/CardComponents';
import { LeadStatusChart, EmailTimelineChart, SenderPerformanceChart, IndustryChart } from '../components/charts/Charts';
import { useDashboardStats, useAnalytics } from '../hooks/useApi';

const Dashboard = () => {
  const { stats, isLoading: statsLoading, error: statsError } = useDashboardStats();
  const { analytics, isLoading: analyticsLoading, error: analyticsError } = useAnalytics();

  if (statsLoading || analyticsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  const dashboardStats = stats || {};
  const dashboardAnalytics = analytics || {};
  const dataError = statsError || analyticsError;

  // Calculate success rate
  const successRate = dashboardStats.emailsSent && dashboardStats.totalLeads
    ? Math.round((dashboardStats.emailsSent / dashboardStats.totalLeads) * 100)
    : 0;

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Premium Header */}
      <div className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-600/20 to-purple-600/10 rounded-full blur-3xl -mr-48 -mt-48" />
        <div className="relative z-10">
          <h1 className="text-5xl font-bold text-white mb-2 tracking-tight">Campaign Dashboard</h1>
          <p className="text-gray-400 text-lg">Real-time insights into your AutoNova outreach performance</p>
          {dataError && (
            <p className="text-sm text-yellow-300/80 mt-3">
              Google Sheets is not connected yet, so the dashboard is showing empty campaign metrics.
            </p>
          )}
        </div>
      </div>

      {/* Primary KPI Cards - Premium Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Leads"
          value={dashboardStats.totalLeads || 0}
          icon={Users}
          color="blue"
          trend={12}
          trend_direction="up"
        />
        <KPICard
          title="Emails Sent"
          value={dashboardStats.emailsSent || 0}
          icon={Mail}
          color="purple"
          trend={8}
          trend_direction="up"
        />
        <KPICard
          title="Follow-ups Sent"
          value={dashboardStats.followupsSent || 0}
          icon={Send}
          color="green"
          trend={15}
          trend_direction="up"
        />
        <KPICard
          title="Success Rate"
          value={`${successRate}%`}
          icon={TrendingUp}
          color="blue"
          trend={5}
          trend_direction="up"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <PremiumStatCard
          title="Unsubscribed"
          value={dashboardStats.unsubscribedLeads || 0}
          icon={LogOut}
          description="Leads that opted out"
          color="red"
        />
        <PremiumStatCard
          title="Invalid Emails"
          value={dashboardStats.invalidEmails || 0}
          icon={AlertCircle}
          description="Emails that failed validation"
          color="red"
        />
        <PremiumStatCard
          title="Active Accounts"
          value={dashboardStats.activeSenderAccounts || 0}
          icon={Activity}
          description="Sender accounts in use"
          color="green"
        />
      </div>

      {/* Charts Section - 2x2 Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead Status Distribution */}
        <Card className="col-span-1">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Target size={24} className="text-blue-400" />
              Lead Status Distribution
            </h2>
            <p className="text-sm text-gray-400 mt-1">Overview of all lead statuses in current campaign</p>
          </div>
          <LeadStatusChart data={dashboardAnalytics.statusBreakdown} />
        </Card>

        {/* Email Timeline */}
        <Card className="col-span-1">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <TrendingUp size={24} className="text-purple-400" />
              Email Volume Trends
            </h2>
            <p className="text-sm text-gray-400 mt-1">Emails and follow-ups progression over time</p>
          </div>
          <EmailTimelineChart />
        </Card>

        {/* Sender Performance */}
        <Card className="col-span-1">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Zap size={24} className="text-green-400" />
              Sender Performance
            </h2>
            <p className="text-sm text-gray-400 mt-1">Email delivery rates by sender account</p>
          </div>
          <SenderPerformanceChart data={dashboardAnalytics.senderPerformance} />
        </Card>

        {/* Industry Distribution */}
        <Card className="col-span-1">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Clock size={24} className="text-orange-400" />
              Industry Breakdown
            </h2>
            <p className="text-sm text-gray-400 mt-1">Lead distribution across industries</p>
          </div>
          <IndustryChart data={dashboardAnalytics.industryDistribution} />
        </Card>
      </div>

      {/* Bottom Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-bold text-white mb-4">Campaign Overview</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Conversion Rate</span>
              <span className="text-white font-semibold">{successRate}%</span>
            </div>
            <div className="w-full bg-white/[0.1] rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-600 to-blue-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${successRate}%` }}
              />
            </div>
            <div className="text-sm text-gray-400 mt-2">
              {dashboardStats.emailsSent || 0} emails sent from {dashboardStats.totalLeads || 0} leads
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full px-4 py-2 bg-gradient-to-r from-blue-600/20 to-blue-400/10 border border-blue-500/30 text-blue-200 rounded-lg hover:bg-blue-600/30 transition-colors text-sm font-medium">
              Start New Campaign
            </button>
            <button className="w-full px-4 py-2 bg-gradient-to-r from-purple-600/20 to-purple-400/10 border border-purple-500/30 text-purple-200 rounded-lg hover:bg-purple-600/30 transition-colors text-sm font-medium">
              View Analytics Report
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

