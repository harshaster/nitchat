import { createApp } from 'vue'
import App from './App.vue'
import '@/assets/vendor/pico/css/pico.indigo.min.css'
import '@/assets/vendor/fontawesome/css/fontawesome.min.css'
import '@/assets/vendor/fontawesome/css/solid.min.css'
import Aos from 'aos';
import 'aos/dist/aos.css';

Aos.init();

createApp(App).mount('#app')
