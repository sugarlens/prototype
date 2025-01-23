<template>
	<span v-if="valueOnly">{{ inRange }}%</span>
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
			inRange: 0
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
</style>