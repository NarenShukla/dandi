import type { ReactNode } from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { Header } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';

export default async function PlaygroundLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);

  return (
    <main className="min-h-screen bg-background">
      <Header session={session} navVariant="site" />
      {children}
      <Footer />
    </main>
  );
}
