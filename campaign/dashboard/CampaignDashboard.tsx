// Campaign Dashboard Component
// Real-time campaign management and analytics dashboard

import React, { useState, useEffect } from 'react';

interface CampaignMetrics {
  totalLeads: number;
  emailLeads: number;
  smsLeads: number;
  conversionRate: number;
  averageScore: number;
  industryDistribution: Record<string, number>;
  sourceDistribution: Record<string, number>;
  revenue: number;
  leadsNeedingAttention: number;
}

interface Lead {
  id: string;
  email: string;
  phoneNumber?: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  industry: string;
  source: string;
  status: string;
  score: number;
  createdAt: string;
  lastActivityAt?: string;
}

interface CampaignDashboardProps {
  className?: string;
}

const CampaignDashboard: React.FC<CampaignDashboardProps> = ({ className = '' }) => {
  const [metrics, setMetrics] = useState<CampaignMetrics | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    fetchCampaignData();
  }, []);

  const fetchCampaignData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // In a real implementation, you would fetch from your campaign API
      // For now, we'll use mock data
      const mockMetrics: CampaignMetrics = {
        totalLeads: 150,
        emailLeads: 120,
        smsLeads: 80,
        conversionRate: 15.5,
        averageScore: 78.5,
        industryDistribution: {
          construction: 45,
          fleet: 35,
          healthcare: 70
        },
        sourceDistribution: {
          email: 60,
          sms: 40,
          website: 30,
          referral: 20
        },
        revenue: 125000,
        leadsNeedingAttention: 12
      };

      const mockLeads: Lead[] = [
        {
          id: 'lead_1',
          email: 'john.smith@constructionco.com',
          phoneNumber: '+15551234567',
          firstName: 'John',
          lastName: 'Smith',
          company: 'Smith Construction Co.',
          industry: 'construction',
          source: 'email',
          status: 'interested',
          score: 85,
          createdAt: '2024-01-15T10:30:00Z',
          lastActivityAt: '2024-01-20T14:22:00Z'
        },
        {
          id: 'lead_2',
          email: 'lisa.wilson@fleetlogistics.com',
          phoneNumber: '+15551234570',
          firstName: 'Lisa',
          lastName: 'Wilson',
          company: 'Fleet Logistics Inc.',
          industry: 'fleet',
          source: 'website',
          status: 'qualified',
          score: 92,
          createdAt: '2024-01-16T09:15:00Z',
          lastActivityAt: '2024-01-21T11:45:00Z'
        },
        {
          id: 'lead_3',
          email: 'dr.james.miller@healthcare.com',
          phoneNumber: '+15551234573',
          firstName: 'Dr. James',
          lastName: 'Miller',
          company: 'Miller Medical Group',
          industry: 'healthcare',
          source: 'referral',
          status: 'proposal',
          score: 88,
          createdAt: '2024-01-17T16:20:00Z',
          lastActivityAt: '2024-01-22T09:30:00Z'
        }
      ];

      setMetrics(mockMetrics);
      setLeads(mockLeads);
    } catch (err) {
      console.error('Failed to fetch campaign data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch campaign data');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLeads = leads.filter(lead => {
    const industryMatch = selectedIndustry === 'all' || lead.industry === selectedIndustry;
    const statusMatch = selectedStatus === 'all' || lead.status === selectedStatus;
    return industryMatch && statusMatch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'interested': return 'bg-green-100 text-green-800';
      case 'qualified': return 'bg-purple-100 text-purple-800';
      case 'proposal': return 'bg-orange-100 text-orange-800';
      case 'negotiation': return 'bg-red-100 text-red-800';
      case 'closed_won': return 'bg-emerald-100 text-emerald-800';
      case 'closed_lost': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getIndustryIcon = (industry: string) => {
    switch (industry) {
      case 'construction': return '🏗️';
      case 'fleet': return '🚛';
      case 'healthcare': return '🏥';
      default: return '📊';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading campaign data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="text-center">
          <div className="text-red-600 text-2xl mb-2">⚠</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Campaign Data Unavailable</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchCampaignData}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return null;
  }

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Campaign Dashboard</h2>
          <p className="text-sm text-gray-600">Real-time campaign management and analytics</p>
        </div>
        <button
          onClick={fetchCampaignData}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          title="Refresh"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 text-lg">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Leads</p>
              <p className="text-2xl font-semibold text-gray-900">{metrics.totalLeads}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600 text-lg">📈</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Conversion Rate</p>
              <p className="text-2xl font-semibold text-gray-900">{metrics.conversionRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-purple-600 text-lg">⭐</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg Lead Score</p>
              <p className="text-2xl font-semibold text-gray-900">{metrics.averageScore.toFixed(1)}</p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-orange-600 text-lg">💰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">${metrics.revenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Industry Distribution */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Industry Distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(metrics.industryDistribution).map(([industry, count]) => (
            <div key={industry} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{getIndustryIcon(industry)}</span>
                  <div>
                    <p className="font-medium text-gray-900 capitalize">{industry}</p>
                    <p className="text-sm text-gray-600">{count} leads</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                  <p className="text-sm text-gray-600">
                    {((count / metrics.totalLeads) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Leads Table */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Leads</h3>
          <div className="flex space-x-4">
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              <option value="all">All Industries</option>
              <option value="construction">Construction</option>
              <option value="fleet">Fleet</option>
              <option value="healthcare">Healthcare</option>
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="interested">Interested</option>
              <option value="qualified">Qualified</option>
              <option value="proposal">Proposal</option>
              <option value="negotiation">Negotiation</option>
              <option value="closed_won">Closed Won</option>
              <option value="closed_lost">Closed Lost</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lead
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Industry
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {lead.firstName?.[0]}{lead.lastName?.[0]}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {lead.firstName} {lead.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{lead.email}</div>
                        {lead.company && (
                          <div className="text-sm text-gray-500">{lead.company}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-lg mr-2">{getIndustryIcon(lead.industry)}</span>
                      <span className="text-sm text-gray-900 capitalize">{lead.industry}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900 capitalize">{lead.source}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(lead.status)}`}>
                      {lead.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${getScoreColor(lead.score)}`}>
                      {lead.score}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alerts */}
      {metrics.leadsNeedingAttention > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-yellow-600 text-lg">⚠️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                {metrics.leadsNeedingAttention} leads need attention
              </h3>
              <p className="text-sm text-yellow-700">
                These leads haven't been contacted in the last 7 days and may need follow-up.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignDashboard;
