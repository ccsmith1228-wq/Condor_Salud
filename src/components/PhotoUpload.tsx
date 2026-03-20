"use client";

// ─── Photo Upload Button ─────────────────────────────────────
// Web-native file upload with drag-and-drop, preview, and delete.
// Ported from frontend/src/components/PhotoUploadButton.tsx
// (expo-image-picker → web file input).

import { useState, useRef, useCallback } from "react";
import { Camera, Upload, Trash2, Loader2, Image as ImageIcon } from "lucide-react";
import NextImage from "next/image";

interface PhotoUploadProps {
  currentPhotoUrl?: string | null;
  token: string;
  onUploaded?: (url: string) => void;
  onDeleted?: () => void;
  className?: string;
}

export function PhotoUpload({
  currentPhotoUrl,
  token,
  onUploaded,
  onDeleted,
  className = "",
}: PhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentPhotoUrl || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);

      // Validate client-side
      const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!allowed.includes(file.type)) {
        setError("Solo se permiten imágenes JPEG, PNG o WebP");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("La imagen no puede superar 5 MB");
        return;
      }

      // Preview
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);

      // Upload
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("photo", file);

        const res = await fetch("/api/photo-upload/doctor", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Error al subir foto");
        }

        const data = await res.json();
        setPreview(data.url);
        onUploaded?.(data.url);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al subir foto");
        setPreview(currentPhotoUrl || null);
      } finally {
        setUploading(false);
      }
    },
    [token, currentPhotoUrl, onUploaded],
  );

  const handleDelete = useCallback(async () => {
    setUploading(true);
    setError(null);
    try {
      const res = await fetch("/api/photo-upload/doctor", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al eliminar foto");
      }
      setPreview(null);
      onDeleted?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar foto");
    } finally {
      setUploading(false);
    }
  }, [token, onDeleted]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  return (
    <div className={`w-full ${className}`}>
      {/* ── Preview / Drop zone ───────────────────────────── */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 transition ${
          dragOver
            ? "border-celeste bg-celeste-50"
            : preview
              ? "border-transparent"
              : "border-gray-200 hover:border-gray-300"
        }`}
      >
        {preview ? (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Foto de perfil"
              className="h-32 w-32 rounded-full object-cover shadow-lg"
            />
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
                <Loader2 className="h-6 w-6 animate-spin text-white" />
              </div>
            )}
          </div>
        ) : (
          <div className="text-center">
            <ImageIcon className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-2 text-sm text-gray-500">Arrastrá una imagen o hacé clic para subir</p>
            <p className="mt-1 text-xs text-gray-400">JPEG, PNG o WebP • Máx. 5 MB</p>
          </div>
        )}
      </div>

      {/* ── Error message ─────────────────────────────────── */}
      {error && <p className="mt-2 text-center text-xs text-red-500">{error}</p>}

      {/* ── Action buttons ────────────────────────────────── */}
      <div className="mt-3 flex justify-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 rounded-lg bg-celeste-50 px-4 py-2 text-xs font-medium text-celeste-dark transition hover:bg-celeste-100 disabled:opacity-50"
        >
          {preview ? (
            <>
              <Camera className="h-3.5 w-3.5" /> Cambiar
            </>
          ) : (
            <>
              <Upload className="h-3.5 w-3.5" /> Subir foto
            </>
          )}
        </button>

        {preview && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={uploading}
            className="flex items-center gap-1.5 rounded-lg bg-red-50 px-4 py-2 text-xs font-medium text-red-600 transition hover:bg-red-100 disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" /> Eliminar
          </button>
        )}
      </div>

      {/* ── Hidden file input ─────────────────────────────── */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          // Reset so the same file can be re-selected
          e.target.value = "";
        }}
      />
    </div>
  );
}
