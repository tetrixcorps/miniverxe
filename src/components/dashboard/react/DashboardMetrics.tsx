import React, { useState, useEffect } from 'react';

interface DashboardMetricsProps {
  industry?: string;
}

interface Metric {
  label: string;
  value: string | number;
  change?: string;
  icon: string;
  color: string;
}

export const DashboardMetrics: React.FC<DashboardMetricsProps> = ({ industry = 'general' }) => {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading metrics data
    const loadMetrics = async () => {
      setLoading(true);
      
      // Industry-specific metrics
      const industryMetrics: Record<string, Metric[]> = {
        healthcare: [
          { label: 'Active Patients', value: '1,247', change: '+89', icon: '👥', color: 'blue' },
          { label: 'Today\'s Appointments', value: '32', change: '+5', icon: '📅', color: 'green' },
          { label: 'Revenue', value: '$125,430', change: '+12%', icon: '💰', color: 'purple' },
          { label: 'System Uptime', value: '99.9%', change: 'Stable', icon: '✅', color: 'emerald' }
        ],
        legal: [
          { label: 'Active Cases', value: '156', change: '+12', icon: '⚖️', color: 'blue' },
          { label: 'Billable Hours', value: '2,340', change: '+8%', icon: '⏰', color: 'green' },
          { label: 'Revenue', value: '$245,680', change: '+15%', icon: '💰', color: 'purple' },
          { label: 'Client Satisfaction', value: '4.8/5', change: '+0.2', icon: '⭐', color: 'yellow' }
        ],
        default: [
          { label: 'Active Users', value: '1,247', change: '+89', icon: '👥', color: 'blue' },
          { label: 'Total Revenue', value: '$125,430', change: '+12%', icon: '💰', color: 'green' },
          { label: 'System Uptime', value: '99.9%', change: 'Stable', icon: '✅', color: 'purple' },
          { label: 'Data Processed', value: '2.4TB', change: '+5%', icon: '📊', color: 'orange' }
        ]
      };

      const selectedMetrics = industryMetrics[industry] || industryMetrics.default;
      
      // Simulate API delay
      setTimeout(() => {
        setMetrics(selectedMetrics);
        setLoading(false);
      }, 500);
    };

    loadMetrics();
  }, [industry]);

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: 'from-blue-50 to-blue-100 text-blue-600',
      green: 'from-green-50 to-green-100 text-green-600',
      purple: 'from-purple-50 to-purple-100 text-purple-600',
      emerald: 'from-emerald-50 to-emerald-100 text-emerald-600',
      yellow: 'from-yellow-50 to-yellow-100 text-yellow-600',
      orange: 'from-orange-50 to-orange-100 text-orange-600'
    };
    return colorMap[color] || colorMap.blue;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-md p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-20"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => (
        <div
          key={index}
          className={`bg-gradient-to-r ${getColorClasses(metric.color)} rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-all duration-200`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="text-3xl">{metric.icon}</div>
            {metric.change && (
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-white/50">
                {metric.change}
              </span>
            )}
          </div>
          <div>
            <p className="text-sm font-medium opacity-80 mb-1">{metric.label}</p>
            <p className="text-3xl font-bold">{metric.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardMetrics;




