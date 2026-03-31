import { NextResponse } from 'next/server';

/**
 * Landing-page demo: forwards to /api/github-summarizer using DEMO_SUMMARIZER_API_KEY
 * from the server environment (never sent to the browser).
 */
export async function POST(request) {
  const key =
    typeof process.env.DEMO_SUMMARIZER_API_KEY === 'string'
      ? process.env.DEMO_SUMMARIZER_API_KEY.trim()
      : '';
  if (!key) {
    return NextResponse.json(
      { error: 'Demo summarizer is not configured (missing DEMO_SUMMARIZER_API_KEY).' },
      { status: 503 },
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const url = new URL(request.url);
  const target = `${url.origin}/api/github-summarizer`;

  const res = await fetch(target, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  const contentType = res.headers.get('content-type') || 'application/json';
  return new NextResponse(text, {
    status: res.status,
    headers: { 'Content-Type': contentType },
  });
}
