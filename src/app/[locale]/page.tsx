import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { Phone, Monitor, Users, Zap, Globe, Shield } from 'lucide-react';

export default function HomePage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const t = useTranslations();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary via-blue-500 to-purple-500 flex items-center justify-center">
              <Phone className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-wider uppercase">{t('common.appName')}</h1>
              <p className="text-xs text-muted-foreground">Support Command Center</p>
            </div>
          </div>
          
          <nav className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {t('auth.login')}
            </Link>
            <Link 
              href="/signup" 
              className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              {t('auth.signup')}
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-bg">
        <div className="container px-4 py-24 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-background/50 px-4 py-2 text-sm backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
              </span>
              AI-Powered Support • L1 → L2 → L3 Workflow
            </div>
            
            <h2 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Need product support?{' '}
              <span className="bg-gradient-to-r from-primary via-blue-500 to-purple-500 bg-clip-text text-transparent">
                Call us and the magic starts.
              </span>
            </h2>
            
            <p className="mb-8 text-lg text-muted-foreground md:text-xl">
              TechSupport AI™ answers calls as a Level 1 agent, triages and resolves common issues, 
              and seamlessly escalates to Level 2 with VisionScreen™ guided support when needed.
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link 
                href="/signup" 
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Zap className="h-4 w-4" />
                Get Started Free
              </Link>
              <Link 
                href="/login" 
                className="inline-flex items-center justify-center gap-2 rounded-lg border bg-background px-6 py-3 text-sm font-medium hover:bg-accent transition-colors"
              >
                View Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container px-4 py-24">
        <div className="mx-auto max-w-5xl">
          <h3 className="mb-12 text-center text-3xl font-bold">Three-Tier Support System</h3>
          
          <div className="grid gap-8 md:grid-cols-3">
            {/* L1 */}
            <div className="rounded-2xl border bg-card p-6">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900">
                <Phone className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h4 className="mb-2 text-xl font-semibold">{t('levels.L1')}</h4>
              <p className="mb-4 text-sm text-muted-foreground">{t('levels.L1Description')}</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                  Twilio voice call entry
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                  Playbook-driven triage
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                  Safe, scripted fixes
                </li>
              </ul>
            </div>

            {/* L2 */}
            <div className="rounded-2xl border bg-card p-6">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900">
                <Monitor className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <h4 className="mb-2 text-xl font-semibold">{t('levels.L2')}</h4>
              <p className="mb-4 text-sm text-muted-foreground">{t('levels.L2Description')}</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                  VisionScreen™ screen share
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                  Step-by-step guidance
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                  Camera fallback mode
                </li>
              </ul>
            </div>

            {/* L3 */}
            <div className="rounded-2xl border bg-card p-6">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900">
                <Users className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h4 className="mb-2 text-xl font-semibold">{t('levels.L3')}</h4>
              <p className="mb-4 text-sm text-muted-foreground">{t('levels.L3Description')}</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
                  Auto escalation packet
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
                  Full case history
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
                  Human agent handoff
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="border-t bg-muted/30">
        <div className="container px-4 py-24">
          <div className="mx-auto max-w-5xl">
            <h3 className="mb-12 text-center text-3xl font-bold">Key Capabilities</h3>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex items-start gap-4 rounded-xl border bg-card p-4">
                <Globe className="h-8 w-8 text-primary shrink-0" />
                <div>
                  <h4 className="font-semibold">Multilingual</h4>
                  <p className="text-sm text-muted-foreground">EN • FR • DE • IT • 中文 • فارسی with RTL support</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 rounded-xl border bg-card p-4">
                <Shield className="h-8 w-8 text-primary shrink-0" />
                <div>
                  <h4 className="font-semibold">Privacy First</h4>
                  <p className="text-sm text-muted-foreground">PII redaction, opt-in VisionScreen, audit trails</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 rounded-xl border bg-card p-4">
                <Zap className="h-8 w-8 text-primary shrink-0" />
                <div>
                  <h4 className="font-semibold">Knowledge Base</h4>
                  <p className="text-sm text-muted-foreground">Train AI on your docs with RAG retrieval</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="container flex flex-col items-center justify-between gap-4 px-4 py-8 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} TechSupport AI™ — Invention Date: 12/15/2025
          </p>
          <p className="text-sm text-muted-foreground">
            Built for NOFA AI Factory
          </p>
        </div>
      </footer>
    </div>
  );
}
