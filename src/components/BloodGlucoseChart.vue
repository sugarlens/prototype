<template>
    <v-card>
      <v-card-text style="height: 100%">
        <line-chart v-if="chartData" :data="chartData" :options="chartOptions"></line-chart>
      </v-card-text>
    </v-card>
  </template>
  
  <script>
  import { Line } from 'vue-chartjs';
  import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js';
  
  // Register the necessary Chart.js components
  ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement);
  
  export default {
    name: 'BloodGlucoseChart',
    components: {
      LineChart: Line
    },
    props: {
      readings: {
        type: Array,
        required: true
      }
    },
    data() {
      return {
        chartData: null, // Initialize chartData as null
        chartOptions: {
          responsive: true,
          scales: {
            x: {
              type: 'category',
              title: {
                display: false
              },
              ticks: {
                // eslint-disable-next-line no-unused-vars
                callback: function(val, index) {
                    const time = new Date(this.getLabelForValue(val));
                    return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                }
              }
            },
            y: {
              min: 0, // Minimum Y value for glucose (you can adjust this based on expected range)
              title: {
                display: false
              }
            }
          },
          plugins: {
            legend: {
                display: false
            }
          },
          maintainAspectRatio: false
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
        const glucoseValues = readings.map((reading) => reading.glucose);
        const colors = readings.map((reading) => this.getColorForReading(reading.glucose));
  
        // Set chartData with proper structure
        this.chartData = {
          labels: times,
          datasets: [
            {
              data: glucoseValues,
              borderColor: 'transparent', // Set the line color to white
              tension: 0.4, // Adjust the curve of the line
              pointRadius: 5,
              pointBackgroundColor: colors
            }
          ]
        };
      },
      // Determine the color based on whether the reading is in range
      getColorForReading(glucose) {
        const lowerLimit = 4.0;  // Lower bound for normal blood glucose range in mmol/L
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
  