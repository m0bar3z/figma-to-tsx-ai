"use client";

import { ComponentGallery } from "../components/ComponentGallery";
import { GeneratedOutput } from "../components/GeneratedOutput";
import { useFigmaBuilder } from "../hooks/useFigmaBuilder";

export default function Home() {
  const {
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
  } = useFigmaBuilder();

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
            onClick={loadFile}
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
            onGenerate={generateSelected}
          />
        )}

        {generated.length > 0 && (
          <GeneratedOutput
            files={generated}
            onCopy={copyToClipboard}
            onDownloadSingle={downloadSingle}
            onDownloadAll={downloadZip}
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
