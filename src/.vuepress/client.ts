// .vuepress/client.ts
import { defineClientConfig } from "@vuepress/client";
// @ts-ignore
import { defineMermaidConfig, injectMermaidConfig, useMermaidOptions } from "vuepress-plugin-md-enhance/client";
import {defineAsyncComponent, onBeforeMount} from "vue";
import mermaidThemes from './styles/mermaid';
import VueCookies from "vue-cookies";
// import 'bootstrap/dist/css/bootstrap.min.css';
// import 'bootstrap/dist/js/bootstrap.js';

// import _default from "mermaid/dist/themes";
// import base = _default.base;
defineMermaidConfig({
    // 在此设置 mermaid 选项
    // theme: 'default', // npm 安装的包中主题全是空值
    themeVariables: mermaidThemes.dark.getThemeVariables(),
    themeCSS: `
    .node rect, .cluster rect {
        fill: #fff1;
    }
    .edge-thickness-normal {
        stroke-width: 1px;
    }
    .edgeLabel {
        background-color: #00000011;
    }
    .cluster span {
        color: var(--black);
    }
    `,
    flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: "basis",
    },
});

export default defineClientConfig({
    enhance({app, router, siteData}) {
        // app.component("Qcommon", defineAsyncComponent(() => import("./components/Qcommon.vue")));
        // app.component("Qpron", defineAsyncComponent(() => import("./components/Qpron.vue")));
        VueCookies.install(app);
    },
    layouts: {},
    setup() {
        // onBeforeMount(() => {
        //     import("mermaid/dist/mermaid").then(m => {
        //         m.initialize({
        //             startOnLoad: true
        //         });
        //         m.init();
        //     });
        // })
    },
    rootComponents: [],
});
