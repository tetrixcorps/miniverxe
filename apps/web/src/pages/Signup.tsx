import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Spinner } from '../components/ui/spinner';
import ErrorDisplay from '../components/ui/ErrorDisplay';

const GROUP_LABELS: Record<string, string> = {
  'data-annotator': 'Data Annotator',
  'academy': 'Code Academy',
  'enterprise': 'Enterprise Customer',
};

export default function Signup() {
  const navigate = useNavigate();
  const location = useLocation();
  const [group, setGroup] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', name: '' });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const groupParam = params.get('group');
    if (!groupParam || !GROUP_LABELS[groupParam]) {
      // Redirect to landing page if group is missing or invalid
      navigate('/', { replace: true });
      return;
    }
    setGroup(groupParam);
  }, [location, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // TODO: Replace with real sign-up logic (API call)
      // Simulate sign-up and assign group
      await new Promise((res) => setTimeout(res, 1000));
      // Redirect to correct dashboard
      switch (group) {
        case 'data-annotator':
          navigate('/data-labeling/dashboard');
          break;
        case 'academy':
          navigate('/academy/dashboard');
          break;
        case 'enterprise':
          navigate('/customer/dashboard');
          break;
        default:
          navigate('/');
      }
    } catch (err: any) {
      setError('Sign-up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return <ErrorDisplay error={error} title="Sign Up Error" description={error} />;
  }
  if (!group) {
    return <Spinner />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white p-6">
      <Card className="p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4 text-blue-800">Sign Up as {GROUP_LABELS[group]}</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            name="name"
            type="text"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <Input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <Input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Spinner /> : 'Sign Up'}
          </Button>
        </form>
      </Card>
    </div>
  );
} 