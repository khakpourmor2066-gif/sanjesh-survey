"use client";

import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import jsQR from "jsqr";
import { getDictionary, type Lang } from "@/lib/i18n";

export default function ScanPage({
  params,
}: {
  params: Promise<{ lang: Lang }>;
}) {
  const { lang } = use(params);
  const t = getDictionary(lang);
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [error, setError] = useState("");
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let rafId = 0;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setScanning(true);
        scanLoop();
      } catch {
        setError(t.cameraDenied);
      }
    };

    const scanLoop = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      if (code?.data) {
        handleScan(code.data);
        return;
      }
      rafId = requestAnimationFrame(scanLoop);
    };

    const handleScan = (data: string) => {
      setScanning(false);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      cancelAnimationFrame(rafId);

      const employeeId = extractEmployeeId(data);
      if (!employeeId) {
        setError(t.invalidEmployee);
        return;
      }
      router.replace(`/${lang}/auth?employeeId=${encodeURIComponent(employeeId)}`);
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      cancelAnimationFrame(rafId);
    };
  }, [lang, router, t.cameraDenied, t.invalidEmployee]);

  return (
    <main className="orbit min-h-screen px-6 py-10 text-[var(--ink)]">
      <div className="mx-auto flex max-w-xl flex-col gap-6 text-center">
        <div className="surface rounded-[28px] p-8 sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--accent)]">
            {t.scanQrTitle}
          </p>
          <h1 className="mt-3 text-2xl font-semibold">{t.scanQr}</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {t.scanQrHint}
          </p>
        </div>

        <div className="surface rounded-[28px] p-6">
          <div className="relative overflow-hidden rounded-2xl bg-slate-900">
            <video ref={videoRef} className="h-72 w-full object-cover" />
            <canvas ref={canvasRef} className="hidden" />
            <div className="pointer-events-none absolute inset-0 border-2 border-white/30" />
          </div>
          {scanning ? (
            <p className="mt-4 text-xs text-[var(--muted)]">{t.scanning}</p>
          ) : null}
          {error ? (
            <p className="mt-4 text-sm font-medium text-rose-600">{error}</p>
          ) : null}
        </div>
      </div>
    </main>
  );
}

function extractEmployeeId(data: string) {
  try {
    const url = new URL(data);
    const parts = url.pathname.split("/");
    const idx = parts.findIndex((part) => part === "e");
    if (idx >= 0 && parts[idx + 1]) {
      return parts[idx + 1];
    }
    const employeeId = url.searchParams.get("employeeId");
    if (employeeId) return employeeId;
  } catch {
    // not a URL
  }
  return data.trim();
}
