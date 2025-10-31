import { APP_NAME } from '@/constants';
import { Button } from '@/components/ui/button';
import { createFileRoute } from '@tanstack/react-router';
import { SiGithub } from 'react-icons/si';
import { authClient } from '@/lib/auth-client';
import { useState } from 'react';

export const Route = createFileRoute('/')({
  component: App,
});

function App() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      await authClient.signIn.social({
        provider: 'github',
        callbackURL: '/dashboard',
        newUserCallbackURL: '/onboarding',
      });
    } catch (error) {
      console.error('Sign in failed:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="flex flex-col gap-y-6 items-center">
        <h1 className="text-xl uppercase">{APP_NAME}</h1>
        <Button icon={<SiGithub size={20} />} onClick={handleSignIn} disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign in with GitHub'}
        </Button>
      </div>
    </div>
  );
}
