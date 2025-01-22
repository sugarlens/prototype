<template>
	<v-row>
		<v-col cols="12">
			<v-card>
				<v-card-text>
					<BloodGlucoseChartDES :readings="history" :amount-of-data-points="30" style="height: 200px"></BloodGlucoseChartDES>
				</v-card-text>
			</v-card>
		</v-col>
	</v-row>
	<v-row>
		<v-col cols="12">
			<p>Last 24 hours</p>
		</v-col>
	</v-row>
	<v-row>
		<v-col cols="6">
			<v-card>
				<v-card-text>
					<InRangeDay :history="history"></InRangeDay>
				</v-card-text>
			</v-card>
		</v-col>
		<v-col cols="6">
			<v-card>
				<v-card-text>
					<AverageDay :history="history"></AverageDay>
				</v-card-text>
			</v-card>
		</v-col>
	</v-row>
	<v-row>
		<v-col cols="12">
			<v-card>
				<v-card-text>
					<DailyBloodGlucoseChart :readings="history" :amount-of-data-points="12 * 24" style="height: 100px"></DailyBloodGlucoseChart>
				</v-card-text>
			</v-card>
		</v-col>
	</v-row>
	<v-row>
		<v-col cols="12">
			<p>Today</p>
		</v-col>
	</v-row>
	<v-row>
		<v-col cols="8">
			<v-card>
				<v-card-text>
					<DailyBloodGlucoseChart :readings="history" :amount-of-data-points="readingsToday" :fillDay="true" style="height: 70px"></DailyBloodGlucoseChart>
				</v-card-text>
			</v-card>
		</v-col>
		<v-col cols="4">
			<v-card>
				<v-card-text>
					<InRangeDay :showTitle="false" :history="history.slice(-readingsToday)"></InRangeDay>
				</v-card-text>
			</v-card>
		</v-col>
	</v-row>
</template>

<script>
import InRangeDay from '../components/InRangeDay.vue';
import AverageDay from '../components/AverageDay.vue';
import DailyBloodGlucoseChart from '../components/DailyBloodGlucoseChart.vue';
import BloodGlucoseChartDES from '../components/BloodGlucoseChartDES.vue';

export default {
	name: 'VerticalView',
	components: {
		AverageDay,
		InRangeDay,
		DailyBloodGlucoseChart,
		BloodGlucoseChartDES,
	},
	props: {
		history: {
			type: Array,
			required: true
		}
	},
	data() {
		return {
			readingsToday: 0,
		};
	},
	created() {
		this.updateMinutesPassed();
		setInterval(this.updateMinutesPassed, 60000);
	},
	methods: {
		updateMinutesPassed() {
			const now = new Date();
			const minutes = now.getHours() * 60 + now.getMinutes();
			this.readingsToday = minutes / 5;
		},
	},
}
</script>