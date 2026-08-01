"use client";

import React, { useEffect, useRef, useState } from "react";

type WeekDay =
  | "Lunes"
  | "Martes"
  | "Miércoles"
  | "Jueves"
  | "Viernes"
  | "Sábado"
  | "Domingo";

interface ChartData {
  labels: WeekDay[];
  datasets: {
    day: WeekDay;
    data: number;
  }[];
}

interface ChartProps {
  data?: ChartData;
}

export const Chart: React.FC<ChartProps> = ({ data: externalData }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(500);

  const [hoveredPoint, setHoveredPoint] = useState<{
    x: number;
    y: number;
    val: number;
    day: WeekDay;
  } | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width;
      if (width && width > 0) {
        setContainerWidth(width);
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const weekDays: WeekDay[] = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
    "Domingo",
  ];

  const defaultData: ChartData = {
    labels: weekDays,
    datasets: [
      { day: "Lunes", data: 1 },
      { day: "Martes", data: 2 },
      { day: "Miércoles", data: 9 },
      { day: "Jueves", data: 4 },
      { day: "Viernes", data: 5 },
      { day: "Sábado", data: 6 },
      { day: "Domingo", data: 7 },
    ],
  };

  const activeData = externalData || defaultData;

  const dataMap = new Map(
    activeData.datasets.map((item) => [item.day, item.data]),
  );
  const values = weekDays.map((day) => dataMap.get(day) ?? 0);

  // El viewBox usa el ancho REAL medido del contenedor y un alto fijo,
  // así el SVG nunca necesita estirarse de forma no uniforme (lo cual
  // deformaría círculos, números y letras).
  const svgWidth = containerWidth;
  const svgHeight = 200;
  const padding = 35;

  const maxValue = Math.max(...values, 1);
  const minValue = 0;

  const yTicks = [
    maxValue,
    Math.round(maxValue * 0.66),
    Math.round(maxValue * 0.33),
    minValue,
  ];

  const points = values.map((val, index) => {
    const x =
      padding + (index / (values.length - 1)) * (svgWidth - padding * 2);
    const y =
      svgHeight -
      padding -
      ((val - minValue) / (maxValue - minValue)) * (svgHeight - padding * 2);
    return { x, y, val, day: weekDays[index] };
  });

  const createSmoothPath = (pts: typeof points) => {
    if (pts.length === 0) return "";
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;

    const k = 0.15;

    return pts.reduce((path, point, i) => {
      if (i === 0) return `M ${point.x} ${point.y}`;

      const prev = pts[i - 1];
      const prevPrev = pts[i - 2] || prev;
      const next = pts[i + 1] || point;

      const cp1x = prev.x + (point.x - prevPrev.x) * k;
      const cp1y = prev.y + (point.y - prevPrev.y) * k;

      const cp2x = point.x - (next.x - prev.x) * k;
      const cp2y = point.y - (next.y - prev.y) * k;

      return `${path} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${point.x} ${point.y}`;
    }, "");
  };

  const linePath = createSmoothPath(points);

  const stepWidth = (svgWidth - padding * 2) / (weekDays.length - 1);

  return (
    <div className="w-full rounded-lg">
      <div ref={containerRef} className="relative w-full h-[200px]">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-full overflow-visible"
          onMouseLeave={() => setHoveredPoint(null)}
        >
          {yTicks.map((tick, i) => {
            const y =
              svgHeight -
              padding -
              ((tick - minValue) / (maxValue - minValue)) *
                (svgHeight - padding * 2);
            return (
              <g key={i}>
                <line
                  x1={padding}
                  y1={y}
                  x2={svgWidth - padding}
                  y2={y}
                  className="stroke-primary-lighter/10"
                  strokeDasharray="4 4"
                  strokeWidth="0.5"
                />
                <text
                  x={padding - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-text font-mono text-[10px] opacity-70"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {hoveredPoint && (
            <line
              x1={hoveredPoint.x}
              y1={padding}
              x2={hoveredPoint.x}
              y2={svgHeight - padding}
              className="stroke-gray-300 dark:stroke-gray-600"
              strokeWidth="1.5"
              strokeDasharray="2 2"
            />
          )}

          <path
            d={linePath}
            fill="none"
            className="stroke-primary"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {points.map((p) => (
            <text
              key={`label-${p.day}`}
              x={p.x}
              y={svgHeight - 10}
              textAnchor="middle"
              className={`font-mono text-[10px] transition-all ${
                hoveredPoint?.day === p.day
                  ? "fill-primary font-bold opacity-100"
                  : "fill-text opacity-80"
              }`}
            >
              {p.day.slice(0, 1)}{" "}
            </text>
          ))}

          {points.map((p) => {
            const isHovered = hoveredPoint?.day === p.day;

            return (
              <g key={p.day}>
                <rect
                  x={p.x - stepWidth / 2}
                  y={0}
                  width={stepWidth}
                  height={svgHeight}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredPoint(p)}
                />

                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? "6" : "3.5"}
                  className={`transition-all duration-150 ${
                    isHovered
                      ? "fill-primary stroke-white dark:stroke-gray-900 stroke-2"
                      : "fill-transparent"
                  }`}
                />
              </g>
            );
          })}
        </svg>

        {hoveredPoint && (
          <div
            className="absolute z-10 pointer-events-none transform -translate-x-1/2 -translate-y-full transition-all duration-75"
            style={{
              left: `${(hoveredPoint.x / svgWidth) * 100}%`,
              top: `${(hoveredPoint.y / svgHeight) * 100 - 12}%`,
            }}
          >
            <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border border-gray-200 dark:border-slate-700 shadow-lg rounded-xl p-3 text-xs flex flex-col gap-1 min-w-25">
              <span className="font-semibold text-gray-500 dark:text-gray-400 text-center border-b border-gray-100 dark:border-slate-700/50 pb-1">
                {hoveredPoint.day}
              </span>
              <div className="flex items-center justify-between gap-2 mt-0.5">
                <span className="text-primary font-bold">:</span>
                <span className="font-mono font-bold text-gray-800 dark:text-gray-100">
                  ${hoveredPoint.val}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
