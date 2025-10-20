import ApexCharts from "apexcharts";

// ===== chartTwo
const chart02 = () => {
  const chartTwoOptions = {
    series: [
      {
        name: "Profit",
        data: [0, 0, 0, 0, 0, 0, 0],
      },
      {
        name: "Revenue",
        data: [0, 0, 0, 0, 0, 0, 0],
      },
    ],
    colors: ["#FF7A81", "#80CAEE"],
    chart: {
      type: "bar",
      height: 335,
      stacked: true,
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },

    responsive: [
      {
        breakpoint: 1536,
        options: {
          plotOptions: {
            bar: {
              borderRadius: 0,
              columnWidth: "25%",
            },
          },
        },
      },
    ],
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 0,
        columnWidth: "25%",
        borderRadiusApplication: "end",
        borderRadiusWhenStacked: "last",
      },
    },
    dataLabels: {
      enabled: false,
    },

    xaxis: {
      categories: ["M", "T", "W", "T", "F", "S", "S"],
    },
    legend: {
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Satoshi",
      fontWeight: 500,
      fontSize: "14px",

      markers: {
        radius: 99,
      },
    },
    fill: {
      opacity: 1,
    },
  };

  const chartSelector = document.querySelectorAll("#chartTwo");

  if (chartSelector.length) {
    const chartTwo = new ApexCharts(
      document.querySelector("#chartTwo"),
      chartTwoOptions
    );
    chartTwo.render();
  }
};

export default chart02;
