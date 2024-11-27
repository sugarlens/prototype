<template>
  <Line v-if="chartData" :data="chartData" :options="chartOptions"></Line>
</template>
  
<script>
import { Line } from 'vue-chartjs';
import 'chartjs-adapter-moment';
import { Chart as ChartJS, Tooltip, CategoryScale, TimeScale, LineElement, LinearScale, PointElement } from 'chart.js';

const minValue = 2;
const maxValue = 17;
const optimalMin = 4;
const optimalMax = 10;

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
    }
  },
  setup() {
    ChartJS.register(horizontalLinePlugin);
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
            min: minValue,
            max: maxValue,
            title: {
              display: false
            },
          }
        },
        plugins: {
          legend: {
            display: false
          },
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

      var newReadings = readings.slice(-12*3);

      // Extract times and glucose values from the readings prop
      const times = newReadings.map((reading) => reading.time);
      const glucoseValues = newReadings.map((reading) => this.getActualReading(reading.mmol));
      const colors = newReadings.map((reading) => this.getColorForReading(reading.mmol));

      // Set chartData with proper structure
      this.chartData = {
        labels: times,
        datasets: [
          {
            data: glucoseValues,
            pointRadius: 5, // Increase the size of the points
            pointBackgroundColor: colors
          }
        ]
      };
    },
    // Determine the color based on whether the reading is in range
    getColorForReading(glucose) {
      if (glucose <= minValue) {
        return '#660000';
      } else if (glucose < optimalMin) {
        return 'red';
      } else if (glucose > maxValue) {
        return '#603B00';
      } else if (glucose >= optimalMax) {
        return 'orange';
      } else {
        return 'lightgreen';
      }
    },
    getActualReading(glucose) {
      if (glucose < minValue) {
        return minValue;
      } else if (glucose > maxValue) {
        return maxValue;
      }
      return glucose;
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
  
