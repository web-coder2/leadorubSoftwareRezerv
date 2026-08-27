import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css' // Основные стили
import 'element-plus/theme-chalk/dark/css-vars.css' // Стили темной темы

// Импорт локализации
import localeRU from 'element-plus/dist/locale/ru'

const app = createApp(App)

app.use(router)
app.use(ElementPlus, { locale: localeRU })
app.use(store)

app.mount('#app')