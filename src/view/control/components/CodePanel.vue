<template>
  <n-drawer
      class="x-flow-code-view"
      id="x-flow-code-view"
      placement="right"
      :resizable="true"
      :auto-focus="false"
      show-mask="transparent"
      :min-width="700"
      :max-width="1600"
      default-width="700"
      v-model:show="codeShow"
      to="#x-designer-home"
  >
    <n-drawer-content
        header-class="panel-header"
        body-class="panel-body"
        footer-class="panel-footer"
    >
      <template #header>
        <div class="code-panel-header">
          <div class="code-panel-header-title">Json Data</div>
          <div class="title-icon" @click="onDownload">
            <IconDownload></IconDownload>
          </div>
        </div>
      </template>
      <template #default>
        <!-- monaco editor 容器 -->
        <div
            ref="monacoEditorContainer"
            style="width: 100%; height: 100%"
        ></div>
      </template>
      <template #footer>
        <div class="code-panel-footer"></div>
      </template>
    </n-drawer-content>
  </n-drawer>
</template>

<script setup lang="ts">
import {onMounted, onUpdated, ref, useTemplateRef} from "vue";
import * as monaco from "monaco-editor";
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import JsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import CssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import HtmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import TsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
import getUUID from "@/util/UUIDUtil.ts";
import IconDownload from "@/assets/image/svg/button/icon-download.svg";
import {useMessage} from "naive-ui";

window.self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'json') {
      return new JsonWorker();
    }
    if (label === 'css' || label === 'scss' || label === 'less') {
      return new CssWorker();
    }
    if (label === 'html' || label === 'handlebars' || label === 'razor') {
      return new HtmlWorker();
    }
    if (label === 'typescript' || label === 'javascript') {
      return new TsWorker();
    }
    return new EditorWorker();
  },
};

const codeShow = defineModel("code-show", {type: Boolean, default: false});

const codeText = defineModel("code-text", {type: String, default: "{}"});

const message = useMessage();

const monacoEditorContainer = useTemplateRef<HTMLElement>(
    "monacoEditorContainer",
);

const monacoEditor = ref<monaco.editor.IStandaloneCodeEditor>();

// 下载按钮
const onDownload = () => {
  // 下载为图片
  // DesignerHome.getInstance().lf.getSnapshot();
  // 要保存的字符串, 需要先将数据转成字符串
  const stringData = codeText.value;
  // dada 表示要转换的字符串数据，type 表示要转换的数据格式
  const blob = new Blob([stringData], {
    type: "application/json",
  });
  // 根据 blob生成 url链接
  const objectURL = URL.createObjectURL(blob);
  // 创建一个 a 标签Tag
  const aTag = document.createElement("a");
  // 设置文件的下载地址
  aTag.href = objectURL;
  // 设置保存后的文件名称
  aTag.download = `x-graph-data${getUUID()}_${Date.now()}.json`;
  // 给 a 标签添加点击事件
  aTag.click();
  // 释放一个之前已经存在的、通过调用 URL.createObjectURL() 创建的 URL 对象。
  // 当你结束使用某个 URL 对象之后，应该通过调用这个方法来让浏览器知道不用在内存中继续保留对这个文件的引用了。
  URL.revokeObjectURL(objectURL);
  message.success("下载成功");
};

onMounted(() => {
});
onUpdated(() => {
  monacoEditor.value = monaco.editor.create(monacoEditorContainer.value!, {
    value: codeText.value || "",
    language: "json",
    automaticLayout: true, // 自适应布局
    theme: "vs", // 官方自带三种主题vs, hc-black, or vs-dark
    foldingStrategy: "indentation", // 代码可分小段折叠
    renderLineHighlight: "all", // 行亮
    selectOnLineNumbers: true, // 显示行号
    minimap: {
      enabled: true,
    },
    readOnly: true, // 只读
    fontSize: 16, // 字体大小
    scrollBeyondLastLine: false, // 取消代码后面一大段空白
    overviewRulerBorder: false, // 不要滚动条的边框
    wordWrap: "on", // 自动换行
    tabSize: 2, // tab 缩进长度
  });
});
</script>

<!-- <style lang="scss"></style> -->
<style lang="scss">
#x-flow-code-view {
  top: 25px;
  right: 30px;
  bottom: 25px;
  width: 600px;
  border-radius: 16px;

  .panel-header {
    padding: 0;
    width: 100%;
    height: 80px;

    .code-panel-header {
      width: 100%;
      height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;

      .code-panel-header-title {
        display: inline-block;
        color: #252b3a;
        margin-right: 16px;
        line-height: 20px;
        font-weight: bold;
      }

      .title-icon {
        &:hover {
          cursor: pointer;
        }
      }
    }
  }

  .panel-body {
    padding: 0;
    height: calc(100% - 210px);
    overflow-y: auto;

    .flow-code-content {
      width: 600px;
      display: flex;
    }
  }

  .panel-footer {
    padding: 0;
    width: 100%;
    height: 80px;

    .code-panel-footer {
      width: 100%;
      height: 100%;
    }
  }
}
</style>
