import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/components/utils';
import LoginPrompt from '../components/auth/LoginPrompt';

export default function Welcome() {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuthenticated = await base44.auth.isAuthenticated();
        if (isAuthenticated) {
          navigate(createPageUrl('Dashboard'));
        }
      } catch (error) {
        // User not authenticated, stay on welcome
      } finally {
        setIsChecking(false);
      }
    };
    checkAuth();
  }, [navigate]);

  if (isChecking) {
    return <div className="min-h-screen bg-background" />;
  }

  return <LoginPrompt />;
}