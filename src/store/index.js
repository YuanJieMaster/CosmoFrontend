
import { createStore } from 'vuex';

export default createStore({
  state: {
    username: localStorage.getItem('username') || '', // 从本地存储加载用户名
    currentTaskName: '' // 当前任务名称
  },
  mutations: {
    SET_USERNAME(state, username) {
      state.username = username;
      localStorage.setItem('username', username); // 同步到本地存储
    },
    CLEAR_USERNAME(state) {
      state.username = '';
      localStorage.removeItem('username'); // 清除本地存储
    },
    SET_CURRENT_TASK(state, taskName) {
      state.currentTaskName = taskName;
    }
  },
  actions: {
    login({ commit }, username) {
      commit('SET_USERNAME', username);
    },
    logout({ commit }) {
      commit('CLEAR_USERNAME');
    },
    setCurrentTask({ commit }, taskName) {
      commit('SET_CURRENT_TASK', taskName);
    }
  }
});