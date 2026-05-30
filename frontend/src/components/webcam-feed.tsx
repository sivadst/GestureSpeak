"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { motion } from "framer-motion";
import { Video, VideoOff, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface WebcamFeedProps {
  onFrame?: (frameBase64: string) => void;
  isActive: boolean;
  onToggle: () => void;
  fps?: number;
  showLandmarks?: boolean;
  landmarks?: any[];
}

export default function WebcamFeed({
  onFrame,
  isActive,
  onToggle,
  fps = 5,
  showLandmarks = true,
  landmarks = [],
}: WebcamFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasCamera, setHasCamera] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
      setHasCamera(true);
    } catch {
      setHasCamera(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const captureFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !onFrame) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video.readyState < 2) return;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    const base64 = canvas.toDataURL("image/jpeg", 0.6);
    onFrame(base64);
  }, [onFrame]);

  // Draw landmarks overlay
  useEffect(() => {
    if (!showLandmarks || !overlayCanvasRef.current || landmarks.length === 0)
      return;
    const canvas = overlayCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const parent = canvas.parentElement;
    if (parent) {
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // MediaPipe hand connections
    const connections = [
      [0, 1], [1, 2], [2, 3], [3, 4],
      [0, 5], [5, 6], [6, 7], [7, 8],
      [5, 9], [9, 10], [10, 11], [11, 12],
      [9, 13], [13, 14], [14, 15], [15, 16],
      [13, 17], [17, 18], [18, 19], [19, 20],
      [0, 17],
    ];

    for (const hand of landmarks) {
      // Draw connections
      ctx.strokeStyle = "rgba(0, 255, 200, 0.6)";
      ctx.lineWidth = 2;
      for (const [a, b] of connections) {
        if (hand[a] && hand[b]) {
          ctx.beginPath();
          ctx.moveTo(hand[a].x * canvas.width, hand[a].y * canvas.height);
          ctx.lineTo(hand[b].x * canvas.width, hand[b].y * canvas.height);
          ctx.stroke();
        }
      }

      // Draw landmarks
      for (const point of hand) {
        ctx.beginPath();
        ctx.arc(
          point.x * canvas.width,
          point.y * canvas.height,
          4,
          0,
          2 * Math.PI
        );
        ctx.fillStyle = "rgba(0, 200, 255, 0.9)";
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }, [landmarks, showLandmarks]);

  useEffect(() => {
    if (isActive) {
      startCamera();
      intervalRef.current = setInterval(captureFrame, 1000 / fps);
    } else {
      stopCamera();
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      stopCamera();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, fps, startCamera, stopCamera, captureFrame]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative group">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 backdrop-blur-sm"
      >
        {/* Video feed */}
        <div className="relative aspect-[4/3] bg-slate-900/50">
          {isActive && hasCamera ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]"
              />
              <canvas
                ref={overlayCanvasRef}
                className="absolute inset-0 w-full h-full transform scale-x-[-1] pointer-events-none"
              />
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-cyan-500/20 animate-ping" />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10">
                  <VideoOff className="h-8 w-8 text-white/40" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-white/60 text-sm">
                  {hasCamera ? "Camera is off" : "Camera not available"}
                </p>
                <p className="text-white/40 text-xs mt-1">
                  Click the button below to start
                </p>
              </div>
            </div>
          )}

          {/* Hidden canvas for frame capture */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Status indicator */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            {isActive && (
              <Badge variant="success" className="gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                LIVE
              </Badge>
            )}
          </div>

          {/* Fullscreen button */}
          <button
            onClick={toggleFullscreen}
            className="absolute top-3 right-3 p-2 rounded-lg bg-black/40 text-white/60 hover:text-white hover:bg-black/60 transition-all opacity-0 group-hover:opacity-100"
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </button>

          {/* Scanning effect */}
          {isActive && (
            <div className="absolute inset-0 pointer-events-none">
              <motion.div
                animate={{ y: ["0%", "100%", "0%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-30"
              />
            </div>
          )}
        </div>

        {/* Controls bar */}
        <div className="flex items-center justify-between p-3 border-t border-white/5">
          <Button
            onClick={onToggle}
            variant={isActive ? "destructive" : "default"}
            size="sm"
            className="gap-2"
          >
            {isActive ? (
              <>
                <VideoOff className="h-4 w-4" />
                Stop Camera
              </>
            ) : (
              <>
                <Video className="h-4 w-4" />
                Start Camera
              </>
            )}
          </Button>
          <span className="text-xs text-white/40">{fps} FPS</span>
        </div>
      </motion.div>
    </div>
  );
}
