<template>
	<v-col cols="9" class="d-flex align-stretch">
		<v-card class="w-100 d-flex">
			<v-card-text class="flex-grow-1">
				<BloodGlucoseChartDES :readings="history"></BloodGlucoseChartDES>
			</v-card-text>
		</v-card>
	</v-col>
	<v-col cols="3">
		<v-row>
			<v-col cols="12">
				<v-card>
					<v-card-text>
						<InRangeDay :history="history"></InRangeDay>
					</v-card-text>
				</v-card>
			</v-col>
			<v-col cols="12">
				<v-card>
					<v-card-text>
						<AverageDay :history="history"></AverageDay>
					</v-card-text>
				</v-card>
			</v-col>
		</v-row>
	</v-col>
</template>

<script>
import AverageDay from '../components/AverageDay.vue';
import BloodGlucoseChartDES from '../components/BloodGlucoseChartDES.vue';
import InRangeDay from '../components/InRangeDay.vue';


export default {
	name: 'HorizontalView',
	components: {
		AverageDay,
		BloodGlucoseChartDES,
		InRangeDay
	},
	props: {
		history: {
			type: Array,
			required: true
		},
	}
}
</script>