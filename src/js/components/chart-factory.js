// js/components/chart-factory.js - Reusable chart rendering
import ApexCharts from "apexcharts";

/**
 * Renders an ApexChart if the target element exists
 * @param {string} selector - CSS selector for the chart container
 * @param {object} options - ApexCharts configuration options
 * @returns {ApexCharts|null} - The chart instance or null
 */
export function renderChart(selector, options) {
  const element = document.querySelector(selector);
  if (element) {
    const chart = new ApexCharts(element, options);
    chart.render();
    return chart;
  }
  return null;
}

// Common chart defaults
export const chartDefaults = {
  fontFamily: "Satoshi, sans-serif",
  toolbar: { show: false },
  dropShadow: {
    enabled: true,
    color: "#623CEA14",
    top: 10,
    blur: 4,
    left: 0,
    opacity: 0.1,
  },
};

// Common colors
export const chartColors = {
  primary: "#7AD9FF",
  secondary: "#80CAEE",
  accent: "#FF7A81",
  tertiary: "#6577F3",
  quaternary: "#8FD0EF",
  quinary: "#0FADCF",
};
