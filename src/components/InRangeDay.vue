<template>
	<span v-if="valueOnly">
		<span :class="(inRange >= 70)? 'readingIn' : 'readingOut'">TIR: {{ inRange }}%</span>&nbsp;
		<span :class="(history[history.length -1] >= 4 && history[history.length -1] <= 10)? 'readingIn' : 'readingOut'">&#11044;</span>&nbsp;
		<small>[{{ min }}%, {{ max }}%]</small></span>
	<div v-else class="text-center">
		<p class="muted mt-4 float-left">In range</p>
		<v-progress-circular v-if="size > 0" :model-value="inRange" :size="size" :width="size / 10">
			<template v-slot:default><span class="value">{{ inRange }}%</span></template>
		</v-progress-circular>
	</div>
</template>

<script>
export default {
	name: 'InRangeDay',
	props: {
		history: {
			type: Array,
			required: true,
			default: () => [
				{ "trend": { "name": "Flat", "desc": "steady", "arrow": "→" }, "mgdl": 0, "mmol": 0, "time": "2000-01-01T00:00:01.000Z" },
				{ "trend": { "name": "Flat", "desc": "steady", "arrow": "→" }, "mgdl": 0, "mmol": 0, "time": "2000-01-01T00:00:01.000Z" }
			]
		},
		valueOnly: {
			type: Boolean,
			default: false
		},
		size: {
			type: Number,
			default: 70
		}
	},
	data() {
		return {
			inRange: 0,
			min: 0,
			max: 100
		}
	},
	watch: {
		// Watch for changes in the readings prop and update chartData accordingly
		history(newHistory) {
			this.updateInRange(newHistory);
		}
	},
	methods: {
		updateInRange(history) {
			if (!history || history.length === 0) {
				this.inRange = 0;
			}

			const inRange = history.filter((reading) => reading.mmol >= 4 && reading.mmol <= 10).length;
			this.inRange = Math.round((inRange / history.length) * 100);

			const now = new Date();
			const readingsInDay = 24*60 / 5;
			const missingReadings = Math.round((24*60 - (now.getHours() * 60 + now.getMinutes())) / 5);
			this.min = Math.round(inRange / readingsInDay * 100);
			this.max = Math.round((inRange + missingReadings) / readingsInDay * 100);
		}
	},
	mounted() {
		this.updateInRange(this.history);
	}
}
</script>

<style scoped>
.muted {
	opacity: 0.5;
	font-size: .9em;
	writing-mode: vertical-rl;
	text-orientation: mixed;
	transform: rotate(180deg);
}

.value {
	font-size: 1.3em;
}

small {
	opacity: 0.75;
}

.readingIn {
	color: #5F5;
}

.readingOut {
	color: #FAA;
}
</style>
