// Compliance Dashboard Widget
// Displays compliance metrics and status for enterprise IVR systems

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { AlertCircle, CheckCircle2, Shield, FileText, Lock } from 'lucide-react';

interface ComplianceDashboardWidgetProps {
  tenantId: string;
  industry: string;
  compact?: boolean;
}

interface ComplianceMetrics {
  auditTrailCompleteness: number;
  consentRate: number;
  redactionCoverage: number;
  policyCompliance: number;
  recentViolations: number;
  lastAuditDate: string;
  complianceStatus: 'compliant' | 'warning' | 'non-compliant';
}

const fetchComplianceMetrics = async (tenantId: string, industry: string): Promise<ComplianceMetrics> => {
  const res = await fetch(`/api/compliance/dashboard/metrics?tenantId=${tenantId}&industry=${industry}`);
  if (!res.ok) throw new Error('Failed to fetch compliance metrics');
  return res.json();
};

export function ComplianceDashboardWidget({ tenantId, industry, compact = false }: ComplianceDashboardWidgetProps) {
  const { data: metrics, isLoading, error } = useQuery(
    ['compliance-metrics', tenantId, industry],
    () => fetchComplianceMetrics(tenantId, industry),
    {
      refetchInterval: 60000, // Refresh every minute
    }
  );

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="text-sm text-gray-500">Loading compliance metrics...</div>
        </CardContent>
      </Card>
    );
  }

  if (error || !metrics) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="text-sm text-red-600">Failed to load compliance metrics</div>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'compliant':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="w-3 h-3 mr-1" />Compliant</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertCircle className="w-3 h-3 mr-1" />Warning</Badge>;
      case 'non-compliant':
        return <Badge className="bg-red-100 text-red-800"><AlertCircle className="w-3 h-3 mr-1" />Non-Compliant</Badge>;
      default:
        return null;
    }
  };

  if (compact) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Compliance Status
            </CardTitle>
            {getStatusBadge(metrics.complianceStatus)}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Audit Trail</span>
              <span className="font-semibold">{metrics.auditTrailCompleteness}%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Consent Rate</span>
              <span className="font-semibold">{metrics.consentRate}%</span>
            </div>
            {metrics.recentViolations > 0 && (
              <div className="text-xs text-red-600">
                {metrics.recentViolations} recent violation{metrics.recentViolations !== 1 ? 's' : ''}
              </div>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-2"
              onClick={() => window.location.href = `/compliance/dashboard?tenantId=${tenantId}`}
            >
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Compliance Dashboard
          </CardTitle>
          {getStatusBadge(metrics.complianceStatus)}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <div className="text-xs text-gray-600">Audit Trail</div>
            </div>
            <div className="text-2xl font-bold text-blue-900">{metrics.auditTrailCompleteness}%</div>
            <div className="text-xs text-gray-500 mt-1">Completeness</div>
          </div>

          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <div className="text-xs text-gray-600">Consent Rate</div>
            </div>
            <div className="text-2xl font-bold text-green-900">{metrics.consentRate}%</div>
            <div className="text-xs text-gray-500 mt-1">Granted</div>
          </div>

          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-4 h-4 text-purple-600" />
              <div className="text-xs text-gray-600">Redaction</div>
            </div>
            <div className="text-2xl font-bold text-purple-900">{metrics.redactionCoverage}%</div>
            <div className="text-xs text-gray-500 mt-1">Coverage</div>
          </div>

          <div className="p-4 bg-orange-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-orange-600" />
              <div className="text-xs text-gray-600">Policy</div>
            </div>
            <div className="text-2xl font-bold text-orange-900">{metrics.policyCompliance}%</div>
            <div className="text-xs text-gray-500 mt-1">Compliance</div>
          </div>
        </div>

        {/* Violations Alert */}
        {metrics.recentViolations > 0 && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div>
                <div className="font-semibold text-red-900">
                  {metrics.recentViolations} Recent Violation{metrics.recentViolations !== 1 ? 's' : ''}
                </div>
                <div className="text-sm text-red-700 mt-1">
                  Action required. Review compliance violations in the audit log.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Last Audit Info */}
        <div className="text-xs text-gray-500">
          Last audit: {new Date(metrics.lastAuditDate).toLocaleString()}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.location.href = `/compliance/dashboard?tenantId=${tenantId}`}
          >
            Full Dashboard
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.location.href = `/compliance/audit?tenantId=${tenantId}`}
          >
            Audit Trail
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.location.href = `/compliance/reports?tenantId=${tenantId}`}
          >
            Reports
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
