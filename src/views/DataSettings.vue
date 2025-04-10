<template>
  <div class="data-settings">
    <!-- 教室数据导入 -->
    <div class="classroom-import">
      <h3>教室数据导入</h3>
      <button @click="openFilePicker('classrooms')">导入</button>
      <div v-if="classroomImported" class="import-status">
        已导入，点击重新导入
      </div>
    </div>

    <!-- 排课任务导入 -->
    <div class="scheduling-task-import">
      <h3>排课任务导入</h3>
      <button @click="openFilePicker('courses')">导入</button>
      <div v-if="schedulingTaskImported" class="import-status">
        已导入，点击重新导入
      </div>
    </div>

    <!-- 学期时间设置 -->
    <div class="semester-settings">
      <h3>学期时间设置</h3>
      <div class="date-picker">
        <label for="start-date">开始时间：</label>
        <button id="start-date-btn" @click="toggleCalendar('start')">{{ startDate || '选择开始时间' }}</button>
        <div id="start-calendar" class="calendar" v-if="isStartCalendarVisible">
          <input type="date" @change="selectDate('start', $event)" />
        </div>
      </div>
      <div class="date-picker">
        <label for="end-date">结束时间：</label>
        <button id="end-date-btn">{{ endDate || '自动计算' }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps } from 'vue';
import axios from 'axios'; // 引入 Axios 进行 HTTP 请求

const classroomImported = ref(false);
const schedulingTaskImported = ref(false);
const startDate = ref(null); // 开始时间
const endDate = ref(null); // 结束时间
const isStartCalendarVisible = ref(false); // 控制开始时间日历的显示
const weeks = ref([]); // 每周的时间段
// 声明 Props
const props = defineProps({
  taskId: {
    type: [String, Number], // 类型校验
    required: true,         // 强制要求父组件传递
  }
});

// 打开文件选择器并上传文件
const openFilePicker = async (type) => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.csv, .xls, .xlsx'; // 可以根据需要调整文件类型
  input.onchange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      // 从 localStorage 中获取 token， 若没有则从 sessionStorage 中获取
      const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
      if (!token) {
        alert('请先登录');
        return;
      }
      const formData = new FormData();
      formData.append('file', file);
      const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/api/import/${type}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
        params: {
          task_id: props.taskId
        },
      });

      if (response.data.code === 200) {
        if (type === 'classroom') {
          classroomImported.value = true;
        } else if (type === 'scheduling') {
          schedulingTaskImported.value = true;
        }
        alert('导入成功');
      } else {
        alert('导入失败，请检查文件格式');
      }
    } catch (error) {
      console.error(error);
      alert('导入失败，请稍后再试');
    }
  };
  input.click();
};

// 切换日历显示
const toggleCalendar = (type) => {
  if (type === 'start') {
    isStartCalendarVisible.value = !isStartCalendarVisible.value;
  }
};

// 选择日期并更新开始时间
const selectDate = async (type, event) => {
  const selectedDate = event.target.value; // 获取用户选择的日期
  if (type === 'start') {
    startDate.value = selectedDate;
    calculateEndDate(selectedDate); // 根据开始时间计算结束时间
    divideIntoWeeks(selectedDate); // 划分每周时间段
    isStartCalendarVisible.value = false; // 关闭日历

    try {
      await saveSemesterDates(); // 将日期保存到后端
    } catch (error) {
      console.error('保存日期失败:', error);
      alert('保存日期失败，请稍后再试');
    }
  }
};

// 计算结束时间
const calculateEndDate = (startDateStr) => {
  const start = new Date(startDateStr);
  const end = new Date(start.getTime() + 18 * 7 * 24 * 60 * 60 * 1000); // 向后推 18 周
  endDate.value = formatDate(end); // 格式化日期并赋值给结束时间
};

// 划分每周时间段
const divideIntoWeeks = (startDateStr) => {
  const start = new Date(startDateStr);
  const weekArray = [];
  for (let i = 0; i < 18; i++) {
    const weekStart = new Date(start.getTime() + i * 7 * 24 * 60 * 60 * 1000);
    const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
    weekArray.push({
      week: i + 1,
      start: formatDate(weekStart),
      end: formatDate(weekEnd),
    });
  }
  weeks.value = weekArray; // 更新每周时间段
};

// 格式化日期
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 保存学期时间到后端
const saveSemesterDates = async () => {
  try {
    // 从 localStorage 中获取 token， 若没有则从 sessionStorage 中获取
    const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
    if (!token) {
      alert('请先登录');
      return;
    }
    await axios.post(`${process.env.VUE_APP_API_BASE_URL}/api/import/semester`, {
      start_date: new Date(startDate.value).toISOString(),
      end_date: new Date(endDate.value).toISOString(),
      weeks: weeks.value,
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      params: {
        task_id: props.taskId
      }
    });
  } catch (error) {
    console.error('保存学期日期失败:', error.message); // 记录错误日志
    alert('保存学期日期失败，请稍后再试'); // 提示用户
    throw error; // 如果需要，继续将错误抛出给上层
  }
};
</script>

<style scoped>
/* 样式保持不变 */
.data-settings {
  padding: 20px;
}

.import-status {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  padding: 10px;
  margin-top: 10px;
}

.date-range {
  display: flex;
  gap: 10px;
}

.semester-settings {
  margin-bottom: 20px;
}

.date-picker {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.date-picker button {
  margin-left: 10px;
  padding: 5px 10px;
  cursor: pointer;
}

.calendar {
  position: absolute;
  margin-top: 5px;
  padding: 10px;
  background-color: white;
  border: 1px solid #ccc;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}
</style>