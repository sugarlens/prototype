<template>
  <v-app dark>
    <v-main>
      <v-container style="height: 100vh;">
        <!-- LOGIN -->
        <v-card v-if="!credentialsProvided">
          <v-card-title>Login</v-card-title>
          <v-card-text>
            <p class="mb-2">Insert here the Dexcom Follow data:</p>
            <v-form ref="loginForm" v-model="valid">
              <v-text-field v-model="username" label="Username" :rules="[rules.required]" required></v-text-field>
              <v-text-field v-model="password" label="Password" :rules="[rules.required]" type="password" required></v-text-field>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" @click="handleLogin" :disabled="!valid">
              Login
            </v-btn>
          </v-card-actions>
        </v-card>

        <!-- LOADING -->
        <div v-if="(isLoggedIn || credentialsProvided) && !dataRetrieved" class="text-center" style="height: 100%; padding: 10%">
          <v-progress-circular color="primary" indeterminate :size="64"></v-progress-circular>
        </div>

        <!-- ACTUAL CONTENT -->
        <div v-if="isLoggedIn && dataRetrieved" class="d-flex flex-column fill-height">
          <v-row class="flex-grow-0">
            <v-col cols="12">
              <MainValue :history="history"></MainValue>
            </v-col>
          </v-row>

          <!-- HORIZONTAL LAYOUT -->
          <v-row v-if="isHorizontal" class="d-flex">
            <v-col cols="9" class="d-flex align-stretch">
              <v-card class="w-100 d-flex">
                <v-card-text class="flex-grow-1">
                  <BloodGlucoseChart :readings="history"></BloodGlucoseChart>
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
          </v-row>

          <!-- VERTICAL LAYOUT -->
          <div v-else class="mt-4 flex-grow-1">
            <v-row>
              <v-col cols="12" >
                <v-card>
                  <v-card-text>
                    <BloodGlucoseChart :readings="history" :amount-of-data-points="30" style="height: 200px"></BloodGlucoseChart>
                  </v-card-text>
                </v-card>
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
                    <DailyBloodGlucoseChart :readings="history" :amount-of-data-points="12*24" style="height: 100px"></DailyBloodGlucoseChart>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </div>
        </div>
      </v-container>
    </v-main>
  </v-app>
</template>


<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

// Detect screen orientation
const isHorizontal = ref(window.innerHeight < window.innerWidth);

function updateOrientation() {
  isHorizontal.value = window.innerHeight < window.innerWidth;
}

onMounted(() => {
  window.addEventListener('resize', updateOrientation);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateOrientation);
});
</script>


<script>
import MainValue from './components/MainValue.vue';
import BloodGlucoseChart from './components/BloodGlucoseChart.vue';
import InRangeDay from './components/InRangeDay.vue';
import AverageDay from './components/AverageDay.vue';
import DailyBloodGlucoseChart from './components/DailyBloodGlucoseChart.vue';
import moment from 'moment';  

// const Client = require('./dexcom-mock.js');
const Client = require('./dexcom.js');

export default {
  components: {
    MainValue,
    BloodGlucoseChart,
  },
  data() {
    return {
      username: '',
      password: '',
      valid: false,
      credentialsProvided: false,
      isLoggedIn: false,
      dataRetrieved: false,
      dexcomClient: null,
      history: [
        {"time": "2000-01-01 00:00", "mmol": 0, "trend": { "name": "", "desc": "", "arrow": "" }},
      ],
      rules: {
        required: value => !!value || 'This field is required',
      },
      fetchInterval: null, // Store the interval ID for future cleanup
    };
  },
  created() {
    this.dexcomClient = new Client(true);
    // Check for existing credent.ials in localStorage
    const storedCredentials = localStorage.getItem('userCredentials');
    if (storedCredentials) {
      this.credentialsProvided = true;
      const credentials = JSON.parse(atob(storedCredentials));
      this.username = credentials.username;
      this.password = credentials.password;
      this.login();
    }
  },
  methods: {
    handleLogin() {
      const credentials = btoa(JSON.stringify({ username: this.username, password: this.password }));
      localStorage.setItem('userCredentials', credentials);
      this.credentialsProvided = true;
      this.login();
    },
    async login() {
      await this.dexcomClient.login(this.username, this.password);
      this.isLoggedIn = true;
      this.startDataFetching();
    },
    logout() {
      this.isLoggedIn = false;
      localStorage.removeItem('userCredentials');
      this.username = '';
      this.password = '';
    },
    startDataFetching() {
      // Fetch data immediately on login
      this.fetchData();

      // Set an interval to fetch data every minute (60,000 milliseconds)
      this.fetchInterval = setInterval(() => {
        this.fetchData();
      }, 60000);
    },
    fetchData() {
      var seconds = moment().diff(moment(this.history[this.history.length-1].time), 'seconds');
      if (seconds > 60*5) {
        console.log(" - Fetching new data...");
        this.dexcomClient.fetchReadings(60*24, 12*24).then(
          (data) => {
            this.history = data.reverse();
            this.dataRetrieved = true;
          }
        );
      }
    },
  },
};
</script>
