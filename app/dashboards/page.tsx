import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { Header } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';
import DashboardPage from './DashboardPage';

export default async function DashboardsRoute() {
  const session = await getServerSession(authOptions);

  return (
    <main className="min-h-screen bg-background">
      <Header session={session} navVariant="site" />
      <DashboardPage />
      <Footer />
    </main>
  );
}
