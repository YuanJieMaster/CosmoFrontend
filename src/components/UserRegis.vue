<template>
  <div class="container">
    <div class="title">欢迎注册</div>
    <form @submit.prevent="register">
      <input v-model="username" placeholder="请输入账号" @blur="validateUsername" />
      <input v-model="password" type="password" placeholder="请输入密码" @blur="validatePassword" />
      <input v-model="confirmPassword" type="password" placeholder="确认密码" @blur="validateConfirmPassword" />
      <p v-if="error" class="error">{{ error }}</p>
      <button :disabled="loading">{{ loading ? '注册中...' : '注册' }}</button>
      <div class="link" @click="goToLogin">已有账号？登录</div>
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
      confirmPassword: "",
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
    validateConfirmPassword() {
      if (this.password !== this.confirmPassword) {
        this.error = "两次密码输入不一致";
      } else {
        this.error = "";
      }
    },
    async register() {
      // 表单验证
      if (!this.username || !this.password || !this.confirmPassword) {
        this.error = "所有字段都不能为空";
        return;
      }

      // 设置加载状态
      this.loading = true;

      try {
        // 发送注册请求到后端
        const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/register`, {
          username: this.username,
          password: this.password,
          password_confirm: this.confirmPassword,
        });

        // 检查后端响应
        if (response.data.success) {
          alert("注册成功");

          // 跳转到登录页或其他页面
          this.$router.push({name: "Login"});
        } else {
          this.error = response.data.message || "注册失败";
        }
      } catch (error) {
        if (error.response) {
          this.error = error.response.data.message || "注册失败";
        } else {
          console.error(error);
          this.error = "网络错误，请稍后再试";
        }
      } finally {
        this.loading = false; // 结束加载状态
      }
    },
    goToLogin() {
      this.$router.push({name: "Login"});
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

input {
  display: block;
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.checkbox-container {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
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
