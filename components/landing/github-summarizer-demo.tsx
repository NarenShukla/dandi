'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Code2, Send } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';

const DEFAULT_BODY = `{
  "githubUrl": "https://github.com/langchain-ai/langchain"
}`;

const DEMO_API_PATH = '/api/demo/github-summarizer';

export function GithubSummarizerDemo() {
  const [payload, setPayload] = useState(DEFAULT_BODY);
  const [loading, setLoading] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [status, setStatus] = useState<number | null>(null);

  async function send() {
    setLoading(true);
    setStatus(null);
    setResponseText('');

    let parsed: unknown;
    try {
      parsed = JSON.parse(payload);
    } catch {
      setResponseText(JSON.stringify({ error: 'Invalid JSON in request body' }, null, 2));
      setStatus(400);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(DEMO_API_PATH, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parsed),
      });
      const text = await res.text();
      let pretty = text;
      try {
        pretty = JSON.stringify(JSON.parse(text), null, 2);
      } catch {
        // keep raw body
      }
      setStatus(res.status);
      setResponseText(pretty);
    } catch (e) {
      setStatus(0);
      setResponseText(
        JSON.stringify({ error: e instanceof Error ? e.message : 'Network error' }, null, 2),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="api-demo" className="w-full py-20 lg:py-28 bg-card/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            Try the GitHub Summarizer API
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Send a POST request with a repository URL, then inspect the summary and cool facts in
            the response—just like your favorite API client.
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
                    Editable JSON body and live response from this deployment.
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
                      This page calls a demo route that uses a server-side key. Integrations should
                      use the production API with your own key.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6 space-y-4 px-4 text-sm text-muted-foreground">
                    <div>
                      <p className="font-medium text-foreground">Interactive demo (this page)</p>
                      <p className="mt-1 font-mono text-xs break-all">POST /api/demo/github-summarizer</p>
                      <p className="mt-1 text-xs">Headers: <span className="font-mono">Content-Type: application/json</span> only.</p>
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
                  <Label htmlFor="github-summarizer-body">Body (JSON)</Label>
                  <Textarea
                    id="github-summarizer-body"
                    value={payload}
                    onChange={(e) => setPayload(e.target.value)}
                    spellCheck={false}
                    className="min-h-[160px] font-mono text-sm lg:min-h-[220px]"
                  />
                </div>
                <Button
                  type="button"
                  className="w-fit bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={loading}
                  onClick={send}
                >
                  {loading ? (
                    <>
                      <Spinner className="mr-2" />
                      Sending…
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send
                    </>
                  )}
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-2 border-t border-border/40 pt-6 lg:col-start-2 lg:row-start-1 lg:border-t-0 lg:pt-0">
                <h3 className="text-sm font-semibold text-foreground">Response</h3>
                {status !== null && (
                  <Badge variant={status === 200 ? 'default' : 'destructive'} className="font-mono">
                    {status === 0 ? 'Error' : status}
                  </Badge>
                )}
              </div>
              <pre className="max-h-[280px] min-h-[160px] overflow-auto rounded-lg border border-border/40 bg-muted/20 p-4 font-mono text-xs text-foreground whitespace-pre-wrap break-words lg:col-start-2 lg:row-start-2 lg:max-h-[min(420px,calc(100vh-20rem))]">
                {responseText || 'Send a request to see the response here.'}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
