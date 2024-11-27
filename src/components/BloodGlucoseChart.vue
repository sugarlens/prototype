<template>
  <v-card>
    <v-card-text style="height: 100%">
      <Line v-if="chartData" :data="chartData" :options="chartOptions"></Line>
    </v-card-text>
  </v-card>
</template>
  
<script>
import { Line } from 'vue-chartjs';
import 'chartjs-adapter-moment';
import { Chart as ChartJS, Tooltip, CategoryScale, TimeScale, LineElement, LinearScale, PointElement } from 'chart.js';

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
            min: 2, // Minimum Y value for glucose (you can adjust this based on expected range)
            max: 17,
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
          { y: 4, color: "red", lineWidth: 2, dash: [5, 5] },
          { y: 10, color: "orange", lineWidth: 2, dash: [5, 5] },
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

      // Extract times and glucose values from the readings prop
      const times = readings.map((reading) => reading.time);
      const glucoseValues = readings.map((reading) => reading.mmol);
      const colors = readings.map((reading) => this.getColorForReading(reading.mmol));

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
      const lowerLimit = 4;  // Lower bound for normal blood glucose range in mmol/L
      const upperLimit = 10;  // Upper bound for normal blood glucose range in mmol/L
      if (glucose < lowerLimit) {
        return 'red';  // Below range
      } else if (glucose > upperLimit) {
        return 'orange';  // Above range
      } else {
        return 'lightgreen';  // In range
      }
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
  
