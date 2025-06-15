import {createI18n} from "vue-i18n";
import type {Language} from "@/type";

// 自动扫描所有 en-US.ts 并合并
const enUSModules = import.meta.glob("/src/**/locale/en-US.ts", {
    eager: true,
    import: "default",
});

// 自动扫描所有 zh-CN.ts 并合并
const zhCNModules = import.meta.glob("/src/**/locale/zh-CN.ts", {
    eager: true,
    import: "default",
});

const enUS: Language = (
    Object.values(enUSModules) as Language[]
).reduce<Language>(
    (acc: Language, module: Language) => ({
        ...acc,
        ...module,
    }),
    {} as Language,
);

const zhCN: Language = (
    Object.values(zhCNModules) as Language[]
).reduce<Language>(
    (acc: Language, module: Language) => ({
        ...acc,
        ...module,
    }),
    {} as Language,
);

const i18n = createI18n({
    legacy: false, // 设置为 false，启用 composition API 模式
    locale: localStorage.getItem('language') || "zh-CN",
    messages: {
        "zh-CN": zhCN,
        en: enUS,
    },
});
export default i18n;
