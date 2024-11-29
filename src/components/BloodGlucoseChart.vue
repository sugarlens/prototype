<template>
  <Line v-if="chartData" :data="chartData" :options="chartOptions"></Line>
</template>
  
<script>
import { Line } from 'vue-chartjs';
import 'chartjs-adapter-moment';
import { Chart as ChartJS, Tooltip, CategoryScale, TimeScale, LineElement, LinearScale, PointElement } from 'chart.js';
import { smoothData, getColorForReading, getActualReading, doRegression } from './chartUtils';

const minValue = 2;
const maxValue = 17;
const optimalMin = 4;
const optimalMax = 10;
const pointsForRegression = 12;

// Register the necessary Chart.js components
ChartJS.register(Tooltip, CategoryScale, TimeScale, LineElement, LinearScale, PointElement);

// Plugin to draw horizontal lines
const horizontalLinePlugin = {
  id: "horizontalLinePlugin",
  beforeDraw(chart) {
    // eslint-disable-next-line
    const { ctx, chartArea: { top, bottom, left, right }, scales: { y } } = chart;
    const lines = chart.options.horizontalLines || [];

    lines.forEach((line) => {
      const yPos = y.getPixelForValue(line.y);
      ctx.save();
      ctx.beginPath();
      ctx.lineWidth = line.lineWidth || 1;
      ctx.strokeStyle = line.color || "rgba(0, 0, 0, 0.5)";
      ctx.setLineDash(line.dash || []); // For dashed lines
      ctx.moveTo(left, yPos);
      ctx.lineTo(right, yPos);
      ctx.stroke();
      ctx.restore();
    });
  },
};

export default {
  name: 'BloodGlucoseChart',
  components: {
    Line
  },
  props: {
    readings: {
      type: Array,
      required: true
    },
    amountOfDataPoints: {
      type: Number,
      default: 12*3
    }
  },
  setup() {
    ChartJS.register([ horizontalLinePlugin ]);
  },
  data() {
    return {
      chartData: null, // Initialize chartData as null
      chartOptions: {
        responsive: true,
        scales: {
          x: {
            type: 'time',
            time: {
              unit: "hour", // Display ticks every hour
              displayFormats: {
                hour: "HH:mm", // Custom format for hours
              },
            },
            ticks: {
              maxTicksLimit: 10,
              stepSize: 0.5,
            },
            grid: {
              drawTicks: true, // Ensures tick marks align with grid lines
              color: "#666666", // Vertical grid line color
            },
          },
          y: {
            suggestedMin: optimalMin,
            suggestedMax: optimalMax,
            grid: {
              color: "transparent",
            },
          }
        },
        maintainAspectRatio: false,
        horizontalLines: [
          { y: optimalMin, color: "red", lineWidth: 2, dash: [5, 5] },
          { y: optimalMax, color: "orange", lineWidth: 2, dash: [5, 5] },
        ],
      }
    };
  },
  watch: {
    // Watch for changes in the readings prop and update chartData accordingly
    readings(newReadings) {
      this.updateChartData(newReadings);
    }
  },
  methods: {
    updateChartData(readings) {
      // Check if the readings array is not empty
      if (!readings || readings.length === 0) {
        return;
      }

      // Consider only the last amountOfDataPoints readings
      var newReadings = readings.slice(-this.amountOfDataPoints);
      var smoothedReadings = smoothData(readings.map((reading) => reading.mmol)).slice(-this.amountOfDataPoints);

      // Extract times and glucose values from the readings prop
      const times = newReadings.map((reading) => reading.time);
      const glucoseValues = newReadings.map((reading) => getActualReading(reading.mmol, minValue, maxValue));
      const colorsActualReadings = newReadings.map((reading) => getColorForReading(reading.mmol, minValue, maxValue, optimalMin, optimalMax, 0.3));
      const colorsSmoothedReadings = smoothedReadings.map((reading) => getColorForReading(reading, minValue, maxValue, optimalMin, optimalMax, 0.9));

      // prediction
      // const dataForPrediction = smoothedReadings.map((value, index) => ({ time: newReadings[index].time, mmol: value }));
      const [ pastRegressionPoints, futureRegressionPoints ] = doRegression(newReadings.slice(-pointsForRegression), minValue, maxValue, pointsForRegression);

      // Set chartData with proper structure
      this.chartData = {
        labels: times,
        datasets: [
          {
            // Raw glucose values
            data: glucoseValues,
            pointRadius: 2,
            pointBackgroundColor: colorsActualReadings,
            borderColor: 'transparent',
          },
          {
            // Smoothed glucose values
            data: smoothedReadings,
            pointRadius: 3,
            borderWidth: 1,
            pointBackgroundColor: colorsSmoothedReadings,
            borderColor: 'transparent',
          },
          {
            // Regression line for past data
            data: pastRegressionPoints,
            borderColor: 'rgba(255, 255, 255, 0.5)',
            borderWidth: 1,
            pointRadius: 0,
            borderDash: [5, 2],
          },
          {
            // Regression line for future data
            data: futureRegressionPoints,
            borderColor: 'transparent',
            borderWidth: 0,
            pointRadius: 3,
            pointBackgroundColor: 'rgba(255, 255, 255, 0.5)',
          },
        ]
      };
    }
  },
  mounted() {
    // Initialize chartData when the component is mounted
    this.updateChartData(this.readings);
  }
};
</script>
  
<style scoped>
  .v-card {
    max-width: 800px;
    margin: auto;
  }
  
  .line-chart {
    height: 400px;
  }
</style>
  
