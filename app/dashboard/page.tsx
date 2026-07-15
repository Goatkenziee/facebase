"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Camera, Upload, Users, ScanLine, Clock, TrendingUp, Activity, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";

type DetectionLog = {
  id: string;
  timestamp: Date;
  source: "camera" | "upload";
  faceCount: number;
  imageUrl?: string;
};

export default function DashboardPage() {
  const [logs, setLogs] = useState<DetectionLog[]>([]);
  const [stats, setStats] = useState({
    totalDetections: 0,
    totalFaces: 0,
    todayDetections: 0,
    avgFacesPerDetection: 0,
  });

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("facebase_logs");
    if (stored) {
      try {
        const parsed: DetectionLog[] = JSON.parse(stored);
        setLogs(parsed);
        computeStats(parsed);
      } catch { /* ignore corrupt data */ }
    }
  }, []);

  const computeStats = (data: DetectionLog[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayDetections = data.filter((l) => new Date(l.timestamp) >= today).length;
    const totalFaces = data.reduce((a, l) => a + l.faceCount, 0);
    setStats({
      totalDetections: data.length,
      totalFaces,
      todayDetections,
      avgFacesPerDetection: data.length > 0 ? Math.round((totalFaces / data.length) * 10) / 10 : 0,
    });
  };

  const clearHistory = () => {
    localStorage.removeItem("facebase_logs");
    setLogs([]);
    setStats({ totalDetections: 0, totalFaces: 0, todayDetections: 0, avgFacesPerDetection: 0 });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" /> Back
            </a>
            <span className="text-muted-foreground">|</span>
            <BarChart3 className="h-5 w-5 text-amber-500" />
            <span className="font-semibold">Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <Badge>{logs.length} detections</Badge>
            {logs.length > 0 && (
              <Button variant="outline" size="sm" onClick={clearHistory}>
                Clear History
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* Stats grid */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<ScanLine className="h-5 w-5" />}
            label="Total Detections"
            value={stats.totalDetections.toString()}
            trend={stats.totalDetections > 0 ? "+" : ""}
          />
          <StatCard
            icon={<Users className="h-5 w-5" />}
            label="Total Faces Found"
            value={stats.totalFaces.toString()}
            trend={stats.totalFaces > 0 ? "+" : ""}
          />
          <StatCard
            icon={<Camera className="h-5 w-5" />}
            label="Today"
            value={stats.todayDetections.toString()}
            trend={stats.todayDetections > 0 ? "new" : ""}
          />
          <StatCard
            icon={<Activity className="h-5 w-5" />}
            label="Avg Faces / Detection"
            value={stats.avgFacesPerDetection.toString()}
            trend={stats.avgFacesPerDetection > 0 ? "" : ""}
          />
        </div>

        {/* Detection history */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              Detection History
            </CardTitle>
            <CardDescription>
              {logs.length > 0
                ? `Last ${logs.length} detection${logs.length > 1 ? "s" : ""}`
                : "No detections yet — start detecting faces!"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-center">
                <Camera className="h-12 w-12 text-muted-foreground/30" />
                <p className="mt-4 text-muted-foreground">No detection history yet</p>
                <p className="text-sm text-muted-foreground/50">
                  Use the camera or upload images to get started
                </p>
                <div className="mt-4 flex gap-3">
                  <a href="/">
                    <Button size="sm"><Camera className="mr-2 h-4 w-4" /> Camera</Button>
                  </a>
                  <a href="/upload">
                    <Button size="sm" variant="outline"><Upload className="mr-2 h-4 w-4" /> Upload</Button>
                  </a>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {logs.toReversed().map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between rounded-lg border border-border/30 bg-muted/10 px-4 py-3 transition-colors hover:bg-muted/20"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`rounded-full p-2 ${log.source === "camera" ? "bg-blue-500/10 text-blue-500" : "bg-amber-500/10 text-amber-500"}`}>
                        {log.source === "camera" ? <Camera className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium capitalize">{log.source}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(log.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Badge>{log.faceCount} face{log.faceCount !== 1 ? "s" : ""}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
