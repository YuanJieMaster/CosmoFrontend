<template>
  <div class="schedule-page">
    <!-- 新增搜索框容器 -->
    <div class="top-search-container">
      <div class="search-container">
        <select v-model="searchType">
          <option value="classroom">教室</option>
          <option value="teacher">教师</option>
        </select>
        <input
            type="text"
            v-model="searchKeyword"
            placeholder="输入搜索关键词"
            @keyup.enter="performSearch"
        >
        <button @click="performSearch">搜索</button>
      </div>
    </div>

    <!-- 功能栏 -->
    <div class="toolbar">
      <button @click="autoSchedule">自动排课</button>
      <button @click="checkSchedule">课表检测</button>
      <button @click="resetSchedule">重置课表</button>

      <!--      <select @change="setViewMode" v-model="viewMode">-->
      <!--        <option value="classroom">教室课表</option>-->
      <!--        <option value="class">教学班课表</option>-->
      <!--        <option value="teacher">教师课表</option>-->
      <!--      </select>-->
      <button @click="exportSchedule">导出</button>
    </div>

    <div id="app" class="course-table">
      <div class="header">
        <div></div> <!-- 占位符，确保时间列对齐 -->
        <div v-for="(day, index) in daysOfWeek" :key="index">{{ day }}</div>
      </div>
      <div v-for="(row, rowIndex) in schedule" :key="rowIndex" class="row">
        <div class="time">{{ row.time }}</div> <!-- 显示时间 -->
        <div
            v-for="(cell, colIndex) in row.cells"
            :key="colIndex"
            class="cell"
            :class="{ selected: cell.selected }"
            @click="selectCell(rowIndex, colIndex)"
            @contextmenu.prevent="deleteCourse(rowIndex, colIndex)"
        >
          {{ cell.class_name || '空闲' }} <!-- 显示课程名称或“空闲” -->
        </div>
      </div>
    </div>

    <!--    <div class="course-selector">-->
    <!--      <input type="text" placeholder="搜索课程" v-model="searchCourse" @keyup="filterCourses" />-->
    <!--      <ul>-->
    <!--        <li v-for="(course, index) in tempCourses" :key="index">-->
    <!--          <span>{{ course.class_name }}</span> &lt;!&ndash; 显示课程名称 &ndash;&gt;-->
    <!--          <button @click="addCourse(course)">添加课程</button>-->
    <!--        </li>-->
    <!--      </ul>-->
    <!--    </div>-->

    <div class="temp-course-area">
      <h4>课程暂放区</h4>
      <ul>
        <li v-for="(course, index) in tempCourses" :key="index">
          <span>{{ course.class_name }}</span> <!-- 显示课程名称 -->
          <button @click="restoreCourse(index)">放入课程</button>
          {{ course.name }}
        </li>
      </ul>
    </div>

    <!-- 统计信息 -->
    <div class="task-statistics">
      <p>总任务数: {{ totalTasks }}</p>
      <p>已完成数: {{ completedTasks }}</p>
      <p>未完成数: {{ uncompletedTasks }}</p>
      <p>未完成原因: {{ uncompletedReasons }}</p>
    </div>
  </div>
</template>

<script>
import axios from "axios"; // 引入 Axios 进行 HTTP 请求

export default {
  props: [
    "taskId", // 任务ID
    "tabData" // 传递给子组件的数据
  ],
  data() {
    return {
      timeSlots: [], // 初始化为空数组，从后端加载数据
      schedule: [
        {time: '1节', cells: Array(7).fill().map(() => ({selected: false}))},
        {time: '2节', cells: Array(7).fill().map(() => ({selected: false}))},
        {time: '3节', cells: Array(7).fill().map(() => ({selected: false}))},
        {time: '4节', cells: Array(7).fill().map(() => ({selected: false}))},
      ],
      viewMode: "classroom",
      daysOfWeek: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
      daysOfWeek_En: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      searchCourse: "",
      courses: [], // 从后端加载课程列表
      filteredCourses: [],
      selectedCourses: [],
      tempCourses: [],
      totalTasks: 0,
      completedTasks: 0,
      uncompletedTasks: 0,
      uncompletedReasons: ["课表冲突", "手动删除", "设置冲突"],
    };
  },
  methods: {
    async loadScheduleFromBackend() {
      try {
        const query = {
          "task_id": Number(this.taskId),
          "type": "classroom",
          "name": "HXGC2#202"
        };
        const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/api/schedule`, query, {
          headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('userToken') || sessionStorage.getItem('userToken')
          }
        });
        this.timeSlots = response.data.data.schedule; // 更新课表数据
        // 将courses过滤timeSlots已排的课程
        this.tempCourses = this.courses.filter((course) =>
            !this.timeSlots.some((item) => item.class_id === course.class_id)
        );
        console.log(this.tempCourses);

        // 将timeSlots放入schedule中
        this.fillSchedule()
        console.log(this.schedule);
      } catch (error) {
        console.error("加载课表失败:", error);
        alert("加载课表失败，请稍后再试");
      }
    },
    fillSchedule() {
      // 初始化 schedule 中的每一天
      this.schedule.forEach((row) => {
        row.cells = Array(7).fill().map(() => ({selected: false})); // 初始化每个单元格为空对象
      });

      // 填充每个时间段的课程数据
      this.timeSlots.forEach((item) => {
        const dayIndex = this.daysOfWeek_En.indexOf(item.day_of_week);  // 获取星期几对应的索引
        if (dayIndex !== -1) {
          // 填充对应的课程
          console.log(item.class_name);
          this.schedule[item.period - 1].cells[dayIndex] = item;
        }
      });
    },

    async saveScheduleToBackend() {
      try {
        await axios.post(`${process.env.VUE_APP_API_BASE_URL}/api/manual-schedule`, {schedule: this.schedule});
      } catch (error) {
        console.error("保存课表失败:", error);
        alert("保存课表失败，请稍后再试");
      }
    },
    async loadCoursesFromBackend() {
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/api/courses`, {
          headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('userToken') || sessionStorage.getItem('userToken')
          }
        });
        this.courses = response.data.data.courses; // 更新课程列表
        this.tempCourses = [...this.courses];
      } catch (error) {
        console.error("加载课程失败:", error);
        alert("加载课程失败，请稍后再试");
      }
    },
    async autoSchedule() {
      // 自动排课
      try {
        const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
        await axios.post(`${process.env.VUE_APP_API_BASE_URL}/api/automated_scheduling`, null, {
          headers: {
            'Authorization': 'Bearer ' + token
          }
        });
        this.loadScheduleFromBackend(); // 自动排课后重新加载课表数据
      } catch (error) {
        console.error("自动排课失败:", error);
        alert("自动排课失败，请稍后再试");
      }
      // this.saveScheduleToBackend(); // 自动排课后保存到后端
    },
    checkSchedule() {
      const conflicts = [];
      this.schedule.forEach((row) => {
        row.cells.forEach((cell) => {
          if (cell.course && !this.isValidCourse(cell.course)) {
            conflicts.push(cell.course);
          }
        });
      });

      if (conflicts.length > 0) {
        alert(`以下课程不符合要求：${conflicts.join(", ")}`);
      } else {
        alert("无问题");
      }
    },
    resetSchedule() {
      for (let rowIndex = 0; rowIndex < 4; rowIndex++) {
        for (let colIndex = 0; colIndex < 7; colIndex++) {
          if (this.schedule[rowIndex].cells[colIndex].id !== undefined) {
            this.deleteCourse(rowIndex, colIndex)
          }
        }
      }
    },
    setViewMode() {
      console.log("切换视角为:", this.viewMode);
      // 实现视角切换逻辑
    },
    async exportSchedule() {
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/api/export`, {
          headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('userToken') || sessionStorage.getItem('userToken'),
            'Content-Type': 'application/json',
          },
          params: {
            'file': "课程表.xlsx",
          },
          responseType: 'blob' // 关键配置
        });
        // 创建 Blob 对象并触发下载
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', '课程表.xlsx'); // 设置下载文件名
        document.body.appendChild(link);
        link.click();

        // 清理临时对象
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        alert("课表已成功导出！");
      } catch (error) {
        console.error("导出失败:", error);
        alert("导出课表失败，请稍后再试");
      }
    },
    async deleteCourse(rowIndex, colIndex) {
      const removedCourse = this.schedule[rowIndex].cells[colIndex];
      console.log(rowIndex);
      console.log(colIndex);
      console.log("删除课程:", removedCourse);
      if (this.schedule[rowIndex].cells[colIndex].id === undefined) {
        alert("该单元格没有课程，无法删除");
        return;
      }
      if (removedCourse && removedCourse.class_name) {
        // 将课程对象及其位置信息添加到暂放区
        this.tempCourses.push(removedCourse);
      }
      // 清空课表单元格
      this.schedule[rowIndex].cells[colIndex] = {};
      console.log(this.schedule);

      // 删除课程后保存到后端
      // 创建空课程对象来表示删除
      const emptyCourse = {
        day_of_week: this.daysOfWeek_En[colIndex], // 根据列索引获取星期几
        teacher_name: '', // 空教师名称
        class_name: '', // 空课程名称
        period: rowIndex + 1, // 节次
        classroom_name: removedCourse.classroom_name, // 空教室名称
        is_available: false, // 是否可用（可以根据需求设置）
      };

      // 删除课程后，保存课表到后端
      try {
        const requestBody = {
          day_of_week: emptyCourse.day_of_week,
          teacher_name: emptyCourse.teacher_name,
          class_name: emptyCourse.class_name,
          period: emptyCourse.period,
          classroom_name: emptyCourse.classroom_name,
          is_available: emptyCourse.is_available,
          task_id: removedCourse.task_id
        };

        // 发送空课程信息到后端
        const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/api/manual-schedule`, requestBody, {
          headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('userToken') || sessionStorage.getItem('userToken'),
            'Content-Type': 'application/json',
          },
        });

        if (response.status === 200) {
          console.log('课程删除成功:', response.data);
          // alert("课程已删除并保存！");
        } else {
          console.error("课程删除失败:", response.status, response.data);
          alert("课程删除失败，请稍后再试");
        }
      } catch (error) {
        console.error("请求失败:", error);
        alert("保存课表失败，请稍后再试");
      }
    },
    restoreCourse(index) {
      const restoredCourse = this.tempCourses.splice(index, 1)[0]; // 移除暂放区的课程
      if (restoredCourse) {
        const [rowIndex, colIndex] = this.selectedCell;

        // 恢复课程到选中位置
        this.schedule[rowIndex].cells[colIndex] = restoredCourse;

        // 修改课程后保存到后端
        this.editCell(restoredCourse);
      }
    },
    async editCell(restoredCourse) {

      // 确保恢复的课程对象包含必需的字段
      if (!restoredCourse || !restoredCourse.class_name || !restoredCourse.teacher_name || !restoredCourse.class_id) {
        alert("课程信息不完整，无法保存");
        return;
      }

      // 获取选中的单元格位置
      const [rowIndex, colIndex] = this.selectedCell;
      const dayOfWeek = this.daysOfWeek_En[colIndex];  // 根据列索引获取星期几

      // 获取该单元格的时间段
      const period = rowIndex + 1;  // 这里假设 rowIndex 是从 0 开始的，且每个索引代表不同的时间段

      // 构建请求体
      const requestBody = {
        day_of_week: dayOfWeek,  // 星期几，根据选中的列来设置
        teacher_name: restoredCourse.teacher_name, // 教师名称
        class_name: restoredCourse.class_name, // 课程名称
        class_id: restoredCourse.class_id,
        period: period, // 节次，从行索引获取
        classroom_name: restoredCourse.classroom_name, // 教室名称
        is_available: restoredCourse.is_available, // 是否可用
        task_id: restoredCourse.task_id
      };

      try {
        console.log(this.timeSlots)
        // 发送POST请求到后端，保存课程信息
        const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/api/manual-schedule`, requestBody, {
          headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('userToken') || sessionStorage.getItem('userToken'),
            'Content-Type': 'application/json'
          }
        });

        // 检查响应结果
        if (response.status === 200) {
          console.log('课程保存成功:', response.data);
          alert("课程已成功保存！");
        } else {
          console.error("课程保存失败:", response.status, response.data);
          alert("课程保存失败，请稍后再试");
        }
      } catch (error) {
        console.error("请求失败:", error);
        alert("保存课程失败，请稍后再试");
      }
    },
    selectCell(rowIndex, colIndex) {
      const row = this.schedule[rowIndex];
      const cell = row.cells[colIndex];

      if (!cell || !cell.class_name) {
        // 如果当前单元格没有课程
        if (this.selectedCell && this.isSameCell(this.selectedCell, [rowIndex, colIndex])) {
          // 如果再次点击同一个单元格，取消选中
          this.clearSelectedCell();
        } else {
          // 记录新的选中单元格位置
          this.selectedCell = [rowIndex, colIndex];
          this.clearOtherSelections(); // 清除其他选中的单元格（可选）
          cell.selected = true; // 设置选中状态
        }
        console.log("选中单元格:", rowIndex, colIndex);
        console.log(row);
        console.log(cell);
      } else {
        alert("该单元格已有课程，无法选中");
      }
    },

// 辅助函数：清除所有其他单元格的选中状态
    clearOtherSelections() {
      this.schedule.forEach(row => {
        row.cells.forEach(cell => {
          if (cell.selected) {
            cell.selected = false;
          }
        });
      });
    },

// 辅助函数：判断两个单元格是否相同
    isSameCell(cell1, cell2) {
      return cell1[0] === cell2[0] && cell1[1] === cell2[1];
    },

// 辅助函数：清除当前选中的单元格
    clearSelectedCell() {
      if (this.selectedCell) {
        const [rowIndex, colIndex] = this.selectedCell;
        const cell = this.schedule[rowIndex].cells[colIndex];
        if (cell) {
          cell.selected = false;
        }
        this.selectedCell = null;
      }
    },
    addCourse(course) {
      if (!this.selectedCell) {
        alert("请先选择一个单元格");
        return;
      }

      const [rowIndex, colIndex] = this.selectedCell;
      const targetCell = this.schedule[rowIndex].cells[colIndex];

      if (targetCell.course) {
        alert("该单元格已有课程，无法添加");
        return;
      }

      // 添加课程到目标单元格
      targetCell.course = course.name;

      // 清空选中的单元格
      this.selectedCell = null;
      this.saveScheduleToBackend(); // 添加课程后保存到后端
    },
    filterCourses() {
      this.tempCourses = this.courses.filter((course) =>
          course.name.toLowerCase().includes(this.searchCourse.toLowerCase())
      );
    },
    isValidCourse(courseName) {
      // 示例：检查课程是否符合规则
      return !["冲突课程1", "冲突课程2"].includes(courseName);
    },
    // 新增搜索方法
    async performSearch() {
      if (!this.searchKeyword.trim()) {
        alert('请输入搜索关键词');
        return;
      }
      try {
        const params = {
          "type": this.searchType,
          "name": this.searchKeyword.trim(),
          "task_id": Number(this.taskId)
        };

        const response = await axios.post(
            `${process.env.VUE_APP_API_BASE_URL}/api/schedule`, params,
            {
              headers: {
                Authorization: 'Bearer ' +
                    (localStorage.getItem('userToken') || sessionStorage.getItem('userToken'))
              }
            }
        );

        this.timeSlots = response.data.data.schedule;
        this.fillSchedule();
      } catch (error) {
        console.error('搜索失败:', error);
        alert('搜索失败，请稍后重试');
      }
    },

    // 清除搜索
    clearSearch() {
      this.searchKeyword = '';
      this.timeSlots = [];
      this.clearHighlights();
    },

    // 结果文本格式化
    resultText(result) {
      if (this.searchType === 'teacher') {
        return `${result.teacher_name} - ${result.class_name} (${result.day_of_week} 第${result.period}节)`;
      }
      return `${result.classroom_name} - ${result.class_name} (${result.day_of_week} 第${result.period}节)`;
    },

    // 定位高亮
    highlightInSchedule(result) {
      this.clearHighlights();

      const dayIndex = this.daysOfWeek_En.indexOf(result.day_of_week);
      const rowIndex = result.period - 1;

      if (dayIndex !== -1 && rowIndex < this.schedule.length) {
        const cell = this.schedule[rowIndex].cells[dayIndex];
        cell.highlighted = true;
        this.$nextTick(() => {
          const element = document.querySelector(`.row:nth-child(${rowIndex + 2}) .cell:nth-child(${dayIndex + 2})`);
          element?.scrollIntoView({behavior: 'smooth', block: 'center'});
        });
      }
    },

    // 清除高亮
    clearHighlights() {
      this.schedule.forEach(row => {
        row.cells.forEach(cell => {
          cell.highlighted = false;
        });
      });
    },
  },
  watch: {
    searchCourse() {
      this.filterCourses();
    },
  },
  created() {
    this.loadScheduleFromBackend(); // 页面加载时加载课表数据
    // this.loadCoursesFromBackend(); // 页面加载时加载课程列表
  },
};
</script>
<style scoped>
.search-container {
  display: flex;
  align-items: center;
  gap: 10px; /* 控制元素之间的间距 */
  margin-bottom: 10px;
}

.search-container select,
.search-container input[type="text"],
.search-container button {
  height: 32px;
  padding: 0 8px;
  font-size: 14px;
}
.search-container button:first-of-type {
  width: 60px; /* 搜索按钮设短 */
}

.schedule-page {
  display: flex;
  flex-direction: column;
}

.course-table {
  font-family: Arial, sans-serif;
  border: 1px solid #ddd;
  border-spacing: 0;
  width: 100%;
}

.header,
.row {
  display: grid;
  grid-template-columns: 150px repeat(7, 1fr); /* 第一列固定宽度，其余列均分 */
  align-items: center;
}

.header > div,
.row > div {
  padding: 10px;
  text-align: center;
  border: 1px solid #ddd;
}

.header > div:first-child {
  background-color: #f0f0f0;
}

.cell {
  height: 60px;
  background-color: #fff;
  border: 1px solid #ddd;
  cursor: pointer; /* 鼠标悬停时显示为手型 */
}

.cell:hover {
  background-color: #f9f9f9;
}

/* 选中状态样式 */
.cell.selected {
  background-color: #d4edda; /* 绿色背景表示选中 */
  color: #155724;
  font-weight: bold;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.schedule-preview {
  flex: 1;
  overflow-y: auto;
}

.course-selector {
  margin-top: 20px;
}

.course-selector ul {
  list-style: none;
  padding: 0;
}

.course-selector li {
  display: flex;
  align-items: center;
  justify-content: space-between; /* 让名称和按钮分开 */
  margin-bottom: 8px;
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.course-selector span {
  font-weight: bold;
  flex-grow: 1; /* 让名称占据更多空间 */
}

.course-selector button {
  margin-left: 10px;
}

.temp-course-area ul {
  list-style: none;
  padding: 0;
}

.temp-course-area li {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.temp-course-area button {
  margin-right: 10px;
}

.task-statistics {
  margin-top: 10px;
}
</style>
