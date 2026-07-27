# IdeaDianping · 灵感粉碎机

IdeaDianping 是一个有节目效果的 Idea 验证工具：把不方便问朋友的想法交给三位性格不同的 AI 锐评官，让它们同时开麦、独立打分，最后给出一份可以继续行动的审判结果。

> 当前版本：**v0.1.0 · Hackathon Edition**
>
> 这是 24 小时黑客松的完整 MVP 交付版。项目会继续迭代，但本版本作为第一条可运行、可部署、可完整演示的基线保留。

## 为什么做它

向亲友讲创业点子时，我们经常只能收到照顾情绪的回答；传统 AI 验证工具又很容易产出千篇一律的 SWOT 报告。IdeaDianping 希望把严肃的假设检验做得更直接、更好玩：不假装替用户完成市场调研，而是用三种互相冲突的视角，尽快暴露一个想法最值得验证的地方。

## 当前体验

1. 在首页输入 **1–300 字**的 Idea，也可以打开推荐 Idea 体验完整流程。
2. 三位 AI 锐评官并发生成评论，卡片独立返回，单个失败可以单独重试。
3. 页面实时计算平均分，并显示“夯爆了 / 顶级 / 人上人 / NPC / 拉完了”五档短判词。
4. 用户主动点击总结后，获得最终判词、三项共识风险和“下一步行动”。
5. 可以收藏、取消收藏、丢进垃圾桶、恢复或永久删除本机记录。
6. 可以下载包含 Idea、评分、三条短评和最终判词的 **1080 × 1350 PNG 锐评卡**。
7. 个人页集中展示全部 Idea、收藏夹和垃圾桶，数量会随操作立即更新。

## 三位锐评官

- **Leo｜00 后互联网嘴替**：没有耐心、擅长网络梗，从第一眼爽点和真实用户反应出发。
- **Victor｜双面评论家**：面对创业型 Idea 时切换为挑剔风投，面对生活型 Idea 时切换为哲学家 / 诗人。
- **Alex｜15 年老程序员**：关注技术边界、数据质量、维护成本和那些 Demo 之后才会出现的坑。

如果用户描述的正是 IdeaDianping 本身，系统会触发一个隐藏彩蛋：三位锐评官保留各自身份和语气，但都会给出 5 星并疯狂夸赞。普通 Idea 不受影响。

## v0.1.0 · Hackathon Edition

发布时间：**2026.7.26 16:00**

这一版完成了从“能展示概念”到“能跑完整闭环”的升级：

- 接通 DeepSeek 对话 API，评论与总结都通过 Cloudflare Pages Functions 在服务端调用。
- 完成首页、Idea 详情、并发锐评、最终审判、收藏 / 垃圾桶、个人页和导出卡片的完整流程。
- 从早期的 iPhone / Pixel 假手机演示壳，调整为用户可以直接滚动、输入和点击的正常响应式网页；仍然坚持移动端优先，并增加平板和桌面布局。
- 首页从大段产品说明改为轮播打字标题、紧凑输入区、三步流程和三位头像并排的审判团介绍。
- 收藏与垃圾桶按钮移动到最终审判卡下方，状态互斥，并补齐取消收藏、恢复和永久删除逻辑。
- 评论卡只保留角色评分与核心锐评，把共识风险和后续行动统一交给最终审判，减少重复信息。
- 推荐 Idea 统一使用真实的三位 AI 锐评数量，不再展示无法对应详情页的虚构热度。
- 增加五档短判词、PNG 锐评卡下载和 IdeaDianping 自夸彩蛋。

### 和最初原型相比

| 最初原型 | v0.1.0 Hackathon Edition |
| --- | --- |
| 假手机设备框、状态栏和模拟键盘 | 正常响应式网页，不再显示手机壳、系统状态栏或键盘占位 |
| 更像静态 App 概念演示 | 首页 → 三人锐评 → 最终审判 → 用户动作的完整闭环 |
| 偏重“店铺 / 探店”隐喻 | 保留大众点评式信息结构，但文案转向“热议 / 锐评 / 审判” |
| 预制内容和本地效果为主 | 生产环境接入真实 DeepSeek API，并支持失败重试 |
| 没有可管理的用户记录 | 增加本机个人页、收藏夹、垃圾桶与永久删除 |
| 结果只能留在页面里 | 可以导出适合分享的 1080 × 1350 锐评卡 |

## 技术结构

- **前端**：React 19、TypeScript、Vite
- **部署**：Cloudflare Pages
- **服务端接口**：Cloudflare Pages Functions
- **AI**：DeepSeek Chat Completions API
- **本地数据**：浏览器 `localStorage`
- **图片导出**：浏览器 Canvas，无额外服务端接口

生产环境通过 `/api/review` 和 `/api/summary` 请求 DeepSeek。API Key 只保存在 Cloudflare 的加密环境变量中，不会进入浏览器或 GitHub。三位评论员并发、独立返回；最终总结只在用户点击按钮后请求，避免不必要的 API 消耗。

本地 `npm run dev` 默认使用快速 mock，方便零成本调试界面；生产构建会调用真实 API。当前匿名 Idea、评论、总结和状态都保存在当前浏览器的 `localStorage` 中，因此不会跨浏览器或跨设备同步。

## 本地运行

需要 Node.js 20+。

```bash
npm install
npm run dev -- --host 0.0.0.0 --port 4173 --strictPort
```

浏览器打开 `http://localhost:4173/`。不要直接双击 `index.html`：项目需要 Vite 处理 TypeScript、React 模块和资源路径，使用 `file://` 打开会白屏。

## Cloudflare Pages 部署

Cloudflare Pages 连接本仓库后使用：

```text
Build command: npm run build
Build output directory: dist/client
```

然后进入：

`Workers & Pages → IdeaDianping → Settings → Variables and Secrets`

添加加密 Secret：

```text
DEEPSEEK_API_KEY=<你的 DeepSeek API Key>
```

如果 Preview 和 Production 都需要真实 AI，请分别配置。保存后重新部署，Cloudflare 会自动发现仓库根目录下的 `functions/`。

不要把真实 Key 写进 `.env`、`.dev.vars`、前端代码、README 或 GitHub；`.env.example` 只能保留变量名占位。

## 验证命令

```bash
npm run test:api
npm run test:sites
npm run build
```

仓库仍保留早期假手机模板的 `npm run check:runtime` 完整性脚本。由于当前版本已经主动修改相关运行时、移除手机壳，它不再是发布验收项；`prebuild` 会明确跳过这条旧校验。

## 主要文件

```text
src/Prototype.tsx              页面、产品数据、评论流、导出与本地状态
src/prototype.css              IdeaDianping 的视觉与响应式布局
src/mobile/                    页面栈和 Bottom Sheet 等内部交互工具
functions/api/review.js        三位 AI 锐评官的服务端接口与 Prompt
functions/api/summary.js       最终审判的服务端接口
tests/api-functions.test.mjs   API 校验、异常处理和密钥隔离测试
tests/sites-worker.test.mjs    Cloudflare 站点产物与路由测试
public/assets/reviewers/       三位锐评官头像
IdeaDianping-MVP-Spec.md       最初的产品、交互与技术规格
design-qa.md                   视觉与主流程验收记录
```

`src/mobile/` 是早期移动端原型留下的目录名，目前仍提供页面导航和弹层所需的内部能力，但线上界面已经不再展示假手机边框、状态栏、系统键盘或底部 Home Indicator。

## 当前边界与后续方向

- 暂无真实登录，个人页数据只属于当前浏览器。
- 暂未接入 Supabase，团队分析和跨设备同步仍是后续工作。
- 早期假手机运行时目录和完整性脚本尚未彻底清理，当前只保留页面栈、弹层等仍在使用的内部能力。
- AI 锐评是观点与假设压力测试，不代表真实市场调查或创业成功率。
- 后续可以继续加入匿名数据分析、账号同步、Prompt 实验、更多语言和社区化 Idea 发现机制。

IdeaDianping 的目标不是替用户证明一个想法一定成功，而是让一个模糊点子更快变成下一步可以验证的行动。

完整的最初背景、角色协议和 24 小时排期见 [MVP Spec](./IdeaDianping-MVP-Spec.md)。部分界面与交互已在开发过程中演进，以本 README 和当前代码为准。
