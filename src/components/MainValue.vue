<template>
	<v-card>
		<v-card-text>
			<div class="float-right text-end class-muted">
				<p>
					<v-progress-circular
						:size="20"
						:width="10"
						:model-value="this.secondsRotation"
						color="blue-grey"
						class="mr-1"></v-progress-circular>
					{{ now }}
				</p>
				<p v-if="latestEntry && secondLatestEntry">&Delta;: {{ delta }} mmol/l</p>
			</div>
			
			<p :class="{ 'large-text': true, 'stale': isReadingStale }">
				{{ latestEntry.value.toFixed(1) }}
				<span v-html="adjustArrows(latestEntry.trend.arrow)"></span>
			</p>
			

		</v-card-text>
	</v-card>
</template>

<script>
import moment from 'moment';

export default {
	props: {
		history: {
			type: Array,
			required: true,
			default: () => [
				{ "trend": { "name": "Flat", "desc": "steady", "arrow": "→" }, "mgdl": 0, "value": 0, "time": "2000-01-01T00:00:01.000Z" },
				{ "trend": { "name": "Flat", "desc": "steady", "arrow": "→" }, "mgdl": 0, "value": 0, "time": "2000-01-01T00:00:01.000Z" }
			]
		}
	},
	data() {
		return {
			now: "&nbsp;",
			secondsRotation: 0,
			timerRotation: null
		};
	},
	methods: {
		updateNow() {
			this.now = -moment(this.history[this.history.length - 1].time).diff(moment(), 'minutes');
			if (this.now > 3 && this.now < 6) { // necessary to handle the time before new reading arrives
				this.now = `${this.now} minutes ago`; // we want precise minutes
			} else {
				this.now = moment(this.history[this.history.length - 1].time).fromNow(); // ok with more fuzzy text
			}
			this.secondsRotation = moment().diff(moment(this.history[this.history.length - 1].time), 'seconds') / 3;
		},
		adjustArrows(arrow) {
			if (arrow === '↑') return '&uarr;';
			if (arrow === '↓') return '&darr;';
			if (arrow === '↗') return '&#8599;';
			if (arrow === '↘') return '&#8600;';
			if (arrow === '→') return '&rarr;';
			if (arrow === '⮅') return '&#8648;';
			if (arrow === '⮇') return '&#8650;';
			return '?';
		}
	},
	computed: {
		latestEntry() {
			return this.history[this.history.length - 1] || null;
		},
		secondLatestEntry() {
			return this.history[this.history.length - 2] || null;
		},
		delta() {
			if (!this.latestEntry || !this.secondLatestEntry) return null;
			const diff = this.latestEntry.value - this.secondLatestEntry.value;
			return diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1);
		},
		isReadingStale() {
			if (!this.latestEntry) return false;
			const fifteenMinutesAgo = moment().subtract(15, 'minute');
			return moment(this.latestEntry.time).isBefore(fifteenMinutesAgo);
		}
	},
	watch: {
		history: {
			immediate: true,
			handler() {
				this.updateNow();
			}
		}
	},
	mounted() {
		this.updateNow();
		this.timerRotation = setInterval(() => {
			this.secondsRotation += 3;
			this.updateNow();
		}, 5000);

	},
	beforeUnmount() {
		clearInterval(this.timerRotation);

	}
}
</script>

<style scoped>
.large-text {
	font-size: 35px;
}

.stale {
	text-decoration: line-through;
	color: gray;
}

.class-muted {
	opacity: 0.75;
}
</style>