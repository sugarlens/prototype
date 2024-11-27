<template>
    <v-card>
        <v-card-text>
            <div class="float-right text-end class-muted">
                <p>{{ prepareMoment(history[history.length-1].time).fromNow() }}</p>
                <p>Delta: {{ (history[history.length-1].mmol - history[history.length-2].mmol) > 0? "+" : "" }}{{ Math.round((history[history.length-1].mmol - history[history.length-2].mmol)*100)/100 }} mmol/l</p>
            </div>
            <p style="font-size: 35px;">{{ history[history.length-1].mmol }} {{ history[history.length-1].trend.arrow }}</p>
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
                { "trend": { "name": "Flat", "desc": "steady", "arrow": "→" }, "mgdl": 0, "mmol": 0, "time": "2000-01-01T00:00:01.000Z" },
                { "trend": { "name": "Flat", "desc": "steady", "arrow": "→" }, "mgdl": 0, "mmol": 0, "time": "2000-01-01T00:00:01.000Z" }
            ]
        }
    },
    methods: {
        prepareMoment(t) {
            return moment(t);
        }
    }
}
</script>

<style scoped>
.class-muted {
    opacity: 0.75;
}
</style>