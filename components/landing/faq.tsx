'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'How does Dandi analyze repositories?',
    answer:
      'Dandi uses the GitHub API to fetch comprehensive repository data and applies advanced algorithms to generate insights. We analyze commit history, pull requests, releases, contributors, and more to create detailed summaries and trends.',
  },
  {
    question: 'What data sources do you use?',
    answer:
      'We exclusively use the official GitHub API to gather data. No private repositories are accessed, and we fully comply with GitHub&apos;s terms of service. All data is processed securely and never shared with third parties.',
  },
  {
    question: 'Can I analyze private repositories?',
    answer:
      'Yes! With Pro and Enterprise plans, you can analyze private repositories that you have access to. Simply connect your GitHub account and we&apos;ll authenticate your access to analyze any repository you own or have permissions to view.',
  },
  {
    question: 'How often are insights updated?',
    answer:
      'Analytics are updated in real-time for active users. Cached data refreshes automatically every 6 hours for repositories not actively being monitored. You can also manually trigger an instant update at any time.',
  },
  {
    question: 'Is my data secure?',
    answer:
      'Security is our top priority. We use enterprise-grade encryption for all data in transit and at rest. Our systems are GDPR compliant, and we never store sensitive information longer than necessary.',
  },
  {
    question: 'Do you offer an API?',
    answer:
      'Yes! Pro and Enterprise plans include API access. You can programmatically fetch repository insights, create custom integrations, and build analytics dashboards. Full documentation is available in our developer portal.',
  },
];

export function FAQ() {
  return (
    <section id="faq" className="w-full py-20 lg:py-28">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about Dandi.
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, idx) => (
            <AccordionItem
              key={idx}
              value={`item-${idx}`}
              className="border border-border/40 rounded-lg px-6 data-[state=open]:bg-primary/5 transition-colors"
            >
              <AccordionTrigger className="text-foreground hover:text-primary transition-colors py-4">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-4">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
