import {defineConfig, loadEnv} from "vite";
import vue from "@vitejs/plugin-vue";
import Components from "unplugin-vue-components/vite";
import {NaiveUiResolver} from "unplugin-vue-components/resolvers";
import {resolve} from "path";
import svgLoader from "vite-svg-loader";
import visualizer from 'rollup-plugin-visualizer';
//Gzip文件压缩
import viteCompression from 'vite-plugin-compression'

// https://vite.dev/config/
export default defineConfig(({mode}) => {
    // 强制加载根目录下的 .env.[] 配置文件
    const env = loadEnv(mode, process.cwd(), '');
    return {
        plugins: [
            vue(),
            Components({
                resolvers: [NaiveUiResolver()],
            }),
            svgLoader({svgoConfig: {}}),
            visualizer({
                filename: './node_modules/.cache/visualizer/stats.html',
                open: true,
                gzipSize: true,
                brotliSize: true,
            }),
            viteCompression({
                verbose: true, // 是否在控制台中输出压缩结果
                disable: false,
                threshold: 10240, // 如果体积大于阈值，将被压缩，单位为b，体积过小时请不要压缩，以免适得其反
                algorithm: 'gzip', // 压缩算法，可选['gzip'，' brotliccompress '，'deflate '，'deflateRaw']
                ext: '.gz',
                deleteOriginFile: true // 源文件压缩后是否删除(我为了看压缩后的效果，先选择了true)
            }),
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
        base: env.VITE_BASE,
    }
});
