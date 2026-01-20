<template>
  <div class="file-uploader">
    <div
      class="upload-area"
      :class="{ 'drag-over': isDragOver, 'has-file': file }"
      @drop.prevent="handleDrop"
      @dragover.prevent="isDragOver = true"
      @dragleave.prevent="isDragOver = false"
      @click="triggerFileInput"
    >
      <input
        ref="fileInput"
        type="file"
        :accept="accept"
        @change="handleFileSelect"
        style="display: none"
      />

      <div v-if="!file" class="upload-prompt">
        <div class="upload-icon">📁</div>
        <p>{{ label }}</p>
        <p class="upload-hint">点击或拖放文件到此处</p>
      </div>

      <div v-else class="file-info">
        <div class="file-icon">📄</div>
        <div class="file-details">
          <p class="file-name">{{ file.name }}</p>
          <p class="file-size">{{ formatFileSize(file.size) }}</p>
        </div>
        <button class="remove-btn" @click.stop="removeFile">✕</button>
      </div>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { validateFile } from "../utils/fileValidator";
import { ErrorHandler } from "../utils/errorHandler";

interface Props {
  label: string;
  accept: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  fileSelected: [file: File];
  fileError: [error: string];
}>();

const fileInput = ref<HTMLInputElement>();
const file = ref<File | null>(null);
const error = ref<string>("");
const isDragOver = ref(false);

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const selectedFile = target.files?.[0];

  if (selectedFile) {
    processFile(selectedFile);
  }
};

const handleDrop = (event: DragEvent) => {
  isDragOver.value = false;
  const droppedFile = event.dataTransfer?.files[0];

  if (droppedFile) {
    processFile(droppedFile);
  }
};

const processFile = (selectedFile: File) => {
  error.value = "";

  try {
    validateFile(selectedFile);
    file.value = selectedFile;
    emit("fileSelected", selectedFile);
  } catch (err) {
    const errorMessage = ErrorHandler.handle(err as Error, "FileUploader");
    error.value = errorMessage;
    emit("fileError", errorMessage);
  }
};

const removeFile = () => {
  file.value = null;
  error.value = "";
  if (fileInput.value) {
    fileInput.value.value = "";
  }
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
};
</script>

<style scoped>
.file-uploader {
  width: 100%;
}

.upload-area {
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  padding: 30px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background-color: #fafafa;
}

.upload-area:hover {
  border-color: #40a9ff;
  background-color: #f0f8ff;
}

.upload-area.drag-over {
  border-color: #40a9ff;
  background-color: #e6f7ff;
}

.upload-area.has-file {
  border-color: #52c41a;
  background-color: #f6ffed;
}

.upload-prompt {
  color: #666;
}

.upload-icon {
  font-size: 48px;
  margin-bottom: 10px;
}

.upload-hint {
  font-size: 14px;
  color: #999;
  margin-top: 5px;
}

.file-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
}

.file-icon {
  font-size: 36px;
}

.file-details {
  text-align: left;
}

.file-name {
  font-weight: 500;
  margin: 0;
  color: #333;
}

.file-size {
  font-size: 14px;
  color: #999;
  margin: 5px 0 0 0;
}

.remove-btn {
  background: #ff4d4f;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  transition: background 0.3s;
}

.remove-btn:hover {
  background: #ff7875;
}

.error-message {
  margin-top: 10px;
  padding: 10px;
  background-color: #fff2f0;
  border: 1px solid #ffccc7;
  border-radius: 4px;
  color: #ff4d4f;
  font-size: 14px;
}
</style>
