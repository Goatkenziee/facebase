"use client";

import { useState, useCallback } from "react";
import { ArrowLeft, Smartphone, Wifi, WifiOff, Bluetooth, Camera, Check, Loader2, ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input, Label } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

type ConnectionStatus = "disconnected" | "connecting" | "connected";
type GlassesProtocol = "bluetooth" | "wifi" | "usb";

export default function GlassesPage() {
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [protocol, setProtocol] = useState<GlassesProtocol>("bluetooth");
  const [deviceName, setDeviceName] = useState("");
  const [ipAddress, setIpAddress] = useState("");
  const [streamActive, setStreamActive] = useState(false);
  const [faceCount, setFaceCount] = useState(0);

  const handleConnect = useCallback(async () => {
    setStatus("connecting");
    // Simulate connection handshake
    await new Promise((r) => setTimeout(r, 2000));
    setStatus("connected");
  }, []);

  const handleDisconnect = useCallback(() => {
    setStatus("disconnected");
    setStreamActive(false);
    setFaceCount(0);
  }, []);

  const startStream = useCallback(async () => {
    setStreamActive(true);
    // Simulate face detection feed from glasses
    const interval = setInterval(() => {
      setFaceCount(Math.floor(Math.random() * 4) + 1);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" /> Back
            </a>
            <span className="text-muted-foreground">|</span>
            <Smartphone className="h-5 w-5 text-amber-500" />
            <span className="font-semibold">Smart Glasses</span>
          </div>
          <Badge tone={status === "connected" ? "success" : status === "connecting" ? "warning" : "default"}>
            {status === "connected" ? "Connected" : status === "connecting" ? "Connecting..." : "Disconnected"}
          </Badge>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* Main viewport */}
          <div>
            <Card className="overflow-hidden border-border/50">
              <div className="relative aspect-video bg-black">
                {status === "connected" && streamActive ? (
                  <>
                    {/* Simulated glasses feed */}
                    <div className="flex h-full items-center justify-center">
                      <div className="text-center">
                        <ScanLine className="mx-auto h-12 w-12 text-amber-500/50" />
                        <p className="mt-3 text-sm text-muted-foreground">Live feed from glasses</p>
                        <Badge className="mt-2 bg-amber-500/10 text-amber-500">
                          {faceCount} face{faceCount !== 1 ? "s" : ""} detected
                        </Badge>
                      </div>
                    </div>
                    {/* Scan line animation */}
                    <div className="scan-line" />
                  </>
                ) : status === "connected" ? (
                  <div className="flex h-full items-center justify-center">
                    <div className="text-center">
                      <Camera className="mx-auto h-12 w-12 text-muted-foreground/50" />
                      <p className="mt-3 text-sm text-muted-foreground">Glasses connected — start the stream</p>
                      <Button size="sm" className="mt-4" onClick={startStream}>
                        Start Stream
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <div className="text-center">
                      <Smartphone className="mx-auto h-16 w-16 text-muted-foreground/30" />
                      <p className="mt-4 text-sm text-muted-foreground">Connect your smart glasses to begin</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Detection log */}
            {streamActive && (
              <Card className="mt-4 border-border/50">
                <CardHeader>
                  <CardTitle className="text-sm">Detection Log</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
                      <span className="text-muted-foreground">[{new Date().toLocaleTimeString()}]</span>
                      <span>{faceCount} face{faceCount !== 1 ? "s" : ""} detected</span>
                      <Badge className="bg-green-500/10 text-green-500">Live</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar — connection controls */}
          <div className="space-y-6">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Connection</CardTitle>
                <CardDescription>Pair with your smart glasses device</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs defaultValue="bluetooth">
                  <TabsList className="w-full">
                    <TabsTrigger value="bluetooth">
                      <Bluetooth className="mr-1.5 h-3.5 w-3.5" /> Bluetooth
                    </TabsTrigger>
                    <TabsTrigger value="wifi">
                      <Wifi className="mr-1.5 h-3.5 w-3.5" /> Wi-Fi
                    </TabsTrigger>
                    <TabsTrigger value="usb">
                      <Camera className="mr-1.5 h-3.5 w-3.5" /> USB
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="bluetooth" className="space-y-3">
                    <div>
                      <Label>Device Name</Label>
                      <Input
                        placeholder="e.g. Vuzix M400"
                        value={deviceName}
                        onChange={(e) => setDeviceName(e.target.value)}
                        disabled={status === "connected"}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Ensure your glasses are in pairing mode and discoverable.
                    </p>
                  </TabsContent>

                  <TabsContent value="wifi" className="space-y-3">
                    <div>
                      <Label>IP Address</Label>
                      <Input
                        placeholder="e.g. 192.168.1.100:8080"
                        value={ipAddress}
                        onChange={(e) => setIpAddress(e.target.value)}
                        disabled={status === "connected"}
                      />
                    </div>
                    <div>
                      <Label>Access Key</Label>
                      <Input type="password" placeholder="Optional access key" disabled={status === "connected"} />
                    </div>
                  </TabsContent>

                  <TabsContent value="usb" className="space-y-3">
                    <div className="rounded-lg border-2 border-dashed border-border p-6 text-center">
                      <Camera className="mx-auto h-8 w-8 text-muted-foreground/50" />
                      <p className="mt-2 text-sm text-muted-foreground">Connect glasses via USB cable</p>
                      <p className="text-xs text-muted-foreground/50">Device should appear automatically</p>
                    </div>
                  </TabsContent>
                </Tabs>

                {status === "disconnected" && (
                  <Button className="w-full" onClick={handleConnect} disabled={!deviceName && !ipAddress}>
                    <Bluetooth className="mr-2 h-4 w-4" /> Connect Glasses
                  </Button>
                )}
                {status === "connecting" && (
                  <Button className="w-full" disabled>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Connecting...
                  </Button>
                )}
                {status === "connected" && (
                  <Button variant="destructive" className="w-full" onClick={handleDisconnect}>
                    <WifiOff className="mr-2 h-4 w-4" /> Disconnect
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Device info */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Compatible Devices</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  {[
                    { name: "Vuzix M400", status: "Verified" },
                    { name: "Ray-Ban Meta", status: "Beta" },
                    { name: "Google Glass EE2", status: "Verified" },
                    { name: "RealWear Navigator", status: "Beta" },
                    { name: "Epson Moverio BT-40", status: "Coming Soon" },
                  ].map((d) => (
                    <li key={d.name} className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2">
                      <span>{d.name}</span>
                      <Badge tone={d.status === "Verified" ? "success" : d.status === "Beta" ? "warning" : "default"} className="text-[10px]">
                        {d.status}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
