<template>
	<Line v-if="chartData" :data="chartData" :options="chartOptions"></Line>
</template>

<script>
import { Line } from 'vue-chartjs';
import 'chartjs-adapter-moment';
import { Chart as ChartJS, Tooltip, CategoryScale, TimeScale, LineElement, LinearScale, PointElement } from 'chart.js';
import { horizontalFillPlugin } from './chartUtils.js';

const optimalMin = 4;
const optimalMax = 10;

// Register the necessary Chart.js components
ChartJS.register(Tooltip, CategoryScale, TimeScale, LineElement, LinearScale, PointElement);

export default {
	name: 'DailyBloodGlucoseChart',
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
			default: 12 * 3
		}
	},
	setup() {
		ChartJS.register(horizontalFillPlugin);
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
							stepSize: 6,
						},
						grid: {
							drawTicks: true, // Ensures tick marks align with grid lines
							color: "#666666", // Vertical grid line color
						},
					},
					y: {
						grid: {
							color: "transparent",
						},
					}
				},
				maintainAspectRatio: false,
				plugins: {
					filler: true,
					horizontalFill: {
						color: "rgba(255, 255, 255, 0.15)",
						startValue: optimalMin,
						endValue: optimalMax,
					},
				},
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

			var newReadings = readings.slice(-this.amountOfDataPoints);

			// Extract times and glucose values from the readings prop
			const times = newReadings.map((reading) => reading.time);
			const glucoseValues = newReadings.map((reading) => reading.mmol);

			// Set chartData with proper structure
			this.chartData = {
				labels: times,
				datasets: [
					{
						data: glucoseValues,
						pointRadius: 0,
						borderColor: "#CCCCCC",
						borderWidth: 2,
						tension: 0.5,
					}
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
