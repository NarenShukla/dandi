'use client';

import { Star, TrendingUp, Lightbulb, GitBranch, Package, BarChart3 } from 'lucide-react';

const features = [
  {
    icon: BarChart3,
    title: 'Repository Summary',
    description: 'Get a comprehensive overview of any repository with key metrics, descriptions, and project details at a glance.',
  },
  {
    icon: Star,
    title: 'Star Analytics',
    description: 'Track star growth trends, understand what&apos;s driving engagement, and benchmark against similar projects.',
  },
  {
    icon: Lightbulb,
    title: 'Cool Facts',
    description: 'Discover interesting insights about repositories including contributor stats, language breakdown, and trends.',
  },
  {
    icon: GitBranch,
    title: 'Important Pull Requests',
    description: 'Stay updated on the most significant PRs, recent merges, and ongoing development activity instantly.',
  },
  {
    icon: Package,
    title: 'Version Updates',
    description: 'Never miss a release. Get notified about new versions, breaking changes, and important patches.',
  },
  {
    icon: TrendingUp,
    title: 'Trend Analysis',
    description: 'Understand project momentum with detailed trend analysis and growth projections.',
  },
];

export function Features() {
  return (
    <section id="features" className="w-full py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            Powerful Insights at Your Fingertips
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to understand open source projects deeply and make informed decisions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="group p-6 rounded-lg border border-border/40 bg-card hover:bg-primary/5 transition-all duration-300 hover:border-primary/20"
              >
                <div className="mb-4 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
