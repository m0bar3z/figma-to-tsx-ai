"use client";

import { useEffect, useState } from "react";

export type ModelOption = {
  id: string;
  name: string;
  providers: string[];
};

type ModelSelectorProps = {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
};

export function ModelSelector({ selectedModel, onModelChange }: ModelSelectorProps) {
  const [models, setModels] = useState<ModelOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchModels() {
      try {
        const res = await fetch("/api/models");
        if (!res.ok) throw new Error("Failed to fetch models");
        const data = await res.json();
        setModels(data.models);

        // Set first model as default if none selected
        if (!selectedModel && data.models.length > 0) {
          onModelChange(data.models[0].id);
        }
      } catch (err) {
        setError("Failed to load models");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchModels();
  }, []);

  if (loading) {
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">AI Model</label>
        <div className="w-full p-2 border border-gray-300 rounded bg-gray-100 text-gray-500 animate-pulse">
          Loading models...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">AI Model</label>
        <div className="w-full p-2 border border-red-300 rounded bg-red-50 text-red-600 text-sm">{error}</div>
      </div>
    );
  }

  // Group models by first provider for better organization
  const grouped = models.reduce(
    (acc, model) => {
      const provider = model.providers[0] || "Other";
      if (!acc[provider]) acc[provider] = [];
      acc[provider].push(model);
      return acc;
    },
    {} as Record<string, ModelOption[]>,
  );

  return (
    <div className="mb-4">
      <label htmlFor="model-select" className="block text-sm font-medium text-gray-700 mb-1">
        AI Model ({models.length} available)
      </label>
      <select
        id="model-select"
        value={selectedModel}
        onChange={(e) => onModelChange(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded bg-white text-black focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
      >
        {Object.entries(grouped).map(([provider, providerModels]) => (
          <optgroup key={provider} label={formatProviderName(provider)}>
            {providerModels.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
}

function formatProviderName(provider: string): string {
  return provider
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
