import {defineUserConfig} from "vuepress";
import {getDirname, path} from "@vuepress/utils";
import theme from "./theme.js";
import {extendsBundlerOptions, hopeTheme} from "vuepress-theme-hope";
import {registerComponentsPlugin} from "@vuepress/plugin-register-components";
import * as dotenv from 'dotenv'

// @ts-ignore
const __dirname = getDirname(import.meta.url);

dotenv.config();

export default defineUserConfig({
  // @ts-ignore
  base: process.env.VUE_APP_BASEURL || "/",
  lang: "zh-CN",
  title: "潮汕方言白话字辞典【DEMO】",
  alias: {
    '@src': path.resolve(__dirname, ".."),
    '@public': path.resolve(__dirname, "public"),
    '@modules': path.resolve(__dirname, "../node_modules"),
  },
  // bundler: webpackBundler({
  //   // postcss: {},
  //   // vue: {},
  //   chainWebpack: (config) => {
  //     // config.resolve.alias.set('sqlWasm', path.resolve(__dirname, "../node_modules/sql.js/dist/sql-wasm.wasm"));
  //     // config.resolve.alias.set('sqlWasm', "sql.js/dist/sql-wasm.js");
  //   },
  // }),
  head: [
    // // jquery
    // ["script", {src: "https://cdn.bootcdn.net/ajax/libs/jquery/3.5.1/jquery.min.js",},],
    // // jquery cookie
    // ["script", {src: "https://cdnjs.cloudflare.com/ajax/libs/jquery-cookie/1.4.1/jquery.cookie.min.js",},],
    // // sqljs
    // ["script", {src: "https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.5.0/sql-wasm.js",},],
  ],

  // locales: {
  //   "/": {
  //     lang: "en-US",
  //     title: "Docs Demo",
  //     description: "A docs demo for vuepress-theme-hope",
  //   },
  //   "/zh/": {
  //     lang: "zh-CN",
  //     title: "文档演示",
  //     description: "vuepress-theme-hope 的文档演示",
  //   },
  // },

  theme: hopeTheme({
    darkmode: "switch",
    favicon: "book-bookmark-solid.svg",
    iconAssets: "fontawesome-with-brands",
    repo: "pujdict/pujdict.github.io",
    docsBranch: "main",
    editLink: true,
    docsDir: "src",
    contributors: false,
    nextLink: false,
    prevLink: false,
    // navbar: ["/doc/"],
    // sidebar: [],
    sidebar: {
      // '/query/': [
      //   {
      //     text: "汉字查询",
      //     link: "/query/qchar.md",
      //   },
      //   {
      //     text: "音韵查询",
      //     link: "/query/qpron.md",
      //   }
      // ],
      '/doc/': [
        "puj.md",
        "guide.md",
        "bib.md",
      ],
      '/appendix/': [
        "human_body.md",
      ]
    },
    navbar: [
      {
        text: "检索",
        prefix: "/query/",
        icon: "search",
        children: [
          {
            text: "汉字检索",
            link: "qchar.md",
          },
          {
            text: "音韵检索",
            link: "qpron.md",
          },
        ]
      },
      {
        text: "文档",
        prefix: "/doc/",
        icon: "file-lines",
        children: [
          {
            text: "白话字拼音方案",
            link: "puj.md",
          },
          {
            text: "凡例",
            link: "guide.md",
          },
          {
            text: "参考文献",
            link: "bib.md",
          },
        ]
      },
      {
        text: "附录",
        prefix: "/appendix/",
        icon: "receipt",
        children: [
          {
            text: "人体",
            link: "human_body.md",
          }
        ]
      }
    ],
    plugins: {
      readingTime: false,
      mdEnhance: {
        include: {
          resolvePath: (file) => {
            if (file.startsWith("@src"))
              return file.replace("@src", path.resolve(__dirname, ".."));
            if (file.startsWith("@public"))
              return file.replace("@public", path.resolve(__dirname, "public"));
            return file;
          },
        },
        mermaid: true,
        sub: true,
        sup: true,
        tabs: true,
        tasklist: true,
      },
      comment: {},
    }
  }),
  plugins: [
    registerComponentsPlugin({
      // componentsDir: path.resolve(__dirname, "./components"),
      components: {
        Qpron: path.resolve(__dirname, "./components/Qpron.vue"),
        Qchar: path.resolve(__dirname, "./components/Qchar.vue"),
        Qcommon: path.resolve(__dirname, "./components/Qcommon.vue"),
        Qappendix: path.resolve(__dirname, "./components/Qappendix.vue"),
        // Mermaid: path.resolve(__dirname, "./components/Mermaid.vue"),
      },
    }),
  ],

  // Enable it with pwa
  shouldPrefetch: false,
});
