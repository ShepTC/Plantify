import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
export default function ProRouteGate({ children, feature }) {
  const { data: user, isLoading, error } = useQuery({ queryKey: ['pro-access'], queryFn: () => base44.auth.me() });
  if (isLoading) return <p className="p-8 text-muted-foreground">Checking your plan…</p>;
  if (error) return <p className="p-8 text-destructive">Could not check your plan. Please refresh.</p>;
  if (user?.is_premium) return children;
  return <section className="max-w-lg mx-auto m-6 p-6 rounded-3xl border border-border bg-card space-y-4"><Sparkles className="w-8 h-8 text-primary" /><h1 className="text-2xl font-semibold">{feature}</h1><p className="text-muted-foreground text-sm">Get personalized garden help with Plantify Pro. Your planting recommendations, library, and garden additions are always free.</p><Button asChild><Link to="/Upgrade">Explore Plantify Pro</Link></Button><Link to="/" className="block text-sm text-primary">Back to Today</Link></section>;
}