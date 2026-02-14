'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, Auth } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const t = useTranslations();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [firebaseAuth, setFirebaseAuth] = useState<Auth | null>(null);

  useEffect(() => {
    // Dynamic import of Firebase auth
    import('@/lib/firebase/client').then((module) => {
      if (module.auth) {
        setFirebaseAuth(module.auth as Auth);
      }
    });
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseAuth) {
      setError('Firebase not initialized. Please configure environment variables.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(firebaseAuth, email, password);
      router.push('/dashboard');
    } catch (err: unknown) {
      console.error('Login error:', err);
      setError(t('auth.invalidCredentials'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background gradient-bg px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-xl bg-gradient-to-br from-primary via-blue-500 to-purple-500 flex items-center justify-center">
            <Phone className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl">{t('auth.login')}</CardTitle>
          <CardDescription>
            {t('common.appName')} — Support Command Center
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                {t('auth.email')}
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium">
                  {t('auth.password')}
                </label>
                <Link 
                  href="/forgot-password" 
                  className="text-xs text-primary hover:underline"
                >
                  {t('auth.forgotPassword')}
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('auth.login')}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              {t('auth.noAccount')}{' '}
              <Link href="/signup" className="text-primary hover:underline font-medium">
                {t('auth.signup')}
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
