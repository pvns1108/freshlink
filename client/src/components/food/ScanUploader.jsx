import { useCallback, useRef, useState } from "react";
import { UploadCloud, ImageOff, X } from "lucide-react";
import Button from "../ui/Button.jsx";

export default function ScanUploader({ onFileSelected, onManualFoodName, foodName, disabled }) {
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState(null);
  const inputRef = useRef(null);

  const handleFile = useCallback(
    (file) => {
      if (!file) return;
      if (!file.type.startsWith("image/")) return;
      setPreview(URL.createObjectURL(file));
      onFileSelected(file);
    },
    [onFileSelected]
  );

  const clear = () => {
    setPreview(null);
    onFileSelected(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFile(e.dataTransfer.files?.[0]);
        }}
        className={`relative flex flex-col items-center justify-center gap-3 rounded-xl2 border-2 border-dashed p-8 text-center transition-colors ${
          dragOver ? "border-primary bg-primary-light" : "border-line bg-bg"
        }`}
      >
        {preview ? (
          <div className="relative">
            <img src={preview} alt="Food preview" className="mx-auto max-h-56 rounded-lg object-contain" />
            <button
              onClick={clear}
              className="absolute -right-2 -top-2 grid h-7 w-7 place-items-center rounded-full bg-ink text-white shadow-card"
              aria-label="Remove image"
              disabled={disabled}
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <>
            <div className="grid h-12 w-12 place-items-center rounded-full bg-primary-light text-primary-dark">
              <UploadCloud size={22} />
            </div>
            <div>
              <p className="text-sm font-medium text-ink">Drag & drop a food photo here</p>
              <p className="text-xs text-ink-muted mt-1">or choose a file — JPG, PNG, WebP up to 8MB</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={disabled}>
              Choose Image
            </Button>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
          disabled={disabled}
        />
      </div>

      <div className="flex items-center gap-2 text-xs text-ink-faint">
        <ImageOff size={14} />
        No image on hand? Just enter the food name below and skip straight to manual details.
      </div>

      <div>
        <label htmlFor="foodName" className="mb-1.5 block text-sm font-medium text-ink">
          Food name
        </label>
        <input
          id="foodName"
          type="text"
          value={foodName}
          onChange={(e) => onManualFoodName(e.target.value)}
          placeholder="e.g. Milk, Bread, Tomatoes, Rice..."
          disabled={disabled}
          className="w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none"
        />
      </div>
    </div>
  );
}
