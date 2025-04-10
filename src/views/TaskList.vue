<template>
  <div class="task-list-container">
    <div class="header">
      <button @click="openNewTaskModal" class="btn btn-primary">新增</button>
      <button @click="deleteTask" class="btn btn-danger">删除</button>
      <span>共{{ taskCount }}项任务</span>
      <button @click="prevPage" class="btn btn-secondary">&lt;</button>
      <button @click="nextPage" class="btn btn-secondary">&gt;</button>
    </div>
    <table class="task-table">
      <thead>
        <tr>
          <th><input type="checkbox" v-model="selectAll"></th>
          <th>任务ID</th>
          <th>任务名称</th>
          <th>学期</th>
          <th>修改时间</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(task, index) in filteredTasks" :key="index">
          <td><input type="checkbox" v-model="selectedTasks" :value="task.id"></td>
          <td>{{ task.id }}</td>
          <td>{{ task.name }}</td>
          <td>{{ task.duration }}</td>
          <td>{{ task.updatedat }}</td>
          <td>
            <button class="btn btn-blank" @click="openEditModal(task)">修改</button>
            <button class="btn btn-blank" @click="copyTask(task)">复制</button>
            <button class="btn btn-blank" @click="selectTask(task.id)">选择</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- 新建/编辑任务弹窗 -->
    <div class="new-task-modal" v-if="showModal">
      <div class="modal-content">
        <h3>{{ isEditing ? '编辑排课任务' : '新建排课任务' }}</h3>
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <input type="text" id="taskName" v-model="taskName" @blur="validateTaskName" placeholder="请输入任务名称!" />
            <span class="error-message" v-if="!isValidTaskName">{{ taskNameError }}</span>
          </div>
          <div class="form-group">
            <label for="semester">学期选择</label>
            <select id="semester" v-model="selectedSemester" @click="toggleDropdown" @blur="hideDropdown">
              <option value="" disabled>请选择学期</option>
              <option v-for="(semester, index) in semesters" :key="index" :value="semester">{{ semester }}</option>
            </select>
            <ul class="dropdown-list" v-show="isDropdownVisible">
              <li v-for="(semester, index) in semesters" :key="index" @click="selectSemester(index)">
                {{ semester }}
              </li>
            </ul>
          </div>
          <div class="button-group">
            <button type="submit" class="btn btn-primary">确认</button>
            <button type="button" class="btn btn-off" @click="closeModal">取消</button>
          </div>
        </form>
      </div>
    </div>
     <!-- 删除提示弹窗 -->
     <div class="delete-modal" v-if="showDeleteModal">
      <div class="modal-content">
        <h3>温馨提示</h3>
        <p>您确定要删除所选任务吗？</p>
        <div class="button-group">
          <button type="button" class="btn btn-primary" @click="closeDeleteModal">我再想想</button>
          <button type="button" class="btn btn-off" @click="confirmDelete">继续删除</button>
        </div>
      </div>
    </div>
  </div>

  
</template>

<script>
import axios from 'axios';

export default {

  data() {
    return {
      tasks: [

      ],
      selectedTasks: [],
      selectAll: false,
      currentPage: 1,
      itemsPerPage: 10,
      showModal: false,
      isEditing: false,
      taskId: '',
      taskName: '',
      selectedSemester: '',
      semesters: [
        '2024-2025学年第1学期',
        '2024-2025学年第2学期',
        '2025-2026学年第1学期',
        '2025-2026学年第2学期',
        '2026-2027学年第1学期',
        '2026-2027学年第2学期',
        '2027-2028学年第1学期',
        '2027-2028学年第2学期'
      ],
      isDropdownVisible: false,
      isValidTaskName: true,
      taskNameError: '',
      showDeleteModal: false,
    };
  },
  created() {
    this.fetchTasks(); // 在组件创建时加载任务列表
  },
  computed: {
    taskCount() {
      return this.tasks.length;
    },
    filteredTasks() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.tasks.slice(start, end);
    }
  },
  methods: {
    async fetchTasks() {
      // 从 localStorage 中获取 token， 若没有则从 sessionStorage 中获取
      const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
      if (!token) {
        alert('请先登录');
        return;
      }
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/api/tasks`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        this.tasks = response.data.data.tasks; // 将后端返回的任务数据赋值给 tasks
      } catch (error) {
        console.error('获取任务列表失败:', error);
      }
    },
    async addTask() {
      // 从 localStorage 中获取 token， 若没有则从 sessionStorage 中获取
      const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
      if (!token) {
        alert('请先登录');
        return;
      }
      try {
        const newTask = {
          name: this.taskName,
          duration: this.selectedSemester,
        };
        const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/api/tasks`, newTask, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        this.tasks.push(response.data.data.task); // 将后端返回的新任务添加到任务列表
        this.closeModal();
      } catch (error) {
        console.error('新增任务失败:', error);
      }
    },
    async selectTask(taskId) {
      try {
        this.taskId = taskId;
        this.$router.push( {path: '/scheduleTool', query: {taskId: this.taskId} });
      } catch (error) {
        console.error('选择任务时出错:', error);
      }
    },
    async deleteTask() {
      // 从 localStorage 中获取 token， 若没有则从 sessionStorage 中获取
      const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
      if (!token) {
        alert('请先登录');
        return;
      }
      if (this.selectedTasks.length > 0) {
        this.showDeleteModal = true;
      } else {
        alert('请先选择要删除的任务');
      }
    },
    async confirmDelete() {
      // 从 localStorage 中获取 token， 若没有则从 sessionStorage 中获取
      const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
      if (!token) {
        alert('请先登录');
        return;
      }
      try {
        for (const taskId of this.selectedTasks) {
          await axios.delete(`${process.env.VUE_APP_API_BASE_URL}/api/tasks/${taskId}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
        }
        this.tasks = this.tasks.filter(task => !this.selectedTasks.includes(task.id)); // 更新任务列表
        this.selectedTasks = [];
        this.showDeleteModal = false;
      } catch (error) {
        console.error('删除任务失败:', error);
      }
    },
    closeDeleteModal() {
      
      this.showDeleteModal = false;
    },
    async editTask() {
      // 从 localStorage 中获取 token，若没有则从 sessionStorage 中获取
      const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
      if (!token) {
        alert('请先登录');
        return;
      }

      try {
        const updatedTask = {
          name: this.taskName, // 更新后的任务名称
          duration: this.selectedSemester, // 更新后的学期
        };

        // 发送 PUT 或 PATCH 请求更新任务
        const response = await axios.put(`${process.env.VUE_APP_API_BASE_URL}/api/tasks/${this.taskId}`, updatedTask, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // 更新本地任务列表
        const updatedTaskIndex = this.tasks.findIndex(task => task.id === this.taskId);
        console.log(updatedTaskIndex);
        if (updatedTaskIndex !== -1) {
          this.tasks.splice(updatedTaskIndex, 1, response.data.data.task); // 替换为更新后的任务
        }
        this.closeModal();
      } catch (error) {
        console.error('更新任务失败:', error);
        alert('更新任务失败，请稍后重试');
      }
    },
    async copyTask(task) {
      // 从 localStorage 中获取 token， 若没有则从 sessionStorage 中获取
      const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
      if (!token) {
        alert('请先登录');
        return;
      }
      try {
        const baseName = task.name;
        const baseDuration = task.duration;
        let copyCount = this.tasks.filter(t => t.name.startsWith(baseName)).length;

        const newName = `${baseName}（${copyCount > 1 ? copyCount : 1}）`;

        const copiedTask = {
          ...task,
          name: newName,
          duration: baseDuration,
        };
        const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/api/tasks`, copiedTask, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        this.tasks.push(response.data.data.task); // 将后端返回的新任务添加到任务列表
        this.closeModal();
      } catch (error) {
        console.error('新增任务失败:', error);
      }
    },
    // 打开弹窗进行编辑
    openEditModal(task) {
      this.taskId = task.id;
      this.isEditing = true;
      this.showModal = true;
      this.taskName = task.name;
      this.selectedSemester = task.duration;
      this.isDropdownVisible = false;
    },
    openNewTaskModal() {
      this.showModal = true;
      this.taskName = '';
      this.selectedSemester = '';
      this.isDropdownVisible = false;
    },
    closeModal() {
      this.showModal = false;
      this.taskName = '';
      this.selectedSemester = '';
      this.isDropdownVisible = false;
    },
    handleSubmit() {
      if (this.taskName && this.selectedSemester && !this.isEditing) {
        this.addTask();
      } else if (this.isEditing) {
        this.editTask();
      } else {
          this.taskNameError = '请填写所有必填项';
          this.isValidTaskName = false;
      }
    },
    validateTaskName() {
      this.taskNameError = '';
      this.isValidTaskName = !!this.taskName;
    },
    toggleDropdown() {
      this.isDropdownVisible = !this.isDropdownVisible;
    },
    hideDropdown() {
      this.isDropdownVisible = false;
    },
    selectSemester(index) {
      this.selectedSemester = this.semesters[index];
      this.hideDropdown();
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
    nextPage() {
      const totalPages = Math.ceil(this.taskCount / this.itemsPerPage);
      if (this.currentPage < totalPages) {
        this.currentPage++;
      }
    }
  },
  watch: {
    selectAll(value) {
      if (value) {
        this.selectedTasks = this.tasks.map(task => task.id);
      } else {
        this.selectedTasks = [];
      }
    }
  }
};
</script>

<style scoped>

.delete-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.task-list-container {
  margin: 20px;
}

.header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.btn {
  width: 120px;
  height:40px;
  padding: 8px ;
  margin-right: 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-danger {
  background-color: white;
  color: #dc3545;
}
.btn-off{
  background-color: #dc3545;
  color:white;
}
.btn-secondary {
  width: 40px;
  height:40px;
  border-color: black;
  background-color: white;
  color: #6c757d;
  margin-left: 10px;
}
.btn-blank{
  color: rgba(0, 55, 255, 0.692);
  background-color: white;
  font-weight: bold;
  font-size: 17px;
}
.header>span{
  margin-left:auto;
}
.header > span + .btn-secondary {
      margin-left: 10px; /* 控制文本与导航按钮之间的间距 */
    }


.task-table {
  width: 100%;
  background-color: white;
  border-collapse: collapse;
}

.task-table th,
.task-table td {
  padding: 10px;
  border: 1px solid #ddd;
}

.task-table th {
  background-color: #f2f2f2;
  text-align: left;
}

.task-table td input[type="checkbox"] {
  margin-right: 10px;
}
.new-task-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  width: 300px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.error-message {
  color: red;
  font-size: 12px;
}

.dropdown-list {
  position: absolute;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-top: 5px;
  max-height: 200px;
  overflow-y: auto;
}

.dropdown-list li {
  list-style: none;
  padding: 8px;
  cursor: pointer;
}

.dropdown-list li:hover {
  background-color: #f0f0f0;
}
.delete-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  width: 300px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.error-message {
  color: red;
  font-size: 12px;
}

.dropdown-list {
  position: absolute;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-top: 5px;
  max-height: 200px;
  overflow-y: auto;
}

.dropdown-list li {
  list-style: none;
  padding: 8px;
  cursor: pointer;
}

.dropdown-list li:hover {
  background-color: #f0f0f0;
}
</style>