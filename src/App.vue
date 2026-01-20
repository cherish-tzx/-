<template>
  <div id="app">
    <header class="app-header">
      <h1>📄 文件对比工具</h1>
      <p class="subtitle">支持 Excel 和 Word 文件的内容对比</p>
    </header>

    <main class="app-main">
      <!-- 错误提示 -->
      <div v-if="errorMessage" class="error-banner">
        <div class="error-content">
          <span class="error-icon">⚠️</span>
          <div class="error-text">
            <strong>错误</strong>
            <p style="white-space: pre-line">{{ errorMessage }}</p>
          </div>
          <button class="error-close" @click="errorMessage = ''">✕</button>
        </div>
      </div>

      <div class="upload-section">
        <FileUploader
          label="上传第一个文件"
          accept=".xls,.xlsx,.docx"
          @file-selected="handleFile1Selected"
          @file-error="handleFileError"
        />

        <FileUploader
          label="上传第二个文件"
          accept=".xls,.xlsx,.docx"
          @file-selected="handleFile2Selected"
          @file-error="handleFileError"
        />
      </div>

      <div v-if="showResults" class="results-section">
        <SimilarityDisplay :similarity="similarity" />

        <DiffViewer
          :left-content="leftContent"
          :right-content="rightContent"
          :loading="loading"
        />
      </div>
    </main>

    <footer class="app-footer">
      <p>Vue 3 + TypeScript 版本</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import FileUploader from "./components/FileUploader.vue";
import DiffViewer from "./components/DiffViewer.vue";
import SimilarityDisplay from "./components/SimilarityDisplay.vue";
import { fileParser } from "./services/fileParser";
import { diffEngine } from "./services/diffEngine";
import { similarityCalculator } from "./services/similarityCalculator";
import { ErrorHandler } from "./utils/errorHandler";
import { DiffLine } from "./types";

const file1 = ref<File | null>(null);
const file2 = ref<File | null>(null);
const loading = ref(false);
const leftContent = ref<DiffLine[]>([]);
const rightContent = ref<DiffLine[]>([]);
const similarity = ref(0);
const showResults = ref(false);
const errorMessage = ref("");

const handleFile1Selected = (file: File) => {
  file1.value = file;
  errorMessage.value = "";
  compareFiles();
};

const handleFile2Selected = (file: File) => {
  file2.value = file;
  errorMessage.value = "";
  compareFiles();
};

const handleFileError = (error: string) => {
  errorMessage.value = error;
};

const compareFiles = async () => {
  if (!file1.value || !file2.value) {
    return;
  }

  loading.value = true;
  showResults.value = true;
  errorMessage.value = "";

  try {
    // 解析两个文件
    const content1 = await fileParser.parse(file1.value);
    const content2 = await fileParser.parse(file2.value);

    // 计算差异
    const diffResult = diffEngine.computeDiff(content1.text, content2.text);

    // 计算相似度
    const calculatedSimilarity = similarityCalculator.calculate(diffResult);

    // 更新结果
    leftContent.value = diffResult.leftLines;
    rightContent.value = diffResult.rightLines;
    similarity.value = calculatedSimilarity;
  } catch (error) {
    const errorMsg = ErrorHandler.handle(error as Error, "App");
    errorMessage.value = errorMsg;
    showResults.value = false;
  } finally {
    loading.value = false;
  }
};
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen",
    "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue",
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f5f5f5;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px 20px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.app-header h1 {
  font-size: 32px;
  margin-bottom: 10px;
}

.subtitle {
  font-size: 16px;
  opacity: 0.9;
}

.app-main {
  flex: 1;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  padding: 30px 20px;
}

.error-banner {
  margin-bottom: 20px;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.error-content {
  background-color: #fff2f0;
  border: 1px solid #ffccc7;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.error-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.error-text {
  flex: 1;
}

.error-text strong {
  display: block;
  color: #ff4d4f;
  margin-bottom: 4px;
}

.error-text p {
  color: #666;
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
}

.error-close {
  background: none;
  border: none;
  color: #999;
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  transition: color 0.3s;
}

.error-close:hover {
  color: #ff4d4f;
}

.upload-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 30px;
}

@media (max-width: 768px) {
  .upload-section {
    grid-template-columns: 1fr;
  }
}

.results-section {
  margin-top: 30px;
}

.app-footer {
  background-color: #fafafa;
  border-top: 1px solid #d9d9d9;
  padding: 20px;
  text-align: center;
  color: #999;
  font-size: 14px;
}
</style>
