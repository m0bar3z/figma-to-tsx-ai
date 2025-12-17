import { NextResponse } from "next/server";

type HFModel = {
  id: string;
  modelId?: string;
  pipeline_tag?: string;
  inference?: {
    providers?: string[];
  };
  inference_provider_mapping?: Record<string, unknown>;
  [key: string]: unknown;
};

type ModelOption = {
  id: string;
  name: string;
  providers: string[];
};

// Fallback models if API fails
const FALLBACK_MODELS: ModelOption[] = [
  { id: "openai/gpt-4o", name: "GPT-4o", providers: ["OpenAI"] },
  { id: "openai/gpt-4o-mini", name: "GPT-4o Mini", providers: ["OpenAI"] },
  { id: "anthropic/claude-sonnet-4", name: "Claude Sonnet 4", providers: ["Anthropic"] },
  { id: "google/gemini-2.0-flash-001", name: "Gemini 2.0 Flash", providers: ["Google"] },
  { id: "meta-llama/Llama-3.3-70B-Instruct", name: "Llama 3.3 70B Instruct", providers: ["Meta"] },
  { id: "mistralai/Mistral-Small-24B-Instruct-2501", name: "Mistral Small 24B", providers: ["Mistral"] },
  { id: "Qwen/Qwen2.5-72B-Instruct", name: "Qwen 2.5 72B Instruct", providers: ["Qwen"] },
];

function formatModelName(id: string): string {
  const parts = id.split("/");
  const name = parts.length > 1 ? parts[parts.length - 1] : id;
  return name
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/(\d+)b/gi, "$1B")
    .replace(/instruct/gi, "Instruct")
    .replace(/chat/gi, "Chat");
}

function extractProvider(id: string): string {
  const parts = id.split("/");
  if (parts.length > 1) {
    const provider = parts[0];
    return provider
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }
  return "HuggingFace";
}

export async function GET() {
  try {
    const url = new URL("https://huggingface.co/api/models");
    url.searchParams.set("inference_provider", "all");
    url.searchParams.set("pipeline_tag", "text-generation");
    url.searchParams.set("sort", "downloads");
    url.searchParams.set("direction", "-1");
    url.searchParams.set("limit", "100");

    const res = await fetch(url.toString(), {
      headers: {
        ...(process.env.HF_TOKEN && { Authorization: `Bearer ${process.env.HF_TOKEN}` }),
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      console.warn(`HF API returned ${res.status}: ${res.statusText}, using fallback models`);
      return NextResponse.json({ models: FALLBACK_MODELS });
    }

    const data: HFModel[] = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      console.warn("HF API returned empty or invalid data, using fallback models");
      return NextResponse.json({ models: FALLBACK_MODELS });
    }

    // Process models - filter for those with inference providers
    const modelsMap = new Map<string, ModelOption>();

    data.forEach((m) => {
      const modelId = m.modelId || m.id;
      
      // Check if model has inference providers
      const hasInferenceProvider = 
        (m.inference?.providers && m.inference.providers.length > 0) ||
        (m.inference_provider_mapping && Object.keys(m.inference_provider_mapping).length > 0);

      if (!hasInferenceProvider) return;

      // Extract providers
      const providers: string[] = [];
      if (m.inference?.providers) {
        providers.push(...m.inference.providers);
      }
      if (m.inference_provider_mapping) {
        providers.push(...Object.keys(m.inference_provider_mapping));
      }

      // For router API, we need provider/model format
      // Try to construct router-compatible ID
      const routerId = modelId.includes("/") ? modelId : `huggingface/${modelId}`;
      
      // Only include if it looks like a router-compatible model
      // Router models typically have format: provider/model-name
      if (modelId.includes("/") || providers.length > 0) {
        const uniqueProviders = [...new Set(providers.map(extractProvider))];
        
        modelsMap.set(routerId, {
          id: routerId,
          name: formatModelName(modelId),
          providers: uniqueProviders.length > 0 ? uniqueProviders : [extractProvider(modelId)],
        });
      }
    });

    const models = Array.from(modelsMap.values());

    // If we got models, return them; otherwise use fallback
    if (models.length > 0) {
      // Sort by name for better UX
      models.sort((a, b) => a.name.localeCompare(b.name));
      return NextResponse.json({ models });
    }

    console.warn("No models matched filter, using fallback");
    return NextResponse.json({ models: FALLBACK_MODELS });
  } catch (error) {
    console.error("Failed to fetch models:", error);
    // Return fallback models instead of error
    return NextResponse.json({ models: FALLBACK_MODELS });
  }
}
