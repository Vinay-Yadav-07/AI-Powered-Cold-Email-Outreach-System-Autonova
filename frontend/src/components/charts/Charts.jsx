import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

export const LeadStatusChart = ({ data }) => {
  const chartData = [
    { name: 'Queued', value: data?.queued || 0 },
    { name: 'Sent (Step 1)', value: data?.sent_step_1 || 0 },
    { name: 'Follow-up', value: data?.sent_followup_1 || 0 },
    { name: 'Invalid', value: data?.invalid_email || 0 },
    { name: 'Bounced', value: data?.bounced || 0 },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, value }) => `${name}: ${value}`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
};

export const EmailTimelineChart = ({ data = [] }) => {
  const chartData = [
    { name: 'Week 1', emails: 120, followups: 45 },
    { name: 'Week 2', emails: 180, followups: 75 },
    { name: 'Week 3', emails: 150, followups: 60 },
    { name: 'Week 4', emails: 210, followups: 85 },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
        <XAxis stroke="#999" />
        <YAxis stroke="#999" />
        <Tooltip
          contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
          labelStyle={{ color: '#f3f4f6' }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="emails"
          stroke="#3b82f6"
          dot={{ fill: '#3b82f6', r: 4 }}
          activeDot={{ r: 6 }}
          name="Emails Sent"
        />
        <Line
          type="monotone"
          dataKey="followups"
          stroke="#8b5cf6"
          dot={{ fill: '#8b5cf6', r: 4 }}
          activeDot={{ r: 6 }}
          name="Follow-ups"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export const SenderPerformanceChart = ({ data = {} }) => {
  const chartData = Object.entries(data || {}).map(([sender, performance]) => ({
    sender: sender.replace('_', ' ').toUpperCase(),
    sent: performance.sent,
    followed_up: performance.followed_up,
    bounced: performance.bounced,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
        <XAxis stroke="#999" />
        <YAxis stroke="#999" />
        <Tooltip
          contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
          labelStyle={{ color: '#f3f4f6' }}
        />
        <Legend />
        <Bar dataKey="sent" fill="#3b82f6" name="Sent" />
        <Bar dataKey="followed_up" fill="#8b5cf6" name="Follow-ups" />
        <Bar dataKey="bounced" fill="#ef4444" name="Bounced" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export const IndustryChart = ({ data = {} }) => {
  const chartData = Object.entries(data || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([industry, count]) => ({
      name: industry,
      value: count,
    }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 200, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
        <XAxis type="number" stroke="#999" />
        <YAxis dataKey="name" type="category" stroke="#999" width={190} />
        <Tooltip
          contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
          labelStyle={{ color: '#f3f4f6' }}
        />
        <Bar dataKey="value" fill="#10b981" name="Leads" />
      </BarChart>
    </ResponsiveContainer>
  );
};
