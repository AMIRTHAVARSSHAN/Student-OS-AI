'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GraduationCap, ArrowRight } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useAppStore } from '@/stores/app-store';

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useAppStore();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('en');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await apiClient.post('/auth/register', {
        full_name: fullName,
        email,
        password,
        preferred_language: preferredLanguage
      });

      // Auto login after registration
      const loginRes = await apiClient.post('/auth/login', { email, password });
      localStorage.setItem('access_token', loginRes.data.access_token);

      // Store user identity in Zustand so dashboard has it immediately
      setUser({
        id: loginRes.data.user_id,
        email,
        fullName: fullName,
        preferredLanguage: preferredLanguage as any,
        subscriptionTier: loginRes.data.subscription_tier || 'free',
        onboardingCompleted: false,
        subjects: [],
      });

      router.push('/onboarding');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--surface-0)]">
      <div className="w-full max-w-md bg-[var(--surface-1)] border border-[var(--border-default)] rounded-3xl p-8 space-y-6 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-indigo-600/30">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Create your ScholarOS account</h1>
          <p className="text-xs text-[var(--text-secondary)]">Join thousands of students achieving top grades</p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs p-3 rounded-xl text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1.5">Full Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Priya Raman"
              className="w-full bg-[var(--surface-2)] border border-[var(--border-default)] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--brand-primary)]"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1.5">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="priya@annauniv.edu"
              className="w-full bg-[var(--surface-2)] border border-[var(--border-default)] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--brand-primary)]"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1.5">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="w-full bg-[var(--surface-2)] border border-[var(--border-default)] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--brand-primary)]"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1.5">Preferred Language</label>
            <select
              value={preferredLanguage}
              onChange={(e) => setPreferredLanguage(e.target.value)}
              className="w-full bg-[var(--surface-2)] border border-[var(--border-default)] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--brand-primary)] text-[var(--text-primary)]"
            >
              <option value="en">English</option>
              <option value="ta">Tamil (தமிழ்)</option>
              <option value="tanglish">Tanglish (Tamil + English)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--brand-primary)] hover:bg-indigo-500 text-white font-medium py-3 rounded-xl transition text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30"
          >
            {loading ? 'Creating Account...' : 'Get Started'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-[var(--text-secondary)]">
          Already have an account?{' '}
          <Link href="/login" className="text-indigo-400 font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
