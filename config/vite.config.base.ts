import {defineConfig} from "vite";
import vue from "@vitejs/plugin-vue";
import Components from "unplugin-vue-components/vite";
import {NaiveUiResolver} from "unplugin-vue-components/resolvers";
import {resolve} from "path";
import svgLoader from "vite-svg-loader";

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        Components({
            resolvers: [NaiveUiResolver()],
        }),
        svgLoader({svgoConfig: {}}),
    ],
    resolve: {
        alias: [
            {
                find: "@",
                replacement: resolve(__dirname, "../src"),
            },
        ],
        extensions: [".ts", ".js", ".css"],
    },
    // server: {
    //   // host: "0.0.0.0",
    //   // origin: 'http://127.0.0.1:16018'
    // },
});
