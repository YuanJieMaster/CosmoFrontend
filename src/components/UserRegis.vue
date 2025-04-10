<template>
  <div class="register-container">
    <div class="register-card">
      <div class="logo-container">
        <div class="logo">慧排课</div>
        <h1 class="register-title">用户注册</h1>
      </div>
      <p class="register-subtitle">加入智慧排课系统，开启高效课程管理</p>

      <form @submit.prevent="register" class="register-form">
        <div class="form-group">
          <i class="icon icon-user"></i>
          <input
              v-model="username"
              placeholder="请输入账号"
              @blur="validateUsername"
              class="form-input"
          />
          <div class="input-border"></div>
        </div>

        <div class="form-group">
          <i class="icon icon-lock"></i>
          <input
              v-model="password"
              type="password"
              placeholder="请输入密码"
              @blur="validatePassword"
              class="form-input"
          />
          <div class="input-border"></div>
        </div>

        <div class="form-group">
          <i class="icon icon-lock"></i>
          <input
              v-model="confirmPassword"
              type="password"
              placeholder="确认密码"
              @blur="validateConfirmPassword"
              class="form-input"
          />
          <div class="input-border"></div>
        </div>

        <transition name="fade">
          <p v-if="error" class="error-message">
            <i class="error-icon"></i>
            {{ error }}
          </p>
        </transition>

        <button
            type="submit"
            :disabled="loading"
            class="register-button"
            :class="{'loading': loading}"
        >
          <span v-if="!loading">注 册</span>
          <span v-else class="loading-spinner"></span>
        </button>

        <div class="login-link">
          已有账号？<span @click="goToLogin">立即登录</span>
        </div>
      </form>
    </div>

    <div class="footer">
      <p>© 2025 智慧排课系统</p>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      username: "",
      password: "",
      confirmPassword: "",
      error: "",
      loading: false,
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
      if (!this.username || !this.password || !this.confirmPassword) {
        this.error = "所有字段都不能为空";
        return;
      }

      if (this.password !== this.confirmPassword) {
        this.error = "两次密码输入不一致";
        return;
      }

      this.loading = true;

      try {
        const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/register`, {
          username: this.username,
          password: this.password,
          password_confirm: this.confirmPassword,
        });

        if (response.data.success) {
          alert("注册成功");
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
        this.loading = false;
      }
    },
    goToLogin() {
      this.$router.push({name: "Login"});
    },
  },
};
</script>

<style scoped>
/* 使用与登录页面相同的设计系统 */
:root {
  --primary-color: #4361ee;
  --primary-hover: #3a56d4;
  --primary-light: rgba(67, 97, 238, 0.1);
  --text-color: #2b2d42;
  --text-light: #6c757d;
  --light-gray: #f8f9fa;
  --gray: #adb5bd;
  --dark-gray: #495057;
  --error-color: #ef233c;
  --error-light: rgba(239, 35, 60, 0.1);
  --white: #ffffff;
  --box-shadow: 0 15px 30px rgba(0, 0, 0, 0.12);
  --transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.register-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(--light-gray);
  padding: 20px;
  background-image: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.register-card {
  background: var(--white);
  border-radius: 16px;
  padding: 48px 40px;
  width: 100%;
  max-width: 440px;
  box-shadow: var(--box-shadow);
  transition: var(--transition);
}

.logo-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 16px;
}

.logo {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #4361ee, #3a0ca3);
  color: white;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 16px;
}

.register-title {
  color: var(--text-color);
  font-size: 28px;
  font-weight: 700;
  margin: 0;
  text-align: center;
}

.register-subtitle {
  color: var(--text-light);
  font-size: 15px;
  text-align: center;
  margin-bottom: 32px;
  line-height: 1.5;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 16px; /* 调整为与登录表单相同的间距 */
}

.form-group {
  position: relative;
  margin-bottom: 0; /* 调整为与登录表单相同的底部间距 */
}

.form-input {
  width: 100%;
  padding: 14px 16px 14px 48px; /* 调整为与登录表单相同的padding */
  border: none;
  border-radius: 8px;
  font-size: 15px;
  transition: var(--transition);
  background-color: var(--light-gray);
  height: 48px; /* 调整为与登录表单相同的高度 */
  color: var(--text-color);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
}

.form-input:focus {
  outline: none;
  background-color: var(--white);
  box-shadow: 0 0 0 2px var(--primary-light);
}

.form-input:focus + .input-border {
  transform: scaleX(1);
}

.input-border {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: var(--primary-color);
  transform: scaleX(0);
  transform-origin: left;
  transition: var(--transition);
}

.icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--gray);
  font-size: 18px;
  z-index: 1;
}

.icon-user:before {
  content: "👤";
}

.icon-lock:before {
  content: "🔒";
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}

.error-message {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--error-color);
  font-size: 14px;
  padding: 12px;
  background-color: var(--error-light);
  border-radius: 8px;
  margin: -4px 0 4px 0; /* 调整为与登录表单相同的边距 */
}

.error-icon {
  display: inline-block;
  width: 16px;
  height: 16px;
  background-color: var(--error-color);
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'%3E%3C/circle%3E%3Cline x1='12' y1='8' x2='12' y2='12'%3E%3C/line%3E%3Cline x1='12' y1='16' x2='12.01' y2='16'%3E%3C/line%3E%3C/svg%3E");
  mask-repeat: no-repeat;
  margin-right: 8px;
}

.register-button {
  background: linear-gradient(135deg, #4361ee, #3a0ca3);
  color: white;
  border: none;
  padding: 14px; /* 调整为与登录按钮相同的padding */
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  justify-content: center;
  align-items: center;
  height: 48px; /* 调整为与登录按钮相同的高度 */
  letter-spacing: 1px;
  margin-top: 8px; /* 调整为与登录表单相同的顶部间距 */
}

.register-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #3a56d4, #2e0a8c);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(67, 97, 238, 0.4);
}

.register-button:active:not(:disabled) {
  transform: translateY(0);
}

.register-button:disabled {
  background: var(--gray);
  cursor: not-allowed;
  box-shadow: none;
}

.loading-spinner {
  width: 22px;
  height: 22px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: var(--white);
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.login-link {
  text-align: center;
  color: var(--text-light);
  font-size: 15px;
  margin-top: 8px;
}

.login-link span {
  color: var(--primary-color);
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
}

.login-link span:hover {
  text-decoration: underline;
}

.footer {
  margin-top: 40px;
  color: var(--text-light);
  font-size: 13px;
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .register-card {
    padding: 40px 24px;
    border-radius: 12px;
  }

  .logo {
    width: 56px;
    height: 56px;
    font-size: 22px;
  }

  .register-title {
    font-size: 24px;
  }

  .register-subtitle {
    font-size: 14px;
  }

  .form-input {
    height: 44px; /* 调整为与移动端登录表单相同的高度 */
    padding-left: 44px;
    font-size: 14px;
  }

  .register-button {
    height: 44px; /* 调整为与移动端登录按钮相同的高度 */
    font-size: 15px;
  }

  .footer {
    margin-top: 24px;
  }
}
</style>