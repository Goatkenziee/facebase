// FaceBase — face detection engine wrapping face-api.js
// Loads models from CDN, detects faces on canvas/image elements.
// Returns normalized face data for overlay rendering + persistence.

import * as faceapi from "face-api.js";

// Model URLs — we use the UNPKG CDN for the tiny-face-detector model
// (~200KB, fast enough for real-time on modern devices)
const MODEL_URL = "https://unpkg.com/@vladmandic/face-api/model/";

type FaceDetectionResult = {
  top: number;
  left: number;
  width: number;
  height: number;
  confidence: number;
};

type FaceDetectionOutput = {
  count: number;
  faces: FaceDetectionResult[];
};

let modelsLoaded = false;

/** Load the face detection model once. Idempotent. */
export async function loadFaceDetectionModel(): Promise<void> {
  if (modelsLoaded) return;
  try {
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    modelsLoaded = true;
  } catch (err) {
    console.error("FaceBase: failed to load detection model", err);
    throw new Error("Face detection model could not be loaded. Check network.");
  }
}

/** Detect faces in an HTMLImageElement or HTMLVideoElement.
 *  Returns count + array of face bounding boxes with confidence. */
export async function detectFaces(
  input: HTMLImageElement | HTMLVideoElement,
): Promise<FaceDetectionOutput> {
  if (!modelsLoaded) await loadFaceDetectionModel();

  const detections = await faceapi
    .detectAllFaces(input, new faceapi.TinyFaceDetectorOptions({
      inputSize: 320,
      scoreThreshold: 0.5,
    }))
    .withFaceLandmarks()
    .withFaceDescriptors();

  const faces: FaceDetectionResult[] = detections.map((d: { detection: { box: { y: number; x: number; width: number; height: number }; score: number } }) => ({
    top: d.detection.box.y,
    left: d.detection.box.x,
    width: d.detection.box.width,
    height: d.detection.box.height,
    confidence: d.detection.score,
  }));

  return { count: faces.length, faces };
}

/** Draw face bounding boxes onto a canvas overlay.
 *  The canvas should be positioned over the source image/video. */
export function drawFaceOverlay(
  canvas: HTMLCanvasElement,
  faces: FaceDetectionResult[],
  displayWidth: number,
  displayHeight: number,
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  canvas.width = displayWidth;
  canvas.height = displayHeight;

  ctx.clearRect(0, 0, displayWidth, displayHeight);

  for (const face of faces) {
    ctx.strokeStyle = "hsl(38, 92%, 50%)";
    ctx.lineWidth = 3;
    ctx.shadowBlur = 8;
    ctx.shadowColor = "hsl(38, 92%, 50% / 0.5)";
    ctx.strokeRect(face.left, face.top, face.width, face.height);

    // Confidence badge
    const pct = Math.round(face.confidence * 100);
    ctx.fillStyle = "hsl(38, 92%, 50%)";
    ctx.font = "bold 12px ui-sans-serif, sans-serif";
    ctx.fillText(`${pct}%`, face.left + 4, face.top - 4);
  }
}
