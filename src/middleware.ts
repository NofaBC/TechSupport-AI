import createMiddleware from 'next-intl/middleware';
import { locales } from './i18n';

export default createMiddleware({
  locales,
  defaultLocale: 'en',
  localePrefix: 'always',
});

export const config = {
  // Match all paths except static files and API routes
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
