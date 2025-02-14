<template>
	<span v-if="valueOnly">
		<span :class="(inTightRange >= 50)? 'readingIn' : 'readingOut'">TITR: {{ inTightRange }}%</span>&nbsp;
		<span :class="(history[history.length -1] > 3.8 && history[history.length -1] <= 7.8)? 'readingIn' : 'readingOut'">&#11044;</span>&nbsp;
		<small v-if="forecast">[{{ min }}%, {{ max }}%]</small></span>
	<div v-else class="text-center">
		<p class="muted mt-4 float-left">In tight range</p>
		<v-progress-circular v-if="size > 0" :model-value="inTightRange" :size="size" :width="size / 10">
			<template v-slot:default><span class="value">{{ inTightRange }}%</span></template>
		</v-progress-circular>
	</div>
</template>

<script>
export default {
	name: 'inTightRange',
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
		forecast: {
			type: Boolean,
			default: true
		},
		size: {
			type: Number,
			default: 70
		}
	},
	data() {
		return {
			inTightRange: 0,
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
				this.inTightRange = 0;
			}

			const inTightRange = history.filter((reading) => reading.mmol > 3.8 && reading.mmol <= 7.8).length;
			this.inTightRange = Math.round((inTightRange / history.length) * 100);

			const now = new Date();
			const readingsInDay = 24*60 / 5;
			const missingReadings = Math.round((24*60 - (now.getHours() * 60 + now.getMinutes())) / 5);
			this.min = Math.round(inTightRange / readingsInDay * 100);
			this.max = Math.round((inTightRange + missingReadings) / readingsInDay * 100);
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