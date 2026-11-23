import React, { useEffect, useRef, useState } from 'react';
import {
  FileVideo,
  Lock,
  Pause,
  Play,
  RotateCcw,
  Upload,
} from 'lucide-react';
import { AiObservation, VideoMetadata } from '../../types';
import { formatFileSize, formatSecondsToTimestamp } from '../../utils/formatters';

interface VideoEvidencePlayerProps {
  assessmentId: string;
  competency: string;
  candidateName: string;
  videoMeta: VideoMetadata;
  localVideoUrl?: string;
  observations: AiObservation[];
  seekRequest: { seconds: number; nonce: number } | null;
  onAttachVideo: (objectUrl: string, meta: VideoMetadata) => void;
  onTimeUpdate?: (seconds: number) => void;
}

export function VideoEvidencePlayer({
  assessmentId,
  competency,
  candidateName,
  videoMeta,
  localVideoUrl,
  observations,
  seekRequest,
  onAttachVideo,
  onTimeUpdate,
}: VideoEvidencePlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [dragActive, setDragActive] = useState(false);
  const [demoActive, setDemoActive] = useState(videoMeta.uploadStatus === 'Demo Simulation');
  const [demoPlaying, setDemoPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState<number>(videoMeta.durationSeconds || 105);

  // Reset demo mode when switching assessments
  useEffect(() => {
    setDemoActive(videoMeta.uploadStatus === 'Demo Simulation' && !localVideoUrl);
    setDemoPlaying(false);
    setCurrentTime(0);
    setDuration(videoMeta.durationSeconds || 105);
  }, [assessmentId, localVideoUrl, videoMeta.uploadStatus, videoMeta.durationSeconds]);

  // Handle seek requests from clicked timestamps
  useEffect(() => {
    if (!seekRequest) return;
    const targetSec = seekRequest.seconds;

    if (localVideoUrl && videoRef.current) {
      videoRef.current.currentTime = targetSec;
      videoRef.current.play().catch(() => {
        // Autoplay might be restricted; still seeked cleanly
      });
      setCurrentTime(targetSec);
      return;
    }

    if (!localVideoUrl) {
      setDemoActive(true);
      setCurrentTime(targetSec);
      onTimeUpdate?.(targetSec);
    }
  }, [seekRequest, localVideoUrl, onTimeUpdate]);

  // Demo playback timer loop
  useEffect(() => {
    if (!demoActive || !demoPlaying || localVideoUrl) return;
    const interval = window.setInterval(() => {
      setCurrentTime((prev) => {
        const next = prev + 0.5;
        if (next >= duration) {
          setDemoPlaying(false);
          return duration;
        }
        onTimeUpdate?.(next);
        return next;
      });
    }, 500);
    return () => window.clearInterval(interval);
  }, [demoActive, demoPlaying, localVideoUrl, duration, onTimeUpdate]);

  // Render crisp interactive demo workshop canvas preview when no local file is attached
  useEffect(() => {
    if (!demoActive || localVideoUrl) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Dark workshop studio slate backdrop
    ctx.fillStyle = '#18181B';
    ctx.fillRect(0, 0, w, h);

    // Subtle workbench grid
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Simulated camera framing corner brackets
    ctx.strokeStyle = 'rgba(129, 140, 248, 0.55)';
    ctx.lineWidth = 2;
    const pad = 28;
    const arm = 22;
    // Top-left
    ctx.beginPath();
    ctx.moveTo(pad, pad + arm);
    ctx.lineTo(pad, pad);
    ctx.lineTo(pad + arm, pad);
    ctx.stroke();
    // Top-right
    ctx.beginPath();
    ctx.moveTo(w - pad - arm, pad);
    ctx.lineTo(w - pad, pad);
    ctx.lineTo(w - pad, pad + arm);
    ctx.stroke();
    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(pad, h - pad - arm);
    ctx.lineTo(pad, h - pad);
    ctx.lineTo(pad + arm, h - pad);
    ctx.stroke();
    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(w - pad - arm, h - pad);
    ctx.lineTo(w - pad, h - pad);
    ctx.lineTo(w - pad, h - pad - arm);
    ctx.stroke();

    // Find nearest observation at currentTime
    const activeObs = [...observations]
      .reverse()
      .find((obs) => currentTime >= obs.timestampSeconds);

    // Simulated task stage visual indicator
    const progress = Math.min(1, currentTime / Math.max(1, duration));
    ctx.fillStyle = '#27272A';
    ctx.fillRect(pad + 20, h / 2 - 42, w - (pad + 20) * 2, 84);
    ctx.strokeStyle = '#3F3F46';
    ctx.strokeRect(pad + 20, h / 2 - 42, w - (pad + 20) * 2, 84);

    // Animated activity waveform bar representing practical motion
    const barCount = 24;
    const innerW = w - (pad + 36) * 2;
    const step = innerW / barCount;
    for (let i = 0; i < barCount; i++) {
      const wave = Math.sin(currentTime * 1.4 + i * 0.65) * 0.5 + 0.5;
      const barH = 12 + wave * 36;
      const barX = pad + 36 + i * step;
      const isPassed = i / barCount <= progress;
      ctx.fillStyle = isPassed ? '#6366F1' : '#3F3F46';
      ctx.fillRect(barX, h / 2 - barH / 2, Math.max(4, step - 6), barH);
    }

    // Header overlay inside simulated frame
    ctx.fillStyle = '#A1A1AA';
    ctx.font = '500 12px "JetBrains Mono", monospace';
    ctx.fillText(`DEMO PLAYBACK SIMULATION · ${competency.toUpperCase()}`, pad + 18, pad + 26);

    ctx.fillStyle = '#F4F4F5';
    ctx.font = '600 16px "DM Sans", sans-serif';
    ctx.fillText(
      activeObs
        ? `${activeObs.timestampLabel} — ${activeObs.criterionTitle}`
        : `Ready to inspect ${candidateName}'s practical submission`,
      pad + 18,
      h - pad - 42
    );

    ctx.fillStyle = '#D4D4D8';
    ctx.font = '400 13px "DM Sans", sans-serif';
    const caption = activeObs
      ? activeObs.description.slice(0, 95) + (activeObs.description.length > 95 ? '...' : '')
      : 'Press Play or click any timestamped observation on the right to scrub.';
    ctx.fillText(caption, pad + 18, h - pad - 18);
  }, [demoActive, localVideoUrl, currentTime, duration, observations, competency, candidateName]);

  const handleFileSelected = (file: File | null | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('video/')) return;
    const objectUrl = URL.createObjectURL(file);
    setDemoActive(false);
    setDemoPlaying(false);
    onAttachVideo(objectUrl, {
      filename: file.name,
      durationSeconds: null,
      fileSizeLabel: formatFileSize(file.size),
      uploadStatus: 'Attached (Local)',
      uploadedAt: new Date().toISOString(),
    });
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    const realDuration = Math.round(videoRef.current.duration);
    if (!Number.isNaN(realDuration) && realDuration > 0) {
      setDuration(realDuration);
      onAttachVideo(localVideoUrl || '', {
        ...videoMeta,
        durationSeconds: realDuration,
        uploadStatus: 'Attached (Local)',
      });
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
      {/* Top Evidence Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <FileVideo className="h-4 w-4 shrink-0 text-indigo-600" aria-hidden="true" />
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-zinc-900">{videoMeta.filename}</p>
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-zinc-500 tabular-nums">
              <span>{videoMeta.uploadStatus}</span>
              <span aria-hidden="true">·</span>
              <span>
                Duration:{' '}
                {duration ? formatSecondsToTimestamp(duration) : 'Pending load'}
              </span>
              {videoMeta.fileSizeLabel !== '—' && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{videoMeta.fileSizeLabel}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-md border border-zinc-200 bg-[#F8F8F6] px-2 py-1 text-[11px] font-medium text-zinc-600">
            <Lock className="h-3 w-3 text-zinc-500" aria-hidden="true" />
            <span>Local Preview Only</span>
          </span>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>{localVideoUrl ? 'Replace local video' : 'Upload local video'}</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => handleFileSelected(e.target.files?.[0])}
          />
        </div>
      </div>

      {/* Main Video / Demo Player Area */}
      <div className="bg-zinc-950">
        {localVideoUrl ? (
          <div className="relative">
            <video
              ref={videoRef}
              src={localVideoUrl}
              controls
              onLoadedMetadata={handleLoadedMetadata}
              onTimeUpdate={() => {
                if (videoRef.current) {
                  const t = videoRef.current.currentTime;
                  setCurrentTime(t);
                  onTimeUpdate?.(t);
                }
              }}
              className="aspect-video w-full bg-black object-contain"
            />
          </div>
        ) : demoActive ? (
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={800}
              height={450}
              className="aspect-video w-full bg-zinc-900"
            />
            {/* Demo Transport Bar */}
            <div className="flex items-center gap-3 border-t border-zinc-800 bg-zinc-900 px-4 py-2.5 text-zinc-100">
              <button
                type="button"
                onClick={() => setDemoPlaying((p) => !p)}
                aria-label={demoPlaying ? 'Pause demo playback' : 'Play demo playback'}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-indigo-600 text-white hover:bg-indigo-500"
              >
                {demoPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  setDemoPlaying(false);
                  setCurrentTime(0);
                  onTimeUpdate?.(0);
                }}
                aria-label="Restart demo playback"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>

              <input
                type="range"
                min={0}
                max={duration}
                step={1}
                value={Math.min(currentTime, duration)}
                aria-label="Seek demo timeline"
                onChange={(e) => {
                  const next = Number(e.target.value);
                  setCurrentTime(next);
                  onTimeUpdate?.(next);
                }}
                className="h-1.5 flex-1 cursor-pointer accent-indigo-500"
              />

              <span className="font-mono text-xs text-zinc-300 tabular-nums">
                {formatSecondsToTimestamp(currentTime)} / {formatSecondsToTimestamp(duration)}
              </span>
            </div>
          </div>
        ) : (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              handleFileSelected(e.dataTransfer.files?.[0]);
            }}
            className={`flex aspect-video flex-col items-center justify-center border-2 border-dashed p-6 text-center transition-colors ${
              dragActive
                ? 'border-indigo-400 bg-indigo-950/30'
                : 'border-zinc-800 bg-zinc-900'
            }`}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-300">
              <Upload className="h-5 w-5" />
            </div>
            <h3 className="mt-3 font-display text-sm font-semibold text-white">
              Select a local video file to review
            </h3>
            <p className="mt-1 max-w-md text-xs text-zinc-400">
              Drag and drop an MP4, WebM, or MOV recording from your device. Videos stay strictly in your browser and are never uploaded to a public server.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white hover:bg-indigo-500"
              >
                Choose video file
              </button>
              <button
                type="button"
                onClick={() => setDemoActive(true)}
                className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-xs font-medium text-zinc-200 hover:bg-zinc-700"
              >
                Load demo timeline player
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Timestamp Jump Bar */}
      <div className="flex flex-wrap items-center gap-2 border-t border-zinc-200 bg-[#F8F8F6] px-4 py-2.5">
        <span className="text-[11px] font-medium text-zinc-500">Jump to timestamp:</span>
        {observations.map((obs) => {
          const isNear = Math.abs(currentTime - obs.timestampSeconds) <= 3;
          return (
            <button
              key={obs.id}
              type="button"
              onClick={() => {
                if (localVideoUrl && videoRef.current) {
                  videoRef.current.currentTime = obs.timestampSeconds;
                  videoRef.current.play().catch(() => {});
                  setCurrentTime(obs.timestampSeconds);
                } else {
                  setDemoActive(true);
                  setCurrentTime(obs.timestampSeconds);
                  onTimeUpdate?.(obs.timestampSeconds);
                }
              }}
              className={`rounded-md border px-2 py-1 font-mono text-[11px] font-medium transition-colors tabular-nums ${
                isNear
                  ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                  : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50'
              }`}
            >
              {obs.timestampLabel}
            </button>
          );
        })}
      </div>
    </div>
  );
}
