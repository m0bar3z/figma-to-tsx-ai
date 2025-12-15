"use client";

export type ModelOption = {
  id: string;
  name: string;
  provider: string;
};

export const AVAILABLE_MODELS: ModelOption[] = [
  { id: "openai/gpt-4o", name: "GPT-4o", provider: "OpenAI" },
  { id: "openai/gpt-4o-mini", name: "GPT-4o Mini", provider: "OpenAI" },
  { id: "anthropic/claude-sonnet-4", name: "Claude Sonnet 4", provider: "Anthropic" },
  { id: "google/gemini-2.0-flash-001", name: "Gemini 2.0 Flash", provider: "Google" },
  { id: "meta-llama/Llama-3.3-70B-Instruct", name: "Llama 3.3 70B", provider: "Meta" },
  { id: "mistralai/Mistral-Small-24B-Instruct-2501", name: "Mistral Small 24B", provider: "Mistral" },
  { id: "Qwen/Qwen2.5-72B-Instruct", name: "Qwen 2.5 72B", provider: "Qwen" },
  { id: "deepseek-ai/DeepSeek-R1", name: "DeepSeek R1", provider: "DeepSeek" },
];

type ModelSelectorProps = {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
};

export function ModelSelector({ selectedModel, onModelChange }: ModelSelectorProps) {
  const grouped = AVAILABLE_MODELS.reduce(
    (acc, model) => {
      if (!acc[model.provider]) acc[model.provider] = [];
      acc[model.provider].push(model);
      return acc;
    },
    {} as Record<string, ModelOption[]>,
  );

  return (
    <div className="mb-4">
      <label htmlFor="model-select" className="block text-sm font-medium text-gray-700 mb-1">
        AI Model
      </label>
      <select
        id="model-select"
        value={selectedModel}
        onChange={(e) => onModelChange(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded bg-white text-black focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
      >
        {Object.entries(grouped).map(([provider, models]) => (
          <optgroup key={provider} label={provider}>
            {models.map((model) => (
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

