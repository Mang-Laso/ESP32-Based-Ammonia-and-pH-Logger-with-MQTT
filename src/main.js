import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'

const app = createApp(App)

// Use Pinia for global state management
app.use(createPinia())

app.mount('#app')