// js/components/chart-03.js - Device Breakdown Donut Chart
import { renderChart, chartColors } from "./chart-factory";

const chart03 = () => {
  renderChart("#chartThree", {
    series: [65, 34, 45, 12],
    chart: { type: "donut", width: 380 },
    colors: [chartColors.primary, chartColors.tertiary, chartColors.quaternary, chartColors.quinary],
    labels: ["Desktop", "Tablet", "Mobile", "Unknown"],
    legend: { show: false, position: "bottom" },
    plotOptions: {
      pie: {
        donut: { size: "65%", background: "transparent" },
      },
    },
    dataLabels: { enabled: false },
    responsive: [
      { breakpoint: 640, options: { chart: { width: 200 } } },
    ],
  });
};

export default chart03;
