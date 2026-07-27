# IdeaDianping · 灵感粉碎机

把你的 Idea 交给三位性格不同的 AI 锐评官：同时开麦、独立打分，再给出一份可以继续行动的最终审判。

> **v0.1.0 · Hackathon Edition**
>
> 发布时间：2026.7.26 16:00

## 核心功能

- 输入 1–300 字的 Idea，三位 AI 锐评官并发生成评论。
- 实时计算平均分，并显示五档短判词。
- 汇总三人观点，生成最终判词、共识风险和下一步行动。
- 收藏、丢弃和管理本机 Idea，支持个人页与永久删除。
- 下载 1080 × 1350 PNG 锐评卡，方便分享。

## 锐评官

- **Leo｜00 后互联网嘴替**：关注第一眼爽点和真实用户反应。
- **Victor｜双面评论家**：在挑剔风投与哲学家 / 诗人之间切换。
- **Alex｜15 年老程序员**：关注技术边界、数据质量和维护成本。

## 版本说明

相比最初的概念原型，v0.1.0 已经完成：

- 从假手机演示壳改为正常的响应式网页。
- 接入 DeepSeek API，跑通“输入 → 三人锐评 → 最终审判”的完整流程。
- 增加个人页、收藏夹、垃圾桶和锐评卡下载。
- 优化首页、审判团、评论卡和操作按钮的排版与交互。

## 本地运行

需要 Node.js 20+。

```bash
npm install
npm run dev
```

打开终端显示的本地网址。不要直接双击 `index.html`。

## Cloudflare Pages 部署

```text
Build command: npm run build
Build output directory: dist/client
```

在 Cloudflare Pages 的 `Variables and Secrets` 中添加：

```text
DEEPSEEK_API_KEY=<你的 DeepSeek API Key>
```

不要把真实 API Key 写进代码或提交到 GitHub。

## 技术栈

React 19 · TypeScript · Vite · Cloudflare Pages Functions · DeepSeek API · localStorage

完整产品背景见 [MVP Spec](./IdeaDianping-MVP-Spec.md)。
