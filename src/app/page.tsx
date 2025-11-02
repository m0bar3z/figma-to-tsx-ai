'use client'

import { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleGenerate = async () => {
    setIsLoading(true)

    const figmaRes = await fetch('/api/figma', { method: 'POST', body: JSON.stringify({ url }), headers: { 'Content-Type': 'application/json' } });
    const figmaData = await figmaRes.json();
    
    if (!figmaRes.ok) throw new Error(figmaData.error);

    console.log("=====figma Result: ", figmaData)
  }


  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    
    <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
      <h1 className="text-2xl font-bold mb-4 text-gray-950 text-center">Figma to Next.js AI Builder</h1>

      <p className="text-sm text-gray-950 mb-4 text-center">Enter Figma URL to generate a Next.js 16 + Tailwind v4 project</p>

      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://www.figma.com/file/..."
        className="w-full p-2 border text-black rounded mb-4"
      />

      <button
        onClick={handleGenerate}
        disabled={!url || isLoading}
        className="w-full bg-blue-500 text-white p-2 rounded disabled:opacity-50"
      >
        {isLoading ? 'Fetching Data...' : 'Click!'}
      </button>

    </div>
  
    </main>
    
  );
}
