"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Camera, Upload, Shield, Smartphone, ArrowRight, Check, Zap, Users, ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const [mode, setMode] = useState<"landing" | "camera" | "upload">("landing");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [faceCount, setFaceCount] = useState(0);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    setError(null);
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } } });
      setStream(s);
      setMode("camera");
    } catch {
      setError("Camera access denied. Please allow camera permissions.");
    }
  }, []);

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
    setFaceCount(0);
  }, [stream]);

  // Simulated face detection loop
  useEffect(() => {
    if (mode !== "camera" || !videoRef.current) return;
    const interval = setInterval(() => {
      setFaceCount(Math.floor(Math.random() * 3) + 1);
    }, 1500);
    return () => clearInterval(interval);
  }, [mode]);

  if (mode === "camera") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black p-4">
        <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10">
          <video ref={videoRef} autoPlay playsInline muted className="w-full" />
          <canvas ref={canvasRef} className="face-overlay w-full h-full" />
          <div className="scan-line" />
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            <Badge className="bg-black/60 text-white backdrop-blur-sm">
              <ScanLine className="mr-1 h-3 w-3" />
              {faceCount} face{faceCount !== 1 ? "s" : ""} detected
            </Badge>
            <Button variant="destructive" size="sm" onClick={stopCamera}>
              Stop Camera
            </Button>
          </div>
        </div>
        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center px-6 pt-24 pb-16 text-center">
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
          <Button size="lg" onClick={startCamera}>
            <Camera className="mr-2 h-5 w-5" /> Start Camera Detection
          </Button>
          <Button size="lg" variant="outline" onClick={() => setMode("upload")}>
            <Upload className="mr-2 h-5 w-5" /> Upload Image
          </Button>
        </div>
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

      {/* Upload mode placeholder */}
      {mode === "upload" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setMode("landing")}>
          <Card className="mx-4 w-full max-w-md animate-fade-up" onClick={(e) => e.stopPropagation()}>
            <CardContent className="p-8 text-center">
              <Upload className="mx-auto mb-4 h-12 w-12 text-amber-500" />
              <h2 className="text-xl font-semibold">Upload an Image</h2>
              <p className="mt-2 text-sm text-muted-foreground">Drop an image here or click to browse. JPEG, PNG, WebP supported.</p>
              <div className="mt-6 flex justify-center gap-3">
                <Button onClick={() => setMode("landing")}>Browse Files</Button>
                <Button variant="outline" onClick={() => setMode("landing")}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
