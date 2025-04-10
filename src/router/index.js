// router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import Login from '@/components/UserLogin.vue';
import Register from '@/components/UserRegis.vue';
import TaskList from '@/views/TaskList.vue';
import ScheduleTool from '@/views/ScheduleTool.vue';
import axios from "axios";

const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  { path: '/taskList',
    name: 'TaskList',
    component: TaskList,
    // 在这里添加路由守卫，确保只有登录后才能访问
    meta: { requiresAuth: true }
  },
  { path: '/scheduleTool',
    name: 'ScheduleTool',
    component: ScheduleTool,
    // 在这里添加路由守卫，确保只有登录后才能访问
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes // short for `routes: routes`
});

// 添加全局导航守卫
router.beforeEach(async (to, from, next) => {
  // 如果目标路由需要登录权限
  if (to.meta.requiresAuth) {
    // 从 localStorage 获取 token
    const userToken = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');

    if (!userToken) {
      // 如果没有 token，跳转到登录页面
      next({ name: 'Login' });
    } else {
      try {
        // 发送请求到后端验证 token 是否有效
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/api/profile`, {
          params: {
            service: 'rundo' // 传递 service 参数
          },
          headers: {
            Authorization: `Bearer ${userToken}` // 设置 Authorization 头部
          }
        });

        // 检查后端返回的 token 验证结果
        if (response.data.code === 200) {
          // 如果 token 有效，允许访问
          next();
        } else {
          // 如果 token 无效，跳转到登录页面
          next({ name: 'Login' });
        }
      } catch (error) {
        // 处理请求错误
        console.error('Token 验证失败:', error);
        next({ name: 'Login' }); // 如果验证请求失败，也跳转到登录
      }
    }
  } else {
    // 如果目标路由不需要登录权限，直接跳转
    next();
  }
});

export default router;