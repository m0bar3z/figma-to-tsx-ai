import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { fileKey, nodeIds } = await req.json();
  if (!fileKey || !Array.isArray(nodeIds) || nodeIds.length === 0) {
    return NextResponse.json({ error: "Missing fileKey or nodeIds" }, { status: 400 });
  }

  const token = process.env.FIGMA_TOKEN;
  if (!token) return NextResponse.json({ error: "Missing FIGMA_TOKEN" }, { status: 500 });

  const ids = nodeIds.map((id: string) => encodeURIComponent(id)).join(",");
  const apiUrl = `https://api.figma.com/v1/images/${fileKey}?ids=${ids}&format=svg`;

  try {
    const res = await fetch(apiUrl, { headers: { "X-Figma-Token": token } });
    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: "Figma images error" }, { status: res.status });
    return NextResponse.json(data.images || {});
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch images" }, { status: 500 });
  }
}
