import React from 'react';
import { useQuery } from '@tanstack/react-query';
import apiService from '../../lib/api';
import { Spinner } from '../../components/ui/spinner';
import { useAuth } from '../../hooks/useAuth';
import { withErrorBoundary } from '../../components/ui/withErrorBoundary';
import LoadingState from '../../components/ui/LoadingState';
import ErrorDisplay from '../../components/ui/ErrorDisplay';

function Billing() {
  const { user } = useAuth();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['billing'],
    queryFn: async () => {
      const result = await apiService.getBilling();
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data;
    },
  });

  if (isLoading) {
    return <LoadingState message="Loading billing data..." />;
  }

  if (error) {
    return (
      <ErrorDisplay
        error={error}
        title="Failed to load billing data"
        description="Unable to load billing information. Please try again."
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Billing</h2>
      {data && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-600">Current Balance</div>
              <div className="text-2xl font-bold">${data.currentBalance?.toFixed(2) || '0.00'}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-600">Pending Payouts</div>
              <div className="text-2xl font-bold">${data.pendingPayouts?.toFixed(2) || '0.00'}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-600">Total Earned</div>
              <div className="text-2xl font-bold">${data.totalEarned?.toFixed(2) || '0.00'}</div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow">
            <h3 className="text-lg font-semibold p-4 border-b">Payment History</h3>
            {data.paymentHistory && Array.isArray(data.paymentHistory) && data.paymentHistory.length > 0 ? (
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left">ID</th>
                    <th className="px-4 py-3 text-left">Amount</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Method</th>
                  </tr>
                </thead>
                <tbody>
                  {data.paymentHistory.map((payment: any, idx: number) => (
                    <tr key={idx} className="border-b">
                      <td className="px-4 py-3">{payment.id}</td>
                      <td className="px-4 py-3">${payment.amount?.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                          payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">{payment.date}</td>
                      <td className="px-4 py-3">{payment.method}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-4 text-gray-500">No payment history found.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default withErrorBoundary(Billing, {
  title: 'Billing Error',
  showDetails: false
}); 