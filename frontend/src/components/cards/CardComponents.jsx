import React from 'react';
import { cn } from '../../lib/utils';

export const Card = ({ children, className = '' }) => (
  <div className={cn(
    'backdrop-blur-xl bg-white/[0.05] border border-white/[0.08] rounded-2xl p-6',
    'transition-all duration-300 hover:bg-white/[0.08] hover:border-white/[0.15] hover:shadow-lg hover:shadow-blue-500/10',
    className
  )}>
    {children}
  </div>
);

export const KPICard = ({ title, value, icon: Icon, trend, trend_direction = 'up', color = 'blue' }) => {
  const colorClasses = {
    blue: 'from-blue-600 to-blue-400 shadow-blue-500/20',
    purple: 'from-purple-600 to-purple-400 shadow-purple-500/20',
    green: 'from-green-600 to-green-400 shadow-green-500/20',
    red: 'from-red-600 to-red-400 shadow-red-500/20',
  };

  const trendColor = trend_direction === 'up' || trend >= 0 ? 'text-green-400' : 'text-red-400';

  return (
    <div className={cn(
      'backdrop-blur-xl bg-white/[0.05] border border-white/[0.08] p-6 rounded-2xl overflow-hidden relative group',
      'hover:border-white/[0.15] transition-all duration-300 hover:shadow-2xl hover:scale-105 cursor-pointer'
    )}>
      {/* Animated gradient background */}
      <div
        className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${colorClasses[color]} opacity-0 group-hover:opacity-10 transition-opacity duration-300 -mr-8 -mt-8 rounded-full blur-3xl`}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
            <h3 className="text-4xl font-bold text-white">{value.toLocaleString ? value.toLocaleString() : value}</h3>
          </div>
          {Icon && (
            <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]} text-white shadow-lg`}>
              <Icon size={24} />
            </div>
          )}
        </div>

        {trend !== undefined && (
          <div className="flex items-center gap-2">
            <span className={cn('text-sm font-bold', trendColor)}>
              {trend_direction === 'up' || trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </span>
            <span className="text-xs text-gray-500">vs last month</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Premium featured stat card
export const PremiumStatCard = ({ title, value, icon: Icon, description, color = 'blue' }) => {
  const colors = {
    blue: 'from-blue-600/30 to-blue-400/10',
    purple: 'from-purple-600/30 to-purple-400/10',
    green: 'from-green-600/30 to-green-400/10',
    red: 'from-red-600/30 to-red-400/10',
  };

  return (
    <div className={cn(
      'bg-gradient-to-br rounded-3xl p-8 border border-white/[0.1] backdrop-blur-xl',
      'transition-all duration-500 hover:scale-102 hover:border-white/[0.2] hover:shadow-2xl group',
      'relative overflow-hidden',
      colors[color]
    )}>
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-full blur-3xl" />
      
      <div className="relative z-10">
        <div className="flex items-start gap-4 mb-3">
          {Icon && (
            <div className="p-4 rounded-2xl bg-white/[0.05] group-hover:bg-white/[0.1] transition-colors">
              <Icon size={28} className="text-white" />
            </div>
          )}
          <div>
            <p className="text-gray-400 text-sm font-medium">{title}</p>
            <p className="text-3xl font-bold text-white mt-1">{value}</p>
          </div>
        </div>
        {description && <p className="text-gray-400 text-sm">{description}</p>}
      </div>
    </div>
  );
};

export const EmptyState = ({ icon: Icon, title, description }) => (
  <div className="flex flex-col items-center justify-center py-16">
    {Icon && (
      <div className="p-4 rounded-full bg-white/[0.05] mb-4">
        <Icon size={40} className="text-gray-500" />
      </div>
    )}
    <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
    <p className="text-sm text-gray-400 text-center max-w-sm">{description}</p>
  </div>
);

export const ErrorState = ({ title = 'Unable to load data', message }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300">
      {title}
    </div>
    {message && <p className="mt-4 max-w-md text-sm text-gray-400">{message}</p>}
  </div>
);

export const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center py-16">
    <div className="relative w-16 h-16">
      <div className="absolute inset-0 rounded-full border-4 border-white/10" />
      <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-blue-500 animate-spin" />
    </div>
    <p className="text-gray-400 text-sm font-medium mt-4">Loading your data...</p>
  </div>
);

// Badge component
export const Badge = ({ children, color = 'blue', size = 'md' }) => {
  const colors = {
    blue: 'bg-blue-500/20 text-blue-200 border-blue-500/30',
    green: 'bg-green-500/20 text-green-200 border-green-500/30',
    red: 'bg-red-500/20 text-red-200 border-red-500/30',
    yellow: 'bg-yellow-500/20 text-yellow-200 border-yellow-500/30',
    purple: 'bg-purple-500/20 text-purple-200 border-purple-500/30',
  };

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <span className={cn(
      'inline-flex items-center gap-2 rounded-full border font-medium',
      colors[color],
      sizes[size]
    )}>
      {children}
    </span>
  );
};
