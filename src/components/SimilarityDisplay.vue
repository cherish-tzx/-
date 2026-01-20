<template>
  <div class="similarity-display">
    <div class="similarity-header">
      <h3>文件相似度</h3>
    </div>

    <div class="similarity-content">
      <div class="similarity-circle" :style="{ borderColor: getColor() }">
        <span class="similarity-value">{{ similarity.toFixed(1) }}%</span>
      </div>

      <div class="similarity-bar">
        <div class="bar-background">
          <div
            class="bar-fill"
            :style="{ width: similarity + '%', backgroundColor: getColor() }"
          ></div>
        </div>
        <div class="bar-labels">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      <div class="similarity-description">
        <p>{{ getDescription() }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  similarity: number;
}

const props = defineProps<Props>();

const getColor = (): string => {
  if (props.similarity >= 80) return "#52c41a"; // 绿色
  if (props.similarity >= 50) return "#faad14"; // 橙色
  return "#ff4d4f"; // 红色
};

const getDescription = (): string => {
  if (props.similarity >= 90) return "文件内容几乎相同";
  if (props.similarity >= 70) return "文件内容相似度较高";
  if (props.similarity >= 50) return "文件内容有一定差异";
  if (props.similarity >= 30) return "文件内容差异较大";
  return "文件内容完全不同";
};
</script>

<style scoped>
.similarity-display {
  background-color: white;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.similarity-header h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
  color: #333;
}

.similarity-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.similarity-circle {
  width: 120px;
  height: 120px;
  border: 8px solid;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fafafa;
}

.similarity-value {
  font-size: 32px;
  font-weight: bold;
  color: #333;
}

.similarity-bar {
  width: 100%;
}

.bar-background {
  width: 100%;
  height: 20px;
  background-color: #f0f0f0;
  border-radius: 10px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  transition: width 0.5s ease, background-color 0.3s ease;
  border-radius: 10px;
}

.bar-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 5px;
  font-size: 12px;
  color: #999;
}

.similarity-description {
  text-align: center;
  color: #666;
  font-size: 14px;
}

.similarity-description p {
  margin: 0;
}
</style>
