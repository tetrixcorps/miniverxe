import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchCIResults } from '../../lib/utils';
import { Spinner } from '../../components/ui/spinner';
import { useAuth } from '../../hooks/useAuth';
import { AcademyCIListSchema } from '../../lib/schemas';
import { toast } from 'react-hot-toast';
import ErrorBoundary from '../../components/ui/ErrorBoundary';
import ErrorMessage from '../../components/ui/ErrorMessage';
import LoadingState from '../../components/ui/LoadingState';

const CI: React.FC = () => {
  const { user } = useAuth();
  const token = user?.accessToken || user?.stsTokenManager?.accessToken;

  // Fetch CI results with Zod validation
  const { data, isLoading, error } = useQuery<any[] | null>({
    queryKey: ['ci-results'],
    queryFn: async () => {
      const result = await fetchCIResults(token);
      const parsed = AcademyCIListSchema.safeParse(result?.data);
      if (!parsed.success) {
        toast.error('Invalid CI results data received.');
        return null;
      }
      return parsed.data;
    },
    enabled: !!token,
  });

  return (
    <ErrorBoundary>
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-4">CI Results</h2>
        {isLoading ? (
          <LoadingState message="Loading CI results..." />
        ) : error ? (
          <ErrorMessage error={error} fallback="Error loading CI results." />
        ) : !data ? (
          <ErrorMessage error="Invalid CI results data." fallback="No CI results found." />
        ) : data.length > 0 ? (
          <table className="min-w-full bg-white rounded shadow">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">Build #</th>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Duration</th>
              </tr>
            </thead>
            <tbody>
              {data.map((build: any, idx: number) => (
                <tr key={idx} className="border-t">
                  <td className="px-4 py-2">{build.number}</td>
                  <td className="px-4 py-2">{build.date}</td>
                  <td className="px-4 py-2">{build.status}</td>
                  <td className="px-4 py-2">{build.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-gray-500">No CI results found.</div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default CI; 