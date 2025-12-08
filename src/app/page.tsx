"use client";
import saveAs from "file-saver";
import JSZip from "jszip";
import { useCallback, useEffect, useState } from "react";
import { ComponentGallery } from "../components/ComponentGallery";

export default function Home() {
  const [url, setUrl] = useState("");
  const [projectName, setProjectName] = useState("my-figma-app");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const [parsed, setParsed] = useState<{
    fileKey: string;
    nodeId: string | null;
  } | null>(null);
  const [figmaData, setFigmaData] = useState<any>(null);
  const [components, setComponents] = useState<Array<{ id: string; name: string }>>([]);
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [generated, setGenerated] = useState<Array<{ name: string; code: string }>>([]);

  const parseFigmaUrl = useCallback((url: string): { fileKey: string; nodeId: string | null } | null => {
    if (!url.trim()) return null;
    try {
      const u = new URL(url.trim());
      if (!u.hostname.endsWith("figma.com")) return null;
      const match = u.pathname.match(/\/(?:file|design|proto|fig|community)\/([a-zA-Z0-9]{22})/);
      if (!match) return null;
      let nodeId = u.searchParams.get("node-id");
      if (nodeId) nodeId = nodeId.replace(/-/g, ":");
      return { fileKey: match[1], nodeId };
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    setParsed(parseFigmaUrl(url));
    setFigmaData(null);
    setComponents([]);
    setGenerated([]);
    setSelectedIds(new Set());
  }, [url, parseFigmaUrl]);

  const handleLoadFile = async () => {
    if (!parsed) return;
    setLoading(true);
    setStatus("Fetching Figma file...");
    try {
      const res = await fetch("/api/figma", {
        method: "POST",
        body: JSON.stringify({ fileKey: parsed.fileKey }),
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      const data = await res.json();
      setFigmaData(data);

      const comps: Array<{ id: string; name: string }> = [];
      data.document.children.forEach((page: any) => {
        collectComponents(page, comps);
      });
      setComponents(comps);
      if (comps.length === 0) throw new Error("No frames/components found");

      const nodeIds = comps.map((c) => c.id);
      const imgRes = await fetch("/api/figma-images", {
        method: "POST",
        body: JSON.stringify({ fileKey: parsed.fileKey, nodeIds }),
        headers: { "Content-Type": "application/json" },
      });
      if (imgRes.ok) {
        const imgs = await imgRes.json();
        setThumbnails(imgs);
      }

      if (parsed.nodeId) {
        const pre = comps.find((c) => c.id === parsed.nodeId);
        if (pre) setSelectedIds(new Set([pre.id]));
      }

      setStatus(`Loaded ${comps.length} components`);
    } catch (error: any) {
      setStatus(`Error: ${error.message}`);
    }
    setLoading(false);
  };

  function collectComponents(node: any, result: Array<{ id: string; name: string }> = []) {
    if (!node || node.visible === false) return;
    const isSelectable =
      ["FRAME", "COMPONENT", "COMPONENT_SET"].includes(node.type) &&
      node.children?.length > 0 &&
      !node.name.startsWith("_");
    if (isSelectable) {
      result.push({ id: node.id, name: node.name || "Unnamed" });
    }
    node.children?.forEach((child: any) => collectComponents(child, result));
  }

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const selectAll = () => setSelectedIds(new Set(components.map((c) => c.id)));

  const handleGenerateMultiple = async () => {
    if (selectedIds.size === 0 || !parsed) return;
    setLoading(true);
    setGenerated([]);
    setStatus("Fetching selected nodes...");

    try {
      const selIds = Array.from(selectedIds);
      const nodesRes = await fetch("/api/figma", {
        method: "POST",
        body: JSON.stringify({ fileKey: parsed.fileKey, nodeIds: selIds }),
        headers: { "Content-Type": "application/json" },
      });
      if (!nodesRes.ok) throw new Error("Failed to fetch nodes");
      const nodesData = await nodesRes.json();

      const gens: Array<{ name: string; code: string }> = [];
      for (let i = 0; i < selIds.length; i++) {
        const id = selIds[i];
        const nodeInfo = nodesData.nodes[id];
        if (!nodeInfo) continue;
        const figmaJson = nodeInfo.document;
        const compName = components.find((c) => c.id === id)?.name || "Component";

        setStatus(`Generating ${compName} (${i + 1}/${selIds.length})...`);

        const codeRes = await fetch("/api/generate-code", {
          method: "POST",
          body: JSON.stringify({ figmaJson, componentName: compName }),
          headers: { "Content-Type": "application/json" },
        });
        if (!codeRes.ok) throw new Error("Code generation failed");
        const { code } = await codeRes.json();

        const fileName = toPascalCase(compName) + ".tsx";
        gens.push({ name: fileName, code });
      }
      setGenerated(gens);
      setStatus(`Success! ${gens.length} components generated`);
    } catch (error: any) {
      setStatus(`Error: ${error.message}`);
    }
    setLoading(false);
  };

  function toPascalCase(str: string): string {
    return str
      .replace(/[^a-zA-Z0-9]+/g, " ")
      .replace(/\w+/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
      .replace(/ /g, "");
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setStatus("Copied!");
  };

  const downloadSingle = (filename: string, code: string) => {
    const blob = new Blob([code], { type: "text/tsx" });
    saveAs(blob, filename);
  };

  const downloadZip = async () => {
    const zip = new JSZip();
    const folder = zip.folder(projectName || "figma-components");
    generated.forEach((g) => folder?.file(g.name, g.code));
    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, `${projectName || "figma-components"}.zip`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">Figma → Next.js AI Builder</h1>

        <p className="text-sm text-gray-600 mb-4 text-center">Paste Figma URL → pick components → download code</p>

        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.figma.com/design/..."
          className={`w-full p-2 border rounded mb-2 ${parsed ? "border-green-500" : url ? "border-red-500" : "border-gray-300"} text-black`}
        />
        {!parsed && url && <p className="text-red-600 text-sm mb-2">Invalid Figma URL</p>}
        {parsed && <p className="text-green-600 text-sm mb-2">Valid → fileKey: {parsed.fileKey}</p>}

        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="Project name"
          className="w-full p-2 border rounded mb-4 text-black"
        />

        {parsed && !figmaData && (
          <button
            onClick={handleLoadFile}
            disabled={loading}
            className="w-full bg-purple-600 text-white p-2 rounded mb-4 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Load Figma File"}
          </button>
        )}

        {components.length > 0 && (
          <ComponentGallery
            components={components}
            thumbnails={thumbnails}
            selectedIds={selectedIds}
            loading={loading}
            onSelectAll={selectAll}
            onToggleSelect={toggleSelect}
            onGenerate={handleGenerateMultiple}
          />
        )}

        {status && (
          <p
            className={`mt-4 p-3 rounded ${status.includes("Error") || status.includes("Invalid") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}
          >
            {status}
          </p>
        )}
      </div>
    </div>
  );
}
