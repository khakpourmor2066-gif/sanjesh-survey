"use client";

import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

type Props = {
  labels: string[];
  values: number[];
  label: string;
};

export default function ReportBarChart({ labels, values, label }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    chartRef.current = new Chart(canvasRef.current, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label,
            data: values,
            backgroundColor: "rgba(37, 99, 235, 0.65)",
            borderRadius: 8,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: { intersect: false, mode: "index" },
        },
        scales: {
          y: {
            beginAtZero: true,
            suggestedMax: 10,
            ticks: { stepSize: 1 },
          },
        },
      },
    });

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [labels, values, label]);

  return <canvas ref={canvasRef} className="w-full" />;
}
