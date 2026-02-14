'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { onAuthStateChanged, signOut, User, Auth } from 'firebase/auth';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Phone,
  LayoutDashboard,
  Ticket,
  BookOpen,
  Settings,
  Users,
  CreditCard,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [firebaseAuth, setFirebaseAuth] = useState<Auth | null>(null);

  useEffect(() => {
    // Dynamic import of Firebase
    import('@/lib/firebase/client').then((module) => {
      if (module.auth) {
        const authInstance = module.auth as Auth;
        setFirebaseAuth(authInstance);
        const unsubscribe = onAuthStateChanged(authInstance, (user) => {
          if (user) {
            setUser(user);
          } else {
            router.push('/login');
          }
          setLoading(false);
        });
        return () => unsubscribe();
      } else {
        // No Firebase configured, redirect to login
        setLoading(false);
        router.push('/login');
      }
    });
  }, [router]);

  const handleLogout = async () => {
    if (!firebaseAuth) return;
    try {
      await signOut(firebaseAuth);
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navItems: NavItem[] = [
    { href: '/dashboard', label: t('nav.dashboard'), icon: <LayoutDashboard className="h-5 w-5" /> },
    { href: '/dashboard/cases', label: t('nav.cases'), icon: <Ticket className="h-5 w-5" /> },
    { href: '/dashboard/knowledge-base', label: t('nav.knowledgeBase'), icon: <BookOpen className="h-5 w-5" /> },
    { href: '/dashboard/team', label: t('nav.team'), icon: <Users className="h-5 w-5" /> },
    { href: '/dashboard/billing', label: t('nav.billing'), icon: <CreditCard className="h-5 w-5" /> },
    { href: '/dashboard/settings', label: t('nav.settings'), icon: <Settings className="h-5 w-5" /> },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-200 ease-in-out lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center gap-3 border-b px-4">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary via-blue-500 to-purple-500 flex items-center justify-center">
              <Phone className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-sm font-bold tracking-wider uppercase truncate">
                {t('common.appName')}
              </h1>
              <p className="text-xs text-muted-foreground truncate">Command Center</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  'hover:bg-accent hover:text-accent-foreground',
                  'text-muted-foreground'
                )}
                onClick={() => setSidebarOpen(false)}
              >
                {item.icon}
                <span>{item.label}</span>
                <ChevronRight className="ml-auto h-4 w-4 opacity-50" />
              </Link>
            ))}
          </nav>

          {/* User section */}
          <div className="border-t p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-medium text-primary">
                  {user?.displayName?.charAt(0) || user?.email?.charAt(0) || '?'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user?.displayName || 'User'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              {t('auth.logout')}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex-1" />
          
          {/* Status indicator */}
          <div className="flex items-center gap-2 text-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
            </span>
            <span className="text-muted-foreground hidden sm:inline">System Online</span>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
