import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true, onlyAdmin: false }
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
      meta: { requiresAuth: true, onlyAdmin: false }
    },
    {
      path: '/leads',
      name: 'leads',
      component: () => import('../views/LeadsView.vue'),
      meta: { requiresAuth: true, onlyAdmin: false }
    },
    {
      path: '/login',
      name: "login",
      component: () => import('../views/LoginView.vue'),
      meta: { requiresAuth: true, onlyAdmin: false }
    },
    {
      path: '/users',
      name: "users",
      component: () => import('../views/UsersView.vue'),
      meta: { requiresAuth: true, onlyAdmin: true }
    },
    {
      path: '/salary',
      name: "salary",
      component: () => import('../views/SalaryView.vue'),
      meta: { requiresAuth: true, onlyAdmin: false }
    },
    {
      path: '/okk',
      name: "okk",
      component: () => import('../views/OKKView.vue'),
      meta: { requiresAuth: true, onlyAdmin: true }
    },
    {
      path: '/transfers',
      name: "transfers",
      component: () => import('../views/TransfersView.vue'),
      meta: { requiresAuth: true, onlyAdmin: true }
    },
    {
      path: '/bonuses',
      name: "bonuses",
      component: () => import('../views/BonusesView.vue'),
      meta: { requiresAuth: true, onlyAdmin: true }
    },
    // {
    //   path: '/phones',
    //   name: "phones",
    //   component: () => import('../views/PhonesView.vue'),
    //   meta: { requiresAuth: true }
    // }
  ],
})

// Глобальный guard
router.beforeEach((to, from, next) => {
  const userObject = JSON.parse(localStorage.getItem('userObject'));
  const authorized = !!userObject; // true, если есть пользователь
  const rankName = userObject?.rankName || null

  console.log(rankName, 'rankName !!!!')

  // Если пользователь не авторизован и он не идет на страницу логина
  if (!authorized && to.path !== '/login') {
    next('/login');
    return;
  }

  // Проверка на доступ только для админов
  if (to.meta.onlyAdmin) {
    if (rankName === 'admin') {
      next();
    } else {
      next('/');
    }
    return;
  }
  // Во всех остальных случаях — разрешаем переход
  next();
});


export default router
