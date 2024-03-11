import {defineUserConfig} from "vuepress";
// @ts-ignore
import {getDirname, path} from "vuepress/utils";
import theme from "./theme.js";
import {extendsBundlerOptions, hopeTheme} from "vuepress-theme-hope";
import {registerComponentsPlugin} from "@vuepress/plugin-register-components";
import {viteBundler} from '@vuepress/bundler-vite';
import * as dotenv from 'dotenv';
import cjk_breaks from 'markdown-it-cjk-breaks';
import {webpackBundler} from "@vuepress/bundler-webpack";

// @ts-ignore
const __dirname = getDirname(import.meta.url); // .vuepress

dotenv.config();

export default defineUserConfig({
  // @ts-ignore
  base: process.env.VUE_APP_BASEURL || "/",
  lang: "zh-CN",
  title: "潮汕方言白话字辞典 (DEMO)",
  alias: {
    '@src': path.resolve(__dirname, ".."),
    '@components': path.resolve(__dirname, "components"),
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
    // ["link", {rel: "preconnect", href: "https://fonts.googleapis.com/",},],
    // ["link", {rel: "preconnect", href: "https://fonts.gstatic.com/",},],
    // fonts:
    //   noto sans sc
    //   source sans 3
    // ["link", {rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400..700&family=Source+Sans+3:ital,wght@0,200..900;1,200..900&display=swap",},],
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
    repo: "pujdict/pujdict",
    docsBranch: "main",
    editLink: false,
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
        "relationships.md",
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
            text: "人称",
            link: "relationships.md",
          },
          {
            text: "人体",
            link: "human_body.md",
          },
        ]
      }
    ],
    plugins: {
      git: {
        createdTime: true,
        updatedTime: true,
        contributors: false,
      },
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
  extendsMarkdown: (md) => {
    md.use(cjk_breaks);
  },
  plugins: [
    registerComponentsPlugin({
      // componentsDir: path.resolve(__dirname, "./components"),
      components: {
        QDarkTheme: path.resolve(__dirname, "./components/QDarkTheme.vue"),
        // Mermaid: path.resolve(__dirname, "./components/Mermaid.vue"),
      },
    }),
  ],

  // Enable it with pwa
  // shouldPrefetch: false,
  bundler: webpackBundler({
    postcss: {},
    vue: {},
    chainWebpack: (config) => {
    },
    configureWebpack: (config) => {
      // const require = createRequire(import.meta.url);
      config.resolve = config.resolve || {};
      config.resolve.fallback = {
        "browser": false,
        "crypto": false,
        "fs": false,
        "os": false,
        "path": false,
      };
    },
  }),
  // bundler: viteBundler({
  //   viteOptions: {},
  //   vuePluginOptions: {},
  // }),
  templateDev: path.join(__dirname, "./templates/dev.html"),
  templateBuild: path.join(__dirname, "./templates/build.html"),
});
