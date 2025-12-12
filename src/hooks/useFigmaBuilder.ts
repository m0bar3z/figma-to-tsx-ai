"use client";

import saveAs from "file-saver";
import JSZip from "jszip";
import { useCallback, useEffect, useState } from "react";

type ParsedUrl = { fileKey: string; nodeId: string | null };
type ComponentSummary = { id: string; name: string };
type GeneratedFile = { name: string; code: string };

function parseFigmaUrl(url: string): ParsedUrl | null {
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
}

function collectComponents(node: any, result: ComponentSummary[] = []) {
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

function toPascalCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .replace(/\w+/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
    .replace(/ /g, "");
}

export function useFigmaBuilder() {
  const [url, setUrl] = useState("");
  const [projectName, setProjectName] = useState("my-figma-app");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const [parsed, setParsed] = useState<ParsedUrl | null>(null);
  const [figmaData, setFigmaData] = useState<any>(null);
  const [components, setComponents] = useState<ComponentSummary[]>([]);
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [generated, setGenerated] = useState<GeneratedFile[]>([]);

  useEffect(() => {
    setParsed(parseFigmaUrl(url));
    setFigmaData(null);
    setComponents([]);
    setGenerated([]);
    setSelectedIds(new Set());
  }, [url]);

  const loadFile = useCallback(async () => {
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

      const comps: ComponentSummary[] = [];
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
  }, [parsed]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(components.map((c) => c.id)));
  }, [components]);

  const generateSelected = useCallback(async () => {
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

      const gens: GeneratedFile[] = [];
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
  }, [parsed, selectedIds, components]);

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    setStatus("Copied!");
  }, []);

  const downloadSingle = useCallback((filename: string, code: string) => {
    const blob = new Blob([code], { type: "text/tsx" });
    saveAs(blob, filename);
  }, []);

  const downloadZip = useCallback(async () => {
    const zip = new JSZip();
    const folder = zip.folder(projectName || "figma-components");
    generated.forEach((g) => folder?.file(g.name, g.code));
    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, `${projectName || "figma-components"}.zip`);
  }, [generated, projectName]);

  return {
    url,
    setUrl,
    projectName,
    setProjectName,
    parsed,
    status,
    loading,
    figmaData,
    components,
    thumbnails,
    selectedIds,
    generated,
    loadFile,
    toggleSelect,
    selectAll,
    generateSelected,
    copyToClipboard,
    downloadSingle,
    downloadZip,
  };
}

