'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowRight, BookOpen, Code2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Spinner } from '@/components/ui/spinner';

const STATIC_REQUEST = {
  githubUrl: 'https://github.com/langchain-ai/langchain',
};

const STATIC_RESPONSE = {
  summary:
    'LangChain is a framework designed for building agents and applications powered by large language models (LLMs). It allows developers to chain together various components and third-party integrations, simplifying the development of AI applications while ensuring adaptability to evolving technologies. The framework supports rapid prototyping, model interoperability, and offers production-ready features, making it suitable for both standalone use and integration with other LangChain products.',
  cool_facts: [
    'LangChain supports real-time data augmentation by connecting LLMs to diverse data sources.',
    'It allows for model interoperability, enabling developers to swap models easily as needed.',
    'The framework promotes rapid prototyping with a modular architecture for quick iteration on LLM applications.',
    'LangChain includes built-in support for monitoring, evaluation, and debugging through integrations like LangSmith.',
    'It has a vibrant community and ecosystem, providing a rich library of integrations and community-contributed components.',
  ],
  stars: 132223,
  latest_version: 'langchain-core==1.2.25',
  website_url: 'https://docs.langchain.com/langchain/',
  license: 'MIT',
};

const REQUEST_DISPLAY = JSON.stringify(STATIC_REQUEST, null, 2);
const RESPONSE_DISPLAY = JSON.stringify(STATIC_RESPONSE, null, 2);

const preBoxClass =
  'max-h-[280px] min-h-[160px] overflow-auto rounded-lg border border-border/40 bg-muted/20 p-4 font-mono text-xs text-foreground whitespace-pre-wrap break-words lg:max-h-[min(420px,calc(100vh-20rem))]';

export function GithubSummarizerDemo() {
  const router = useRouter();
  const { status } = useSession();

  function tryItOut() {
    if (status === 'authenticated') {
      router.push('/playground');
      return;
    }
    if (status === 'unauthenticated') {
      router.push(`/api/auth/signin?callbackUrl=${encodeURIComponent('/playground')}`);
    }
  }

  const isSessionLoading = status === 'loading';

  return (
    <section id="api-demo" className="w-full py-20 lg:py-28 bg-card/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            Try the GitHub Summarizer API
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {status === 'authenticated' ? (
              <>
                Below is a sample request and response. Open the playground to run the API against
                real repositories.
              </>
            ) : (
              <>
                Below is a sample request and response. Open the playground to run the API against
                real repositories with your account.
              </>
            )}
          </p>
        </div>

        <Card className="max-w-5xl mx-auto border-border/40 bg-background shadow-sm">
          <CardHeader className="border-b border-border/40 pb-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Code2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">Check GitHub Summarizer</CardTitle>
                  <CardDescription className="mt-1.5">
                    {status === 'authenticated'
                      ? 'Example payload and response. Click "Try it out" Button below, to open the playground.'
                      : 'Example payload and response. Try it live after you sign in.'}
                  </CardDescription>
                </div>
              </div>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="border-primary/20 shrink-0">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Documentation
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-full overflow-y-auto sm:max-w-md">
                  <SheetHeader>
                    <SheetTitle>GitHub Summarizer API</SheetTitle>
                    <SheetDescription>
                      Use the playground for authenticated, live calls. Integrations should use the
                      production API with your own key.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6 space-y-4 px-4 text-sm text-muted-foreground">
                    <div>
                      <p className="font-medium text-foreground">Try it live</p>
                      <p className="mt-1">
                        After signing in, use the{' '}
                        <Link
                          href="/playground"
                          className="font-medium text-primary underline-offset-4 hover:underline"
                        >
                          Playground
                        </Link>{' '}
                        to call the summarizer with your session.
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Production API</p>
                      <p className="mt-1 font-mono text-xs break-all">POST /api/github-summarizer</p>
                      <ul className="mt-2 list-inside list-disc space-y-1 font-mono text-xs">
                        <li>Content-Type: application/json</li>
                        <li>x-api-key: your_api_key</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Body</p>
                      <pre className="mt-2 overflow-x-auto rounded-md border border-border/40 bg-muted/40 p-3 font-mono text-xs">
                        {`{
  "githubUrl": "https://github.com/owner/repo"
}`}
                      </pre>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Response (200)</p>
                      <pre className="mt-2 overflow-x-auto rounded-md border border-border/40 bg-muted/40 p-3 font-mono text-xs">
                        {`{
  "summary": "…",
  "cool_facts": ["…"]
}`}
                      </pre>
                    </div>
                    <p>
                      Create and manage keys in{' '}
                      <Link
                        href="/dashboards"
                        className="font-medium text-primary underline-offset-4 hover:underline"
                      >
                        Dashboards
                      </Link>
                      .
                    </p>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:grid-rows-[auto_minmax(0,1fr)] lg:gap-x-8 lg:gap-y-4">
              <h3 className="text-sm font-semibold text-foreground lg:col-start-1 lg:row-start-1">
                Request
              </h3>
              <div className="flex flex-col gap-4 lg:col-start-1 lg:row-start-2 lg:min-h-0">
                <div className="space-y-2">
                  <p className="text-sm font-medium leading-none text-foreground">Body (JSON)</p>
                  <pre
                    className={`${preBoxClass} min-h-[160px] lg:min-h-[220px]`}
                    aria-label="Example request body"
                  >
                    {REQUEST_DISPLAY}
                  </pre>
                </div>
                <Button
                  type="button"
                  className="w-fit bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={isSessionLoading}
                  onClick={tryItOut}
                >
                  {isSessionLoading ? (
                    <>
                      <Spinner className="mr-2" />
                      Loading…
                    </>
                  ) : (
                    <>
                      <ArrowRight className="mr-2 h-4 w-4" />
                      Try it out
                    </>
                  )}
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-2 border-t border-border/40 pt-6 lg:col-start-2 lg:row-start-1 lg:border-t-0 lg:pt-0">
                <h3 className="text-sm font-semibold text-foreground">Response</h3>
                <Badge variant="default" className="font-mono">
                  200
                </Badge>
              </div>
              <pre
                className={`${preBoxClass} lg:col-start-2 lg:row-start-2`}
                aria-label="Example response body"
              >
                {RESPONSE_DISPLAY}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
