"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Camera, Upload, Shield, Smartphone, ArrowRight, Check, Zap, Users, ScanLine, BarChart3, Glasses } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useFaceDetection } from "@/hooks/use-face-detection";

type DetectionLog = {
  id: string;
  timestamp: string;
  source: "camera" | "upload";
  faceCount: number;
};

let detectionId = 0;

export default function Home() {
  const [mode, setMode] = useState<"landing" | "camera" | "upload">("landing");
  const videoRef = useRef<HTMLVideoElement>(null);
  const { canvasRef, state: detState, processVideoFrame, processImage, reset: resetDet } = useFaceDetection();
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [detectionCount, setDetectionCount] = useState(0);

  // Save detection to localStorage log
  const saveDetection = useCallback((source: "camera" | "upload", faceCount: number) => {
    const log: DetectionLog = {
      id: `det_${Date.now()}_${++detectionId}`,
      timestamp: new Date().toISOString(),
      source,
      faceCount,
    };
    try {
      const existing = JSON.parse(localStorage.getItem("facebase_logs") || "[]");
      existing.push(log);
      localStorage.setItem("facebase_logs", JSON.stringify(existing));
    } catch { /* localStorage may be full or unavailable */ }
  }, []);

  // ── Camera ──
  const startCamera = useCallback(async () => {
    setError(null);
    resetDet();
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
      });
      setStream(s);
      setMode("camera");
    } catch {
      setError("Camera access denied. Please allow camera permissions.");
    }
  }, [resetDet]);

  useEffect(() => {
    if (mode === "camera" && videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
        setStream(null);
      }
    };
  }, [mode, stream]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
    setMode("landing");
    resetDet();
  }, [stream, resetDet]);

  // Real detection loop on camera frames
  useEffect(() => {
    if (mode !== "camera" || !videoRef.current || !detState.modelLoaded) return;
    const video = videoRef.current;
    let running = true;
    let lastSave = 0;

    const loop = async () => {
      if (!running) return;
      if (video.readyState >= 2) {
        await processVideoFrame(video);
        // Save to history every ~10 seconds when faces are detected
        if (detState.count > 0 && Date.now() - lastSave > 10_000) {
          saveDetection("camera", detState.count);
          lastSave = Date.now();
        }
      }
      requestAnimationFrame(loop);
    };
    loop();

    return () => { running = false; };
  }, [mode, detState.modelLoaded, processVideoFrame, saveDetection, detState.count]);

  // ── Upload ──
  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setMode("upload");

    const img = document.createElement("img");
    img.onload = async () => {
      const result = await processImage(img);
      if (result) {
        setDetectionCount(result.count);
        saveDetection("upload", result.count);
      }
    };
    img.onerror = () => setError("Failed to load image.");
    img.src = URL.createObjectURL(file);
  }, [processImage, saveDetection]);

  const resetUpload = useCallback(() => {
    setMode("landing");
    setDetectionCount(0);
    resetDet();
  }, [resetDet]);

  // ── Camera view ──
  if (mode === "camera") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black p-4">
        <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10">
          <video ref={videoRef} autoPlay playsInline muted className="w-full" />
          <canvas
            ref={canvasRef}
            className="pointer-events-none absolute inset-0 h-full w-full"
          />
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            <Badge className="bg-black/60 text-white backdrop-blur-sm">
              <ScanLine className="mr-1 h-3 w-3" />
              {detState.modelLoaded
                ? `${detState.count} face${detState.count !== 1 ? "s" : ""} detected`
                : "Loading model…"}
            </Badge>
            <Button variant="destructive" size="sm" onClick={stopCamera}>
              Stop Camera
            </Button>
          </div>
          {!detState.modelLoaded && !detState.error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="flex flex-col items-center gap-2 text-white">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
                <p className="text-sm">Loading face detection model…</p>
              </div>
            </div>
          )}
        </div>
        {detState.error && <p className="mt-4 text-sm text-red-400">{detState.error}</p>}
        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      </div>
    );
  }

  // ── Upload view ──
  if (mode === "upload") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <div className="relative w-full max-w-2xl">
          <div className="relative overflow-hidden rounded-2xl border border-border/50">
            <canvas
              ref={canvasRef}
              className="w-full"
              style={{ minHeight: "320px", background: "var(--muted)" }}
            />
          </div>
          <div className="mt-4 flex items-center justify-between">
            <Badge>
              {detState.modelLoaded
                ? `${detState.count} face${detState.count !== 1 ? "s" : ""} detected`
                : "Processing…"}
            </Badge>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={resetUpload}>
                Back
              </Button>
              <Button size="sm" onClick={() => document.getElementById("file-input")?.click()}>
                <Upload className="mr-2 h-4 w-4" /> New Image
              </Button>
            </div>
          </div>
          <input
            id="file-input"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
          />
        </div>
        {detState.error && <p className="mt-4 text-sm text-red-400">{detState.error}</p>}
        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      </div>
    );
  }

  // ── Landing view ──
  return (
    <div className="min-h-screen bg-background">
      {/* Top nav */}
      <header className="border-b border-border/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2 font-semibold text-lg">
            <ScanLine className="h-5 w-5 text-amber-500" />
            FaceBase
          </div>
          <nav className="flex items-center gap-4">
            <a href="/glasses" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Glasses className="h-4 w-4" /> Smart Glasses
            </a>
            <a href="/dashboard" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <BarChart3 className="h-4 w-4" /> Dashboard
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center px-6 pt-20 pb-16 text-center">
        <Badge className="mb-4 animate-fade-in" tone="warning">Beta — Smart Glasses Ready</Badge>
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl animate-fade-up">
          Real-Time{" "}
          <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
            Face Detection
          </span>
          {" "}Platform
        </h1>
        <p className="mt-4 max-w-xl text-lg text-muted-foreground animate-fade-up">
          Detect faces in real-time via webcam, upload images, or connect smart glasses.
          Enterprise-grade recognition with privacy-first architecture.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 animate-fade-up">
          <Button size="lg" onClick={startCamera} disabled={!detState.modelLoaded && detState.error === null}>
            <Camera className="mr-2 h-5 w-5" /> Start Camera Detection
          </Button>
          <Button size="lg" variant="outline" onClick={() => document.getElementById("file-input")?.click()}>
            <Upload className="mr-2 h-5 w-5" /> Upload Image
          </Button>
          <input
            id="file-input"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
          />
        </div>
        {!detState.modelLoaded && detState.error === null && (
          <p className="mt-3 text-sm text-muted-foreground animate-fade-up">
            Loading detection model (one-time download)…
          </p>
        )}
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: <Zap className="h-6 w-6" />, title: "Real-Time Detection", desc: "Sub-100ms face detection on live video streams with confidence scoring and bounding box visualization." },
            { icon: <Smartphone className="h-6 w-6" />, title: "Smart Glasses Ready", desc: "Connect compatible smart glasses for hands-free face recognition in the field." },
            { icon: <Shield className="h-6 w-6" />, title: "Privacy First", desc: "All processing happens on-device. No images are sent to external servers." },
            { icon: <Users className="h-6 w-6" />, title: "Name Recognition", desc: "Match detected faces against known profiles with similarity scoring." },
            { icon: <Upload className="h-6 w-6" />, title: "Batch Upload", desc: "Upload multiple images for bulk face detection and analysis." },
            { icon: <Check className="h-6 w-6" />, title: "Export & Integrate", desc: "Export detection results as JSON/CSV. REST API for custom integrations." },
          ].map((f, i) => (
            <Card key={f.title} className="animate-fade-up border-border/50 transition-all hover:border-amber-500/30" style={{ animationDelay: `${i * 80}ms` }}>
              <CardContent className="p-6">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                  {f.icon}
                </div>
                <h3 className="font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/20 px-6 py-16 text-center">
        <h2 className="text-2xl font-bold">Ready to get started?</h2>
        <p className="mt-2 text-muted-foreground">
          Choose camera detection, upload an image, or connect your smart glasses.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
          <Button size="lg" onClick={startCamera} disabled={!detState.modelLoaded && detState.error === null}>
            <Camera className="mr-2 h-5 w-5" /> Start Now
          </Button>
          <a href="/glasses">
            <Button size="lg" variant="outline">
              <Glasses className="mr-2 h-5 w-5" /> Connect Glasses
            </Button>
          </a>
          <a href="/dashboard">
            <Button size="lg" variant="ghost">
              <BarChart3 className="mr-2 h-5 w-5" /> View Dashboard
            </Button>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/10 px-6 py-8 text-center text-sm text-muted-foreground">
        <p>FaceBase — On-device face detection. Privacy first, always.</p>
      </footer>
    </div>
  );
}
