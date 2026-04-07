"use client";

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsivePie } from "@nivo/pie";
import { ResponsiveLine } from "@nivo/line";
import { ResponsiveRadar } from "@nivo/radar";
import * as d3 from "d3";
import { AnalysisResult } from "@/lib/types";

const CHART_THEME = {
  fontFamily: "Inter, system-ui, sans-serif",
  fontSize: 11,
  textColor: "#57534e",
  grid: { line: { stroke: "#e7e5e4", strokeWidth: 1 } },
  axis: {
    ticks: { text: { fontSize: 10, fill: "#a8a29e" } },
    legend: { text: { fontSize: 11, fill: "#78716c", fontWeight: 500 } },
  },
  tooltip: {
    container: {
      background: "#1c1917",
      color: "#fafaf9",
      fontSize: 12,
      borderRadius: 2,
      padding: "8px 12px",
    },
  },
};

const COLORS = ["#1c1917", "#78716c", "#a8a29e", "#d6d3d1", "#8b7355", "#c4a97d"];

interface ChartsProps {
  analysis: AnalysisResult;
}

export function ScoreBarChart({ analysis }: ChartsProps) {
  const data = Object.entries(analysis.scores).map(([key, value]) => ({
    category: key.charAt(0).toUpperCase() + key.slice(1),
    score: value,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="chart-container h-[300px]"
    >
      <h3 className="text-[10px] uppercase tracking-widest text-stone-500 font-medium mb-4">
        Score Breakdown
      </h3>
      <ResponsiveBar
        data={data}
        keys={["score"]}
        indexBy="category"
        margin={{ top: 10, right: 20, bottom: 50, left: 50 }}
        padding={0.4}
        colors={COLORS}
        borderRadius={1}
        theme={CHART_THEME}
        axisBottom={{
          tickRotation: -30,
          legendPosition: "middle",
          legendOffset: 40,
        }}
        axisLeft={{
          legend: "Score",
          legendPosition: "middle",
          legendOffset: -40,
        }}
        animate={true}
        motionConfig="gentle"
        labelSkipWidth={12}
        labelSkipHeight={12}
        labelTextColor="#fafaf9"
      />
    </motion.div>
  );
}

export function BreakdownPieChart({ analysis }: ChartsProps) {
  const data = analysis.breakdown.map((item, i) => ({
    id: item.label,
    label: item.label,
    value: item.value,
    color: COLORS[i % COLORS.length],
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="chart-container h-[300px]"
    >
      <h3 className="text-[10px] uppercase tracking-widest text-stone-500 font-medium mb-4">
        Analysis Breakdown
      </h3>
      <ResponsivePie
        data={data}
        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        innerRadius={0.55}
        padAngle={2}
        cornerRadius={2}
        colors={COLORS}
        borderWidth={0}
        theme={CHART_THEME}
        arcLinkLabelsSkipAngle={10}
        arcLinkLabelsTextColor="#78716c"
        arcLinkLabelsThickness={1}
        arcLinkLabelsColor={{ from: "color" }}
        arcLabelsSkipAngle={10}
        arcLabelsTextColor="#fafaf9"
        animate={true}
        motionConfig="gentle"
      />
    </motion.div>
  );
}

export function ConfidenceRadarChart({ analysis }: ChartsProps) {
  const data = Object.entries(analysis.scores).map(([key, value]) => ({
    metric: key.charAt(0).toUpperCase() + key.slice(1),
    value: value,
    fullMark: 100,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
      className="chart-container h-[300px]"
    >
      <h3 className="text-[10px] uppercase tracking-widest text-stone-500 font-medium mb-4">
        Confidence Radar
      </h3>
      <ResponsiveRadar
        data={data}
        keys={["value"]}
        indexBy="metric"
        maxValue={100}
        margin={{ top: 30, right: 60, bottom: 30, left: 60 }}
        borderColor={{ from: "color" }}
        gridLabelOffset={16}
        dotSize={6}
        dotColor={{ theme: "background" }}
        dotBorderWidth={2}
        colors={["#1c1917"]}
        fillOpacity={0.15}
        blendMode="multiply"
        theme={CHART_THEME}
        animate={true}
        motionConfig="gentle"
      />
    </motion.div>
  );
}

export function TrendLineChart({ analysis }: ChartsProps) {
  const lineData = [
    {
      id: "Progress",
      data: Object.entries(analysis.scores).map(([key, value], i) => ({
        x: key.charAt(0).toUpperCase() + key.slice(1),
        y: value,
      })),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="chart-container h-[300px]"
    >
      <h3 className="text-[10px] uppercase tracking-widest text-stone-500 font-medium mb-4">
        Score Trend
      </h3>
      <ResponsiveLine
        data={lineData}
        margin={{ top: 10, right: 20, bottom: 50, left: 50 }}
        xScale={{ type: "point" }}
        yScale={{ type: "linear", min: 0, max: 100 }}
        curve="catmullRom"
        colors={["#1c1917"]}
        lineWidth={2}
        pointSize={8}
        pointColor="#fafaf9"
        pointBorderWidth={2}
        pointBorderColor="#1c1917"
        enableArea={true}
        areaBaselineValue={0}
        areaOpacity={0.08}
        theme={CHART_THEME}
        axisBottom={{
          tickRotation: -30,
        }}
        axisLeft={{
          legend: "Score",
          legendPosition: "middle",
          legendOffset: -40,
        }}
        animate={true}
        motionConfig="gentle"
      />
    </motion.div>
  );
}

export function D3GaugeChart({
  value,
  label,
  maxValue = 100,
}: {
  value: number;
  label: string;
  maxValue?: number;
}) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 200;
    const height = 120;
    const radius = 80;
    const startAngle = -Math.PI / 2;
    const endAngle = Math.PI / 2;

    const g = svg
      .attr("viewBox", `0 0 ${width} ${height}`)
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height - 10})`);

    // Background arc
    const bgArc = d3
      .arc()
      .innerRadius(radius - 12)
      .outerRadius(radius)
      .startAngle(startAngle)
      .endAngle(endAngle)
      .cornerRadius(6);

    g.append("path")
      .attr("d", bgArc as unknown as string)
      .attr("fill", "#e7e5e4");

    // Value arc
    const scale = d3.scaleLinear().domain([0, maxValue]).range([startAngle, endAngle]);
    const valueAngle = scale(Math.min(value, maxValue));

    const valueArc = d3
      .arc()
      .innerRadius(radius - 12)
      .outerRadius(radius)
      .startAngle(startAngle)
      .cornerRadius(6);

    g.append("path")
      .datum({ endAngle: startAngle })
      .attr("d", valueArc as unknown as string)
      .attr("fill", "#1c1917")
      .transition()
      .duration(1200)
      .ease(d3.easeCubicOut)
      .attrTween("d", function () {
        const interpolate = d3.interpolate(startAngle, valueAngle);
        return function (t: number) {
          return (valueArc as unknown as (d: { endAngle: number }) => string)({
            endAngle: interpolate(t),
          });
        };
      });

    // Value text
    g.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "-20")
      .attr("font-size", "24")
      .attr("font-weight", "300")
      .attr("fill", "#1c1917")
      .attr("font-family", "Inter, system-ui, sans-serif")
      .text("0")
      .transition()
      .duration(1200)
      .ease(d3.easeCubicOut)
      .tween("text", function () {
        const interpolate = d3.interpolateRound(0, value);
        return function (t: number) {
          d3.select(this).text(interpolate(t));
        };
      });

    // Label
    g.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0")
      .attr("font-size", "9")
      .attr("fill", "#a8a29e")
      .attr("font-family", "Inter, system-ui, sans-serif")
      .attr("letter-spacing", "0.1em")
      .text(label.toUpperCase());
  }, [value, label, maxValue]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="flex justify-center"
    >
      <svg ref={svgRef} className="w-full max-w-[200px]" />
    </motion.div>
  );
}

export function RiskIndicator({ level }: { level: "low" | "medium" | "high" }) {
  const colors = {
    low: { bg: "bg-emerald-50", text: "text-emerald-700", bar: "bg-emerald-500" },
    medium: { bg: "bg-amber-50", text: "text-amber-700", bar: "bg-amber-500" },
    high: { bg: "bg-red-50", text: "text-red-700", bar: "bg-red-500" },
  };

  const widths = { low: "33%", medium: "66%", high: "100%" };
  const c = colors[level];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`${c.bg} rounded-sm p-4`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] uppercase tracking-widest text-stone-500 font-medium">
          Risk Level
        </span>
        <span className={`text-xs font-medium ${c.text} uppercase`}>{level}</span>
      </div>
      <div className="h-1.5 bg-white/50 rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${c.bar} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: widths[level] }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
        />
      </div>
    </motion.div>
  );
}
