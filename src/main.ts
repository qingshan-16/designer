import {createApp} from "vue";
import {createPinia} from "pinia";
import "@/css/index.css";
import App from "@/App.vue";
import i18n from "@/locale";
import router from "@/router";

const app = createApp(App);
const pinia = createPinia();

// 在app挂载之前将vue实例中的_context写入window用于lgiocflw自定义html节点的VNode创建
window.__VUE_APP_CONTEXT__ = app._context;

app.use(i18n);
app.use(router);
app.use(pinia);

app.mount("#app");
