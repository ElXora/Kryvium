"use client";

import { useEffect, useState, type KeyboardEvent } from "react";
import { ImageIcon, Sparkles, Download, AlertCircle } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useImageStore } from "@/lib/store/image-store";

export default function ImagesPage() {
  const { images, generating, error, loadImages, generateImage } = useImageStore();
  const [prompt, setPrompt] = useState("");

  useEffect(() => {
    loadImages();
  }, [loadImages]);

  function handleGenerate() {
    if (!prompt.trim() || generating) return;
    generateImage(prompt.trim());
    setPrompt("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleGenerate();
  }

  return (
    <AppShell>
      <div className="animate-content-in flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-4xl px-3 py-6 sm:px-4 sm:py-8 2xl:max-w-6xl">
          <div className="mb-5 flex items-center gap-2.5 sm:mb-6">
            <ImageIcon size={20} strokeWidth={1.75} />
            <h1 className="text-[18px] font-semibold tracking-tight sm:text-[20px]">Image generation</h1>
          </div>

          <div
            className="focus-glow mb-6 flex items-center gap-2 rounded-[14px] border p-2 sm:mb-8 sm:p-2.5"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
          >
            <input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe an image to generate…"
              className="flex-1 bg-transparent px-2 py-1.5 text-[13.5px] outline-none sm:text-[14px]"
            />
            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || generating}
              className="press flex flex-shrink-0 items-center gap-1.5 rounded-[10px] px-3 py-2 text-[12.5px] font-medium transition-opacity disabled:opacity-40 sm:px-3.5 sm:text-[13px]"
              style={{ background: "var(--border-strong)", color: "var(--bg)" }}
            >
              <Sparkles size={14} className={generating ? "animate-float" : ""} />
              Generate
            </button>
          </div>

          {error && (
            <div
              className="animate-error-shake mb-6 flex items-center gap-2 rounded-[10px] border px-3.5 py-2.5 text-[13px]"
              style={{ borderColor: "var(--danger)", color: "var(--danger)" }}
            >
              <AlertCircle size={15} className="flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 2xl:grid-cols-5">
            {generating && (
              <div
                className="skeleton animate-pop-in aspect-square rounded-[12px] border"
                style={{ borderColor: "var(--border)" }}
              />
            )}

            {images.map((img, i) => (
              <div
                key={img.id}
                className="animate-image-in stagger group relative overflow-hidden rounded-[12px] border"
                style={{ borderColor: "var(--border)", "--i": i } as React.CSSProperties}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.image_url}
                  alt={img.prompt}
                  className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-transparent to-transparent p-2.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <p className="mb-1.5 line-clamp-2 text-[11.5px] text-white">{img.prompt}</p>
                  <a
                    href={img.image_url}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="press flex w-fit items-center gap-1 rounded-[6px] bg-white/15 px-2 py-1 text-[11px] text-white backdrop-blur-sm"
                  >
                    <Download size={11} />
                    Download
                  </a>
                </div>
              </div>
            ))}
          </div>

          {images.length === 0 && !generating && (
            <div className="animate-fade-in flex flex-col items-center gap-2 py-16 text-center sm:py-20">
              <ImageIcon size={32} strokeWidth={1.5} style={{ color: "var(--text-faint)" }} />
              <p className="text-[13px] sm:text-[13.5px]" style={{ color: "var(--text-faint)" }}>
                Your generated images will appear here.
              </p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
