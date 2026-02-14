'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile, Auth } from 'firebase/auth';
import { doc, setDoc, Timestamp, Firestore } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Loader2 } from 'lucide-react';

export default function SignupPage() {
  const t = useTranslations();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [firebaseAuth, setFirebaseAuth] = useState<Auth | null>(null);
  const [firebaseDb, setFirebaseDb] = useState<Firestore | null>(null);

  useEffect(() => {
    // Dynamic import of Firebase
    import('@/lib/firebase/client').then((module) => {
      if (module.auth) setFirebaseAuth(module.auth as Auth);
      if (module.db) setFirebaseDb(module.db as Firestore);
    });
  }, []);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseAuth || !firebaseDb) {
      setError('Firebase not initialized. Please configure environment variables.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      const user = userCredential.user;

      // Update profile with display name
      await updateProfile(user, { displayName: name });

      // Create tenant document
      const tenantId = user.uid; // Use user ID as tenant ID for simplicity
      await setDoc(doc(firebaseDb, 'tenants', tenantId), {
        name: companyName || name + "'s Workspace",
        plan: 'starter',
        settings: {
          languages: ['en'],
          escalationEmail: email,
        },
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      // Create user document under tenant
      await setDoc(doc(firebaseDb, 'tenants', tenantId, 'users', user.uid), {
        email,
        displayName: name,
        role: 'owner',
        createdAt: Timestamp.now(),
      });

      router.push('/dashboard');
    } catch (err: unknown) {
      console.error('Signup error:', err);
      if (err instanceof Error) {
        if (err.message.includes('email-already-in-use')) {
          setError('An account with this email already exists');
        } else if (err.message.includes('weak-password')) {
          setError('Password should be at least 6 characters');
        } else {
          setError(err.message);
        }
      } else {
        setError(t('common.error'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background gradient-bg px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-xl bg-gradient-to-br from-primary via-blue-500 to-purple-500 flex items-center justify-center">
            <Phone className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl">{t('auth.signup')}</CardTitle>
          <CardDescription>
            Create your {t('common.appName')} account
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSignup}>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Full Name
              </label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="company" className="text-sm font-medium">
                Company Name <span className="text-muted-foreground">(optional)</span>
              </label>
              <Input
                id="company"
                type="text"
                placeholder="Acme Inc."
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                disabled={loading}
              />
            </div>

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
              <label htmlFor="password" className="text-sm font-medium">
                {t('auth.password')}
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Must be at least 6 characters
              </p>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('auth.signup')}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              {t('auth.hasAccount')}{' '}
              <Link href="/login" className="text-primary hover:underline font-medium">
                {t('auth.login')}
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
