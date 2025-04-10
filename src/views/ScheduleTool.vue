<template>
  <div class="course-scheduler">
    <nav class="navigation-bar">
      <button 
        v-for="(tab, index) in tabs" 
        :key="index" 
        :class="{ active: currentTab === tab }" 
        @click="switchTab(tab)"
      >
        {{ tab }}
      </button>
    </nav>

    <!-- Display the current TaskId -->
    <div class="task-id-display">
      <p>当前任务ID: {{ taskId }}</p>
    </div>

    <!-- 提示信息 -->
    <div v-if="!dataImported && (currentTab !== '数据设置')">
      <p>请先完成数据导入。</p>
    </div>

    <!-- 动态组件 -->
    <component 
      :is="currentComponent" 
      v-else
      :task-id="taskId"
      :tab-data="tabData[currentTab]"
      @update-data="handleUpdateData"
    ></component>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios'; // 引入 Axios 进行 HTTP 请求
import DataSettings from './DataSettings.vue';
import SchedulingConditions from './SchedulingConditions.vue';
import ManualScheduling from './ManualScheduling.vue';
import StatisticsAnalysis from './StatisticsAnalysis.vue';

// 定义状态
const tabs = ['数据设置', '排课条件设置', '手动排课以及导出', '统计分析'];
const currentTab = ref('数据设置');
const dataImported = ref(true); // 数据是否已导入
const tabData = ref({}); // 各标签页的数据
const route = useRoute();  // 获取路由对象
const taskId = ref(route.query.taskId || '未设置');

// 动态加载组件
const currentComponent = computed(() => {
  const components = {
    '数据设置': DataSettings,
    '排课条件设置': SchedulingConditions,
    '手动排课以及导出': ManualScheduling,
    '统计分析': StatisticsAnalysis,
  };
  return components[currentTab.value];
});

// 初始化数据
onMounted(async () => {
  try {
    const response = await axios.get('/api/course-scheduler/init'); // 获取初始数据
    tabData.value = response || {};
    // dataImported.value = !!tabData.value['数据设置']; // 检查是否有数据导入
    dataImported.value = true; // 检查是否有数据导入
  } catch (error) {
    console.error('初始化数据失败:', error);
  }
});

// 切换标签页
const switchTab = async (tab) => {
  if (tab !== '数据设置' && !dataImported.value) {
    alert('请先完成数据导入');
    return;
  }

  currentTab.value = tab;

  // 如果切换到新标签页，尝试加载对应数据
  if (!tabData.value[tab]) {
    try {
      const response = await axios.get(`/api/course-scheduler/tab/${tab}`);
      tabData.value[tab] = response.data || {};
    } catch (error) {
      console.error(`加载 ${tab} 数据失败`, error);
    }
  }
};



// 处理子组件数据更新
const handleUpdateData = (newData) => {
  tabData.value[currentTab.value] = { ...tabData.value[currentTab.value], ...newData };
};
</script>

<style scoped>
.course-scheduler {
  display: flex;
  flex-direction: column;
}

.navigation-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.navigation-bar button {
  padding: 5px 15px;
  margin-right: 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.navigation-bar button.active {
  background-color: #007bff;
  color: white;
  font-weight: bold;
}

.navigation-bar button:last-child {
  margin-right: 0;
}
</style>