---
title: 鸣谢
order: 10001
date: 2024-10-26
#hide: [toc, navigation]
---

# 鸣谢

## 网站

源码托管于 [GitHub](https://github.com/pujdict/pujdict)，以 [AGPL-v3](https://www.gnu.org/licenses/agpl-3.0.en.html) 协议开源。静态网站基于 [VuePress 2](https://v2.vuepress.vuejs.org/) 框架生成，主题为 [vuepress-theme-hope](https://theme-hope.vuejs.press/)，部分页面使用了 [Bootstrap 5](https://getbootstrap.com/)。静态网站部署托管于 [SourceForge](https://sourceforge.net/)。

目前，网站为纯静态网站，所有查询操作均于前端完成。

## 字体

- [思源黑体（Source Hans Sans）](https://github.com/adobe-fonts/source-han-sans)/[Noto Sans (CJK) SC](https://github.com/notofonts/noto-cjk)：默认中文字体。
- [遍黑体（Plangothic）](https://github.com/Fitzgerald-Porthmouth-Koenigsegg/Plangothic-Project)：与思源黑体外观兼容的字体，用于扩展 B 区及之后区块的生僻汉字。为了加载速度，生僻汉字只根据字表中的生僻字，取出了 Plangothic 文件中的一部分生成为 CJKExtSubset1.generated.woff2 和 CJKExtSubset2.generated.woff2 两个字体文件。遵循其 SIL 协议。
- [Source Sans 3](https://github.com/adobe-fonts/source-sans)：默认西文字体，可以正确显示国际音标，以及白话字声调和西文字符的组合。
- [Gentium Book Plus](https://github.com/silnrsi/font-gentium)：用于标记声调。只用于五度标记法的几个字符，可以组合成连字。

## 特别感谢

本项目能够完成，离不开众多巨人的肩膀：

- 第一版的字表数据来源于开源项目[潮语拼音输入法](https://github.com/kahaani/dieghv/issues)
- 标准音的构拟、口音的归类及演变模式、声调调值数据主要参考：
  - 徐馥琼《粤东闽语语音研究》
  - 郭必之《Southern Min》
  - 知乎博主[佐蔵瑾](https://www.zhihu.com/people/Tsengzu_Tsng/answers)的若干篇文章
- 字音校对过程中主要参考：
  - [潮州母语网](https://wwqw.mogher.com)、[潮州音字典](http://www.czyzd.com)
  - 清末传教士所著字典词典
  - 汲约翰《潮正两音字集》（文读音）
  - 开源项目[汉字音典](https://github.com/osfans/MCPDict)
  - 开源项目[潮州话文本处理工具](https://github.com/p1an-lin-jung/teochew-g2p/)
- 词汇主要参考：
  - [母语网词库/《潮典》](https://www.mogher.com/docs/about_chao_dian)
  - 开源项目[潮州话词库](https://github.com/hokkien-writing/teochew-lexicon)
  - 其他学术文献（参见[参考文献](./bib.md)）
- 母语网群友
- 各位用户朋友
