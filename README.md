# IdeaDianping · 灵感粉碎机

把创业点子变成一家“店”，再让三位性格完全不同的 AI 探店博主从资本、工程和真实用户三个角度打分、毒评，并给出下一步真人验证任务。

![IdeaDianping 移动端首页](./qa-page-v1.png)

## 这一版能做什么

- 在移动端首页输入 12–300 字的创业点子。
- 提交后进入店铺详情页，三张评论卡独立到达并实时更新平均分。
- 查看硅谷风投、暴躁程序员、00 后用户三种固定人格的结构化锐评。
- 点击 `@Idea 总结一下`，得到最终判词、三项共识风险和 48 小时真人验证任务。
- 将点子存入收藏夹或扔进垃圾桶；状态保存在当前浏览器的 `localStorage` 中。
- 打开六个预制热门 Idea，快速稳定地演示完整详情页。
- 在 iPhone 与 Pixel 10 设备框中预览；界面优先适配手机。

## 当前限制

这是黑客松前端原型。三位评论员和最终总结目前使用定时器与真实感 mock 文案模拟，尚未连接 LLM 服务端；个人中心也只保留入口提示。代码中已经标注未来替换位置，下一步应将三个定时任务分别换成安全的 `/api/review` 请求，再将总结换成 `/api/summary`。API Key 不应放进前端。

## 本地运行

需要 Node.js 20+。

```bash
npm install
npm run dev -- --host 0.0.0.0 --port 4173 --strictPort
```

浏览器打开 `http://localhost:4173/`。

## 验证命令

```bash
npm run check:runtime
npm run build
npm run test:sites
```

## 主要文件

```text
src/Prototype.tsx              产品数据、页面、评论流与本地状态
src/prototype.css              移动端视觉与交互状态
public/assets/reviewers/       三位固定评论员头像
IdeaDianping-MVP-Spec.md       产品、交互与技术规格
design-qa.md                   视觉与主流程验收记录
AGENTS.md                      移动端原型运行时约束
```

模板运行时文件负责手机设备框、状态栏、模拟键盘与滚动物理，业务开发优先修改 `src/Prototype.tsx` 和 `src/prototype.css`。

## 产品原则

IdeaDianping 不是市场调查，也不会输出虚假的“创业成功率”。它的目标是用有节目效果的方式快速暴露假设，并把娱乐性的锐评落到一个可以在 48 小时内执行的真人验证动作上。

完整背景、角色协议、异常策略与 24 小时排期见 [MVP Spec](./IdeaDianping-MVP-Spec.md)。
