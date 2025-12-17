"use client";

type ComponentSummary = {
  id: string;
  name: string;
};

type ComponentGalleryProps = {
  components: ComponentSummary[];
  thumbnails: Record<string, string>;
  selectedIds: Set<string>;
  loading: boolean;
  onSelectAll: () => void;
  onToggleSelect: (id: string) => void;
  onGenerate: () => void;
};

export const ComponentGallery = ({
  components,
  thumbnails,
  selectedIds,
  loading,
  onSelectAll,
  onToggleSelect,
  onGenerate,
}: ComponentGalleryProps) => {
  return (
    <>
      <h2 className="text-xl font-semibold mb-4">Select Components ({selectedIds.size} selected)</h2>
      <button onClick={onSelectAll} className="mb-4 text-blue-600">
        Select All
      </button>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        {components.map((component) => {
          const isSelected = selectedIds.has(component.id);
          const thumbnail = thumbnails[component.id];

          return (
            <div
              key={component.id}
              className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${isSelected ? "border-blue-500 bg-blue-50" : "border-gray-300"}`}
              onClick={() => onToggleSelect(component.id)}
            >
              {thumbnail ? (
                <img src={thumbnail} alt={component.name} className="w-full h-32 object-contain bg-gray-100 rounded" />
              ) : (
                <div className="w-full h-32 bg-gray-200 rounded flex items-center justify-center text-xs">
                  No preview
                </div>
              )}
              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onToggleSelect(component.id)}
                  onClick={(e) => e.stopPropagation()}
                />
                <span className="ml-2 text-sm font-medium truncate">{component.name}</span>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={onGenerate}
        disabled={loading || selectedIds.size === 0}
        className="w-full bg-blue-600 text-white p-3 rounded disabled:opacity-50"
      >
        {loading ? "Generating..." : `Generate ${selectedIds.size} Component${selectedIds.size > 1 ? "s" : ""}`}
      </button>
    </>
  );
};


