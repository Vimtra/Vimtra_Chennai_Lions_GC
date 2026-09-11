"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ImagePlus, Replace, Trash2, Undo2 } from "lucide-react";
import { webSrc } from "@/lib/image-src";

/**
 * Cover-image upload field for the news desks.
 *
 * Shared by Admin → News and Admin → Media. It owns no server logic: it
 * renders a drop zone, a live preview of what will be saved, and the three
 * hidden fields the server reads (`coverFile`, `currentCover`,
 * `removeCover`). Validation mirrors lib/cover-upload.ts so the admin hears
 * about a bad file before submitting; the server re-checks everything.
 *
 * States: empty → drop zone · current → saved cover with Replace / Remove ·
 * picked → new file previewed as "not saved yet" · removed → queued for
 * removal on save, with Undo.
 */

const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_BYTES = 5 * 1024 * 1024;

export default function CoverImageField({
  currentCover,
  idPrefix = "cover",
  label = "Cover image",
  disabled,
}: {
  currentCover?: string | null;
  idPrefix?: string;
  label?: string;
  disabled?: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [picked, setPicked] = useState<{ url: string; name: string; size: number } | null>(null);
  const [removed, setRemoved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);

  const current = currentCover?.trim() || "";
  const showing = picked ? picked.url : removed ? "" : webSrc(current) || "";

  useEffect(() => {
    return () => {
      if (picked) URL.revokeObjectURL(picked.url);
    };
  }, [picked]);

  const clearPicked = useCallback(() => {
    setPicked((p) => {
      if (p) URL.revokeObjectURL(p.url);
      return null;
    });
    if (fileRef.current) fileRef.current.value = "";
  }, []);

  const takeFile = useCallback(
    (file: File | undefined) => {
      setError(null);
      if (!file) {
        clearPicked();
        return;
      }
      if (!ACCEPTED.includes(file.type)) {
        setError("That file type isn't supported. Choose a JPG, PNG, WebP or AVIF image.");
        clearPicked();
        return;
      }
      if (file.size > MAX_BYTES) {
        setError("That image is over 5 MB. Choose a smaller file.");
        clearPicked();
        return;
      }
      setRemoved(false);
      setPicked((prev) => {
        if (prev) URL.revokeObjectURL(prev.url);
        return { url: URL.createObjectURL(file), name: file.name, size: file.size };
      });
    },
    [clearPicked]
  );

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => takeFile(e.target.files?.[0]);
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    const file = e.dataTransfer.files?.[0];
    if (file && fileRef.current) {
      const dt = new DataTransfer();
      dt.items.add(file);
      fileRef.current.files = dt.files;
    }
    takeFile(file);
  };

  const remove = useCallback(() => {
    clearPicked();
    setRemoved(true);
    setError(null);
  }, [clearPicked]);

  const inputId = `${idPrefix}-file`;

  return (
    <div className="adm-field">
      <span className="adm-label">
        {label} <span className="adm-opt">optional</span>
      </span>

      <input type="hidden" name="currentCover" value={current} />
      {removed && !picked && <input type="hidden" name="removeCover" value="1" />}

      {showing ? (
        <div className="adm-upload-preview">
          <span className="adm-upload-img">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={showing} alt={picked ? "Selected cover preview" : "Current cover image"} />
          </span>
          <div className="adm-upload-meta">
            <div className="adm-kicker">{picked ? "New cover · not saved yet" : "Current cover"}</div>
            <div className="adm-upload-name">{picked ? `${picked.name} · ${(picked.size / 1024).toFixed(0)} KB` : current}</div>
            <div className="adm-actions">
              <button type="button" onClick={() => fileRef.current?.click()} className="adm-btn adm-btn-sm" disabled={disabled}>
                <Replace /> {picked ? "Choose another" : "Replace"}
              </button>
              {picked ? (
                <button type="button" onClick={clearPicked} className="adm-btn adm-btn-sm adm-btn-ghost" disabled={disabled}>
                  Discard selection
                </button>
              ) : (
                <button type="button" onClick={remove} className="adm-btn adm-btn-sm adm-btn-danger" disabled={disabled}>
                  <Trash2 /> Remove
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDrag(true);
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={onDrop}
            className={`adm-upload-zone ${drag ? "is-drag" : ""}`}
            disabled={disabled}
          >
            <ImagePlus />
            <strong>Upload cover image</strong>
            <span>JPG, PNG, WebP or AVIF · up to 5 MB · drag and drop works too</span>
          </button>
          {removed && current && (
            <div className="adm-alert" data-tone="warn" style={{ marginTop: 8 }}>
              <span>The current cover will be removed when you save.</span>
              <button type="button" onClick={() => setRemoved(false)} className="adm-btn adm-btn-sm" style={{ marginLeft: "auto" }}>
                <Undo2 /> Undo
              </button>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileRef}
        id={inputId}
        name="coverFile"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        onChange={onPick}
        className="adm-sr"
        tabIndex={-1}
      />

      {error ? (
        <p className="adm-field-error" role="alert">
          {error}
        </p>
      ) : !showing && !removed ? (
        <p className="adm-hint">Without a cover the story renders with its publisher mark instead. Upload only images the franchise owns or has permission to use.</p>
      ) : null}
    </div>
  );
}
