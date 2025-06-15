import {defineStore} from "pinia";
import {type AppConfig, LanguageCode} from "@/type";

const useAppConfigStore = defineStore("app-config", {
    state: (): AppConfig => {
        console.log("useAppConfigStore222", localStorage.getItem('language'))

        return <AppConfig>{
            // 系统语言
            language: localStorage.getItem('language') || "zh-CN",
            // 用于尚未加载的数据
            theme: localStorage.getItem('theme') || "light",
        };
    },
    getters: {
        getLanguage(state): keyof typeof LanguageCode {
            return state.language;
        },
        getTheme(state): "light" | "dark" {
            return state.theme;
        },
    },
    actions: {
        changeLanguage(language: keyof typeof LanguageCode) {
            this.language = language;
            localStorage.setItem('language', language);
            if (window.microApp) {
                window.microApp.dispatch({
                    language: language,
                    version: "0.0.1",
                    user: "designer",
                })
            }
        },
        changeTheme(theme: "light" | "dark") {
            this.theme = theme;
            localStorage.setItem('theme', theme);
            if (window.microApp) {
                window.microApp.dispatch({
                    theme: theme,
                    version: "0.0.1",
                    user: "designer",
                })
            }
        },
    },
});

export default useAppConfigStore;
