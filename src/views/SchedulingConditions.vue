<template>
  <div class="rule-settings">
    <h2>规则设置</h2>

    <!-- 规则选项 -->
    <div class="rule-option" v-for="(value, key) in rules" :key="key">
      <label>
        <input type="checkbox" v-model="rules[key]" @change="saveRulesToBackend" />
        {{ formatRuleName(key) }}
      </label>
    </div>
<!--    &lt;!&ndash; 选择先不排的课程 &ndash;&gt;-->
<!--    <div class="course-selection">-->
<!--      <h3>选择先不排的课程</h3>-->
<!--      <div class="button-group">-->
<!--        <button @click="showCourseSelection = true">选择课程</button>-->
<!--        <button @click="clearSelectedCourses" class="clear-button">清空</button>-->
<!--      </div>-->
<!--      <ul v-if="selectedCourses.length > 0">-->
<!--        <li v-for="(course, index) in selectedCourses" :key="index">{{ course }}</li>-->
<!--      </ul>-->
<!--    </div>-->

    <!-- 节假日智能调课 -->
    <div class="holiday-setting">
      <h3>节假日智能调课</h3>
      <div class="button-group">
        <button @click="toggleHolidayCalendar">选择节假日</button>
        <button @click="clearHolidays" class="clear-button">清空</button>
      </div>
      <div v-if="isHolidayCalendarVisible" class="holiday-calendar">
        <input type="date" multiple v-model="holidays" @change="saveHolidaysToBackend" />
      </div>
      <ul v-if="holidays.length > 0">
        <li v-for="(holiday, index) in holidays" :key="index">{{ holiday }}</li>
      </ul>
    </div>

    <!-- 保存按钮 -->
    <button @click="saveAllSettings" class="save-button">保存设置</button>

    <!-- 弹窗：选择课程 -->
    <div v-if="showCourseSelection" class="course-selection-modal">
      <h4>选择课程</h4>
      <ul>
        <li v-for="(course, index) in allCourses" :key="index">
          <label>
            <input type="checkbox" v-model="tempSelectedCourses" :value="course" />
            {{ course }}
          </label>
        </li>
      </ul>
      <button @click="confirmCourseSelection">确认</button>
      <button @click="cancelCourseSelection">取消</button>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps } from 'vue';
import axios from 'axios';

// 假设您的token存储在localStorage中
const token = localStorage.getItem('userToken');

// 创建一个axios实例，配置默认headers
const api = axios.create({
  baseURL: `${process.env.VUE_APP_API_BASE_URL}/api`, // 假设这是您的API基础URL
  headers: {
    'Authorization': `Bearer ${token}` // 在所有请求中添加token
  }
});

// 数据定义
const rules = ref({
  preferential_order: false,
  evening_classes: false,
  weekend_classes: false,
  experimental_class: false,
  sports_only_afternoon: false,
});

const showCourseSelection = ref(false);
const allCourses = ref(['数学分析', '线性代数', '大学物理', '计算机基础']);
const tempSelectedCourses = ref([]);
const selectedCourses = ref([]);

const isHolidayCalendarVisible = ref(false);
const holidays = ref([]);

// 声明 Props
const props = defineProps({
  taskId: {
    type: [String, Number], // 类型校验
    required: true,         // 强制要求父组件传递
  }
});

// 方法定义
const formatRuleName = (key) => {
  const ruleNames = {
    preferential_order: '是否按优先级排课',
    evening_classes: '晚上是否排课',
    weekend_classes: '周末是否排课',
    experimental_class: '实验课是否能安排在晚上',
    sports_only_afternoon: '体育课是否只安排在下午',
  };
  return ruleNames[key] || key;
};

// const clearSelectedCourses = () => {
//   selectedCourses.value = [];
// };

const toggleHolidayCalendar = () => {
  isHolidayCalendarVisible.value = !isHolidayCalendarVisible.value;
};

const confirmCourseSelection = () => {
  selectedCourses.value = [...tempSelectedCourses.value];
  showCourseSelection.value = false;
};

const cancelCourseSelection = () => {
  showCourseSelection.value = false;
};

const clearHolidays = () => {
  holidays.value = [];
};

const validateTaskId = () => {
  const taskId = props.taskId;
  if (!taskId || taskId <= 0) {
    alert('任务ID必须为正整数');
    return false;
  }
  return true;
};

// 保存所有设置的函数
const saveAllSettings = async () => {
  try {
    // 保存规则到后端
    if (!validateTaskId()) return;
    const rulesToSend = { ...rules.value, task_id: Number(props.taskId) };
    const rulesResponse = await api.post('/set/conditions', rulesToSend);
    console.log('规则保存成功:', rulesResponse.data);

    // 保存课程选择到后端
    const coursesToSend = selectedCourses.value.map(courseName => {
      return { course_id: allCourses.value.indexOf(courseName) + 1, course_name: courseName };
    });
    const coursesDataToSend = { courses: coursesToSend, task_id: Number(props.taskId) };
    const coursesResponse = await api.post('/select/courses', coursesDataToSend);
    console.log('课程选择保存成功:', coursesResponse.data);

    // 保存节假日设置到后端
    const holidaysDataToSend = { dates: holidays.value, task_id: Number(props.taskId) };
    const holidaysResponse = await api.post('/set/holidays', holidaysDataToSend);
    console.log('节假日设置保存成功:', holidaysResponse.data);

    alert('所有设置已保存成功');
  } catch (error) {
    console.error('保存设置失败:', error);
    alert('保存设置失败，请稍后再试');
  }
};


</script>
  <style scoped>
  .rule-settings {
    padding: 20px;
    background-color: #f5f5f5;
  }
  
  .rule-option {
    margin-bottom: 10px;
  }
  
  .course-selection,
  .holiday-setting {
    margin-top: 20px;
  }
  
  .course-selection h3,
  .holiday-setting h3 {
    margin-bottom: 10px;
  }

  /* 添加task_id输入框样式 */
  .task-id-input {
    margin-top: 20px;
  }

  .task-id-input label {
    margin-right: 10px;
  }

  .task-id-input input {
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  /* 保存按钮样式 */
  .save-button {
    padding: 10px 20px;
    margin-top: 20px;
    background-color: #409eff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  .save-button:hover {
    background-color: #66b1ff;
  }
  
  /* 按钮组样式 */
  .button-group {
    display: flex;
    gap: 10px; /* 设置按钮之间的间距 */
    align-items: center;
  }
  
  /* 默认按钮样式 */
  .button-group button {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    height: 40px;
  }

  
  /* 清空按钮样式 */
  .button-group .clear-button {
    background-color: #ff4d4f; /* 红色背景 */
    color: white;
    font-size: 12px; /* 字体变小 */
    padding: 4px 8px ; /* 尺寸变小 */
    width: 80px;
    height: 40px;
  }
  
  /* 清空按钮悬停效果 */
  .button-group .clear-button:hover {
    background-color: #ff7875; /* 稍浅的红色 */
  }
  
  .course-selection ul li,
  .holiday-setting ul li {
    list-style-type: none;
    margin-bottom: 5px;
  }
  
  .course-selection-modal {
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
  
  .course-selection-modal ul {
    background-color: white;
    padding: 20px;
    border-radius: 8px;
  }
  
  .course-selection-modal button {
    margin-top: 10px;
  }
  </style>