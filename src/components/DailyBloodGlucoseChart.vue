<template>
	<Line v-if="chartData" :data="chartData" :options="chartOptions"></Line>
</template>

<script>
import { Line } from 'vue-chartjs';
import 'chartjs-adapter-moment';
import { Chart as ChartJS, Tooltip, CategoryScale, TimeScale, LineElement, LinearScale, PointElement, Filler } from 'chart.js';
import { horizontalFillPlugin } from './chartUtils.js';

const optimalMin = 4;
const optimalMax = 10;

// Register the necessary Chart.js components
ChartJS.register(Tooltip, CategoryScale, TimeScale, LineElement, LinearScale, PointElement, Filler);

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
				horizontalLines: [],
				plugins: {
					filler: true,
					horizontalFill: {
						color: "rgba(255, 255, 255, 0.15)",
						borderColor: 'transparent',
						borderWidth: 0,
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

			// Add the average glucose as a horizontal line
			const averageGlucose = this.calculateAverage(newReadings);
			if (this.chartOptions.horizontalLines.length > 0) {
				this.chartOptions.horizontalLines.pop();
			}
			this.chartOptions.horizontalLines.push({
				y: averageGlucose,
				color: "rgba(255, 255, 255, 0.2)",
				lineWidth: 2,
				dash: [5, 2],
			});

			// Extract times and glucose values from the readings prop
			const times = newReadings.map((reading) => reading.time);
			const glucoseValues = newReadings.map((reading) => reading.mmol);

			// Calculate the areas to fill
			const aboveOptimalMax = glucoseValues.map((value) => (value > optimalMax ? value : null));
			const belowOptimalMin = glucoseValues.map((value) => (value < optimalMin ? value : null));

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
						fill: false,
					},
					{
						data: aboveOptimalMax,
						backgroundColor: "rgba(254, 214, 92, 0.5)", // Red for above optimalMax
						borderColor: "transparent",
						borderWidth: 0,
						pointRadius: 0,
						fill: { value: optimalMax },
					},
					{
						data: belowOptimalMin,
						backgroundColor: "rgba(253, 140, 128, 0.5)",
						borderColor: "transparent",
						borderWidth: 0,
						pointRadius: 0,
						fill: { value: optimalMin },
					},
				]
			};
		},
		calculateAverage(readings) {
			if (!readings || readings.length === 0) return 0;
			const total = readings.reduce((sum, reading) => sum + reading.mmol, 0);
			return total / readings.length;
		},
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
