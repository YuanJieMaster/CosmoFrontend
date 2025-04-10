
<template>
  <div v-if="!isLoginPage && !isRegisterPage" class="TheHeader">
    <div style="width: 100%; display: flex; justify-content: space-between; align-items: center;">
      <span class="title">智能排课系统</span>
      <div style="display: flex; align-items: center;">
        <!-- 显示当前任务名称 -->
        <span v-if="currentTaskName" class="current-task">{{ currentTaskName }}</span>

        <!-- 导航按钮 -->
        <ul class="nav">
          <li><router-link to="/taskList" active-class="active">任务列表</router-link></li>
          <li><router-link to="/scheduleTool" active-class="active">排课工具</router-link></li>
        </ul>

        <!-- 登录状态管理 -->
        <div v-if="username" class="user-info">
          <span>{{ username }}</span>
          <button @click="logout" class="logout-btn">退出登录</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
  computed: {
    ...mapState(['username', 'currentTaskName']),
    // 判断当前路由是否是登录页面
    isLoginPage() {
      return this.$route.name === 'Login'; // 当路由名称是 Login 时，隐藏 TheHeader
    },
    isRegisterPage() {
      return this.$route.name === 'Register'; // 当路由名称是 Register 时，隐藏 TheHeader
    }
  },
  methods: {
    ...mapActions(['logout'])
  }
};
</script>

<style scoped>
.TheHeader {
  background: #ffffff;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  padding: 10px 20px;
}

.title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
}

.nav {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  gap: 15px;
  justify-content: center;
}

.nav li a {
  text-decoration: none;
  color: #666;
  padding: 8px 12px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.nav li a.active,
.nav li a:hover {
  color: #409eff;
  border-bottom: 2px solid #409eff;
}

.current-task {
  margin-right: 20px;
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logout-btn {
  padding: 5px 10px;
  background-color: #f56c6c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.logout-btn:hover {
  background-color: #e74c3c;
}
</style>