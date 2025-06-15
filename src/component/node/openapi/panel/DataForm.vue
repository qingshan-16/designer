<template>
  <n-card class="http-form" title="接口信息">
    <n-form :model="formData" ref="formRef">
      <!-- URL -->
      <n-form-item label="URL" path="url">
        <n-input
            v-if="mode !== 'view'"
            v-model:value="formData.url"
            placeholder="请输入接口 URL"
        />
        <span v-else>{{ formData.url }}</span>
      </n-form-item>

      <!-- HTTP 方法类型 -->
      <n-form-item label="HTTP 方法" path="method">
        <n-select
            v-if="mode !== 'view'"
            v-model:value="formData.method"
            :options="httpMethods"
        />
        <span v-else>{{ formData.method }}</span>
      </n-form-item>

      <!-- 参数定义 (Params 和 URL Params) -->
      <n-form-item label="参数定义" path="params">
        <div v-if="mode !== 'view'">
          <div v-for="(param, index) in formData.params" :key="index" class="param-row">
            <n-input
                v-model:value="param.key"
                placeholder="参数名"
                style="margin-right: 10px;"
            />
            <n-input
                v-model:value="param.value"
                placeholder="参数值"
                style="margin-right: 10px;"
            />
            <n-button @click="removeParam(index)" type="error">删除</n-button>
          </div>
          <n-button @click="addParam" type="primary">添加参数</n-button>
        </div>
        <div v-else>
          <div v-for="(param, index) in formData.params" :key="index">
            {{ param.key }}: {{ param.value }}
          </div>
        </div>
      </n-form-item>

      <!-- 消息体 JSON 定义 -->
      <n-form-item label="消息体 JSON 定义" path="body">
        <n-input
            v-if="mode !== 'view'"
            v-model:value="formData.body"
            type="textarea"
            placeholder='示例: {"name": "String", "age": "Long"}'
        />
        <pre v-else>{{ formData.body }}</pre>
      </n-form-item>

      <!-- 提交按钮 -->
      <div v-if="mode !== 'view'" class="form-actions">
        <n-button @click="handleSubmit" type="primary">提交</n-button>
      </div>
    </n-form>
  </n-card>
</template>

<script setup lang="ts">
import {ref, watch} from 'vue';

// 定义 Props
const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      url: '',
      method: 'GET',
      params: [],
      body: '',
    }),
  },
  mode: {
    type: String,
    default: 'edit', // 'edit' 或 'view'
  },
});

// 定义 Emit
const emit = defineEmits(['update:modelValue', 'submit']);

// 表单数据
const formData = ref({...props.modelValue});

// 监听父组件传入的数据变化
watch(
    () => props.modelValue,
    (newVal) => {
      formData.value = {...newVal};
    }
);

// HTTP 方法选项
const httpMethods = [
  {label: 'GET', value: 'GET'},
  {label: 'POST', value: 'POST'},
  {label: 'PUT', value: 'PUT'},
  {label: 'DELETE', value: 'DELETE'},
];

// 添加参数
function addParam() {
  formData.value.params.push({key: '', value: ''});
}

// 删除参数
function removeParam(index) {
  formData.value.params.splice(index, 1);
}

// 提交表单
function handleSubmit() {
  emit('submit', formData.value);
}
</script>

<style scoped>
.http-form {
  max-width: 600px;
  margin: 0 auto;
}

.param-row {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.form-actions {
  text-align: right;
}
</style>