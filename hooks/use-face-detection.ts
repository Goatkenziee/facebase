// FaceBase — hook for real-time face detection on a video or image element
// Manages model loading, detection loop, and canvas overlay rendering.

"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { loadFaceDetectionModel, detectFaces, drawFaceOverlay } from "@/lib/face-detection";

type DetectionState = {
  count: number;
  isDetecting: boolean;
  error: string | null;
  modelLoaded: boolean;
};

export function useFaceDetection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [state, setState] = useState<DetectionState>({
    count: 0,
    isDetecting: false,
    error: null,
    modelLoaded: false,
  });

  const loadModel = useCallback(async () => {
    try {
      await loadFaceDetectionModel();
      setState((s) => ({ ...s, modelLoaded: true, error: null }));
    } catch (err) {
      setState((s) => ({
        ...s,
        error: err instanceof Error ? err.message : "Failed to load face detection model",
      }));
    }
  }, []);

  // Load model on mount
  useEffect(() => {
    loadModel();
  }, [loadModel]);

  /** Run detection on a single image element and draw overlay */
  const processImage = useCallback(
    async (img: HTMLImageElement) => {
      if (!state.modelLoaded) return null;
      setState((s) => ({ ...s, isDetecting: true, error: null }));

      try {
        const result = await detectFaces(img);
        setState((s) => ({ ...s, count: result.count, isDetecting: false }));

        if (canvasRef.current) {
          drawFaceOverlay(canvasRef.current, result.faces, img.width, img.height);
        }

        return result;
      } catch (err) {
        setState((s) => ({
          ...s,
          error: err instanceof Error ? err.message : "Detection failed",
          isDetecting: false,
        }));
        return null;
      }
    },
    [state.modelLoaded],
  );

  /** Run detection on a video frame and draw overlay */
  const processVideoFrame = useCallback(
    async (video: HTMLVideoElement) => {
      if (!state.modelLoaded) return;
      setState((s) => ({ ...s, isDetecting: true, error: null }));

      try {
        const result = await detectFaces(video);
        setState((s) => ({ ...s, count: result.count, isDetecting: false }));

        if (canvasRef.current) {
          drawFaceOverlay(canvasRef.current, result.faces, video.videoWidth, video.videoHeight);
        }
      } catch (err) {
        setState((s) => ({
          ...s,
          error: err instanceof Error ? err.message : "Frame detection failed",
          isDetecting: false,
        }));
      }
    },
    [state.modelLoaded],
  );

  const reset = useCallback(() => {
    setState({ count: 0, isDetecting: false, error: null, modelLoaded: state.modelLoaded });
    if (canvasRef.current) {
      canvasRef.current.getContext("2d")?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  }, [state.modelLoaded]);

  return { canvasRef, state, processImage, processVideoFrame, reset, loadModel };
}
