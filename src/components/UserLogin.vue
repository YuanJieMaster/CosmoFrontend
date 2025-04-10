<template>
  <div class="container">
    <div class="title">欢迎使用智慧排课</div>
    <form @submit.prevent="login">
      <input v-model="username" placeholder="请输入账号" @blur="validateUsername" />
      <input v-model="password" type="password" placeholder="请输入密码" @blur="validatePassword" />
      <div class="checkbox-container">
        <input type="checkbox" id="remember-me" v-model="rememberMe" />
        <label for="remember-me">记住我</label>
      </div>
      <p v-if="error" class="error">{{ error }}</p>
      <button :disabled="loading">{{ loading ? '登录中...' : '登录' }}</button>
      <div class="link" @click="goToRegister">没有账号？注册账号</div>
    </form>
  </div>
</template>

<script>
import axios from "axios"; // 引入 Axios

export default {
  data() {
    return {
      username: "",
      password: "",
      rememberMe: false,
      error: "",
      loading: false, // 控制按钮状态
    };
  },
  methods: {
    validateUsername() {
      if (!this.username) {
        this.error = "请输入账号";
      } else {
        this.error = "";
      }
    },
    validatePassword() {
      if (!this.password) {
        this.error = "请输入密码";
      } else {
        this.error = "";
      }
    },
    async login() {
      // 表单验证
      if (!this.username || !this.password) {
        this.error = "账号或密码不能为空";
        return;
      }

      // 设置加载状态
      this.loading = true;

      try {
        // 发送登录请求到后端
        const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/login`, {
          username: this.username,
          password: this.password,
        });

        // 检查后端响应
        if (response.data.code == 200) {
          alert("登录成功");

          // 如果勾选了“记住我”，可以将 token 或用户信息存储到本地
          if (this.rememberMe) {
            localStorage.setItem("userToken", response.data.data.token);
          } else {
            sessionStorage.setItem("userToken", response.data.data.token);
          }

          // 跳转到主页或其他页面
          this.$router.push({name: "TaskList"});
        } else {
          this.error = response.data.message || "账号或密码错误";
        }
      } catch (error) {
        if (error.response && error.response.status === 401) {
          this.error = "账号或密码错误";
          return;
        }
        this.error = "网络错误，请稍后再试";
      } finally {
        this.loading = false; // 结束加载状态
      }
    },
    goToRegister() {
      this.$router.push({name: "Register"});
    },
  },
};
</script>

<style scoped>
.container {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
}

.title {
  font-size: 24px;
  text-align: center;
  margin-bottom: 20px;
}

.checkbox-container {
  display: flex;
  align-items: center;
  justify-content: space-between; /* 左右对齐 */
  margin-bottom: 15px;
}

.checkbox-container input {
  margin-right: 8px; /* 复选框与文本之间的间距 */
}

.checkbox-container label {
  font-size: 14px; /* 字体大小 */
}
input {
  display: block;
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

#remember-me {
  margin-right: 5px;
}

button {
  width: 100%;
  padding: 10px;
  background-color: #2c3e50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
}

.link {
  text-align: center;
  margin-top: 10px;
  color: #3498db;
  cursor: pointer;
}

.error {
  color: red;
  font-size: 14px;
  margin-top: -10px;
  margin-bottom: 10px;
}
</style>