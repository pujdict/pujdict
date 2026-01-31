---
title: 各地口音及演变模式
order: 5
date: 2025-01-27
---

<script setup>
import TToneLetter from '@components/TToneLetter.vue';
import TPopupPujNoAccent from '@components/TPopupPujNoAccent.vue';
import TDocAccentFuzzyRules from '@components/TDocAccentFuzzyRules.vue';
</script>
<style>
li > ol > li {
  list-style: lower-roman;
}
</style>

“潮州九县，县县有语”，
各地经过长时间的演变，也发展出了各具特色的音系。
不过，具体到同一个市、同一个县的人，发音也可能受各种影响产生差异，
穷举具体每个人的口音是不可能也是没必要的。
本文以及辞典内部数据定义的口音点和演变模式，关注的是区域内总体性的规律。

## 口音演变模式

本辞典中，定义了若干从标准音映射到各地口音的**演变模式**。
代码和数据库中，则是早期开发时参考了普通话拼音输入法的“模糊音”概念，
将这些演变模式称为“模糊音规则（Fuzzy Rules）”，下文统一称为“演变模式”。
一个具体的“口音”，由若干“演变模式”组合形成。
可以在这些模式的基础上组合出合适自己使用的口音。

<TDocAccentFuzzyRules />

[//]: # (TODO：重新校对各地口音)
## 各地口音总表

### 各地口音规则表

[//]: # (TODO：使用程序生成规则表)
转读规则表中，转读音一列为空的表示不需要转读。

::: tabs

@tab 潮州

| 例字      | 辞典标准音                                                                                             | 转读音                                                                                               |
|---------|---------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------|
| 余       | <TPopupPujNoAccent puj=-ur0 />                                                                    |                                                                                                   |
| 退^1^    | <TPopupPujNoAccent puj=-or0 />                                                                    | <TPopupPujNoAccent puj=-o0 />                                                                     |
| 梳       | <TPopupPujNoAccent puj=-eu0 />                                                                    | <TPopupPujNoAccent puj=-iu0 />                                                                    |
| 买鞋^2^   | <TPopupPujNoAccent puj=-oi0 />                                                                    |                                                                                                   |
| 反间      | <TPopupPujNoAccent puj=-oinn0 />                                                                  |                                                                                                   |
| 八狭      | <TPopupPujNoAccent puj=-oih0 />                                                                   |                                                                                                   |
| 县悬^3^   | <TPopupPujNoAccent puj=-uoinn0 />                                                                 | <TPopupPujNoAccent puj=-uinn0 />                                                                  |
| 乌       | <TPopupPujNoAccent puj=-ou0 />                                                                    |                                                                                                   |
| 腰阳药     | <TPopupPujNoAccent puj=-io0 />, <TPopupPujNoAccent puj=-ionn0 />, <TPopupPujNoAccent puj=-ioh0 /> | <TPopupPujNoAccent puj=-ie0 />, <TPopupPujNoAccent puj=-ienn0 />, <TPopupPujNoAccent puj=-ieh0 /> |
| 妖跃^4^   | <TPopupPujNoAccent puj=-iau0 />, <TPopupPujNoAccent puj=-iauh0 />                                 | <TPopupPujNoAccent puj=-ieu0 />, <TPopupPujNoAccent puj=-ieh0 />                                  |
| 话关划     | <TPopupPujNoAccent puj=-ue0 />, <TPopupPujNoAccent puj=-uenn0 />, <TPopupPujNoAccent puj=-ueh0 /> |                                                                                                   |
| 英易^5^   | <TPopupPujNoAccent puj=-eng0 />, <TPopupPujNoAccent puj=-ek0 />                                   |                                                                                                   |
| 音邑      | <TPopupPujNoAccent puj=-im0 />, <TPopupPujNoAccent puj=-ip0 />                                    |                                                                                                   |
| 因乙      | <TPopupPujNoAccent puj=-in0 />, <TPopupPujNoAccent puj=-it0 />                                    | <TPopupPujNoAccent puj=-ing0 />, <TPopupPujNoAccent puj=-ik0 />                                   |
| 恩很^6^   | <TPopupPujNoAccent puj=-orn0 />                                                                   | <TPopupPujNoAccent puj=-urng0 />                                                                  |
| 欣尹      | <TPopupPujNoAccent puj=-urn0 />                                                                   | <TPopupPujNoAccent puj=-ng0 />                                                                    |
| 隐乞      | <TPopupPujNoAccent puj=-urn0 />, <TPopupPujNoAccent puj=-urt0 />                                  | <TPopupPujNoAccent puj=-urng0 />  <TPopupPujNoAccent puj=-urk0 />                                 |
| 温熨      | <TPopupPujNoAccent puj=-un0 />, <TPopupPujNoAccent puj=-ut0 />                                    | <TPopupPujNoAccent puj=-ung0 />, <TPopupPujNoAccent puj=-uk0 />                                   |
| 庵盒      | <TPopupPujNoAccent puj=-am0 />, <TPopupPujNoAccent puj=-ap0 />                                    |                                                                                                   |
| 安抑      | <TPopupPujNoAccent puj=-an0 />, <TPopupPujNoAccent puj=-at0 />                                    | <TPopupPujNoAccent puj=-ang0 />, <TPopupPujNoAccent puj=-ak0 />                                   |
| 奄压      | <TPopupPujNoAccent puj=-iam0 />, <TPopupPujNoAccent puj=-iap0 />                                  | <TPopupPujNoAccent puj=-iem0 />, <TPopupPujNoAccent puj=-iep0 />                                  |
| 嫣设      | <TPopupPujNoAccent puj=-ian0 />, <TPopupPujNoAccent puj=-iat0 />                                  | <TPopupPujNoAccent puj=-ieng0 /> , <TPopupPujNoAccent puj=-iek0 />                                |
| 凡法      | <TPopupPujNoAccent puj=-uam0 />, <TPopupPujNoAccent puj=-uap0 />                                  |                                                                                                   |
| 弯阅      | <TPopupPujNoAccent puj=-uan0 />, <TPopupPujNoAccent puj=-uat0 />                                  | <TPopupPujNoAccent puj=-ueng0 />, <TPopupPujNoAccent puj=-uek0 />                                 |
| 莹衡      | <TPopupPujNoAccent puj=-ueng0 />                                                                  |                                                                                                   |
| 获       | <TPopupPujNoAccent puj=-uek0 />                                                                   |                                                                                                   |
| 饭问      | (双唇音)<TPopupPujNoAccent puj=-ng0 />                                                               | (双唇音)<TPopupPujNoAccent puj=-ung0 />                                                              |
| 中筑茸辱^7^ | (齿龈音)<TPopupPujNoAccent puj=-iong0 />, <TPopupPujNoAccent puj=-iok0 />                            | (齿龈音)<TPopupPujNoAccent puj=-ong0 />, <TPopupPujNoAccent puj=-ok0 />                              |
| 万亡文^8^  | <TPopupPujNoAccent puj=bu- />(阳声韵)                                                                |                                                                                                   |
| 漫闷      | <TPopupPujNoAccent puj=mu- />(阳声韵)                                                                | <TPopupPujNoAccent puj=bu- />                                                                     |
| 男念      | <TPopupPujNoAccent puj=n- /> (m 尾阳声韵)                                                             | <TPopupPujNoAccent puj=l- />                                                                      |
| 难能      | <TPopupPujNoAccent puj=n- /> (n, ng 尾阳声韵)                                                         | <TPopupPujNoAccent puj=l- />                                                                      |
| 蓝林帘     | <TPopupPujNoAccent puj=l- /> (m 尾阳声韵)                                                             |                                                                                                   |

@tab 戏腔^8^

| 例字      | 辞典标准音                                                                                             | 转读音                                                                                               |
|---------|---------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------|
| 余       | <TPopupPujNoAccent puj=-ur0 />                                                                    |                                                                                                   |
| 退^1^    | <TPopupPujNoAccent puj=-or0 />                                                                    | <TPopupPujNoAccent puj=-o0 />                                                                     |
| 梳       | <TPopupPujNoAccent puj=-eu0 />                                                                    | <TPopupPujNoAccent puj=-iu0 />                                                                    |
| 买鞋^2^   | <TPopupPujNoAccent puj=-oi0 />                                                                    |                                                                                                   |
| 反间      | <TPopupPujNoAccent puj=-oinn0 />                                                                  |                                                                                                   |
| 八狭      | <TPopupPujNoAccent puj=-oih0 />                                                                   |                                                                                                   |
| 县悬^3^   | <TPopupPujNoAccent puj=-uoinn0 />                                                                 | <TPopupPujNoAccent puj=-uinn0 />                                                                  |
| 乌       | <TPopupPujNoAccent puj=-ou0 />                                                                    |                                                                                                   |
| 腰阳药     | <TPopupPujNoAccent puj=-io0 />, <TPopupPujNoAccent puj=-ionn0 />, <TPopupPujNoAccent puj=-ioh0 /> | <TPopupPujNoAccent puj=-ie0 />, <TPopupPujNoAccent puj=-ienn0 />, <TPopupPujNoAccent puj=-ieh0 /> |
| 妖跃^4^   | <TPopupPujNoAccent puj=-iau0 />, <TPopupPujNoAccent puj=-iauh0 />                                 | <TPopupPujNoAccent puj=-iou0 />, <TPopupPujNoAccent puj=-iouh0 />                                 |
| 话关划     | <TPopupPujNoAccent puj=-ue0 />, <TPopupPujNoAccent puj=-uenn0 />, <TPopupPujNoAccent puj=-ueh0 /> |                                                                                                   |
| 英易^5^   | <TPopupPujNoAccent puj=-eng0 />, <TPopupPujNoAccent puj=-ek0 />                                   |                                                                                                   |
| 音邑      | <TPopupPujNoAccent puj=-im0 />, <TPopupPujNoAccent puj=-ip0 />                                    |                                                                                                   |
| 因乙      | <TPopupPujNoAccent puj=-in0 />, <TPopupPujNoAccent puj=-it0 />                                    | (<TPopupPujNoAccent puj=-ing0 />, <TPopupPujNoAccent puj=-ik0 />)                                 |
| 恩很^6^   | <TPopupPujNoAccent puj=-orn0 />                                                                   | (<TPopupPujNoAccent puj=-urng0 />)                                                                |
| 欣尹      | <TPopupPujNoAccent puj=-urn0 />                                                                   | (<TPopupPujNoAccent puj=-urng0 />)                                                                |
| 隐乞      | <TPopupPujNoAccent puj=-urn0 />, <TPopupPujNoAccent puj=-urt0 />                                  | (<TPopupPujNoAccent puj=-urng0 />  <TPopupPujNoAccent puj=-urk0 />)                               |
| 温熨      | <TPopupPujNoAccent puj=-un0 />, <TPopupPujNoAccent puj=-ut0 />                                    | (<TPopupPujNoAccent puj=-ung0 />,-uk)                                                             |
| 庵盒      | <TPopupPujNoAccent puj=-am0 />, <TPopupPujNoAccent puj=-ap0 />                                    |                                                                                                   |
| 安抑      | <TPopupPujNoAccent puj=-an0 />, <TPopupPujNoAccent puj=-at0 />                                    | (<TPopupPujNoAccent puj=-ang0 />, <TPopupPujNoAccent puj=-ak0 />)                                 |
| 奄压      | <TPopupPujNoAccent puj=-iam0 />, <TPopupPujNoAccent puj=-iap0 />                                  |                                                                                                   |
| 嫣设      | <TPopupPujNoAccent puj=-ian0 />, <TPopupPujNoAccent puj=-iat0 />                                  | (<TPopupPujNoAccent puj=-iang0 />, -iak)                                                          |
| 凡法      | <TPopupPujNoAccent puj=-uam0 />, <TPopupPujNoAccent puj=-uap0 />                                  |                                                                                                   |
| 弯阅      | <TPopupPujNoAccent puj=-uan0 />, <TPopupPujNoAccent puj=-uat0 />                                  | (-uang, -uak)                                                                                     |
| 莹衡      | <TPopupPujNoAccent puj=-ueng0 />                                                                  |                                                                                                   |
| 获       | <TPopupPujNoAccent puj=-uek0 />                                                                   |                                                                                                   |
| 饭问      | (双唇音)<TPopupPujNoAccent puj=-ng0 />                                                               |                                                                                                   |
| 中筑茸辱^7^ | (齿龈音)<TPopupPujNoAccent puj=-iong0 />, <TPopupPujNoAccent puj=-iok0 />                            | (齿龈音)<TPopupPujNoAccent puj=-ong0 />, <TPopupPujNoAccent puj=-ok0 />                              |
| 万亡文^8^  | <TPopupPujNoAccent puj=bu- />(阳声韵)                                                                |                                                                                                   |
| 漫闷      | <TPopupPujNoAccent puj=mu- />(阳声韵)                                                                | <TPopupPujNoAccent puj=bu- />                                                                     |
| 男念      | <TPopupPujNoAccent puj=n- /> (m 尾阳声韵)                                                             | <TPopupPujNoAccent puj=l- />                                                                      |
| 难能      | <TPopupPujNoAccent puj=n- /> (n, ng 尾阳声韵)                                                         | <TPopupPujNoAccent puj=l- />                                                                      |
| 蓝林帘     | <TPopupPujNoAccent puj=l- /> (m 尾阳声韵)                                                             |                                                                                                   |

@tab 潮安

| 例字      | 辞典标准音                                                                                             | 转读音                                                                          |
|---------|---------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------|
| 余       | <TPopupPujNoAccent puj=-ur0 />                                                                    |                                                                              |
| 退^1^    | <TPopupPujNoAccent puj=-or0 />                                                                    | <TPopupPujNoAccent puj=-o0 />                                                |
| 梳       | <TPopupPujNoAccent puj=-eu0 />                                                                    |                                                                              |
| 买鞋^2^   | <TPopupPujNoAccent puj=-oi0 />                                                                    | (双唇音)<TPopupPujNoAccent puj=-ue0 />, (其他音)<TPopupPujNoAccent puj=-oi0 />     |
| 反间      | <TPopupPujNoAccent puj=-oinn0 />                                                                  | (双唇音)<TPopupPujNoAccent puj=-uenn0 />, (其他音)<TPopupPujNoAccent puj=-oinn0 /> |
| 八狭      | <TPopupPujNoAccent puj=-oih0 />                                                                   | (双唇音)<TPopupPujNoAccent puj=-ueh0 />, (其他音)<TPopupPujNoAccent puj=-oih0 />   |
| 县悬^3^   | <TPopupPujNoAccent puj=-uoinn0 />                                                                 | <TPopupPujNoAccent puj=-uinn0 />                                             |
| 乌       | <TPopupPujNoAccent puj=-ou0 />                                                                    |                                                                              |
| 腰阳药     | <TPopupPujNoAccent puj=-io0 />, <TPopupPujNoAccent puj=-ionn0 />, <TPopupPujNoAccent puj=-ioh0 /> |                                                                              |
| 妖跃^4^   | <TPopupPujNoAccent puj=-iau0 />, <TPopupPujNoAccent puj=-iauh0 />                                 |                                                                              |
| 话关划     | <TPopupPujNoAccent puj=-ue0 />, <TPopupPujNoAccent puj=-uenn0 />, <TPopupPujNoAccent puj=-ueh0 /> |                                                                              |
| 英易^5^   | <TPopupPujNoAccent puj=-eng0 />, <TPopupPujNoAccent puj=-ek0 />                                   |                                                                              |
| 音邑      | <TPopupPujNoAccent puj=-im0 />, <TPopupPujNoAccent puj=-ip0 />                                    |                                                                              |
| 因乙      | <TPopupPujNoAccent puj=-in0 />, <TPopupPujNoAccent puj=-it0 />                                    |                                                                              |
| 恩很^6^   | <TPopupPujNoAccent puj=-orn0 />                                                                   | <TPopupPujNoAccent puj=-urn0 />                                              |
| 欣尹      | <TPopupPujNoAccent puj=-urn0 />                                                                   |                                                                              |
| 隐乞      | <TPopupPujNoAccent puj=-urn0 />, <TPopupPujNoAccent puj=-urt0 />                                  |                                                                              |
| 温熨      | <TPopupPujNoAccent puj=-un0 />, <TPopupPujNoAccent puj=-ut0 />                                    |                                                                              |
| 庵盒      | <TPopupPujNoAccent puj=-am0 />, <TPopupPujNoAccent puj=-ap0 />                                    |                                                                              |
| 安抑      | <TPopupPujNoAccent puj=-an0 />, <TPopupPujNoAccent puj=-at0 />                                    |                                                                              |
| 奄压      | <TPopupPujNoAccent puj=-iam0 />, <TPopupPujNoAccent puj=-iap0 />                                  |                                                                              |
| 嫣设      | <TPopupPujNoAccent puj=-ian0 />, <TPopupPujNoAccent puj=-iat0 />                                  | <TPopupPujNoAccent puj=-ien0 />, <TPopupPujNoAccent puj=-iet0 />             |
| 凡法      | <TPopupPujNoAccent puj=-uam0 />, <TPopupPujNoAccent puj=-uap0 />                                  |                                                                              |
| 弯阅      | <TPopupPujNoAccent puj=-uan0 />, <TPopupPujNoAccent puj=-uat0 />                                  |                                                                              |
| 莹衡      | <TPopupPujNoAccent puj=-ueng0 />                                                                  |                                                                              |
| 获       | <TPopupPujNoAccent puj=-uek0 />                                                                   |                                                                              |
| 饭问      | (双唇音)<TPopupPujNoAccent puj=-ng0 />                                                               |                                                                              |
| 中筑茸辱^7^ | (齿龈音)<TPopupPujNoAccent puj=-iong0 />, <TPopupPujNoAccent puj=-iok0 />                            | (齿龈音)<TPopupPujNoAccent puj=-ong0 />, <TPopupPujNoAccent puj=-ok0 />         |
| 万亡文^8^  | <TPopupPujNoAccent puj=bu- />(阳声韵)                                                                |                                                                              |
| 漫闷      | <TPopupPujNoAccent puj=mu- />(阳声韵)                                                                | <TPopupPujNoAccent puj=bu- />                                                |
| 男念      | <TPopupPujNoAccent puj=n- /> (m 尾阳声韵)                                                             | <TPopupPujNoAccent puj=l- />                                                 |
| 难能      | <TPopupPujNoAccent puj=n- /> (n, ng 尾阳声韵)                                                         | <TPopupPujNoAccent puj=l- />                                                 |
| 蓝林帘     | <TPopupPujNoAccent puj=l- /> (m 尾阳声韵)                                                             |                                                                              |

@tab 丰顺

| 例字      | 辞典标准音                                                                                             | 转读音                                                                                               |
|---------|---------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------|
| 余       | <TPopupPujNoAccent puj=-ur0 />                                                                    |                                                                                                   |
| 退^1^    | <TPopupPujNoAccent puj=-or0 />                                                                    | <TPopupPujNoAccent puj=-o0 />                                                                     |
| 梳       | <TPopupPujNoAccent puj=-eu0 />                                                                    | <TPopupPujNoAccent puj=-iu0 />                                                                    |
| 买鞋^2^   | <TPopupPujNoAccent puj=-oi0 />                                                                    |                                                                                                   |
| 反间      | <TPopupPujNoAccent puj=-oinn0 />                                                                  |                                                                                                   |
| 八狭      | <TPopupPujNoAccent puj=-oih0 />                                                                   |                                                                                                   |
| 县悬^3^   | <TPopupPujNoAccent puj=-uoinn0 />                                                                 | <TPopupPujNoAccent puj=-uinn0 />                                                                  |
| 乌       | <TPopupPujNoAccent puj=-ou0 />                                                                    |                                                                                                   |
| 腰阳药     | <TPopupPujNoAccent puj=-io0 />, <TPopupPujNoAccent puj=-ionn0 />, <TPopupPujNoAccent puj=-ioh0 /> | <TPopupPujNoAccent puj=-ie0 />, <TPopupPujNoAccent puj=-ienn0 />, <TPopupPujNoAccent puj=-ieh0 /> |
| 妖跃^4^   | <TPopupPujNoAccent puj=-iau0 />, <TPopupPujNoAccent puj=-iauh0 />                                 | <TPopupPujNoAccent puj=-ieu0 />, <TPopupPujNoAccent puj=-ieh0 />                                  |
| 话关划     | <TPopupPujNoAccent puj=-ue0 />, <TPopupPujNoAccent puj=-uenn0 />, <TPopupPujNoAccent puj=-ueh0 /> |                                                                                                   |
| 英易^5^   | <TPopupPujNoAccent puj=-eng0 />, <TPopupPujNoAccent puj=-ek0 />                                   | <TPopupPujNoAccent puj=-en0 />, <TPopupPujNoAccent puj=-et0 />                                    |
| 音邑      | <TPopupPujNoAccent puj=-im0 />, <TPopupPujNoAccent puj=-ip0 />                                    |                                                                                                   |
| 因乙      | <TPopupPujNoAccent puj=-in0 />, <TPopupPujNoAccent puj=-it0 />                                    |                                                                                                   |
| 恩很^6^   | <TPopupPujNoAccent puj=-orn0 />                                                                   | <TPopupPujNoAccent puj=-urn0 />                                                                   |
| 欣尹      | <TPopupPujNoAccent puj=-urn0 />                                                                   |                                                                                                   |
| 隐乞      | <TPopupPujNoAccent puj=-urn0 />, <TPopupPujNoAccent puj=-urt0 />                                  |                                                                                                   |
| 温熨      | <TPopupPujNoAccent puj=-un0 />, <TPopupPujNoAccent puj=-ut0 />                                    |                                                                                                   |
| 庵盒      | <TPopupPujNoAccent puj=-am0 />, <TPopupPujNoAccent puj=-ap0 />                                    |                                                                                                   |
| 安抑      | <TPopupPujNoAccent puj=-an0 />, <TPopupPujNoAccent puj=-at0 />                                    |                                                                                                   |
| 奄压      | <TPopupPujNoAccent puj=-iam0 />, <TPopupPujNoAccent puj=-iap0 />                                  | <TPopupPujNoAccent puj=-iem0 />, <TPopupPujNoAccent puj=-iep0 />                                  |
| 嫣设      | <TPopupPujNoAccent puj=-ian0 />, <TPopupPujNoAccent puj=-iat0 />                                  | <TPopupPujNoAccent puj=-ien0 />, <TPopupPujNoAccent puj=-iet0 />                                  |
| 凡法      | <TPopupPujNoAccent puj=-uam0 />, <TPopupPujNoAccent puj=-uap0 />                                  |                                                                                                   |
| 弯阅      | <TPopupPujNoAccent puj=-uan0 />, <TPopupPujNoAccent puj=-uat0 />                                  | -uen, <TPopupPujNoAccent puj=-uet0 />                                                             |
| 莹衡      | <TPopupPujNoAccent puj=-ueng0 />                                                                  | <TPopupPujNoAccent puj=-uen0 />                                                                   |
| 获       | <TPopupPujNoAccent puj=-uek0 />                                                                   | <TPopupPujNoAccent puj=-uet0 />                                                                   |
| 饭问      | (双唇音)<TPopupPujNoAccent puj=-ng0 />                                                               |                                                                                                   |
| 中筑茸辱^7^ | (齿龈音)<TPopupPujNoAccent puj=-iong0 />, <TPopupPujNoAccent puj=-iok0 />                            | (齿龈音)<TPopupPujNoAccent puj=-ong0 />, <TPopupPujNoAccent puj=-ok0 />                              |
| 万亡文^8^  | <TPopupPujNoAccent puj=bu- />(阳声韵)                                                                |                                                                                                   |
| 漫闷      | <TPopupPujNoAccent puj=mu- />(阳声韵)                                                                | <TPopupPujNoAccent puj=bu- />                                                                     |
| 男念      | <TPopupPujNoAccent puj=n- /> (m 尾阳声韵)                                                             | <TPopupPujNoAccent puj=l- />                                                                      |
| 难能      | <TPopupPujNoAccent puj=n- /> (n, ng 尾阳声韵)                                                         | <TPopupPujNoAccent puj=l- />                                                                      |
| 蓝林帘     | <TPopupPujNoAccent puj=l- /> (m 尾阳声韵)                                                             |                                                                                                   |

@tab 饶平

| 例字      | 辞典标准音                                                                                             | 转读音                                                                          |
|---------|---------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------|
| 余       | <TPopupPujNoAccent puj=-ur0 />                                                                    |                                                                              |
| 退^1^    | <TPopupPujNoAccent puj=-or0 />                                                                    | <TPopupPujNoAccent puj=-o0 />                                                |
| 梳       | <TPopupPujNoAccent puj=-eu0 />                                                                    |                                                                              |
| 买鞋^2^   | <TPopupPujNoAccent puj=-oi0 />                                                                    | (双唇音)<TPopupPujNoAccent puj=-ue0 />, (其他音)<TPopupPujNoAccent puj=-oi0 />     |
| 反间      | <TPopupPujNoAccent puj=-oinn0 />                                                                  | (双唇音)<TPopupPujNoAccent puj=-uenn0 />, (其他音)<TPopupPujNoAccent puj=-oinn0 /> |
| 八狭      | <TPopupPujNoAccent puj=-oih0 />                                                                   | (双唇音)<TPopupPujNoAccent puj=-ueh0 />, (其他音)<TPopupPujNoAccent puj=-oih0 />   |
| 县悬^3^   | <TPopupPujNoAccent puj=-uoinn0 />                                                                 | <TPopupPujNoAccent puj=-uinn0 />                                             |
| 乌       | <TPopupPujNoAccent puj=-ou0 />                                                                    |                                                                              |
| 腰阳药     | <TPopupPujNoAccent puj=-io0 />, <TPopupPujNoAccent puj=-ionn0 />, <TPopupPujNoAccent puj=-ioh0 /> |                                                                              |
| 妖跃^4^   | <TPopupPujNoAccent puj=-iau0 />, <TPopupPujNoAccent puj=-iauh0 />                                 |                                                                              |
| 话关划     | <TPopupPujNoAccent puj=-ue0 />, <TPopupPujNoAccent puj=-uenn0 />, <TPopupPujNoAccent puj=-ueh0 /> |                                                                              |
| 英易^5^   | <TPopupPujNoAccent puj=-eng0 />, <TPopupPujNoAccent puj=-ek0 />                                   |                                                                              |
| 音邑      | <TPopupPujNoAccent puj=-im0 />, <TPopupPujNoAccent puj=-ip0 />                                    |                                                                              |
| 因乙      | <TPopupPujNoAccent puj=-in0 />, <TPopupPujNoAccent puj=-it0 />                                    | <TPopupPujNoAccent puj=-ing0 />, <TPopupPujNoAccent puj=-ik0 />              |
| 恩很^6^   | <TPopupPujNoAccent puj=-orn0 />                                                                   | <TPopupPujNoAccent puj=-urng0 />                                             |
| 欣尹      | <TPopupPujNoAccent puj=-urn0 />                                                                   | <TPopupPujNoAccent puj=-urng0 />                                             |
| 隐乞      | <TPopupPujNoAccent puj=-urn0 />, <TPopupPujNoAccent puj=-urt0 />                                  | <TPopupPujNoAccent puj=-urng0 />  <TPopupPujNoAccent puj=-urk0 />            |
| 温熨      | <TPopupPujNoAccent puj=-un0 />, <TPopupPujNoAccent puj=-ut0 />                                    | <TPopupPujNoAccent puj=-ung0 />, <TPopupPujNoAccent puj=-uk0 />              |
| 庵盒      | <TPopupPujNoAccent puj=-am0 />, <TPopupPujNoAccent puj=-ap0 />                                    |                                                                              |
| 安抑      | <TPopupPujNoAccent puj=-an0 />, <TPopupPujNoAccent puj=-at0 />                                    | <TPopupPujNoAccent puj=-ang0 />, <TPopupPujNoAccent puj=-ak0 />              |
| 奄压      | <TPopupPujNoAccent puj=-iam0 />, <TPopupPujNoAccent puj=-iap0 />                                  |                                                                              |
| 嫣设      | <TPopupPujNoAccent puj=-ian0 />, <TPopupPujNoAccent puj=-iat0 />                                  | <TPopupPujNoAccent puj=-iang0 />, <TPopupPujNoAccent puj=-iak0 />            |
| 凡法      | <TPopupPujNoAccent puj=-uam0 />, <TPopupPujNoAccent puj=-uap0 />                                  |                                                                              |
| 弯阅      | <TPopupPujNoAccent puj=-uan0 />, <TPopupPujNoAccent puj=-uat0 />                                  | <TPopupPujNoAccent puj=-uang0 />, <TPopupPujNoAccent puj=-uak0 />            |
| 莹衡      | <TPopupPujNoAccent puj=-ueng0 />                                                                  |                                                                              |
| 获       | <TPopupPujNoAccent puj=-uek0 />                                                                   |                                                                              |
| 饭问      | (双唇音)<TPopupPujNoAccent puj=-ng0 />                                                               |                                                                              |
| 中筑茸辱^7^ | (齿龈音)<TPopupPujNoAccent puj=-iong0 />, <TPopupPujNoAccent puj=-iok0 />                            | (齿龈音)<TPopupPujNoAccent puj=-ong0 />, <TPopupPujNoAccent puj=-ok0 />         |
| 万亡文^8^  | <TPopupPujNoAccent puj=bu- />(阳声韵)                                                                | <TPopupPujNoAccent puj=mu- />(阳声韵)                                           |
| 漫闷      | <TPopupPujNoAccent puj=mu- />(阳声韵)                                                                |                                                                              |
| 男念      | <TPopupPujNoAccent puj=n- /> (m 尾阳声韵)                                                             | <TPopupPujNoAccent puj=l- />                                                 |
| 难能      | <TPopupPujNoAccent puj=n- /> (n, ng 尾阳声韵)                                                         | <TPopupPujNoAccent puj=l- />                                                 |
| 蓝林帘     | <TPopupPujNoAccent puj=l- /> (m 尾阳声韵)                                                             |                                                                              |

@tab 澄海

| 例字      | 辞典标准音                                                                                             | 转读音                                                                                               |
|---------|---------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------|
| 余       | <TPopupPujNoAccent puj=-ur0 />                                                                    |                                                                                                   |
| 退^1^    | <TPopupPujNoAccent puj=-or0 />                                                                    | <TPopupPujNoAccent puj=-o0 />                                                                     |
| 梳       | <TPopupPujNoAccent puj=-eu0 />                                                                    | <TPopupPujNoAccent puj=-iu0 />                                                                    |
| 买鞋^2^   | <TPopupPujNoAccent puj=-oi0 />                                                                    |                                                                                                   |
| 反间      | <TPopupPujNoAccent puj=-oinn0 />                                                                  |                                                                                                   |
| 八狭      | <TPopupPujNoAccent puj=-oih0 />                                                                   |                                                                                                   |
| 县悬^3^   | <TPopupPujNoAccent puj=-uoinn0 />                                                                 | <TPopupPujNoAccent puj=-uinn0 />                                                                  |
| 乌       | <TPopupPujNoAccent puj=-ou0 />                                                                    |                                                                                                   |
| 腰阳药     | <TPopupPujNoAccent puj=-io0 />, <TPopupPujNoAccent puj=-ionn0 />, <TPopupPujNoAccent puj=-ioh0 /> | <TPopupPujNoAccent puj=-ie0 />, <TPopupPujNoAccent puj=-ienn0 />, <TPopupPujNoAccent puj=-ieh0 /> |
| 妖跃^4^   | <TPopupPujNoAccent puj=-iau0 />, <TPopupPujNoAccent puj=-iauh0 />                                 | <TPopupPujNoAccent puj=-iou0 />, <TPopupPujNoAccent puj=-iouh0 />                                 |
| 话关划     | <TPopupPujNoAccent puj=-ue0 />, <TPopupPujNoAccent puj=-uenn0 />, <TPopupPujNoAccent puj=-ueh0 /> |                                                                                                   |
| 英易^5^   | <TPopupPujNoAccent puj=-eng0 />, <TPopupPujNoAccent puj=-ek0 />                                   |                                                                                                   |
| 音邑      | <TPopupPujNoAccent puj=-im0 />, <TPopupPujNoAccent puj=-ip0 />                                    | <TPopupPujNoAccent puj=-ing0 />, <TPopupPujNoAccent puj=-ik0 />                                   |
| 因乙      | <TPopupPujNoAccent puj=-in0 />, <TPopupPujNoAccent puj=-it0 />                                    | <TPopupPujNoAccent puj=-ing0 />, <TPopupPujNoAccent puj=-ik0 />                                   |
| 恩很^6^   | <TPopupPujNoAccent puj=-orn0 />                                                                   | <TPopupPujNoAccent puj=-urng0 />                                                                  |
| 欣尹      | <TPopupPujNoAccent puj=-urn0 />                                                                   | <TPopupPujNoAccent puj=-urng0 />                                                                  |
| 隐乞      | <TPopupPujNoAccent puj=-urn0 />, <TPopupPujNoAccent puj=-urt0 />                                  | <TPopupPujNoAccent puj=-urng0 />  <TPopupPujNoAccent puj=-urk0 />                                 |
| 温熨      | <TPopupPujNoAccent puj=-un0 />, <TPopupPujNoAccent puj=-ut0 />                                    | <TPopupPujNoAccent puj=-ung0 />, <TPopupPujNoAccent puj=-uk0 />                                   |
| 庵盒      | <TPopupPujNoAccent puj=-am0 />, <TPopupPujNoAccent puj=-ap0 />                                    | <TPopupPujNoAccent puj=-ang0 />, <TPopupPujNoAccent puj=-ak0 />                                   |
| 安抑      | <TPopupPujNoAccent puj=-an0 />, <TPopupPujNoAccent puj=-at0 />                                    | <TPopupPujNoAccent puj=-ang0 />, <TPopupPujNoAccent puj=-ak0 />                                   |
| 奄压      | <TPopupPujNoAccent puj=-iam0 />, <TPopupPujNoAccent puj=-iap0 />                                  | <TPopupPujNoAccent puj=-iang0 />, <TPopupPujNoAccent puj=-iak0 />                                 |
| 嫣设      | <TPopupPujNoAccent puj=-ian0 />, <TPopupPujNoAccent puj=-iat0 />                                  | <TPopupPujNoAccent puj=-iang0 />, <TPopupPujNoAccent puj=-iak0 />                                 |
| 凡法      | <TPopupPujNoAccent puj=-uam0 />, <TPopupPujNoAccent puj=-uap0 />                                  | <TPopupPujNoAccent puj=-uang0 />, <TPopupPujNoAccent puj=-uak0 />                                 |
| 弯阅      | <TPopupPujNoAccent puj=-uan0 />, <TPopupPujNoAccent puj=-uat0 />                                  | <TPopupPujNoAccent puj=-uang0 />, <TPopupPujNoAccent puj=-uak0 />                                 |
| 莹衡      | <TPopupPujNoAccent puj=-ueng0 />                                                                  | (零声母)<TPopupPujNoAccent puj=-eng0 />, (其他音)<TPopupPujNoAccent puj=-uang0 />                       |
| 获       | <TPopupPujNoAccent puj=-uek0 />                                                                   | <TPopupPujNoAccent puj=-uak0 />                                                                   |
| 饭问      | (双唇音)<TPopupPujNoAccent puj=-ng0 />                                                               | (双唇音)<TPopupPujNoAccent puj=-ung0 />                                                              |
| 中筑茸辱^7^ | (齿龈音)<TPopupPujNoAccent puj=-iong0 />, <TPopupPujNoAccent puj=-iok0 />                            | (齿龈音)<TPopupPujNoAccent puj=-ong0 />, <TPopupPujNoAccent puj=-ok0 />                              |
| 万亡文^8^  | <TPopupPujNoAccent puj=bu- />(阳声韵)                                                                |                                                                                                   |
| 漫闷      | <TPopupPujNoAccent puj=mu- />(阳声韵)                                                                | <TPopupPujNoAccent puj=bu- />                                                                     |
| 男念      | <TPopupPujNoAccent puj=n- /> (m 尾阳声韵)                                                             |                                                                                                   |
| 难能      | <TPopupPujNoAccent puj=n- /> (n, ng 尾阳声韵)                                                         | <TPopupPujNoAccent puj=l- />                                                                      |
| 蓝林帘     | <TPopupPujNoAccent puj=l- /> (m 尾阳声韵)                                                             | <TPopupPujNoAccent puj=n- />                                                                      |

@tab 汕头

| 例字      | 辞典标准音                                                                                             | 转读音                                                                         |
|---------|---------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------|
| 余       | <TPopupPujNoAccent puj=-ur0 />                                                                    |                                                                             |
| 退^1^    | <TPopupPujNoAccent puj=-or0 />                                                                    | <TPopupPujNoAccent puj=-o0 />                                               |
| 梳       | <TPopupPujNoAccent puj=-eu0 />                                                                    | <TPopupPujNoAccent puj=-iu0 />                                              |
| 买鞋^2^   | <TPopupPujNoAccent puj=-oi0 />                                                                    |                                                                             |
| 反间      | <TPopupPujNoAccent puj=-oinn0 />                                                                  |                                                                             |
| 八狭      | <TPopupPujNoAccent puj=-oih0 />                                                                   |                                                                             |
| 县悬^3^   | <TPopupPujNoAccent puj=-uoinn0 />                                                                 | <TPopupPujNoAccent puj=-uinn0 />                                            |
| 乌       | <TPopupPujNoAccent puj=-ou0 />                                                                    |                                                                             |
| 腰阳药     | <TPopupPujNoAccent puj=-io0 />, <TPopupPujNoAccent puj=-ionn0 />, <TPopupPujNoAccent puj=-ioh0 /> |                                                                             |
| 妖跃^4^   | <TPopupPujNoAccent puj=-iau0 />, <TPopupPujNoAccent puj=-iauh0 />                                 | <TPopupPujNoAccent puj=-iou0 />, <TPopupPujNoAccent puj=-iouh0 />           |
| 话关划     | <TPopupPujNoAccent puj=-ue0 />, <TPopupPujNoAccent puj=-uenn0 />, <TPopupPujNoAccent puj=-ueh0 /> |                                                                             |
| 英易^5^   | <TPopupPujNoAccent puj=-eng0 />, <TPopupPujNoAccent puj=-ek0 />                                   |                                                                             |
| 音邑      | <TPopupPujNoAccent puj=-im0 />, <TPopupPujNoAccent puj=-ip0 />                                    |                                                                             |
| 因乙      | <TPopupPujNoAccent puj=-in0 />, <TPopupPujNoAccent puj=-it0 />                                    | <TPopupPujNoAccent puj=-ing0 />, <TPopupPujNoAccent puj=-ik0 />             |
| 恩很^6^   | <TPopupPujNoAccent puj=-orn0 />                                                                   | <TPopupPujNoAccent puj=-urng0 />                                            |
| 欣尹      | <TPopupPujNoAccent puj=-urn0 />                                                                   | <TPopupPujNoAccent puj=-urng0 />                                            |
| 隐乞      | <TPopupPujNoAccent puj=-urn0 />, <TPopupPujNoAccent puj=-urt0 />                                  | <TPopupPujNoAccent puj=-urng0 />  <TPopupPujNoAccent puj=-urk0 />           |
| 温熨      | <TPopupPujNoAccent puj=-un0 />, <TPopupPujNoAccent puj=-ut0 />                                    | <TPopupPujNoAccent puj=-ung0 />, <TPopupPujNoAccent puj=-uk0 />             |
| 庵盒      | <TPopupPujNoAccent puj=-am0 />, <TPopupPujNoAccent puj=-ap0 />                                    |                                                                             |
| 安抑      | <TPopupPujNoAccent puj=-an0 />, <TPopupPujNoAccent puj=-at0 />                                    | <TPopupPujNoAccent puj=-ang0 />, <TPopupPujNoAccent puj=-ak0 />             |
| 奄压      | <TPopupPujNoAccent puj=-iam0 />, <TPopupPujNoAccent puj=-iap0 />                                  |                                                                             |
| 嫣设      | <TPopupPujNoAccent puj=-ian0 />, <TPopupPujNoAccent puj=-iat0 />                                  | <TPopupPujNoAccent puj=-iang0 />, <TPopupPujNoAccent puj=-iak0 />           |
| 凡法      | <TPopupPujNoAccent puj=-uam0 />, <TPopupPujNoAccent puj=-uap0 />                                  | <TPopupPujNoAccent puj=-uang0 />, <TPopupPujNoAccent puj=-uak0 />           |
| 弯阅      | <TPopupPujNoAccent puj=-uan0 />, <TPopupPujNoAccent puj=-uat0 />                                  | <TPopupPujNoAccent puj=-uang0 />, <TPopupPujNoAccent puj=-uak0 />           |
| 莹衡      | <TPopupPujNoAccent puj=-ueng0 />                                                                  | (零声母)<TPopupPujNoAccent puj=-eng0 />, (其他音)<TPopupPujNoAccent puj=-uang0 /> |
| 获       | <TPopupPujNoAccent puj=-uek0 />                                                                   | <TPopupPujNoAccent puj=-uak0 />                                             |
| 饭问      | (双唇音)<TPopupPujNoAccent puj=-ng0 />                                                               | (双唇音)<TPopupPujNoAccent puj=-ung0 />                                        |
| 中筑茸辱^7^ | (齿龈音)<TPopupPujNoAccent puj=-iong0 />, <TPopupPujNoAccent puj=-iok0 />                            | (齿龈音)<TPopupPujNoAccent puj=-ong0 />, <TPopupPujNoAccent puj=-ok0 />        |
| 万亡文^8^  | <TPopupPujNoAccent puj=bu- />(阳声韵)                                                                |                                                                             |
| 漫闷      | <TPopupPujNoAccent puj=mu- />(阳声韵)                                                                | <TPopupPujNoAccent puj=bu- />                                               |
| 男念      | <TPopupPujNoAccent puj=n- /> (m 尾阳声韵)                                                             |                                                                             |
| 难能      | <TPopupPujNoAccent puj=n- /> (n, ng 尾阳声韵)                                                         | <TPopupPujNoAccent puj=l- />                                                |
| 蓝林帘     | <TPopupPujNoAccent puj=l- /> (m 尾阳声韵)                                                             |                                                                             |

@tab 揭阳

| 例字      | 辞典标准音                                                                                             | 转读音                                                               |
|---------|---------------------------------------------------------------------------------------------------|-------------------------------------------------------------------|
| 余       | <TPopupPujNoAccent puj=-ur0 />                                                                    |                                                                   |
| 退^1^    | <TPopupPujNoAccent puj=-or0 />                                                                    | <TPopupPujNoAccent puj=-o0 />                                     |
| 梳       | <TPopupPujNoAccent puj=-eu0 />                                                                    | <TPopupPujNoAccent puj=-iu0 />                                    |
| 买鞋^2^   | <TPopupPujNoAccent puj=-oi0 />                                                                    |                                                                   |
| 反间      | <TPopupPujNoAccent puj=-oinn0 />                                                                  | <TPopupPujNoAccent puj=-ainn0 />                                  |
| 八狭      | <TPopupPujNoAccent puj=-oih0 />                                                                   |                                                                   |
| 县悬^3^   | <TPopupPujNoAccent puj=-uoinn0 />                                                                 | <TPopupPujNoAccent puj=-uainn0 />                                 |
| 乌       | <TPopupPujNoAccent puj=-ou0 />                                                                    |                                                                   |
| 腰阳药     | <TPopupPujNoAccent puj=-io0 />, <TPopupPujNoAccent puj=-ionn0 />, <TPopupPujNoAccent puj=-ioh0 /> |                                                                   |
| 妖跃^4^   | <TPopupPujNoAccent puj=-iau0 />, <TPopupPujNoAccent puj=-iauh0 />                                 |                                                                   |
| 话关划     | <TPopupPujNoAccent puj=-ue0 />, <TPopupPujNoAccent puj=-uenn0 />, <TPopupPujNoAccent puj=-ueh0 /> |                                                                   |
| 英易^5^   | <TPopupPujNoAccent puj=-eng0 />, <TPopupPujNoAccent puj=-ek0 />                                   |                                                                   |
| 音邑      | <TPopupPujNoAccent puj=-im0 />, <TPopupPujNoAccent puj=-ip0 />                                    |                                                                   |
| 因乙      | <TPopupPujNoAccent puj=-in0 />, <TPopupPujNoAccent puj=-it0 />                                    | <TPopupPujNoAccent puj=-eng0 />, <TPopupPujNoAccent puj=-ek0 />   |
| 恩很^6^   | <TPopupPujNoAccent puj=-orn0 />                                                                   | <TPopupPujNoAccent puj=-eng0 />                                   |
| 欣尹      | <TPopupPujNoAccent puj=-urn0 />                                                                   | <TPopupPujNoAccent puj=-eng0 />                                   |
| 隐乞      | <TPopupPujNoAccent puj=-urn0 />, <TPopupPujNoAccent puj=-urt0 />                                  | <TPopupPujNoAccent puj=-eng0 />, <TPopupPujNoAccent puj=-ek0 />   |
| 温熨      | <TPopupPujNoAccent puj=-un0 />, <TPopupPujNoAccent puj=-ut0 />                                    | <TPopupPujNoAccent puj=-ung0 />, <TPopupPujNoAccent puj=-uk0 />   |
| 庵盒      | <TPopupPujNoAccent puj=-am0 />, <TPopupPujNoAccent puj=-ap0 />                                    |                                                                   |
| 安抑      | <TPopupPujNoAccent puj=-an0 />, <TPopupPujNoAccent puj=-at0 />                                    | <TPopupPujNoAccent puj=-ang0 />, <TPopupPujNoAccent puj=-ak0 />   |
| 奄压      | <TPopupPujNoAccent puj=-iam0 />, <TPopupPujNoAccent puj=-iap0 />                                  |                                                                   |
| 嫣设      | <TPopupPujNoAccent puj=-ian0 />, <TPopupPujNoAccent puj=-iat0 />                                  | <TPopupPujNoAccent puj=-iang0 />, <TPopupPujNoAccent puj=-iak0 /> |
| 凡法      | <TPopupPujNoAccent puj=-uam0 />, <TPopupPujNoAccent puj=-uap0 />                                  |                                                                   |
| 弯阅      | <TPopupPujNoAccent puj=-uan0 />, <TPopupPujNoAccent puj=-uat0 />                                  | <TPopupPujNoAccent puj=-uang0 />, <TPopupPujNoAccent puj=-uak0 /> |
| 莹衡      | <TPopupPujNoAccent puj=-ueng0 />                                                                  |                                                                   |
| 获       | <TPopupPujNoAccent puj=-uek0 />                                                                   |                                                                   |
| 饭问      | (双唇音)<TPopupPujNoAccent puj=-ng0 />                                                               |                                                                   |
| 中筑茸辱^7^ | (齿龈音)<TPopupPujNoAccent puj=-iong0 />, <TPopupPujNoAccent puj=-iok0 />                            |                                                                   |
| 万亡文^8^  | <TPopupPujNoAccent puj=bu- />(阳声韵)                                                                |                                                                   |
| 漫闷      | <TPopupPujNoAccent puj=mu- />(阳声韵)                                                                | <TPopupPujNoAccent puj=bu- />                                     |
| 男念      | <TPopupPujNoAccent puj=n- /> (m 尾阳声韵)                                                             |                                                                   |
| 难能      | <TPopupPujNoAccent puj=n- /> (n, ng 尾阳声韵)                                                         | <TPopupPujNoAccent puj=l- />                                      |
| 蓝林帘     | <TPopupPujNoAccent puj=l- /> (m 尾阳声韵)                                                             |                                                                   |

@tab 潮阳

| 例字      | 辞典标准音                                                                                             | 转读音                                                               |
|---------|---------------------------------------------------------------------------------------------------|-------------------------------------------------------------------|
| 余       | <TPopupPujNoAccent puj=-ur0 />                                                                    | <TPopupPujNoAccent puj=-u0 />                                     |
| 退^1^    | <TPopupPujNoAccent puj=-or0 />                                                                    | <TPopupPujNoAccent puj=-o0 />                                     |
| 梳       | <TPopupPujNoAccent puj=-eu0 />                                                                    | <TPopupPujNoAccent puj=-iu0 />                                    |
| 买鞋^2^   | <TPopupPujNoAccent puj=-oi0 />                                                                    |                                                                   |
| 反间      | <TPopupPujNoAccent puj=-oinn0 />                                                                  | <TPopupPujNoAccent puj=-ainn0 />                                  |
| 八狭      | <TPopupPujNoAccent puj=-oih0 />                                                                   |                                                                   |
| 县悬^3^   | <TPopupPujNoAccent puj=-uoinn0 />                                                                 | <TPopupPujNoAccent puj=-uainn0 />                                 |
| 乌       | <TPopupPujNoAccent puj=-ou0 />                                                                    |                                                                   |
| 腰阳药     | <TPopupPujNoAccent puj=-io0 />, <TPopupPujNoAccent puj=-ionn0 />, <TPopupPujNoAccent puj=-ioh0 /> |                                                                   |
| 妖跃^4^   | <TPopupPujNoAccent puj=-iau0 />, <TPopupPujNoAccent puj=-iauh0 />                                 |                                                                   |
| 话关划     | <TPopupPujNoAccent puj=-ue0 />, <TPopupPujNoAccent puj=-uenn0 />, <TPopupPujNoAccent puj=-ueh0 /> |                                                                   |
| 英易^5^   | <TPopupPujNoAccent puj=-eng0 />, <TPopupPujNoAccent puj=-ek0 />                                   |                                                                   |
| 音邑      | <TPopupPujNoAccent puj=-im0 />, <TPopupPujNoAccent puj=-ip0 />                                    |                                                                   |
| 因乙      | <TPopupPujNoAccent puj=-in0 />, <TPopupPujNoAccent puj=-it0 />                                    | <TPopupPujNoAccent puj=-ing0 />, <TPopupPujNoAccent puj=-ik0 />   |
| 恩很^6^   | <TPopupPujNoAccent puj=-orn0 />                                                                   | <TPopupPujNoAccent puj=-ing0 />                                   |
| 欣尹      | <TPopupPujNoAccent puj=-urn0 />                                                                   | <TPopupPujNoAccent puj=-ing0 />                                   |
| 隐乞      | <TPopupPujNoAccent puj=-urn0 />, <TPopupPujNoAccent puj=-urt0 />                                  | <TPopupPujNoAccent puj=-ing0 />, <TPopupPujNoAccent puj=-ik0 />   |
| 温熨      | <TPopupPujNoAccent puj=-un0 />, <TPopupPujNoAccent puj=-ut0 />                                    | <TPopupPujNoAccent puj=-ung0 />, <TPopupPujNoAccent puj=-uk0 />   |
| 庵盒      | <TPopupPujNoAccent puj=-am0 />, <TPopupPujNoAccent puj=-ap0 />                                    |                                                                   |
| 安抑      | <TPopupPujNoAccent puj=-an0 />, <TPopupPujNoAccent puj=-at0 />                                    | <TPopupPujNoAccent puj=-ang0 />, <TPopupPujNoAccent puj=-ak0 />   |
| 奄压      | <TPopupPujNoAccent puj=-iam0 />, <TPopupPujNoAccent puj=-iap0 />                                  |                                                                   |
| 嫣设      | <TPopupPujNoAccent puj=-ian0 />, <TPopupPujNoAccent puj=-iat0 />                                  | <TPopupPujNoAccent puj=-iang0 />, <TPopupPujNoAccent puj=-iak0 /> |
| 凡法      | <TPopupPujNoAccent puj=-uam0 />, <TPopupPujNoAccent puj=-uap0 />                                  |                                                                   |
| 弯阅      | <TPopupPujNoAccent puj=-uan0 />, <TPopupPujNoAccent puj=-uat0 />                                  | <TPopupPujNoAccent puj=-uang0 />, <TPopupPujNoAccent puj=-uak0 /> |
| 莹衡      | <TPopupPujNoAccent puj=-ueng0 />                                                                  |                                                                   |
| 获       | <TPopupPujNoAccent puj=-uek0 />                                                                   |                                                                   |
| 饭问      | (双唇音)<TPopupPujNoAccent puj=-ng0 />                                                               |                                                                   |
| 中筑茸辱^7^ | (齿龈音)<TPopupPujNoAccent puj=-iong0 />, <TPopupPujNoAccent puj=-iok0 />                            |                                                                   |
| 万亡文^8^  | <TPopupPujNoAccent puj=bu- />(阳声韵)                                                                |                                                                   |
| 漫闷      | <TPopupPujNoAccent puj=mu- />(阳声韵)                                                                | <TPopupPujNoAccent puj=bu- />                                     |
| 男念      | <TPopupPujNoAccent puj=n- /> (m 尾阳声韵)                                                             |                                                                   |
| 难能      | <TPopupPujNoAccent puj=n- /> (n, ng 尾阳声韵)                                                         |                                                                   |
| 蓝林帘     | <TPopupPujNoAccent puj=l- /> (m 尾阳声韵)                                                             |                                                                   |

@tab 普宁

| 例字      | 辞典标准音                                                                                             | 转读音                                                               |
|---------|---------------------------------------------------------------------------------------------------|-------------------------------------------------------------------|
| 余       | <TPopupPujNoAccent puj=-ur0 />                                                                    |                                                                   |
| 退^1^    | <TPopupPujNoAccent puj=-or0 />                                                                    | <TPopupPujNoAccent puj=-o0 />                                     |
| 梳       | <TPopupPujNoAccent puj=-eu0 />                                                                    | <TPopupPujNoAccent puj=-iu0 />                                    |
| 买鞋^2^   | <TPopupPujNoAccent puj=-oi0 />                                                                    |                                                                   |
| 反间      | <TPopupPujNoAccent puj=-oinn0 />                                                                  | <TPopupPujNoAccent puj=-ainn0 />                                  |
| 八狭      | <TPopupPujNoAccent puj=-oih0 />                                                                   |                                                                   |
| 县悬^3^   | <TPopupPujNoAccent puj=-uoinn0 />                                                                 | <TPopupPujNoAccent puj=-uainn0 />                                 |
| 乌       | <TPopupPujNoAccent puj=-ou0 />                                                                    |                                                                   |
| 腰阳药     | <TPopupPujNoAccent puj=-io0 />, <TPopupPujNoAccent puj=-ionn0 />, <TPopupPujNoAccent puj=-ioh0 /> |                                                                   |
| 妖跃^4^   | <TPopupPujNoAccent puj=-iau0 />, <TPopupPujNoAccent puj=-iauh0 />                                 |                                                                   |
| 话关划     | <TPopupPujNoAccent puj=-ue0 />, <TPopupPujNoAccent puj=-uenn0 />, <TPopupPujNoAccent puj=-ueh0 /> |                                                                   |
| 英易^5^   | <TPopupPujNoAccent puj=-eng0 />, <TPopupPujNoAccent puj=-ek0 />                                   |                                                                   |
| 音邑      | <TPopupPujNoAccent puj=-im0 />, <TPopupPujNoAccent puj=-ip0 />                                    |                                                                   |
| 因乙      | <TPopupPujNoAccent puj=-in0 />, <TPopupPujNoAccent puj=-it0 />                                    | <TPopupPujNoAccent puj=-ing0 />, <TPopupPujNoAccent puj=-ik0 />   |
| 恩很^6^   | <TPopupPujNoAccent puj=-orn0 />                                                                   | <TPopupPujNoAccent puj=-ing0 />                                   |
| 欣尹      | <TPopupPujNoAccent puj=-urn0 />                                                                   | <TPopupPujNoAccent puj=-ing0 />                                   |
| 隐乞      | <TPopupPujNoAccent puj=-urn0 />, <TPopupPujNoAccent puj=-urt0 />                                  | <TPopupPujNoAccent puj=-ing0 />, <TPopupPujNoAccent puj=-ik0 />   |
| 温熨      | <TPopupPujNoAccent puj=-un0 />, <TPopupPujNoAccent puj=-ut0 />                                    | <TPopupPujNoAccent puj=-ung0 />, <TPopupPujNoAccent puj=-uk0 />   |
| 庵盒      | <TPopupPujNoAccent puj=-am0 />, <TPopupPujNoAccent puj=-ap0 />                                    |                                                                   |
| 安抑      | <TPopupPujNoAccent puj=-an0 />, <TPopupPujNoAccent puj=-at0 />                                    | <TPopupPujNoAccent puj=-ang0 />, <TPopupPujNoAccent puj=-ak0 />   |
| 奄压      | <TPopupPujNoAccent puj=-iam0 />, <TPopupPujNoAccent puj=-iap0 />                                  |                                                                   |
| 嫣设      | <TPopupPujNoAccent puj=-ian0 />, <TPopupPujNoAccent puj=-iat0 />                                  | <TPopupPujNoAccent puj=-iang0 />, <TPopupPujNoAccent puj=-iak0 /> |
| 凡法      | <TPopupPujNoAccent puj=-uam0 />, <TPopupPujNoAccent puj=-uap0 />                                  |                                                                   |
| 弯阅      | <TPopupPujNoAccent puj=-uan0 />, <TPopupPujNoAccent puj=-uat0 />                                  | <TPopupPujNoAccent puj=-uang0 />, <TPopupPujNoAccent puj=-uak0 /> |
| 莹衡      | <TPopupPujNoAccent puj=-ueng0 />                                                                  |                                                                   |
| 获       | <TPopupPujNoAccent puj=-uek0 />                                                                   |                                                                   |
| 饭问      | (双唇音)<TPopupPujNoAccent puj=-ng0 />                                                               |                                                                   |
| 中筑茸辱^7^ | (齿龈音)<TPopupPujNoAccent puj=-iong0 />, <TPopupPujNoAccent puj=-iok0 />                            |                                                                   |
| 万亡文^8^  | <TPopupPujNoAccent puj=bu- />(阳声韵)                                                                |                                                                   |
| 漫闷      | <TPopupPujNoAccent puj=mu- />(阳声韵)                                                                |                                                                   |
| 男念      | <TPopupPujNoAccent puj=n- /> (m 尾阳声韵)                                                             |                                                                   |
| 难能      | <TPopupPujNoAccent puj=n- /> (n, ng 尾阳声韵)                                                         |                                                                   |
| 蓝林帘     | <TPopupPujNoAccent puj=l- /> (m 尾阳声韵)                                                             |                                                                   |

@tab 惠来

| 例字      | 辞典标准音                                                                                             | 转读音                                                               |
|---------|---------------------------------------------------------------------------------------------------|-------------------------------------------------------------------|
| 余       | <TPopupPujNoAccent puj=-ur0 />                                                                    | <TPopupPujNoAccent puj=-u0 />                                     |
| 退^1^    | <TPopupPujNoAccent puj=-or0 />                                                                    | <TPopupPujNoAccent puj=-o0 />                                     |
| 梳       | <TPopupPujNoAccent puj=-eu0 />                                                                    | <TPopupPujNoAccent puj=-iu0 />                                    |
| 买鞋^2^   | <TPopupPujNoAccent puj=-oi0 />                                                                    |                                                                   |
| 反间      | <TPopupPujNoAccent puj=-oinn0 />                                                                  | <TPopupPujNoAccent puj=-ainn0 />                                  |
| 八狭      | <TPopupPujNoAccent puj=-oih0 />                                                                   |                                                                   |
| 县悬^3^   | <TPopupPujNoAccent puj=-uoinn0 />                                                                 | <TPopupPujNoAccent puj=-uainn0 />                                 |
| 乌       | <TPopupPujNoAccent puj=-ou0 />                                                                    |                                                                   |
| 腰阳药     | <TPopupPujNoAccent puj=-io0 />, <TPopupPujNoAccent puj=-ionn0 />, <TPopupPujNoAccent puj=-ioh0 /> |                                                                   |
| 妖跃^4^   | <TPopupPujNoAccent puj=-iau0 />, <TPopupPujNoAccent puj=-iauh0 />                                 |                                                                   |
| 话关划     | <TPopupPujNoAccent puj=-ue0 />, <TPopupPujNoAccent puj=-uenn0 />, <TPopupPujNoAccent puj=-ueh0 /> |                                                                   |
| 英易^5^   | <TPopupPujNoAccent puj=-eng0 />, <TPopupPujNoAccent puj=-ek0 />                                   |                                                                   |
| 音邑      | <TPopupPujNoAccent puj=-im0 />, <TPopupPujNoAccent puj=-ip0 />                                    |                                                                   |
| 因乙      | <TPopupPujNoAccent puj=-in0 />, <TPopupPujNoAccent puj=-it0 />                                    | <TPopupPujNoAccent puj=-ing0 />, <TPopupPujNoAccent puj=-ik0 />   |
| 恩很^6^   | <TPopupPujNoAccent puj=-orn0 />                                                                   | <TPopupPujNoAccent puj=-ing0 />                                   |
| 欣尹      | <TPopupPujNoAccent puj=-urn0 />                                                                   | <TPopupPujNoAccent puj=-ing0 />                                   |
| 隐乞      | <TPopupPujNoAccent puj=-urn0 />, <TPopupPujNoAccent puj=-urt0 />                                  | <TPopupPujNoAccent puj=-ing0 />, <TPopupPujNoAccent puj=-ik0 />   |
| 温熨      | <TPopupPujNoAccent puj=-un0 />, <TPopupPujNoAccent puj=-ut0 />                                    | <TPopupPujNoAccent puj=-ung0 />, <TPopupPujNoAccent puj=-uk0 />   |
| 庵盒      | <TPopupPujNoAccent puj=-am0 />, <TPopupPujNoAccent puj=-ap0 />                                    |                                                                   |
| 安抑      | <TPopupPujNoAccent puj=-an0 />, <TPopupPujNoAccent puj=-at0 />                                    | <TPopupPujNoAccent puj=-ang0 />, <TPopupPujNoAccent puj=-ak0 />   |
| 奄压      | <TPopupPujNoAccent puj=-iam0 />, <TPopupPujNoAccent puj=-iap0 />                                  |                                                                   |
| 嫣设      | <TPopupPujNoAccent puj=-ian0 />, <TPopupPujNoAccent puj=-iat0 />                                  | <TPopupPujNoAccent puj=-iang0 />, <TPopupPujNoAccent puj=-iak0 /> |
| 凡法      | <TPopupPujNoAccent puj=-uam0 />, <TPopupPujNoAccent puj=-uap0 />                                  |                                                                   |
| 弯阅      | <TPopupPujNoAccent puj=-uan0 />, <TPopupPujNoAccent puj=-uat0 />                                  | <TPopupPujNoAccent puj=-uang0 />, <TPopupPujNoAccent puj=-uak0 /> |
| 莹衡      | <TPopupPujNoAccent puj=-ueng0 />                                                                  |                                                                   |
| 获       | <TPopupPujNoAccent puj=-uek0 />                                                                   |                                                                   |
| 饭问      | (双唇音)<TPopupPujNoAccent puj=-ng0 />                                                               |                                                                   |
| 中筑茸辱^7^ | (齿龈音)<TPopupPujNoAccent puj=-iong0 />, <TPopupPujNoAccent puj=-iok0 />                            |                                                                   |
| 万亡文^8^  | <TPopupPujNoAccent puj=bu- />(阳声韵)                                                                |                                                                   |
| 漫闷      | <TPopupPujNoAccent puj=mu- />(阳声韵)                                                                | <TPopupPujNoAccent puj=bu- />                                     |
| 男念      | <TPopupPujNoAccent puj=n- /> (m 尾阳声韵)                                                             |                                                                   |
| 难能      | <TPopupPujNoAccent puj=n- /> (n, ng 尾阳声韵)                                                         |                                                                   |
| 蓝林帘     | <TPopupPujNoAccent puj=l- /> (m 尾阳声韵)                                                             |                                                                   |

@tab 陆丰

| 例字      | 辞典标准音                                                                                             | 转读音                                                                                                  |
|---------|---------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------|
| 余       | <TPopupPujNoAccent puj=-ur0 />                                                                    | <TPopupPujNoAccent puj=-u0 />                                                                        |
| 退^1^    | <TPopupPujNoAccent puj=-or0 />                                                                    | <TPopupPujNoAccent puj=-e0 />                                                                        |
| 梳       | <TPopupPujNoAccent puj=-eu0 />                                                                    | <TPopupPujNoAccent puj=-iu0 />                                                                       |
| 买鞋^2^   | <TPopupPujNoAccent puj=-oi0 />                                                                    |                                                                                                      |
| 反间      | <TPopupPujNoAccent puj=-oinn0 />                                                                  | <TPopupPujNoAccent puj=-ainn0 />                                                                     |
| 八狭      | <TPopupPujNoAccent puj=-oih0 />                                                                   |                                                                                                      |
| 县悬^3^   | <TPopupPujNoAccent puj=-uoinn0 />                                                                 | <TPopupPujNoAccent puj=-uainn0 />                                                                    |
| 乌       | <TPopupPujNoAccent puj=-ou0 />                                                                    | <TPopupPujNoAccent puj=-au0 />                                                                       |
| 腰阳药     | <TPopupPujNoAccent puj=-io0 />, <TPopupPujNoAccent puj=-ionn0 />, <TPopupPujNoAccent puj=-ioh0 /> |                                                                                                      |
| 妖跃^4^   | <TPopupPujNoAccent puj=-iau0 />, <TPopupPujNoAccent puj=-iauh0 />                                 |                                                                                                      |
| 话关划     | <TPopupPujNoAccent puj=-ue0 />, <TPopupPujNoAccent puj=-uenn0 />, <TPopupPujNoAccent puj=-ueh0 /> | <TPopupPujNoAccent puj=-uei0 />, <TPopupPujNoAccent puj=-ueinn0 />, <TPopupPujNoAccent puj=-ueih0 /> |
| 英易^5^   | <TPopupPujNoAccent puj=-eng0 />, <TPopupPujNoAccent puj=-ek0 />                                   | <TPopupPujNoAccent puj=-eng0 />, <TPopupPujNoAccent puj=-eh0 />                                      |
| 音邑      | <TPopupPujNoAccent puj=-im0 />, <TPopupPujNoAccent puj=-ip0 />                                    |                                                                                                      |
| 因乙      | <TPopupPujNoAccent puj=-in0 />, <TPopupPujNoAccent puj=-it0 />                                    | <TPopupPujNoAccent puj=-ing0 />, <TPopupPujNoAccent puj=-ih0 />                                      |
| 恩很^6^   | <TPopupPujNoAccent puj=-orn0 />                                                                   | <TPopupPujNoAccent puj=-urng0 />                                                                     |
| 欣尹      | <TPopupPujNoAccent puj=-urn0 />                                                                   | <TPopupPujNoAccent puj=-urng0 />                                                                     |
| 隐乞      | <TPopupPujNoAccent puj=-urn0 />, <TPopupPujNoAccent puj=-urt0 />                                  | <TPopupPujNoAccent puj=-urng0 />, <TPopupPujNoAccent puj=-urh0 />                                    |
| 温熨      | <TPopupPujNoAccent puj=-un0 />, <TPopupPujNoAccent puj=-ut0 />                                    | <TPopupPujNoAccent puj=-ung0 />, <TPopupPujNoAccent puj=-uh0 />                                      |
| 庵盒      | <TPopupPujNoAccent puj=-am0 />, <TPopupPujNoAccent puj=-ap0 />                                    |                                                                                                      |
| 安抑      | <TPopupPujNoAccent puj=-an0 />, <TPopupPujNoAccent puj=-at0 />                                    | <TPopupPujNoAccent puj=-ang0 />, <TPopupPujNoAccent puj=-ah0 />                                      |
| 奄压      | <TPopupPujNoAccent puj=-iam0 />, <TPopupPujNoAccent puj=-iap0 />                                  |                                                                                                      |
| 嫣设      | <TPopupPujNoAccent puj=-ian0 />, <TPopupPujNoAccent puj=-iat0 />                                  | <TPopupPujNoAccent puj=-iang0 />, <TPopupPujNoAccent puj=-iah0 />                                    |
| 凡法      | <TPopupPujNoAccent puj=-uam0 />, <TPopupPujNoAccent puj=-uap0 />                                  |                                                                                                      |
| 弯阅      | <TPopupPujNoAccent puj=-uan0 />, <TPopupPujNoAccent puj=-uat0 />                                  | <TPopupPujNoAccent puj=-uang0 />, <TPopupPujNoAccent puj=-uah0 />                                    |
| 莹衡      | <TPopupPujNoAccent puj=-ueng0 />                                                                  |                                                                                                      |
| 获       | <TPopupPujNoAccent puj=-uek0 />                                                                   | <TPopupPujNoAccent puj=-ueh0 />                                                                      |
| 饭问      | (双唇音)<TPopupPujNoAccent puj=-ng0 />                                                               |                                                                                                      |
| 中筑茸辱^7^ | (齿龈音)<TPopupPujNoAccent puj=-iong0 />, <TPopupPujNoAccent puj=-iok0 />                            | <TPopupPujNoAccent puj=-iong0 />, <TPopupPujNoAccent puj=-ioh0 />                                    |
| 万亡文^8^  | <TPopupPujNoAccent puj=bu- />(阳声韵)                                                                |                                                                                                      |
| 漫闷      | <TPopupPujNoAccent puj=mu- />(阳声韵)                                                                | <TPopupPujNoAccent puj=bu- />                                                                        |
| 男念      | <TPopupPujNoAccent puj=n- /> (m 尾阳声韵)                                                             |                                                                                                      |
| 难能      | <TPopupPujNoAccent puj=n- /> (n, ng 尾阳声韵)                                                         |                                                                                                      |
| 蓝林帘     | <TPopupPujNoAccent puj=l- /> (m 尾阳声韵)                                                             |                                                                                                      |

:::

::: note

1. 该韵母在今天潮州话中仅有少数地区保留，详见[单元音](#单元音)一节的讨论。

2. 为了音系的系统性，本辞典将蟹、山、咸摄二、四等字白读层韵母的元音部分都记为
   oi，即 <TPopupPujNoAccent puj=-oi /> <TPopupPujNoAccent puj=-oinn /> <TPopupPujNoAccent puj=-oih />。
   需要注意的是，阴声韵增生而来的鼻化韵 <TPopupPujNoAccent puj=-ainn /> 各地均读为 <TPopupPujNoAccent puj="ainn3"/>。
3. 该韵母有且仅有三个辖字：
   县 <TPopupPujNoAccent puj="kuoinn7"/>、
   悬 <TPopupPujNoAccent puj="kuoinn5"/>（形容词，高）、悬 <TPopupPujNoAccent puj="huoinn5"/>（动词，挂）、惯 <TPopupPujNoAccent puj="kuoinn3"/>（用于“惯势”一词，习惯），
   在西南部多转读为 <TPopupPujNoAccent puj=-uainn />，在东北部多转读为 <TPopupPujNoAccent puj=-uinn />。
   该韵母来自山摄合口字白读层，为了音系的系统性，与开口字的 <TPopupPujNoAccent puj=-oinn /> 一组相对应，本辞典中记为 <TPopupPujNoAccent puj=-uoinn />。
4. 在 <TPopupPujNoAccent puj=-iau /> <TPopupPujNoAccent puj=-iauh0 /> <TPopupPujNoAccent puj=-iam /> <TPopupPujNoAccent puj=-iap0 /> <TPopupPujNoAccent puj=-ian /> <TPopupPujNoAccent puj=-iat0 /> 等韵母中，元音 a 受韵尾的影响，各地发生不同程度的变化。
   例如 <TPopupPujNoAccent puj=-iam /> 中的 a 在潮州等地的高化为 [ɜ]/[ɤ]，
   在 <TPopupPujNoAccent puj=-ian /> 中又进一步前化为 [e]；
   而 <TPopupPujNoAccent puj=-iau /> 中的 a 在澄海等地则进一步圆唇化为 [o]。
5. 韵母 <TPopupPujNoAccent puj=-eng /> <TPopupPujNoAccent puj=-ek0 /> 来自曾、梗摄文读音，
   泉漳片闽南语各地基本读为 <TPopupPujNoAccent puj=-ing /> <TPopupPujNoAccent puj=-ik0 />，
   丰顺（𨻧隍）地区读为 <TPopupPujNoAccent puj=-en /> <TPopupPujNoAccent puj=-et0 /> 有可能是受客语音系的影响，有待进一步考究。
   潮州话中该韵母的开口度更大，因而大部分地区在 -n/-t 韵尾混入 -ng/-k 后，会形成 <TPopupPujNoAccent puj=-ing /> <TPopupPujNoAccent puj=-ik0 /> 和 <TPopupPujNoAccent puj=-eng /> <TPopupPujNoAccent puj=-ek0 /> 的对立。
   因此，本辞典中不选择与泉漳片一样将 <TPopupPujNoAccent puj=-eng /> <TPopupPujNoAccent puj=-ek0 /> 韵母记为 <TPopupPujNoAccent puj=-ing /> <TPopupPujNoAccent puj=-ik0 />。
   不过，在唱戏、讲古等创作中，<TPopupPujNoAccent puj=-eng /> <TPopupPujNoAccent puj=-ek0 /> 和 <TPopupPujNoAccent puj=-in /> <TPopupPujNoAccent puj=-it0 /> 韵母的韵腹也可以都读为 [ɪ] 并进行押韵。
   揭阳地区的 <TPopupPujNoAccent puj=-in /> <TPopupPujNoAccent puj=-it0 /> 转为 <TPopupPujNoAccent puj=-eng /> <TPopupPujNoAccent puj=-ek0 /> 实际上音质也接近于 [ɪ] 音。
6. 臻摄一等痕韵，以及三等开口欣韵、合口文韵的韵母白读音，多数地区没有区别，例如汕头同读 <TPopupPujNoAccent puj=urng0 />，揭阳同读 <TPopupPujNoAccent puj=eng0 />。
   但是，在潮州府城，声母 h 之后一等字读 <TPopupPujNoAccent puj=hurng0 />（如“痕”“很”“恩”等），三等字读 <TPopupPujNoAccent puj=hng0 />（如“欣”“勋”“殷”等），形成对立；
   并且三等欣韵在影母、以母之后亦形成对立：隐 <TPopupPujNoAccent puj=urng2 />，尹 <TPopupPujNoAccent puj=ng2 />。
   这意味着在潮州话中，这对韵母可能曾有过开口度大小之别。
   辞典标准音分别以 <TPopupPujNoAccent puj=orn0 /> 和 <TPopupPujNoAccent puj=urn0 /> 进行记录，以适配两个音节在潮州的不同音变规则。
   记录时区分方式并不复杂，对于声母为 h 或零声母的字：
   韵母在普通话中读 en [ɤn] 而潮州话可能读 [ɯn]/[ən] 的，记为 <TPopupPujNoAccent puj=orn0 />；
   韵母在普通话中读 in [in] 或 ün [yn] 而潮州话可能读 [ɯn]/[ən] 的，记为 <TPopupPujNoAccent puj=urn0 />。
   因为实际上在各地的口音中，均无 [ɯn]/[ən]（或 [ɯŋ]/[əŋ]）这样仅在元音开口度有区分的对立阳声韵，辞典统一将各地口音的 <TPopupPujNoAccent puj=orn0 /> 转为 <TPopupPujNoAccent puj=urn0 />。
7. 通摄三等字文读音韵母为 <TPopupPujNoAccent puj=-iong />, <TPopupPujNoAccent puj=-iok0 />，当接在齿龈音后时，
   包括三市市中心在内的东北部多数地区都读为 <TPopupPujNoAccent puj=-ong />, <TPopupPujNoAccent puj=-ok />，西南部潮阳、普宁、惠来、陆丰等地则保留介音 i——这是潮普小片或练江腔的标志性读音。
   不过，近年来受普通话以及潮汕三市市中心的强势影响，许多年轻人的发音也已倾向于丢失 i 介音，i 介音保留与否成为了自由变体，本辞典中相关地区口音仍保留该介音。
   例如：中 <TPopupPujNoAccent puj="tiong1"/>，宠 <TPopupPujNoAccent puj="thiong2"/>，龙 <TPopupPujNoAccent puj="liong5"/>，终 <TPopupPujNoAccent puj="tsiong1"/>，
   从 <TPopupPujNoAccent puj="tshiong5"/>，松 <TPopupPujNoAccent puj="siong1"/>，茸 <TPopupPujNoAccent puj="jiong5"/>，
   筑 <TPopupPujNoAccent puj="tiok4"/>，六 <TPopupPujNoAccent puj="liok8"/>，属 <TPopupPujNoAccent puj="siok8"/>，辱 <TPopupPujNoAccent puj="jiok8"/>。
   但有且仅有一组例外：<TPopupPujNoAccent puj="thiok"/> 的辖字（“畜”“蓄”“慉”“搐”等）在东北部地区依然保留介音 i。  
   另外值得一提的是，近年来在潮州湘桥、澄海盐鸿等老派依然保留闭口韵尾的地区，出现了一种丢失闭口韵尾的新派读法 <TPopupPujNoAccent puj="-iam"/> > <TPopupPujNoAccent puj="-iorm"/> > <TPopupPujNoAccent puj="-iong"/>, <TPopupPujNoAccent puj="-iap0"/> > <TPopupPujNoAccent puj="-iorp0"/> > <TPopupPujNoAccent puj="-iok0"/>，因 [a] 元音在介音和韵尾双重影响下实际音值接近 [ə]，而丢失闭口韵后不稳定的中央元音 [ə] 与现有音系中的 [o] 合流，因此，出现了 <TPopupPujNoAccent puj=-iong />, <TPopupPujNoAccent puj=-iok0 /> 的新音节，例如：
   严 <TPopupPujNoAccent puj="ngiam5"/> > <TPopupPujNoAccent puj="ngiong5"/>，
   点 <TPopupPujNoAccent puj="tiam2"/> > <TPopupPujNoAccent puj="tiong2"/>，
   粒 <TPopupPujNoAccent puj="liap8"/> > <TPopupPujNoAccent puj="liok8"/>，
   森 <TPopupPujNoAccent puj="siam1"/> > <TPopupPujNoAccent puj="siong1"/>，
   尖 <TPopupPujNoAccent puj="tsiam1"/> > <TPopupPujNoAccent puj="tsiong1"/>，
   这种模式下产生的介音 i，并非源于中古通摄三等字，不遵循在齿龈音后丢失介音的规则。
8. 微母文读音接阳声韵时，在多数地区读 <TPopupPujNoAccent puj=bu- />，但在饶平（黄冈）一律读为 <TPopupPujNoAccent puj=mu- />，而阴声韵和入声韵则与其他地区相同。
9. 潮剧戏腔要求字正腔圆，整体发音接近于未丢失闭口韵的澄海口音，但偶尔会引入来自其他地区的一些口音进行艺术化处理。
   戏腔中，-n/-t 韵尾与 -ng/-k 韵尾一般不要求区分，是否保留 -n/-t
   取决于演员个人的发音习惯（例如方展荣老师的唱词就保留了 -n/-t），但 -m/-p 韵尾一定会保留。

:::


### 各地声调调值表

潮汕各地的声调，大致可总结为几种类型：

1. 主流调型，包括潮汕三市市中心在内大多数地区的调型。这一类型按照前变调的形式也可以进一步细分：
    1. 汕头、饶平音，变调较为“规矩”，通常每个字只有一套前变调，后字声调不会随前字调整；
    2. 潮州、潮安、揭阳、澄海音，前变调有丰富的变化，第 2、3、4 声根据后字声调的高低，会相应地调整前字的变调，甚至后字的声调也会随之调整，听感上显得更加“连绵”，整体语音语调的起伏变化更小；
    3. 南北两端——潮安北部、饶平北部、普宁流沙、惠来惠城等地的调型，不同与上述两种之处在于：第 1 声前变调为平调，反而单字调末尾带上了升调；第 2 声的前变调是一个低曲折调，而非主流的升调。
2. 潮阳调型，潮阳、潮南、达濠、普宁、惠来等地的调型，即传统意义上的“练江腔”或“潮普小片”，相较于其他各地，最显著的特征是大量的降调。

[//]: # (TODO：使用程序生成声调表)
以下声调调值采用五度标记法。
潮州、戏腔（潮剧腔）、澄海、汕头、揭阳的声调调值经过笔者调查。
其余口音声调调值参考【徐馥琼2010】以及【佐蔵瑾2022】记录。

::: tabs

@tab 潮州^1^

| 例字 | 声调 | 单字调（本调）                                          | 连读变调（前变调）                                                      | 轻声调                              |
|----|----|--------------------------------------------------|----------------------------------------------------------------|----------------------------------|
| 分  | 1  | 33 <TToneLetter v=33 />                          | 23 <TToneLetter sandhi v=23 />                                 | 21 <TToneLetter sandhi v=21 />   |
| 粉  | 2  | 52 <TToneLetter v=52 />, 21 <TToneLetter v=21 /> | 25 <TToneLetter sandhi v=25 />, 23 <TToneLetter sandhi v=23 /> | 212 <TToneLetter sandhi v=212 /> |
| 奋  | 3  | 212 <TToneLetter v=212 />                        | 52 <TToneLetter sandhi v=52 />, 32 <TToneLetter sandhi v=32 /> | 21 <TToneLetter sandhi v=21 />   |
| 忽  | 4  | 2 <TToneLetter v=2 />                            | 5 <TToneLetter sandhi v=5 />, 3 <TToneLetter sandhi v=3 />     | 2 <TToneLetter sandhi v=2 />     |
| 云  | 5  | 55 <TToneLetter v=55 />                          | 212 <TToneLetter sandhi v=212 />                               | 21 <TToneLetter sandhi v=21 />   |
| 混  | 6  | 25 <TToneLetter v=25 />                          | 21 <TToneLetter sandhi v=21 />                                 | 21 <TToneLetter sandhi v=21 />   |
| 份  | 7  | 22 <TToneLetter v=22 />                          | 212 <TToneLetter sandhi v=212 />                               | 22 <TToneLetter sandhi v=22 />   |
| 佛  | 8  | 5 <TToneLetter v=5 />                            | 2 <TToneLetter sandhi v=2 />                                   | 2 <TToneLetter sandhi v=2 />     |

@tab 戏腔^2^

| 例字 | 声调 | 单字调（本调）                                              | 连读变调（前变调）                                                         | 轻声调                              |
|----|----|------------------------------------------------------|-------------------------------------------------------------------|----------------------------------|
| 分  | 1  | 33 <TToneLetter v=33 /> (332 <TToneLetter v=332 />)  | 33 <TToneLetter sandhi v=33 /> (23 <TToneLetter sandhi v=23 />)   | 21 <TToneLetter sandhi v=21 />   |
| 粉  | 2  | 52 <TToneLetter v=52 />, 21 <TToneLetter v=21 />     | 25 <TToneLetter sandhi v=25 />, 23 <TToneLetter sandhi v=23 />    | 212 <TToneLetter sandhi v=212 /> |
| 奋  | 3  | 212 <TToneLetter v=212 />                            | 52 <TToneLetter sandhi v=52 />, 32 <TToneLetter sandhi v=32 />    | 21 <TToneLetter sandhi v=21 />   |
| 忽  | 4  | 2 <TToneLetter v=2 />                                | 5 <TToneLetter sandhi v=5 />, 3 <TToneLetter sandhi v=3 />        | 2 <TToneLetter sandhi v=2 />     |
| 云  | 5  | 55 <TToneLetter v=55 /> (554, <TToneLetter v=554 />) | 22 <TToneLetter sandhi v=22 /> (212 <TToneLetter sandhi v=212 />) | 21 <TToneLetter sandhi v=21 />   |
| 混  | 6  | 25 <TToneLetter v=25 /> (254, <TToneLetter v=254 />) | 21 <TToneLetter sandhi v=21 />                                    | 21 <TToneLetter sandhi v=21 />   |
| 份  | 7  | 22 <TToneLetter v=22 />                              | 21 <TToneLetter sandhi v=22 />                                    | 22 <TToneLetter sandhi v=22 />   |
| 佛  | 8  | 5 <TToneLetter v=5 /> (54 <TToneLetter v=54 />)      | 2 <TToneLetter sandhi v=2 />                                      | 2 <TToneLetter sandhi v=2 />     |

@tab 潮安

| 例字 | 声调 | 单字调（本调）                   | 连读变调（前变调）                        | 轻声调 |
|----|----|---------------------------|----------------------------------|-----|
| 分  | 1  | 334 <TToneLetter v=334 /> | 33 <TToneLetter sandhi v=33 />   |     |
| 粉  | 2  | 52 <TToneLetter v=52 />   | 212 <TToneLetter sandhi v=212 /> |     |
| 奋  | 3  | 212 <TToneLetter v=212 /> | 442 <TToneLetter sandhi v=442 /> |     |
| 忽  | 4  | 2 <TToneLetter v=2 />     | 5 <TToneLetter sandhi v=5 />     |     |
| 云  | 5  | 55 <TToneLetter v=55 />   | 21 <TToneLetter sandhi v=21 />   |     |
| 混  | 6  | 25 <TToneLetter v=25 />   | 21 <TToneLetter sandhi v=21 />   |     |
| 份  | 7  | 22 <TToneLetter v=22 />   | 21 <TToneLetter sandhi v=21 />   |     |
| 佛  | 8  | 5 <TToneLetter v=5 />     | 2 <TToneLetter sandhi v=2 />     |     |

@tab 丰顺

| 例字 | 声调 | 单字调（本调）                                          | 连读变调（前变调）                                                      | 轻声调                              |
|----|----|--------------------------------------------------|----------------------------------------------------------------|----------------------------------|
| 分  | 1  | 33 <TToneLetter v=33 />                          | 23 <TToneLetter sandhi v=23 />                                 | 21 <TToneLetter sandhi v=21 />   |
| 粉  | 2  | 52 <TToneLetter v=52 />, 21 <TToneLetter v=21 /> | 25 <TToneLetter sandhi v=25 />, 23 <TToneLetter sandhi v=23 /> | 212 <TToneLetter sandhi v=212 /> |
| 奋  | 3  | 212 <TToneLetter v=212 />                        | 52 <TToneLetter sandhi v=52 />, 32 <TToneLetter sandhi v=32 /> | 21 <TToneLetter sandhi v=21 />   |
| 忽  | 4  | 2 <TToneLetter v=2 />                            | 5  <TToneLetter sandhi v=5 />, 3 <TToneLetter sandhi v=3 />    | 2 <TToneLetter sandhi v=2 />     |
| 云  | 5  | 55 <TToneLetter v=55 />                          | 212 <TToneLetter sandhi v=212 />                               | 21 <TToneLetter sandhi v=21 />   |
| 混  | 6  | 25 <TToneLetter v=25 />                          | 21 <TToneLetter sandhi v=21 />                                 | 21 <TToneLetter sandhi v=21 />   |
| 份  | 7  | 22 <TToneLetter v=22 />                          | 212 <TToneLetter sandhi v=212 />                               | 22 <TToneLetter sandhi v=22 />   |
| 佛  | 8  | 5 <TToneLetter v=5 />                            | 2 <TToneLetter sandhi v=2 />                                   | 2 <TToneLetter sandhi v=2 />     |

@tab 饶平

| 例字 | 声调 | 单字调（本调）                   | 连读变调（前变调）                      | 轻声调                              |
|----|----|---------------------------|--------------------------------|----------------------------------|
| 分  | 1  | 33 <TToneLetter v=33 />   | 33 <TToneLetter sandhi v=33 /> | 21 <TToneLetter sandhi v=21 />   |
| 粉  | 2  | 52 <TToneLetter v=52 />   | 25 <TToneLetter sandhi v=25 /> | 212 <TToneLetter sandhi v=212 /> |
| 奋  | 3  | 212 <TToneLetter v=212 /> | 55 <TToneLetter sandhi v=55 /> | 21 <TToneLetter sandhi v=21 />   |
| 忽  | 4  | 2 <TToneLetter v=2 />     | 5 <TToneLetter sandhi v=5 />   | 2 <TToneLetter sandhi v=2 />     |
| 云  | 5  | 55 <TToneLetter v=55 />   | 22 <TToneLetter sandhi v=22 /> | 21 <TToneLetter sandhi v=21 />   |
| 混  | 6  | 25 <TToneLetter v=25 />   | 21 <TToneLetter sandhi v=21 /> | 21 <TToneLetter sandhi v=21 />   |
| 份  | 7  | 22 <TToneLetter v=22 />   | 21 <TToneLetter sandhi v=21 /> | 21 <TToneLetter sandhi v=21 />   |
| 佛  | 8  | 5 <TToneLetter v=5 />     | 2 <TToneLetter sandhi v=2 />   | 2 <TToneLetter sandhi v=2 />     |

@tab 澄海

| 例字 | 声调 | 单字调（本调）                                          | 连读变调（前变调）                                                                                       | 轻声调                              |
|----|----|--------------------------------------------------|-------------------------------------------------------------------------------------------------|----------------------------------|
| 分  | 1  | 33 <TToneLetter v=33 />                          | 23 <TToneLetter sandhi v=23 />                                                                  | 21 <TToneLetter sandhi v=21 />   |
| 粉  | 2  | 52 <TToneLetter v=52 />, 21 <TToneLetter v=21 /> | 25 <TToneLetter sandhi v=25 />, 23 <TToneLetter sandhi v=23 />                                  | 212 <TToneLetter sandhi v=212 /> |
| 奋  | 3  | 212 <TToneLetter v=212 />                        | 52 <TToneLetter sandhi v=52 /> (25 <TToneLetter sandhi v=25 />), 32 <TToneLetter sandhi v=32 /> | 21 <TToneLetter sandhi v=21 />   |
| 忽  | 4  | 2 <TToneLetter v=2 />                            | 5  <TToneLetter sandhi v=5 />, 3 <TToneLetter sandhi v=3 />                                     | 2 <TToneLetter sandhi v=2 />     |
| 云  | 5  | 55 <TToneLetter v=55 />                          | 212 <TToneLetter sandhi v=212 />                                                                | 21 <TToneLetter sandhi v=21 />   |
| 混  | 6  | 25 <TToneLetter v=25 />                          | 21 <TToneLetter sandhi v=21 />                                                                  | 21 <TToneLetter sandhi v=21 />   |
| 份  | 7  | 22 <TToneLetter v=22 />                          | 212 <TToneLetter sandhi v=212 />                                                                | 22 <TToneLetter sandhi v=22 />   |
| 佛  | 8  | 5 <TToneLetter v=5 />                            | 2 <TToneLetter sandhi v=2 />                                                                    | 2 <TToneLetter sandhi v=2 />     |

@tab 汕头

| 例字 | 声调 | 单字调（本调）                   | 连读变调（前变调）                      | 轻声调                              |
|----|----|---------------------------|--------------------------------|----------------------------------|
| 分  | 1  | 33 <TToneLetter v=33 />   | 33 <TToneLetter sandhi v=33 /> | 21 <TToneLetter sandhi v=21 />   |
| 粉  | 2  | 52 <TToneLetter v=52 />   | 25 <TToneLetter sandhi v=25 /> | 212 <TToneLetter sandhi v=212 /> |
| 奋  | 3  | 212 <TToneLetter v=212 /> | 55 <TToneLetter sandhi v=55 /> | 21 <TToneLetter sandhi v=21 />   |
| 忽  | 4  | 2 <TToneLetter v=2 />     | 5 <TToneLetter sandhi v=5 />   | 2 <TToneLetter sandhi v=2 />     |
| 云  | 5  | 55 <TToneLetter v=55 />   | 22 <TToneLetter sandhi v=22 /> | 21 <TToneLetter sandhi v=21 />   |
| 混  | 6  | 25 <TToneLetter v=25 />   | 21 <TToneLetter sandhi v=21 /> | 21 <TToneLetter sandhi v=21 />   |
| 份  | 7  | 22 <TToneLetter v=22 />   | 21 <TToneLetter sandhi v=21 /> | 22 <TToneLetter sandhi v=22 />   |
| 佛  | 8  | 5 <TToneLetter v=5 />     | 2 <TToneLetter sandhi v=2 />   | 2 <TToneLetter sandhi v=2 />     |

@tab 揭阳

| 例字 | 声调 | 单字调（本调）                                          | 连读变调（前变调）                                                      | 轻声调                              |
|----|----|--------------------------------------------------|----------------------------------------------------------------|----------------------------------|
| 分  | 1  | 33 <TToneLetter v=33 />                          | 33 <TToneLetter sandhi v=33 />                                 | 22 <TToneLetter sandhi v=22 />   |
| 粉  | 2  | 52 <TToneLetter v=52 />, 21 <TToneLetter v=21 /> | 25 <TToneLetter sandhi v=25 />, 23 <TToneLetter sandhi v=23 /> | 212 <TToneLetter sandhi v=212 /> |
| 奋  | 3  | 212 <TToneLetter v=212 />                        | 52 <TToneLetter sandhi v=52 />, 32 <TToneLetter sandhi v=32 /> | 21 <TToneLetter sandhi v=21 />   |
| 忽  | 4  | 2 <TToneLetter v=2 />                            | 5 <TToneLetter sandhi v=5 />, 3 <TToneLetter sandhi v=3 />     | 2 <TToneLetter sandhi v=2 />     |
| 云  | 5  | 55 <TToneLetter v=55 />                          | 212 <TToneLetter sandhi v=212 />                               | 22 <TToneLetter sandhi v=22 />   |
| 混  | 6  | 25 <TToneLetter v=25 />                          | 21 <TToneLetter sandhi v=21 />                                 | 21 <TToneLetter sandhi v=21 />   |
| 份  | 7  | 22 <TToneLetter v=22 />                          | 212 <TToneLetter sandhi v=212 />                               | 21 <TToneLetter sandhi v=21 />   |
| 佛  | 8  | 5 <TToneLetter v=5 />                            | 2 <TToneLetter sandhi v=2 />                                   | 2 <TToneLetter sandhi v=2 />     |

@tab 潮阳^3^

| 例字 | 声调 | 单字调（本调）                                           | 连读变调（前变调）                        | 轻声调                               |
|----|----|---------------------------------------------------|----------------------------------|-----------------------------------|
| 分  | 1  | 21 <TToneLetter v=21 />                           | 21 <TToneLetter sandhi v=21 />   | 332  <TToneLetter sandhi v=332 /> |
| 粉  | 2  | 45 <TToneLetter v=45 />                           | 52 <TToneLetter sandhi v=52 />   | 32 <TToneLetter sandhi v=32 />    |
| 奋  | 3  | 41 <TToneLetter v=41 /> (52 <TToneLetter v=52 />) | 33 <TToneLetter sandhi v=33 />   | 332  <TToneLetter sandhi v=332 /> |
| 忽  | 4  | 2 <TToneLetter v=2 />                             | 5 <TToneLetter sandhi v=5 />     | 2 <TToneLetter sandhi v=2 />      |
| 云  | 5  | 33 <TToneLetter v=33 />                           | 332 <TToneLetter sandhi v=332 /> | 332  <TToneLetter sandhi v=332 /> |
| 混  | 6  | 52 <TToneLetter v=52 />                           | 32 <TToneLetter sandhi v=32 />   | 332  <TToneLetter sandhi v=332 /> |
| 份  | 7  | 332 <TToneLetter v=332 />                         | 21 <TToneLetter sandhi v=21 />   | 332  <TToneLetter sandhi v=332 /> |
| 佛  | 8  | 5 <TToneLetter v=5 />                             | 3 <TToneLetter sandhi v=3 />     | 2 <TToneLetter sandhi v=2 />      |

@tab 普宁

| 例字 | 声调 | 单字调（本调）                   | 连读变调（前变调）                        | 轻声调 |
|----|----|---------------------------|----------------------------------|-----|
| 分  | 1  | 335 <TToneLetter v=335 /> | 33 <TToneLetter sandhi v=33 />   |     |
| 粉  | 2  | 52 <TToneLetter v=52 />   | 212 <TToneLetter sandhi v=212 /> |     |
| 奋  | 3  | 212 <TToneLetter v=212 /> | 55 <TToneLetter sandhi v=55 />   |     |
| 忽  | 4  | 32 <TToneLetter v=32 />   | 54 <TToneLetter sandhi v=54 />   |     |
| 云  | 5  | 44 <TToneLetter v=44 />   | 31 <TToneLetter sandhi v=31 />   |     |
| 混  | 6  | 25 <TToneLetter v=25 />   | 33 <TToneLetter sandhi v=33 />   |     |
| 份  | 7  | 31 <TToneLetter v=31 />   | 33 <TToneLetter sandhi v=33 />   |     |
| 佛  | 8  | 54 <TToneLetter v=54 />   | 32 <TToneLetter sandhi v=32 />   |     |

@tab 惠来^4^

| 例字 | 声调 | 单字调（本调）                   | 连读变调（前变调）                        | 轻声调 |
|----|----|---------------------------|----------------------------------|-----|
| 分  | 1  | 24 <TToneLetter v=24 />   | 33 <TToneLetter sandhi v=33 />   |     |
| 粉  | 2  | 552 <TToneLetter v=552 /> | 213 <TToneLetter sandhi v=213 /> |     |
| 奋  | 3  | 31 <TToneLetter v=31 />   | 44 <TToneLetter sandhi v=44 />   |     |
| 忽  | 4  | 21 <TToneLetter v=21 />   | 43 <TToneLetter sandhi v=43 />   |     |
| 云  | 5  | 44 <TToneLetter v=44 />   | 31 <TToneLetter sandhi v=31 />   |     |
| 混  | 6  | 213 <TToneLetter v=213 /> | 33 <TToneLetter sandhi v=33 />   |     |
| 份  | 7  | 31 <TToneLetter v=31 />   | 33 <TToneLetter sandhi v=33 />   |     |
| 佛  | 8  | 43 <TToneLetter v=43 />   | 21 <TToneLetter sandhi v=21 />   |     |

@tab 陆丰

| 例字 | 声调 | 单字调（本调）                   | 连读变调（前变调）                      | 轻声调 |
|----|----|---------------------------|--------------------------------|-----|
| 分  | 1  | 334 <TToneLetter v=334 /> | 33 <TToneLetter sandhi v=33 /> |     |
| 粉  | 2  | 552 <TToneLetter v=552 /> | 24 <TToneLetter sandhi v=24 /> |     |
| 奋  | 3  | 212 <TToneLetter v=212 /> | 55 <TToneLetter sandhi v=55 /> |     |
| 忽  | 4  | 3 <TToneLetter v=3 />     | 5 <TToneLetter sandhi v=5 />   |     |
| 云  | 5  | 55 <TToneLetter v=55 />   | 31 <TToneLetter sandhi v=31 /> |     |
| 混  | 6  | 24 <TToneLetter v=24 />   | 33 <TToneLetter sandhi v=33 /> |     |
| 份  | 7  | 41 <TToneLetter v=41 />   | 33 <TToneLetter sandhi v=33 /> |     |
| 佛  | 8  | 5 <TToneLetter v=5 />     | 3 <TToneLetter sandhi v=3 />   |     |

:::

::: note

1. 在潮州、澄海、揭阳等地，2、3、4 声三个声调根据前后字声调高低发生相应变化：
    - 二字词组中，如果后字的单字调起调较高（2 声 <TToneLetter v=52 />，5 声 <TToneLetter v=55 />，8 声 <TToneLetter v=5 />），
      则 2、3、4 声前变调对应使用音高较高的一组（2 声 <TToneLetter sandhi v=25 />，3 声 <TToneLetter sandhi v=52 />，4 声  <TToneLetter sandhi v=5 />），
      否则前变调对应使用音高较低的一组（2 声 <TToneLetter sandhi v=23 />，3 声 <TToneLetter sandhi v=32 />，4 声 <TToneLetter sandhi v=3 />）。
      例如：
      粉色 <TToneLetter sandhi v=23 /> <TToneLetter v=2 />，粉红 <TToneLetter sandhi v=25 /> <TToneLetter v=55 />；
      色素 <TToneLetter sandhi v=3 /> <TToneLetter v=212 />，色泽 <TToneLetter sandhi v=5 /> <TToneLetter v=5 />；
      照样 <TToneLetter sandhi v=32 /> <TToneLetter v=22 />，照常 <TToneLetter sandhi v=52 /> <TToneLetter v=55 />。
    - 二字词组中，2 声如果是后一个字，且其前字为 2、3、4 声，则后字 2 声会变为一个低降调 <TToneLetter v=21 />，前字相应使用较高的一组变调。
      例如：
      火腿 <TToneLetter sandhi v=25 /> <TToneLetter v=21 />；
      政委 <TToneLetter sandhi v=52 /> <TToneLetter v=21 />；
      得手 <TToneLetter sandhi v=5 /> <TToneLetter v=21 />。
    - 三字词组中，如果第 1 个字是 2、3、4 声，不管后面的字声调如何，它总是使用较低的一组变调；后两个字的变调规律则与一般的二字词组相同。
      例如：
      气气死 <TToneLetter sandhi v=32 /> <TToneLetter sandhi v=52 /> <TToneLetter v=21 />；
      拭拭白 <TToneLetter sandhi v=3 /> <TToneLetter sandhi v=5 /> <TToneLetter v=5 />；
      走走无 <TToneLetter sandhi v=23 />  <TToneLetter sandhi v=25 /> <TToneLetter v=55 />。
    - 三字以上的词组，除了读单字调的字的前一个字（即一个连调单位的倒数第二个字），其他的前变调一律取较低的一组。
      例如：
      一九九九 <TToneLetter sandhi v=3 /> <TToneLetter sandhi v=23 /> <TToneLetter sandhi v=25 /> <TToneLetter v=21 />，
      三点一四一五九 <TToneLetter sandhi v=23 /> <TToneLetter sandhi v=23 /> <TToneLetter sandhi v=3 /> <TToneLetter sandhi v=32 /> <TToneLetter sandhi v=3 /> <TToneLetter sandhi v=21 /> <TToneLetter v=52 />。
    - 澄海地区在 3 声 + 2 声的组合中，3 声的前变调可以是降调，也可以变为升调，两种前变调是自由变体。
      例如：
      奋起 <TToneLetter sandhi v=52 /> <TToneLetter v=21 /> 或 <TToneLetter sandhi v=25 /> <TToneLetter v=21 />。

2. 潮剧戏腔要求字正腔圆，1 声的前变调通常保持平声，但语速较快时可能带上曲折；5 声
   前变调语速较慢时必须保持平声，在念白语速较快时可以带上曲折。此外，1、5、6、8 声在念单字拖长音时，出于艺术化处理的考虑，有可能带上一个降调。
3. 潮阳新派已经将 3、6 声两个单字调混同，但在变调中依然可区分。
4. 惠来已将 3、7 声两个单字调混同，但在变调中依然可区分。

:::

## 常见自由变体

## 各地口音规则

## 各地口音调值

## 典型例字表
