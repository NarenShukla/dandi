'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import type { Session } from 'next-auth';
import { Button } from '@/components/ui/button';
import { GitBranch } from 'lucide-react';

type HeaderProps = {
  session?: Session | null;
  /** `landing` uses in-page anchors; `site` links to sections on the home page. */
  navVariant?: 'landing' | 'site';
};

export function Header({ session = null, navVariant = 'landing' }: HeaderProps) {
  const pathname = usePathname();
  const user = session?.user;
  const featuresHref = navVariant === 'site' ? '/#features' : '#features';
  const pricingHref = navVariant === 'site' ? '/#pricing' : '#pricing';
  const faqHref = navVariant === 'site' ? '/#faq' : '#faq';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-3">
          <Link href="/" className="group flex shrink-0 items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-primary transition-transform group-hover:scale-110">
              <GitBranch className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">Dandi</span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <Link
              href={featuresHref}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Features
            </Link>
            <Link
              href={pricingHref}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Pricing
            </Link>
            <Link
              href={faqHref}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              FAQ
            </Link>
          </nav>

          <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-x-3 gap-y-2 sm:flex-initial sm:gap-4">
            {user ? (
              <>
                <nav
                  className="flex items-center gap-3 border-border/60 sm:border-r sm:pr-4"
                  aria-label="Account shortcuts"
                >
                  <Link
                    href="/dashboards"
                    className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                    aria-current={pathname === '/dashboards' ? 'page' : undefined}
                  >
                    Dashboards
                  </Link>
                  <Link
                    href="/protected"
                    className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                    aria-current={pathname === '/protected' ? 'page' : undefined}
                  >
                    Protected
                  </Link>
                </nav>
                <div className="flex min-w-0 max-w-[min(100%,14rem)] items-center gap-2 sm:max-w-[18rem]">
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt={
                        user.name
                          ? `${user.name} profile picture`
                          : 'Your profile picture'
                      }
                      width={32}
                      height={32}
                      className="shrink-0 rounded-full ring-2 ring-border"
                    />
                  ) : null}
                  <div className="min-w-0 leading-tight">
                    <p className="truncate text-sm font-medium text-foreground">
                      {user.name ?? user.email ?? 'Account'}
                    </p>
                    {user.email && user.name ? (
                      <p className="hidden truncate text-xs text-muted-foreground sm:block">
                        {user.email}
                      </p>
                    ) : null}
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="shrink-0" asChild>
                  <Link href="/api/auth/signout">Sign out</Link>
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/api/auth/signin">Sign In</Link>
                </Button>
                <Button
                  size="sm"
                  className="bg-primary hover:bg-primary/90"
                  asChild
                >
                  <Link href="/api/auth/signin">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
