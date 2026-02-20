"use client";

type GeneratedFile = { name: string; code: string };

type GeneratedOutputProps = {
  files: GeneratedFile[];
  onCopy: (code: string) => void;
  onDownloadSingle: (filename: string, code: string) => void;
  onDownloadAll: () => Promise<void>;
};

export const GeneratedOutput = ({ files, onCopy, onDownloadSingle, onDownloadAll }: GeneratedOutputProps) => {
  return (
    <div className="mt-12">
      <h2 className="text-xl font-semibold mb-4">Generated Components</h2>
      {files.map((file) => (
        <div key={file.name} className="mb-8 border rounded-lg p-4 bg-gray-50">
          <h3 className="font-bold mb-2">{file.name}</h3>
          <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-xs max-h-96">{file.code}</pre>
          <div className="mt-2 flex gap-2">
            <button onClick={() => onCopy(file.code)} className="bg-gray-700 text-white px-3 py-1 rounded">
              Copy
            </button>
            <button
              onClick={() => onDownloadSingle(file.name, file.code)}
              className="bg-green-600 text-white px-3 py-1 rounded"
            >
              Download
            </button>
          </div>
        </div>
      ))}
      <button onClick={onDownloadAll} className="w-full bg-green-600 text-white p-3 rounded mt-4">
        Download All as ZIP
      </button>
    </div>
  );
};
