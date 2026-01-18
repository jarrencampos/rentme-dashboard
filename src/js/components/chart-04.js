// js/components/chart-04.js - Daily Activity Bar Chart
import { renderChart, chartColors } from "./chart-factory";

const chart04 = () => {
  renderChart("#chartFour", {
    series: [{
      data: [168, 385, 201, 298, 187, 195, 291, 110, 215, 390, 280, 112, 123, 212,
             270, 190, 310, 115, 90, 380, 112, 223, 292, 170, 290, 110, 115, 290, 380, 312],
    }],
    colors: [chartColors.primary],
    chart: {
      fontFamily: "Satoshi, sans-serif",
      type: "bar",
      height: 350,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: { horizontal: false, columnWidth: "55%", endingShape: "rounded", borderRadius: 2 },
    },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 4, colors: ["transparent"] },
    xaxis: {
      categories: Array.from({ length: 30 }, (_, i) => String(i + 1)),
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Satoshi",
      markers: { radius: 99 },
    },
    yaxis: { title: false },
    grid: { yaxis: { lines: { show: false } } },
    fill: { opacity: 1 },
    tooltip: {
      x: { show: false },
      y: { formatter: (val) => val },
    },
  });
};

export default chart04;
