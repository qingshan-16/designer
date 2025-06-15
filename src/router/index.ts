/* eslint-disable prefer-template */
import {createRouter, createWebHashHistory} from "vue-router";
import App from "@/App.vue";

const router = createRouter({
  // 隐藏路由
  // 不带“#”号
  // history: createWebHistory(),
  // 带“#”号
  history: createWebHashHistory(),
  routes: [
    // 本地地址
    {
      path: "/",
      redirect: `designer`,
    },
    {
      path: "/designer", // 模块的根路径
      name: "designer",
      component: App,
    },
  ],
});

export default router;
