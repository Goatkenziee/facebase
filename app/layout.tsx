import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ToastProvider } from "@/components/ui/toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "FaceBase — Real-Time Face Detection",
  description:
    "FaceBase detects faces in real-time via webcam, uploads, and smart glasses. Premium face recognition platform.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="min-h-screen bg-background font-sans text-foreground antialiased">
          <ToastProvider>{children}</ToastProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
