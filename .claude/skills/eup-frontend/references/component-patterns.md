# Frontend Component Patterns

## Hero Section (Landing Page)

```tsx
export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white py-20 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          {/* Eyebrow */}
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            AI Social Automation
          </p>

          {/* Headline */}
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Marketing copy headline here
          </h1>

          {/* Subheadline */}
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Supporting copy that explains the value proposition.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex items-center justify-center gap-x-4">
            <Button size="lg">Primary CTA</Button>
            <Button variant="outline" size="lg">Secondary CTA</Button>
          </div>
        </div>
      </div>
    </section>
  );
}
```

## Lead Capture Form

```tsx
'use client';

import { useState } from 'react';

export function LeadForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('loading');

    const formData = new FormData(e.currentTarget);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.get('email'),
          name: formData.get('name'),
        }),
      });

      if (!res.ok) throw new Error('Failed to submit');
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="rounded-lg bg-green-50 p-6 text-center">
        <p className="text-lg font-medium text-green-800">Thanks! We'll be in touch.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        type="email"
        name="email"
        required
        placeholder="you@example.com"
        className="rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
      />
      <input
        type="text"
        name="name"
        placeholder="Your name (optional)"
        className="rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {status === 'loading' ? 'Submitting...' : 'Get Started'}
      </button>
      {status === 'error' && (
        <p className="text-sm text-red-600">Something went wrong. Please try again.</p>
      )}
    </form>
  );
}
```

## Metric Card (Dashboard)

```tsx
interface MetricCardProps {
  label: string;
  value: string;
  change?: number;
  icon?: React.ReactNode;
}

export function MetricCard({ label, value, change, icon }: MetricCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
      <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
      {change !== undefined && (
        <p className={`mt-1 text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {change >= 0 ? '+' : ''}{change}% from last period
        </p>
      )}
    </div>
  );
}
```

## Social Post Preview Card

```tsx
interface PostPreviewProps {
  platform: 'linkedin' | 'twitter' | 'instagram' | 'facebook';
  content: string;
  scheduledAt?: Date;
  status: 'draft' | 'scheduled' | 'published';
}

export function PostPreview({ platform, content, scheduledAt, status }: PostPreviewProps) {
  const platformColors = {
    linkedin: 'border-blue-600',
    twitter: 'border-sky-400',
    instagram: 'border-pink-500',
    facebook: 'border-blue-500',
  };

  return (
    <div className={`rounded-lg border-l-4 ${platformColors[platform]} bg-white p-4 shadow-sm`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase text-gray-500">{platform}</span>
        <span className={`rounded-full px-2 py-0.5 text-xs ${
          status === 'published' ? 'bg-green-100 text-green-700' :
          status === 'scheduled' ? 'bg-yellow-100 text-yellow-700' :
          'bg-gray-100 text-gray-600'
        }`}>
          {status}
        </span>
      </div>
      <p className="mt-2 line-clamp-3 text-sm text-gray-700">{content}</p>
      {scheduledAt && (
        <p className="mt-2 text-xs text-gray-400">
          Scheduled: {scheduledAt.toLocaleDateString()}
        </p>
      )}
    </div>
  );
}
```
