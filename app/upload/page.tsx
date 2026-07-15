"use client";

import { useState, useRef, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { ArrowLeft, Upload, Image as ImageIcon, ScanLine, X, Check, Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useFaceDetection } from "@/hooks/use-face-detection";

type FileWithPreview = {
  file: File;
  preview: string;
  id: string;
};

type DetectionResult = {
  count: number;
  imageUrl: string;
  timestamp: Date;
};

export default function UploadPage() {
  const { canvasRef, state, processImage } = useFaceDetection();
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<DetectionResult[]>([]);
  const imgRef = useRef<HTMLImageElement>(null);

  const onDrop = useCallback((accepted: File[]) => {
    const newFiles = accepted.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      id: crypto.randomUUID(),
    }));
    setFiles((prev) => [...prev, ...newFiles].slice(0, 5)); // max 5
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
    maxSize: 10 * 1024 * 1024,
    maxFiles: 5,
  });

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const removed = prev.find((f) => f.id === id);
      if (removed) URL.revokeObjectURL(removed.preview);
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const detectAll = useCallback(async () => {
    if (!state.modelLoaded) return;
    setProcessing(true);
    const newResults: DetectionResult[] = [];

    for (const f of files) {
      const img = new Image();
      img.src = f.preview;
      await new Promise((r) => { img.onload = r; });
      if (imgRef.current) {
        imgRef.current.src = f.preview;
        imgRef.current.width = img.width;
        imgRef.current.height = img.height;
      }
      const result = await processImage(img);
      if (result) {
        newResults.push({ count: result.count, imageUrl: f.preview, timestamp: new Date() });
      }
    }

    setResults(newResults);
    setProcessing(false);
  }, [files, state.modelLoaded, processImage]);

  const clearAll = useCallback(() => {
    files.forEach((f) => URL.revokeObjectURL(f.preview));
    setFiles([]);
    setResults([]);
  }, [files]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" /> Back
            </a>
            <span className="text-muted-foreground">|</span>
            <Upload className="h-5 w-5 text-amber-500" />
            <span className="font-semibold">Upload & Detect</span>
          </div>
          <Badge tone={state.modelLoaded ? "success" : "warning"}>
            {state.modelLoaded ? "Model Ready" : "Loading Model..."}
          </Badge>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* Left — upload zone + preview */}
          <div className="space-y-6">
            {/* Drop zone */}
            <div
              {...getRootProps()}
              className={`cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all ${
                isDragActive
                  ? "border-amber-500 bg-amber-500/5"
                  : "border-border hover:border-amber-500/50 hover:bg-muted/30"
              }`}
            >
              <input {...getInputProps()} />
              {isDragActive ? (
                <div className="animate-fade-in">
                  <Upload className="mx-auto h-12 w-12 text-amber-500" />
                  <p className="mt-4 font-medium text-amber-500">Drop images here</p>
                </div>
              ) : (
                <div>
                  <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-4 font-medium">Drag & drop images here</p>
                  <p className="mt-1 text-sm text-muted-foreground">or click to browse (PNG, JPG, WebP, max 10MB)</p>
                </div>
              )}
            </div>

            {/* Image grid */}
            {files.length > 0 && (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {files.map((f) => (
                  <div key={f.id} className="group relative overflow-hidden rounded-xl border border-border/50">
                    <img src={f.preview} alt="" className="aspect-square w-full object-cover" />
                    <button
                      onClick={() => removeFile(f.id)}
                      className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    {results.find((r) => r.imageUrl === f.preview) && (
                      <div className="absolute bottom-2 left-2">
                        <Badge className="bg-green-500/80 text-white">
                          {results.find((r) => r.imageUrl === f.preview)?.count} faces
                        </Badge>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Hidden image ref for detection */}
            <img ref={imgRef} alt="" className="hidden" />

            {/* Canvas overlay for detection visualization */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Action buttons */}
            {files.length > 0 && (
              <div className="flex gap-3">
                <Button size="lg" onClick={detectAll} disabled={processing || !state.modelLoaded} className="flex-1">
                  {processing ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Detecting...</>
                  ) : (
                    <><ScanLine className="mr-2 h-4 w-4" /> Detect Faces ({files.length} image{files.length > 1 ? "s" : ""})</>
                  )}
                </Button>
                <Button variant="outline" size="lg" onClick={clearAll} disabled={processing}>
                  Clear All
                </Button>
              </div>
            )}

            {state.error && (
              <Card className="border-red-500/30 bg-red-500/5">
                <CardContent className="p-4 text-sm text-red-400">{state.error}</CardContent>
              </Card>
            )}
          </div>

          {/* Right — results panel */}
          <div className="space-y-4">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Detection Results</CardTitle>
                <CardDescription>
                  {results.length > 0
                    ? `${results.reduce((a, r) => a + r.count, 0)} total faces found`
                    : "Upload images and run detection"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {results.length === 0 ? (
                  <div className="flex flex-col items-center py-8 text-center">
                    <Users className="h-10 w-10 text-muted-foreground/30" />
                    <p className="mt-3 text-sm text-muted-foreground">No results yet</p>
                    <p className="text-xs text-muted-foreground/50">Upload images and click detect</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {results.map((r, i) => (
                      <div key={i} className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2">
                        <div className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Image {i + 1}</span>
                        </div>
                        <Badge>{r.count} face{r.count !== 1 ? "s" : ""}</Badge>
                      </div>
                    ))}
                    <div className="mt-4 rounded-lg bg-amber-500/10 p-3 text-center">
                      <p className="text-sm font-medium text-amber-500">
                        Total: {results.reduce((a, r) => a + r.count, 0)} faces detected
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Model status */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-sm">Engine Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Detection Model</span>
                  <Badge tone={state.modelLoaded ? "success" : "warning"}>
                    {state.modelLoaded ? "Loaded" : "Loading..."}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Processing</span>
                  <Badge tone={state.isDetecting ? "warning" : "default"}>
                    {state.isDetecting ? "Active" : "Idle"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
