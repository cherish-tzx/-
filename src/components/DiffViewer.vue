<template>
  <div class="diff-viewer">
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>正在对比文件...</p>
    </div>

    <div
      v-else-if="leftContent.length > 0 || rightContent.length > 0"
      class="diff-container"
    >
      <div class="diff-panel left-panel">
        <div class="panel-header">文件 1</div>
        <div class="diff-content">
          <div
            v-for="line in leftContent"
            :key="line.lineNumber"
            class="diff-line"
            :class="'line-' + line.type"
          >
            <span class="line-number">{{ line.lineNumber }}</span>
            <span class="line-content">
              <template v-if="line.changes">
                <span
                  v-for="(change, index) in line.changes"
                  :key="index"
                  :class="'change-' + change.type"
                  >{{ change.value }}</span
                >
              </template>
              <template v-else>{{ line.content }}</template>
            </span>
          </div>
        </div>
      </div>

      <div class="diff-panel right-panel">
        <div class="panel-header">文件 2</div>
        <div class="diff-content">
          <div
            v-for="line in rightContent"
            :key="line.lineNumber"
            class="diff-line"
            :class="'line-' + line.type"
          >
            <span class="line-number">{{ line.lineNumber }}</span>
            <span class="line-content">
              <template v-if="line.changes">
                <span
                  v-for="(change, index) in line.changes"
                  :key="index"
                  :class="'change-' + change.type"
                  >{{ change.value }}</span
                >
              </template>
              <template v-else>{{ line.content }}</template>
            </span>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <p>请上传两个文件进行对比</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DiffLine } from "../types";

interface Props {
  leftContent: DiffLine[];
  rightContent: DiffLine[];
  loading: boolean;
}

defineProps<Props>();
</script>

<style scoped>
.diff-viewer {
  width: 100%;
  height: 600px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  overflow: hidden;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #666;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f0f0f0;
  border-top-color: #1890ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.diff-container {
  display: flex;
  height: 100%;
}

.diff-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.left-panel {
  border-right: 1px solid #d9d9d9;
}

.panel-header {
  padding: 12px 16px;
  background-color: #fafafa;
  border-bottom: 1px solid #d9d9d9;
  font-weight: 500;
  color: #333;
}

.diff-content {
  flex: 1;
  overflow-y: auto;
  font-family: "Consolas", "Monaco", "Courier New", monospace;
  font-size: 13px;
  line-height: 1.6;
}

.diff-line {
  display: flex;
  min-height: 21px;
  padding: 2px 0;
}

.line-number {
  flex-shrink: 0;
  width: 50px;
  padding: 0 8px;
  text-align: right;
  color: #999;
  background-color: #fafafa;
  border-right: 1px solid #e8e8e8;
  user-select: none;
}

.line-content {
  flex: 1;
  padding: 0 12px;
  white-space: pre-wrap;
  word-break: break-all;
}

/* 差异类型样式 */
.line-added {
  background-color: #d4edda;
}

.line-added .line-number {
  background-color: #c3e6cb;
}

.line-removed {
  background-color: #f8d7da;
}

.line-removed .line-number {
  background-color: #f5c6cb;
}

.line-modified {
  background-color: #fff3cd;
}

.line-modified .line-number {
  background-color: #ffeaa7;
}

.line-unchanged {
  background-color: white;
}

/* 行内变化样式 */
.change-added {
  background-color: #a8d5a8;
  font-weight: 500;
}

.change-removed {
  background-color: #f5a5a5;
  text-decoration: line-through;
  font-weight: 500;
}

.change-unchanged {
  /* 保持默认样式 */
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
  font-size: 16px;
}
</style>
