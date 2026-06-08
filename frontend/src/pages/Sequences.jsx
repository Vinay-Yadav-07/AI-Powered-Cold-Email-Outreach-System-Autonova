import React from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Card, LoadingSpinner } from '../components/cards/CardComponents';
import { useSequencePipeline } from '../hooks/useApi';

const Sequences = () => {
  const { pipeline, isLoading, error } = useSequencePipeline();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  const pipelineData = pipeline || {};

  const stages = [
    {
      title: 'Queued',
      count: pipelineData.queued || 0,
      description: 'Waiting to be processed',
      color: 'blue',
    },
    {
      title: 'Email Sent',
      count: pipelineData.sent_step_1 || 0,
      description: 'Initial email dispatched',
      color: 'purple',
    },
    {
      title: 'Follow-up Sent',
      count: pipelineData.sent_followup_1 || 0,
      description: 'Follow-up email sent',
      color: 'green',
    },
    {
      title: 'Unsubscribed',
      count: pipelineData.unsubscribed || 0,
      description: 'Opted out of campaign',
      color: 'red',
    },
  ];

  const totalLeads = Object.values(pipelineData).reduce((a, b) => a + b, 0);

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Sequence Tracking</h1>
        <p className="text-gray-400">Monitor the progression of leads through your email sequences</p>
        {error && (
          <p className="text-sm text-yellow-300/80 mt-3">
            Google Sheets is not connected yet, so sequence metrics are showing as empty.
          </p>
        )}
      </div>

      {/* Pipeline Visualization */}
      <Card>
        <h2 className="text-2xl font-bold text-white mb-8">Email Sequence Pipeline</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {stages.map((stage, index) => (
            <div key={stage.title} className="flex flex-col gap-4">
              {/* Stage Card */}
              <div
                className={`glass p-6 rounded-lg border border-white/10 text-center ${
                  stage.color === 'blue' ? 'border-blue-500/50 bg-blue-500/5' :
                  stage.color === 'purple' ? 'border-purple-500/50 bg-purple-500/5' :
                  stage.color === 'green' ? 'border-green-500/50 bg-green-500/5' :
                  'border-red-500/50 bg-red-500/5'
                }`}
              >
                <h3 className="text-sm font-semibold text-gray-300 mb-2">{stage.title}</h3>
                <div className="text-4xl font-bold text-white mb-2">{stage.count}</div>
                <p className="text-xs text-gray-400">{stage.description}</p>
              </div>

              {/* Arrow */}
              {index < stages.length - 1 && (
                <div className="flex items-center justify-center h-16 md:h-auto">
                  <ArrowRight className="text-gray-600 md:hidden" size={24} />
                  <ArrowRight className="text-gray-600 hidden md:block rotate-90" size={24} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-white">Conversion Progress</h3>

          {stages.map((stage) => (
            <div key={stage.title}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">{stage.title}</span>
                <span className="text-sm font-medium text-white">
                  {totalLeads > 0 ? Math.round((stage.count / totalLeads) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    stage.color === 'blue' ? 'bg-gradient-to-r from-blue-600 to-blue-400' :
                    stage.color === 'purple' ? 'bg-gradient-to-r from-purple-600 to-purple-400' :
                    stage.color === 'green' ? 'bg-gradient-to-r from-green-600 to-green-400' :
                    'bg-gradient-to-r from-red-600 to-red-400'
                  }`}
                  style={{
                    width: `${totalLeads > 0 ? (stage.count / totalLeads) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-white mb-4">Completion Rate</h3>
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <div className="text-5xl font-bold text-green-400 mb-2">
                {totalLeads > 0 
                  ? Math.round(((pipelineData.sent_followup_1 || 0) / totalLeads) * 100)
                  : 0}
                %
              </div>
              <p className="text-sm text-gray-400">
                {pipelineData.sent_followup_1 || 0} leads completed full sequence
              </p>
            </div>
            <CheckCircle2 className="text-green-400 opacity-30" size={48} />
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-white mb-4">Pending Processing</h3>
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <div className="text-5xl font-bold text-blue-400 mb-2">
                {pipelineData.queued || 0}
              </div>
              <p className="text-sm text-gray-400">Leads in queue waiting to process</p>
            </div>
            <div className="text-4xl">⏳</div>
          </div>
        </Card>
      </div>

      {/* Detailed Breakdown */}
      <Card>
        <h3 className="text-lg font-semibold text-white mb-4">Detailed Breakdown</h3>
        <div className="space-y-4">
          {stages.map((stage) => (
            <div key={stage.title} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div>
                <p className="font-medium text-white">{stage.title}</p>
                <p className="text-sm text-gray-400">{stage.description}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-white">{stage.count}</p>
                <p className="text-xs text-gray-400">
                  {totalLeads > 0 ? Math.round((stage.count / totalLeads) * 100) : 0}% of total
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Sequences;
