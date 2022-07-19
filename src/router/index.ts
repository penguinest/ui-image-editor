import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: () => import(/* webpackChunkName: "image" */ '../views/Home.vue')
  },
  {
    path: '/editor',
    name: 'Editor',
    component: () => import(/* webpackChunkName: "image" */ '../views/ImageEditor.vue')
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

export default router;
