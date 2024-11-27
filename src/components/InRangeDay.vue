<template>
    <div class="text-center">
        <p class="muted">In range - 24h</p>
        <p class="large">{{ inRange }}%</p>
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
    font-size: .8em;
}
.large {
    font-size: 3em;
}
</style>