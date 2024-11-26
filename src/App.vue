<template>
  <v-app dark>
    <v-main>
      <v-container style="height: 100vh">
        <v-card v-if="!isLoggedIn" width="400">
          <v-card-title>Login</v-card-title>
          <v-card-text>
            <v-form ref="loginForm" v-model="valid">
              <v-text-field
                v-model="username"
                label="Username"
                :rules="[rules.required]"
                required
              ></v-text-field>
              <v-text-field
                v-model="password"
                label="Password"
                :rules="[rules.required]"
                type="password"
                required
              ></v-text-field>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" @click="handleLogin" :disabled="!valid">
              Login
            </v-btn>
          </v-card-actions>
        </v-card>
        <div v-else class="d-flex flex-column fill-height">
          <v-row>
            <v-col cols="12">
              <v-card>
                <v-card-text>
                  <p style="font-size: 30px;">{{ data.mmol }} {{ data.trend.arrow }}</p>
                  <p>{{ this.lastReading }}</p>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
          <v-row class="fill-height" style="flex-grow: 1;">
            <v-col cols="12" class="d-flex flex-column">
              <BloodGlucoseChart :readings="this.history" style="flex-grow: 1; width:100%;"></BloodGlucoseChart>
            </v-col>
          </v-row>
        </div>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import moment from 'moment';
import BloodGlucoseChart from './components/BloodGlucoseChart.vue';

const Client = require('./dexcom.js');

export default {
  components: {
    BloodGlucoseChart,
  },
  data() {
    return {
      username: '',
      password: '',
      valid: false,
      isLoggedIn: false,
      dexcomClient: null,
      data: {
        mmol: 5,
        trend: {
          arrow: '\u2192',
        },
      },
      history: [
        { time: '2024-11-26 14:00', glucose: 3.8 },
        { time: '2024-11-26 14:10', glucose: 6.5 },
        { time: '2024-11-26 14:20', glucose: 8.0 },
        { time: '2024-11-26 14:30', glucose: 5.2 },
        { time: '2024-11-26 15:00', glucose: 3.8 },
        { time: '2024-11-26 15:10', glucose: 6.5 },
        { time: '2024-11-26 15:20', glucose: 8.0 },
        { time: '2024-11-26 15:30', glucose: 5.2 },
        // Add more readings here...
      ],
      lastReading: null,
      rules: {
        required: value => !!value || 'This field is required',
      },
      fetchInterval: null, // Store the interval ID for future cleanup
    };
  },
  created() {
    this.dexcomClient = new Client(true);
    // Check for existing credentials in localStorage
    const storedCredentials = localStorage.getItem('userCredentials');
    if (storedCredentials) {
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
      console.log(moment().format() + " - Fetching new data...");
      this.dexcomClient.fetchLastReading()
      .then((data) => {
        this.data = data;
        this.lastReading = moment(this.data.time).fromNow();
      })
      .catch(error => {
        console.error('Error fetching data:', error)
      });

      this.dexcomClient.fetchReadings(180, 36).then(
        (data) => {
          this.history = data.map(reading => ({time: reading.time, glucose: reading.mmol})).reverse();
        }
      );
    },
  },
};
</script>

<style>
body {
  margin: 0;
  font-family: Roboto, sans-serif;
}


</style>
