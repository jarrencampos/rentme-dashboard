// js/components/chart-01.js - Revenue Area Chart
import { renderChart, chartColors } from "./chart-factory";

const chart01 = () => {
  renderChart("#chartOne", {
    series: [
      { name: "CY Rev.", data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
      { name: "LY Rev.", data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    ],
    colors: [chartColors.primary, chartColors.secondary],
    chart: {
      fontFamily: "Satoshi, sans-serif",
      height: 335,
      type: "area",
      dropShadow: { enabled: true, color: "#623CEA14", top: 10, blur: 4, left: 0, opacity: 0.1 },
      toolbar: { show: false },
    },
    legend: { show: false, position: "top", horizontalAlign: "left" },
    responsive: [
      { breakpoint: 1024, options: { chart: { height: 300 } } },
      { breakpoint: 1366, options: { chart: { height: 350 } } },
    ],
    stroke: { width: [2, 2], curve: "straight" },
    grid: {
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: true } },
    },
    dataLabels: { enabled: false },
    markers: {
      size: 4,
      colors: "#fff",
      strokeColors: [chartColors.accent, chartColors.secondary],
      strokeWidth: 3,
      strokeOpacity: 0.9,
      fillOpacity: 1,
      hover: { sizeOffset: 5 },
    },
    xaxis: {
      type: "category",
      categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { title: { style: { fontSize: "0px" } }, min: 0, max: 100 },
  });
};

export default chart01;
