<!--<template>-->
<!--    <div>-->
<!--      <h2>统计分析</h2>-->
<!--      <p>请在此查看排课统计分析结果。</p>-->
<!--    </div>-->
<!--  </template>-->

<template>
  <div class="data-settings">
    <!-- 图表显示 -->
    <div class="chart-display">
      <h3>统计分析</h3>
      <!-- 添加输入框 -->
      <input type="text" v-model="sheetName" placeholder="请输入sheetName" />
      <button @click="fetchVisualization">加载图表</button>
      <div v-if="chartImageData" class="chart-image">
        <img :src="chartImageData" alt="统计分析图表" />
      </div>
      <div v-else class="import-status">
        图表尚未加载，请点击“加载图表”按钮。
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';

const chartImageData = ref(null);
const APIBASEURL = `${process.env.VUE_APP_API_BASE_URL}/api`;
// 添加一个新的响应式引用来绑定输入框的值
const sheetName = ref('');

const fetchVisualization = async () => {
  try {
    const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
    if (!token) {
      alert('请先登录');
      return;
    }

    // 使用新的响应式引用作为sheetName的值
    const requestData = {
      sheetName: sheetName.value
    };

    const response = await axios.post(`${APIBASEURL}/visualization`, requestData, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      responseType: 'blob'
    });

    const reader = new FileReader();
    reader.onload = (e) => {
      chartImageData.value = e.target.result;
    };
    reader.readAsDataURL(response.data);
  } catch (error) {
    console.error('加载图表失败:', error);
    alert('加载图表失败，请稍后再试');
  }
};
</script>

<style scoped>
/* 样式保持不变 */
.data-settings {
  padding: 20px;
}

.chart-display {
  margin-bottom: 20px;
}

.chart-image img {
  max-width: 100%;
  height: auto;
  margin-top: 10px;
}

.import-status {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  padding: 10px;
  margin-top: 10px;
}
</style>

