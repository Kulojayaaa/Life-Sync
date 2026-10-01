import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CircleCheck, CircleX, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { LifeSyncLogo } from '@/components/branding/LifeSyncLogo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type CallbackState = 'loading' | 'success' | 'error';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [state, setState] = useState<CallbackState>('loading');
  const [message, setMessage] = useState('Confirming your email securely...');

  const rawNext = searchParams.get('next');
  const nextPath = rawNext && rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/';
  const flow = searchParams.get('flow') === 'magic' ? 'magic' : 'signup';

  useEffect(() => {
    let active = true;

    async function finishAuthentication() {
      const urlError = searchParams.get('error_description') || searchParams.get('error');
      if (urlError) {
        if (!active) return;
        setState('error');
        setMessage(urlError.replace(/\+/g, ' '));
        return;
      }

      const code = searchParams.get('code');
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          if (!active) return;
          setState('error');
          setMessage(error.message);
          return;
        }
      }

      const { data, error } = await supabase.auth.getSession();
      if (!active) return;

      if (error) {
        setState('error');
        setMessage(error.message);
        return;
      }

      if (!data.session) {
        setState('error');
        setMessage('This confirmation link is invalid or has expired. Request a new link and try again.');
        return;
      }

      setState('success');
      setMessage(flow === 'magic'
        ? 'You are signed in securely.'
        : 'Your email is confirmed and your LifeSync account is ready.');
    }

    void finishAuthentication();
    return () => {
      active = false;
    };
  }, [flow, searchParams]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md border-border/60 shadow-xl">
        <CardHeader className="items-center text-center space-y-4">
          <LifeSyncLogo size="lg" />
          {state === 'loading' && <Loader2 className="h-12 w-12 animate-spin text-primary" />}
          {state === 'success' && <CircleCheck className="h-12 w-12 text-success" />}
          {state === 'error' && <CircleX className="h-12 w-12 text-destructive" />}
          <div className="space-y-2">
            <CardTitle className="text-2xl">
              {state === 'loading' && 'Confirming your account'}
              {state === 'success' && (flow === 'magic' ? 'Signed in successfully' : 'Email confirmed')}
              {state === 'error' && 'Confirmation failed'}
            </CardTitle>
            <CardDescription className="text-base">{message}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {state === 'success' && (
            <Button className="w-full gradient-primary text-white" onClick={() => navigate(nextPath, { replace: true })}>
              Continue to LifeSync
            </Button>
          )}
          {state === 'error' && (
            <Button variant="outline" className="w-full" onClick={() => navigate('/auth', { replace: true })}>
              Return to sign in
            </Button>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
