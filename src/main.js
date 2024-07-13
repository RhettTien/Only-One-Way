import '/src/assets/main.css'

import { createApp } from 'vue'

// https://www.npmjs.com/package/vue-rewards
import VueRewards from "vue-rewards";

import App from './App.vue'
import router from '/src/router/index.js'

const app = createApp(App)

app.use(router)
app.use(VueRewards);
app.mount('#app')
