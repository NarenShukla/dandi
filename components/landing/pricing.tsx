'use client';

import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    description: 'Perfect for getting started',
    price: '0',
    features: [
      'Up to 10 repository analyses per month',
      'Basic insights (summaries & stars)',
      'Email support',
      'Community access',
    ],
    cta: 'Get Started',
    highlighted: false,
  },
  {
    name: 'Pro',
    description: 'For active developers',
    price: '29',
    features: [
      'Unlimited repository analyses',
      'All insights including PR & version tracking',
      'Priority email support',
      'Advanced analytics & trends',
      'Custom alerts & notifications',
      'API access',
    ],
    cta: 'Start Free Trial',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    description: 'For teams & organizations',
    price: 'Custom',
    features: [
      'Everything in Pro',
      'Dedicated account manager',
      'SSO & advanced security',
      'Custom integrations',
      'Team collaboration tools',
      'SLA guarantee',
    ],
    cta: 'Contact Sales',
    highlighted: false,
  },
];

export function Pricing() {
  const handleCTA = (planName: string) => {
    if (planName === 'Enterprise') {
      window.open('mailto:hello@dandi.app', '_blank');
    } else {
      // Redirect to sign up
      window.location.href = '/auth/signup';
    }
  };

  return (
    <section id="pricing" className="w-full py-20 lg:py-28 bg-card/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the perfect plan for your needs. Always flexible, always fair.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`relative rounded-lg border transition-all duration-300 ${
                plan.highlighted
                  ? 'border-primary/40 bg-primary/5 md:scale-105 shadow-xl'
                  : 'border-border/40 bg-background hover:border-primary/20'
              } p-8`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-bold text-foreground">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  {plan.price !== 'Custom' && <span className="text-muted-foreground">/month</span>}
                </div>
              </div>

              <Button
                className={`w-full mb-8 ${
                  plan.highlighted
                    ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                    : 'border border-primary/20 text-foreground hover:bg-primary/5'
                }`}
                variant={plan.highlighted ? 'default' : 'outline'}
                onClick={() => handleCTA(plan.name)}
              >
                {plan.cta}
              </Button>

              <div className="space-y-3">
                {plan.features.map((feature, fidx) => (
                  <div key={fidx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-muted-foreground">
            All plans include a 14-day free trial. No credit card required.
          </p>
        </div>
      </div>
    </section>
  );
}
