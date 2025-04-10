<template>
  <div class="login-container">
    <div class="login-card">
      <div class="logo-container">
        <div class="logo">慧排课</div>
        <h1 class="login-title">智慧排课系统</h1>
      </div>
      <p class="login-subtitle">高效管理课程安排，提升教学效率</p>

      <form @submit.prevent="login" class="login-form">
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

        <div class="form-options">
          <label class="remember-me">
            <input type="checkbox" id="remember-me" v-model="rememberMe" />
            <span class="checkmark"></span>
            <span class="remember-text">记住我</span>
          </label>
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
            class="login-button"
            :class="{'loading': loading}"
        >
          <span v-if="!loading">登 录</span>
          <span v-else class="loading-spinner"></span>
        </button>

        <div class="register-link">
          没有账号？<span @click="goToRegister">注册账号</span>
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
      rememberMe: false,
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
    async login() {
      if (!this.username || !this.password) {
        this.error = "账号或密码不能为空";
        return;
      }

      this.loading = true;

      try {
        const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/login`, {
          username: this.username,
          password: this.password,
        });

        if (response.data.code == 200) {
          if (this.rememberMe) {
            localStorage.setItem("userToken", response.data.data.token);
          } else {
            sessionStorage.setItem("userToken", response.data.data.token);
          }

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
        this.loading = false;
      }
    },
    goToRegister() {
      this.$router.push({name: "Register"});
    }
  },
};
</script>

<style scoped>
/* 全局变量 */
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

/* 基础样式 */
* {
  box-sizing: border-box;
}

.login-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(--light-gray);
  padding: 20px;
  background-image: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.login-card {
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

.login-title {
  color: var(--text-color);
  font-size: 28px;
  font-weight: 700;
  margin: 0;
  text-align: center;
}

.login-subtitle {
  color: var(--text-light);
  font-size: 15px;
  text-align: center;
  margin-bottom: 32px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  position: relative;
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  padding: 16px 16px 16px 48px;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  transition: var(--transition);
  background-color: var(--light-gray);
  height: 52px;
  color: var(--text-color);
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

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  margin-top: -8px;
}

.remember-me {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: var(--dark-gray);
  position: relative;
  padding-left: 28px;
  user-select: none;
}

.remember-me input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkmark {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  background-color: var(--light-gray);
  border: 1px solid var(--gray);
  border-radius: 6px;
  transition: var(--transition);
}

.remember-me:hover input ~ .checkmark {
  background-color: #e9ecef;
}

.remember-me input:checked ~ .checkmark {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}

.checkmark:after {
  content: "";
  position: absolute;
  display: none;
  left: 7px;
  top: 3px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.remember-me input:checked ~ .checkmark:after {
  display: block;
}

.remember-text {
  margin-left: 8px;
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
  margin: -8px 0 -4px 0;
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

.login-button {
  background: linear-gradient(135deg, #4361ee, #3a0ca3);
  color: white;
  border: none;
  padding: 16px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  justify-content: center;
  align-items: center;
  height: 52px;
}

.login-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #3a56d4, #2e0a8c);
}

.login-button:disabled {
  background: var(--gray);
  cursor: not-allowed;
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

.register-link {
  text-align: center;
  color: var(--text-light);
  font-size: 15px;
  margin-top: 8px;
}

.register-link span {
  color: var(--primary-color);
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
}

.register-link span:hover {
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
  .login-card {
    padding: 40px 24px;
    border-radius: 12px;
  }

  .logo {
    width: 56px;
    height: 56px;
    font-size: 22px;
  }

  .login-title {
    font-size: 24px;
  }

  .login-subtitle {
    font-size: 14px;
  }

  .form-input {
    height: 48px;
    padding-left: 44px;
  }

  .login-button {
    height: 48px;
  }

  .footer {
    margin-top: 24px;
  }
}
</style>