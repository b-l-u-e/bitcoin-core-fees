"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";

interface BlockData {
  height: number;
  p25: number | null;
  p75: number | null;
}

interface EstimatePoint {
  height: number;
  value: number;
}

interface BlockStatsChartProps {
  blocks: BlockData[];
  startHeight: number;
  endHeight: number;
  estimatePoints: EstimatePoint[];
  estimateLabel?: string;
}

export default function BlockStatsChartD3({
  blocks,
  startHeight,
  endHeight,
  estimatePoints,
  estimateLabel = "Fee estimate",
}: BlockStatsChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || blocks.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 80, bottom: 60, left: 80 };
    const width = 1000 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const maxDataHeight = d3.max(blocks, (d) => d.height) ?? endHeight;
    const maxEstimateHeight =
      d3.max(estimatePoints, (d) => d.height) ?? endHeight;
    const xDomainEnd = Math.max(endHeight, maxDataHeight, maxEstimateHeight);

    // Collect positive values for log scale domain
    const percentileValues = blocks.flatMap((d) =>
      [d.p25, d.p75].filter((v): v is number => v != null && v > 0)
    );
    const estimateValues = estimatePoints
      .map((d) => d.value)
      .filter((v) => v != null && v > 0);
    const combinedValues = [...percentileValues, ...estimateValues];

    // For log scale, compute proper min/max with padding
    const rawMin =
      combinedValues.length > 0 ? (d3.min(combinedValues) as number) : 1;
    const rawMax =
      combinedValues.length > 0 ? (d3.max(combinedValues) as number) : 10;

    // Ensure minimum is at least 0.1 sat/vB for log scale; pad by factor for headroom
    const minPositive = Math.max(0.1, rawMin * 0.8);
    const maxPositive = Math.max(rawMax * 1.2, minPositive * 2);

    const safeValue = (value: number | null | undefined) =>
      value && value > 0 ? value : minPositive;

    // Scales
    const xScale = d3
      .scaleLinear()
      .domain([startHeight, xDomainEnd])
      .range([0, width]);

    const yScale = d3
      .scaleLog()
      .domain([minPositive, maxPositive])
      .range([height, 0])
      .nice();

    // Area generator for p25-p75 range
    const area = d3
      .area<BlockData>()
      .x((d) => xScale(d.height))
      .y0((d) => yScale(safeValue(d.p25)))
      .y1((d) => yScale(safeValue(d.p75)))
      .curve(d3.curveMonotoneX);

    const rangeLine = (accessor: (d: BlockData) => number | null) =>
      d3
        .line<BlockData>()
        .x((d) => xScale(d.height))
        .y((d) => yScale(safeValue(accessor(d))))
        .curve(d3.curveMonotoneX);

    const estimateLine = d3
      .line<EstimatePoint>()
      .x((d) => xScale(d.height))
      .y((d) => yScale(safeValue(d.value)))
      .curve(d3.curveStepAfter);

    // Add gradient for area
    const gradient = svg
      .append("defs")
      .append("linearGradient")
      .attr("id", "rangeGradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");

    gradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#cc7400")
      .attr("stop-opacity", 0.4);

    gradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#cc7400")
      .attr("stop-opacity", 0.1);

    // Add area for p25-p75 range
    g.append("path")
      .datum(blocks)
      .attr("fill", "url(#rangeGradient)")
      .attr("d", area);

    // Add p25 line
    g.append("path")
      .datum(blocks)
      .attr("fill", "none")
      .attr("stroke", "#cc7400")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "3,3")
      .attr("opacity", 0.6)
      .attr("d", rangeLine((d) => d.p25)(blocks));

    // Add p75 line
    g.append("path")
      .datum(blocks)
      .attr("fill", "none")
      .attr("stroke", "#cc7400")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "3,3")
      .attr("opacity", 0.6)
      .attr("d", rangeLine((d) => d.p75)(blocks));

    // Add fee estimate line
    if (estimatePoints.length > 0) {
      g.append("path")
        .datum(estimatePoints)
        .attr("fill", "none")
        .attr("stroke", "#38bdf8")
        .attr("stroke-width", 2.5)
        .attr("stroke-dasharray", "4,2")
        .attr("d", estimateLine);
    }

    // X Axis
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(
        d3
          .axisBottom(xScale)
          .ticks(8)
          .tickFormat((d) => d3.format(",")(d as number))
      )
      .attr("color", "#94a3b8")
      .selectAll("text")
      .style("fill", "#94a3b8")
      .style("font-size", "12px");

    // Left Y Axis (log fee range) - use powers of 10 for clean log scale display
    const powersOf10 = [
      0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000,
    ];
    const [yMin, yMax] = yScale.domain();
    const logTicks = powersOf10.filter((t) => t >= yMin && t <= yMax);
    g.append("g")
      .call(
        d3
          .axisLeft(yScale)
          .tickValues(logTicks.length > 0 ? logTicks : yScale.ticks(5))
          .tickFormat((d) => {
            const val = d as number;
            if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
            if (val >= 1) return val.toFixed(0);
            return val.toString();
          })
      )
      .attr("color", "#cc7400")
      .selectAll("text")
      .style("fill", "#cc7400")
      .style("font-size", "12px");

    // Axis labels
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - height / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("fill", "#cc7400")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .text("sat/vB");

    g.append("text")
      .attr(
        "transform",
        `translate(${width / 2}, ${height + margin.bottom - 10})`
      )
      .style("text-anchor", "middle")
      .style("fill", "#e2e8f0")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .text("Block Height");

    // Legend
    const legend = g
      .append("g")
      .attr("transform", `translate(${width - 240}, 20)`);

    legend
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", 12)
      .attr("height", 12)
      .attr("fill", "url(#rangeGradient)");

    legend
      .append("text")
      .attr("x", 18)
      .attr("y", 9)
      .style("fill", "#e2e8f0")
      .style("font-size", "12px")
      .text("Range (25th-75th pct)");

    legend
      .append("line")
      .attr("x1", 0)
      .attr("x2", 12)
      .attr("y1", 20)
      .attr("y2", 20)
      .attr("stroke", "#38bdf8")
      .attr("stroke-width", 2.5)
      .attr("stroke-dasharray", "4,2");

    legend
      .append("text")
      .attr("x", 18)
      .attr("y", 23)
      .style("fill", "#e2e8f0")
      .style("font-size", "12px")
      .text(estimateLabel);
  }, [blocks, startHeight, endHeight, estimateLabel, estimatePoints]);

  return (
    <div className="bg-[#0b1324] backdrop-blur-sm rounded-2xl border border-[#1f2a3a] p-6 shadow-xl shadow-black/30">
      <h2 className="text-slate-200 text-lg mb-2">
        Mempool Fee Percentiles (log scale)
      </h2>

      <p className="text-slate-400 mb-6">
        Heights {startHeight.toLocaleString()} – {endHeight.toLocaleString()}
      </p>

      <div className="overflow-x-auto">
        <svg ref={svgRef} width="1000" height="400" className="w-full h-auto" />
      </div>
    </div>
  );
}
