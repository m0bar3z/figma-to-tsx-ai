"use client";

import { useCallback, useEffect, useState } from "react";

export default function Home() {
  const [parsed, setParsed] = useState<{
    fileKey: string;
    nodeId: string | null;
  } | null>(null);

  const [url, setUrl] = useState("");
  const [projectName, setProjectName] = useState("my-figma-app");
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const parseFigmaUrl = useCallback((url: string) => {
    if (!url.trim()) return null;
    try {
      const trimmedUrl = new URL(url.trim());
      if (!trimmedUrl.hostname.endsWith("figma.com")) return null;

      const match = trimmedUrl.pathname.match(/\/(?:file|design|proto|fig|community)\/([a-zA-Z0-9]{22})/);
      if (!match) return null;

      let nodeId = trimmedUrl.searchParams.get("node-id");
      if (nodeId) nodeId = nodeId.replace(/-/g, ":");

      return { fileKey: match[1], nodeId };
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    setParsed(parseFigmaUrl(url));
  }, [url, parseFigmaUrl]);

  const handleGenerate = async () => {
    setIsLoading(true);

    setStatus("Fetching Figma data...");

    try {
      const figmaRes = await fetch("/api/figma", {
        method: "POST",
        body: JSON.stringify({ url }),
        headers: { "Content-Type": "application/json" },
      });
      const figmaData = await figmaRes.json();

      if (!figmaRes.ok) throw new Error(figmaData.error);

      setStatus("Generating AI code...");
      const codeRes = await fetch("/api/generate-code", {
        method: "POST",
        body: JSON.stringify({ figmaJson: figmaData }),
        headers: { "Content-Type": "application/json" },
      });
      const { code } = await codeRes.json();

      if (!codeRes.ok) throw new Error(code.error);

      setStatus("Saving component...");
      const saveRes = await fetch("/api/save-component", {
        method: "POST",
        body: JSON.stringify({ projectName, componentName: "FigmaComponent", code }),
        headers: { "Content-Type": "application/json" },
      });

      if (!saveRes.ok) throw new Error((await saveRes.json()).error);

      setStatus(`Success! Component generated at ./generated/${projectName}/FigmaComponent.tsx`);
    } catch (error) {
      setStatus(`Error: ${(error as Error).message}`);
    }

    setIsLoading(false);
  };

  return (
    <main className="min-h-screen bg-gray-200 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4 text-gray-950 text-center">Figma to Next.js AI Builder</h1>

        <p className="text-sm text-gray-950 mb-4 text-center">Paste Figma URL, Pick Components, Download Code</p>

        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.figma.com/file/..."
          className="w-full p-2 border text-black rounded mb-2"
        />
        {!parsed && url && <p className="text-red-600 text-sm mb-2">Invalid Figma URL</p>}
        {parsed && <p className="text-green-600 text-sm mb-2">Valid → fileKey: {parsed.fileKey}</p>}

        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="Project name (e.g., my-app)"
          className="w-full text-black p-2 border rounded mb-4"
        />

        <button
          onClick={handleGenerate}
          disabled={!url || isLoading}
          className="w-full bg-blue-500 text-white p-2 rounded disabled:opacity-50"
        >
          {isLoading ? "Generating..." : "Generate Project"}
        </button>
        {status && (
          <p
            className={`mt-4 p-2 rounded ${status.includes("Error") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}
          >
            {status}
          </p>
        )}
      </div>
    </main>
  );
}
