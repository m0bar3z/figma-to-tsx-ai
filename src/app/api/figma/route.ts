import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json();
  const { url, fileKey } = body;

  const extractFromUrl = (u?: string) => {
    if (!u) return null;
    const patterns = [
      /\/(?:file|design)\/([^\/\?]+)/,        // web/design URL
      /\/files\/([^\/\?]+)/                   // api/v1/files/
    ];
    for (const p of patterns) {
      const m = u.match(p);
      if (m && m[1]) return m[1];
    }
    return null;
  };

  const extractedFileKey = fileKey ?? extractFromUrl(url);

  if (!extractedFileKey) {
    return NextResponse.json(
      { error: 'Invalid Figma URL or missing fileKey. Provide a Figma file URL or fileKey.' },
      { status: 400 }
    );
  }

  const token = process.env.FIGMA_TOKEN;
  if (!token) {
    console.error('Missing FIGMA_TOKEN env var');
    return NextResponse.json({ error: 'Server misconfiguration: missing FIGMA_TOKEN' }, { status: 500 });
  }

  const apiUrl = `https://api.figma.com/v1/files/${fileKey}`;

  try {
    const res = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'X-Figma-Token': token,
        'Accept': 'application/json',
      },
    });
    const data = await res.json();

    if (!res.ok) {
      console.error('Figma API returned non-2xx', res.status, data);

      return NextResponse.json({ error: 'Figma API error', status: res.status, details: data }, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('Fetch to Figma failed:', err);

    return NextResponse.json({ error: 'Failed to fetch Figma data' }, { status: 500 });
  }
}