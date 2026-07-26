import {
  ArrowLeftIcon,
  BookmarkFilledIcon,
  BookmarkIcon,
  ChatBubbleIcon,
  CheckCircledIcon,
  ChevronRightIcon,
  LightningBoltIcon,
  MagicWandIcon,
  PersonIcon,
  Share2Icon,
  StarFilledIcon,
  StarIcon,
  TrashIcon,
  UpdateIcon,
} from "@radix-ui/react-icons";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  BottomSheet,
  FlowStack,
  MobileScroll,
  type FlowControls,
  type FlowScreen,
} from "./mobile";

type PersonaId = "vc" | "engineer" | "genz";
type IdeaStatus = "active" | "saved" | "trashed";

type Review = {
  reviewerId: PersonaId;
  stars: number;
  reactionTag: string;
  review: string;
  fatalFlaw: string;
  nextTest: string;
};

type Summary = {
  verdict: "SAVE" | "PIVOT" | "TRASH";
  verdictLabel: string;
  oneLine: string;
  consensusRisks: string[];
  test48h: string;
};

type Idea = {
  id: string;
  name: string;
  description: string;
  tags: string[];
  buzz: string;
  reviews?: Review[];
  summary?: Summary;
  status?: IdeaStatus;
  createdAt?: string;
};

type StoredIdea = Idea & { status: IdeaStatus; createdAt: string };

const IDEA_STORAGE_KEY = "ideadianping:ideas:v1";
const STORAGE_EVENT = "ideadianping:ideas-changed";
const personaIds: PersonaId[] = ["vc", "engineer", "genz"];

const personaMeta: Record<PersonaId, { name: string; subtitle: string; avatar: string; tone: string }> = {
  vc: {
    name: "Victor 钱",
    subtitle: "硅谷风投 · 只投下一个宇宙",
    avatar: "/assets/reviewers/vc.png",
    tone: "vc",
  },
  engineer: {
    name: "老周不想改 Bug",
    subtitle: "资深程序员 · 工龄 14 年",
    avatar: "/assets/reviewers/engineer.png",
    tone: "engineer",
  },
  genz: {
    name: "互联网活人小唐",
    subtitle: "00 后用户 · 3 秒没爽就卸载",
    avatar: "/assets/reviewers/genz.png",
    tone: "genz",
  },
};

const sampleIdeas: Idea[] = [
  {
    id: "breakup-ai",
    name: "AI 代写分手短信",
    description: "输入你们的聊天记录，让 AI 帮你写一条体面、坚定、还能避免复合的分手短信。",
    tags: ["AI", "情感", "效率工具"],
    buzz: "体面是挺体面，就是对象可能想连你和 AI 一起拉黑。",
    reviews: [
      {
        reviewerId: "vc",
        stars: 1,
        reactionTag: "复购率感人",
        review: "一次性需求、客单价接近一杯豆浆、获客还得蹭情感区流量。你把最难的用户信任问题外包给模型，却没解释谁会为这份尴尬买单。",
        fatalFlaw: "需求存在，但发生频率和付费意愿都太低。",
        nextTest: "在校园墙发 20 个付费名额，先看有没有 3 个人愿意付 9.9 元。",
      },
      {
        reviewerId: "engineer",
        stars: 2,
        reactionTag: "隐私雷区蹦迪",
        review: "聊天记录一上传，隐私、脱敏、上下文长度、截图 OCR 全来开会。最后模型漏看一句反讽，用户回头说你毁了他的人生，工单由谁接？",
        fatalFlaw: "高隐私数据与不可控生成结果叠在一起，责任边界很难讲清。",
        nextTest: "先只收结构化问答，不上传聊天记录，比较用户是否仍觉得结果有用。",
      },
      {
        reviewerId: "genz",
        stars: 5,
        reactionTag: "缺德但想转发",
        review: "救命，这东西我不会承认自己用过，但我一定发宿舍群让全寝室试。最好再加一个“已读不回终结者”模式，节目效果直接拉满。",
        fatalFlaw: "好玩大于刚需，用户可能只薅一次免费体验。",
        nextTest: "做 3 张匿名结果卡发小红书，记录真实分享率而不是点赞数。",
      },
    ],
    summary: {
      verdict: "PIVOT",
      verdictLabel: "建议转向",
      oneLine: "它是个很会传播的梗产品，但还不是一门能稳定收钱的生意。",
      consensusRisks: ["低频一次性需求", "聊天数据隐私责任", "分享热度未必转化为付费"],
      test48h: "做一个不上传聊天记录的免费结果页，同时放 9.9 元高级版，观察 100 个访问里是否至少有 3 次真实支付。",
    },
  },
  {
    id: "cat-collar",
    name: "猫咪情绪识别项圈",
    description: "通过声音和活动数据判断猫主子是饿了、生气了，还是单纯看不起你。",
    tags: ["硬件", "宠物", "AI"],
    buzz: "终于有机器能量化猫对你的嫌弃了。",
  },
  {
    id: "canteen-map",
    name: "校园食堂排队预测",
    description: "根据课表、历史客流和天气，预测每个窗口还要排多久。",
    tags: ["校园", "地图", "效率"],
    buzz: "算法算完了，阿姨今天临时少开一个窗口。",
  },
  {
    id: "left-sock",
    name: "只卖左脚袜子的订阅盒",
    description: "为那些永远找不到另一只袜子的人，每月补寄 5 只左脚袜。",
    tags: ["电商", "订阅制", "生活"],
    buzz: "商业模式很完整，人体结构不是很支持。",
  },
  {
    id: "anti-scroll",
    name: "帮你戒短视频的短视频 App",
    description: "用更短、更无聊的短视频逐渐降低你的多巴胺依赖。",
    tags: ["健康", "内容", "反上瘾"],
    buzz: "为了戒水，先给自己再挖一口井。",
  },
  {
    id: "ai-dating",
    name: "社恐 AI 代相亲",
    description: "AI 先和对方的 AI 聊三天，双方模型都觉得合适再让真人见面。",
    tags: ["社交", "AI", "约会"],
    buzz: "两个模型谈得挺好，建议它们原地结婚。",
  },
];

const sampleIdeaIds = new Set(sampleIdeas.map((idea) => idea.id));

function readIdeaRecords(): StoredIdea[] {
  try {
    const value = JSON.parse(window.localStorage.getItem(IDEA_STORAGE_KEY) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function upsertIdeaRecord(idea: Idea, patch: Partial<StoredIdea> = {}) {
  const records = readIdeaRecords();
  const existing = records.find((record) => record.id === idea.id);
  const next: StoredIdea = {
    ...idea,
    ...existing,
    ...patch,
    status: patch.status || existing?.status || idea.status || "active",
    createdAt: patch.createdAt || existing?.createdAt || idea.createdAt || new Date().toISOString(),
  };
  window.localStorage.setItem(
    IDEA_STORAGE_KEY,
    JSON.stringify([next, ...records.filter((record) => record.id !== idea.id)]),
  );
  window.dispatchEvent(new Event(STORAGE_EVENT));
  return next;
}

function useIdeaRecords() {
  const [records, setRecords] = useState<StoredIdea[]>(() => readIdeaRecords());

  useEffect(() => {
    const refresh = () => setRecords(readIdeaRecords());
    window.addEventListener("storage", refresh);
    window.addEventListener(STORAGE_EVENT, refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener(STORAGE_EVENT, refresh);
    };
  }, []);

  return records;
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 20_000);
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || "服务暂时不可用");
    return payload as T;
  } finally {
    window.clearTimeout(timeout);
  }
}

function makeDisplayName(text: string) {
  const firstSentence = text.split(/[。！？!?\n]/)[0]?.trim() || text.trim();
  return firstSentence.length > 18 ? `${firstSentence.slice(0, 18)}…` : firstSentence;
}

function inferTags(text: string) {
  const tags: string[] = [];
  if (/AI|人工智能|模型/i.test(text)) tags.push("AI");
  if (/校园|大学|学生|食堂/.test(text)) tags.push("校园");
  if (/社交|聊天|微信|朋友|相亲/.test(text)) tags.push("社交");
  if (/硬件|设备|项圈|手环/.test(text)) tags.push("硬件");
  return [...new Set([...tags, "新店试营业"])].slice(0, 3);
}

function buildDynamicReviews(idea: Idea): Review[] {
  return [
    {
      reviewerId: "vc",
      stars: 1,
      reactionTag: "估值当场归零",
      review: `“${idea.name}”听起来很适合拿到路演台上讲 30 秒，但你没有回答获客从哪来、谁会连续付钱。一个能被做出来的功能，不等于一个能长出来的公司。`,
      fatalFlaw: "付费方、使用者和传播者可能根本不是同一群人。",
      nextTest: "找 10 个目标用户，只展示价格和一句价值主张，记录谁愿意留下付款承诺。",
    },
    {
      reviewerId: "engineer",
      stars: 2,
      reactionTag: "需求两行，坑有两百",
      review: `你这句“${idea.description.slice(0, 28)}…”后面至少藏着权限、异常数据、审核和维护四个无底洞。Demo 很快，真正难的是第 101 个用户把脏数据扔进来之后。`,
      fatalFlaw: "产品承诺依赖的数据质量和边界条件都没有被验证。",
      nextTest: "用表单和人工处理跑完 20 单，统计最常见的 5 类异常，再决定是否写代码。",
    },
    {
      reviewerId: "genz",
      stars: 5,
      reactionTag: "离谱，但给我看看",
      review: `有点怪，我会点进去围观，也可能顺手发群里问“谁想的”。但别让我注册、填八页问卷或者看教学视频，三秒没看到爽点我就走。`,
      fatalFlaw: "第一眼有话题，但还没有让我第二天再打开的理由。",
      nextTest: "把核心结果做成一张可分享页面，发 3 个群，观察有多少人主动点进来完成一次。",
    },
  ];
}

function buildDynamicSummary(idea: Idea): Summary {
  return {
    verdict: "PIVOT",
    verdictLabel: "值得抢救",
    oneLine: `“${idea.name}”有传播钩子，但需要先证明真实行为，而不是继续堆功能。`,
    consensusRisks: ["付费意愿未经验证", "实现边界比描述复杂", "围观和长期使用不是一回事"],
    test48h: "做一个只包含核心价值和价格的假门页，邀请 30 个目标用户体验，以真实留资或付款承诺作为继续标准。",
  };
}

function StarRating({ value, compact = false }: { value: number; compact?: boolean }) {
  return (
    <span className={`star-rating ${compact ? "is-compact" : ""}`} aria-label={`${value} 星`}>
      {[1, 2, 3, 4, 5].map((star) =>
        star <= Math.round(value) ? <StarFilledIcon key={star} /> : <StarIcon key={star} />,
      )}
    </span>
  );
}

function HomeScreen({ flow }: { flow: FlowControls }) {
  const [ideaText, setIdeaText] = useState("");
  const [error, setError] = useState("");
  const trimmedLength = ideaText.trim().length;

  const openIdea = (idea: Idea, live = false) => {
    flow.push(createDetailScreen(idea, live));
  };

  const submitIdea = () => {
    if (trimmedLength < 12) {
      setError("再多说两句，不然骂都没地方下嘴");
      return;
    }

    const idea: Idea = {
      id: `idea-${crypto.randomUUID?.() || Date.now()}`,
      name: makeDisplayName(ideaText),
      description: ideaText.trim(),
      tags: inferTags(ideaText),
      buzz: "刚开业，三位探店博主正在赶来。",
      status: "active",
      createdAt: new Date().toISOString(),
    };
    upsertIdeaRecord(idea);
    setIdeaText("");
    setError("");
    openIdea(idea, true);
  };

  return (
    <MobileScroll className="app-screen home-screen">
      <main className="home-content" data-testid="home-screen">
        <header className="brand-row">
          <div className="brand-lockup" aria-label="IdeaDianping">
            <span className="brand-mark"><LightningBoltIcon /></span>
            <span>
              <strong>IdeaDianping</strong>
              <small>灵感粉碎机</small>
            </span>
          </div>
          <button className="icon-button soft" type="button" aria-label="个人主页" onClick={() => flow.push(createProfileScreen())}>
            <PersonIcon />
          </button>
        </header>

        <section className="roast-hero" aria-labelledby="hero-title">
          <div className="hero-kicker"><MagicWandIcon /> 今日还剩 3 次免费暴击</div>
          <h1 id="hero-title">你的伟大点子，<br /><em>扛得住差评吗？</em></h1>
          <p>别问你妈。让全网最难伺候的三个人先骂醒你。</p>
          <div className={`idea-composer ${error ? "has-error" : ""}`}>
            {/* ✅ 彻底去掉 KeyboardTextarea，用原生 textarea */}
            <textarea
              value={ideaText}
              maxLength={300}
              rows={4}
              onChange={(event) => {
                setIdeaText(event.target.value);
                if (error) setError("");
              }}
              placeholder="输入你想改变世界的伟大点子…"
              aria-label="输入创业点子"
              data-testid="idea-input"
            />
            <div className="composer-meta">
              <span>{error || "例：给大学生做一个 AI 代回父母微信的小程序"}</span>
              <b>{trimmedLength}/300</b>
            </div>
            <button
              className="primary-button"
              type="button"
              disabled={trimmedLength < 12}
              onClick={submitIdea}
              data-testid="roast-button"
            >
              接受暴击 <span>ROAST IT</span><LightningBoltIcon />
            </button>
          </div>
        </section>

        <section className="idea-feed" aria-labelledby="feed-title">
          <div className="section-heading">
            <div>
              <span className="section-eyebrow">正在营业</span>
              <h2 id="feed-title">全城热评 Idea</h2>
            </div>
            <span className="live-indicator"><i /> 43 秒前有新差评</span>
          </div>

          <div className="idea-list">
            {sampleIdeas.map((idea, index) => (
              <button className="idea-card" type="button" key={idea.id} onClick={() => openIdea(idea)}>
                <span className="rank-number">{String(index + 1).padStart(2, "0")}</span>
                <span className="idea-card-main">
                  <span className="card-title-row">
                    <strong>{idea.name}</strong>
                    <ChevronRightIcon />
                  </span>
                  <span className="idea-card-desc">{idea.description}</span>
                  <span className="tag-row">
                    {idea.tags.map((tag) => <i key={tag}>{tag}</i>)}
                  </span>
                  <span className="card-rating-row">
                    <StarRating value={index === 0 ? 2.7 : 2.1 + (index % 3) * 0.5} compact />
                    <b>{index === 0 ? "2.7" : (2.1 + (index % 3) * 0.5).toFixed(1)}</b>
                    <small>{12 + index * 7} 条评价</small>
                  </span>
                  <span className="featured-roast"><ChatBubbleIcon /> “{idea.buzz}”</span>
                </span>
              </button>
            ))}
          </div>
        </section>

        <footer className="home-footer-note">AI 探店仅供灵感预检，不代表真实市场需求</footer>
      </main>
    </MobileScroll>
  );
}

type ProfileFilter = "all" | "saved" | "trashed";

function ProfileHeader({ flow }: { flow: FlowControls }) {
  return (
    <div className="detail-toolbar">
      <button className="icon-button" type="button" aria-label="返回" onClick={flow.pop}><ArrowLeftIcon /></button>
      <strong>我的 Idea</strong>
      <span className="toolbar-spacer" />
    </div>
  );
}

function ProfileScreen({ flow }: { flow: FlowControls }) {
  const records = useIdeaRecords();
  const [filter, setFilter] = useState<ProfileFilter>("all");
  const visible = records.filter((record) => filter === "all" || record.status === filter);
  const counts = {
    all: records.length,
    saved: records.filter((record) => record.status === "saved").length,
    trashed: records.filter((record) => record.status === "trashed").length,
  };

  const openRecord = (idea: StoredIdea) => {
    const needsReviews = !sampleIdeaIds.has(idea.id) && (idea.reviews?.length || 0) < 3;
    flow.push(createDetailScreen(idea, needsReviews));
  };

  return (
    <MobileScroll className="app-screen profile-screen">
      <main className="profile-content" data-testid="profile-screen">
        <section className="profile-hero">
          <span className="section-eyebrow">本机匿名档案</span>
          <h1>灵感仓库</h1>
          <p>没有登录，也不会上传这份列表。换浏览器或清除网站数据后记录会消失。</p>
        </section>

        <nav className="profile-tabs" aria-label="Idea 分类">
          {([
            ["all", "全部"],
            ["saved", "收藏夹"],
            ["trashed", "垃圾桶"],
          ] as const).map(([value, label]) => (
            <button
              type="button"
              key={value}
              className={filter === value ? "is-active" : ""}
              aria-pressed={filter === value}
              onClick={() => setFilter(value)}
            >
              <span>{label}</span><b>{counts[value]}</b>
            </button>
          ))}
        </nav>

        {visible.length ? (
          <div className="profile-list">
            {visible.map((idea) => {
              const average = idea.reviews?.length
                ? idea.reviews.reduce((sum, review) => sum + review.stars, 0) / idea.reviews.length
                : 0;
              return (
                <button className="profile-card" type="button" key={idea.id} onClick={() => openRecord(idea)}>
                  <span className={`profile-status status-${idea.status}`}>
                    {idea.status === "saved" ? "已收藏" : idea.status === "trashed" ? "已丢弃" : "待决定"}
                  </span>
                  <strong>{idea.name}</strong>
                  <p>{idea.description}</p>
                  <span className="profile-card-meta">
                    <i>{average ? `${average.toFixed(1)} 星 · ${idea.reviews?.length}/3 已到店` : "等待探店"}</i>
                    <time>{new Date(idea.createdAt).toLocaleDateString("zh-CN", { month: "numeric", day: "numeric" })}</time>
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="profile-empty">
            <MagicWandIcon />
            <strong>{filter === "all" ? "还没有 Idea 入库" : filter === "saved" ? "收藏夹还是空的" : "垃圾桶干干净净"}</strong>
            <p>回首页提交一个点子，或者给现有点子做个决定。</p>
          </div>
        )}
      </main>
    </MobileScroll>
  );
}

function createProfileScreen(): FlowScreen {
  return {
    id: "profile",
    headerHeight: 54,
    header: (flow) => <ProfileHeader flow={flow} />,
    render: (flow) => <ProfileScreen flow={flow} />,
  };
}

function DetailHeader({ flow, idea }: { flow: FlowControls; idea: Idea }) {
  const [shared, setShared] = useState(false);

  const share = async () => {
    const text = `我在 IdeaDianping 上把「${idea.name}」送去挨骂了：${idea.buzz}`;
    try {
      if (navigator.share) await navigator.share({ title: idea.name, text });
      else await navigator.clipboard.writeText(text);
      setShared(true);
      window.setTimeout(() => setShared(false), 1600);
    } catch {
      // 用户主动取消分享时保持安静，不打断详情阅读。
    }
  };

  return (
    <div className="detail-toolbar">
      <button className="icon-button" type="button" aria-label="返回" onClick={flow.pop}><ArrowLeftIcon /></button>
      <strong>Idea 店铺详情</strong>
      <button className="icon-button" type="button" aria-label="分享" onClick={share}><Share2Icon /></button>
      {shared ? <span className="toolbar-toast"><CheckCircledIcon /> 已复制</span> : null}
    </div>
  );
}

function ActionFooter({ idea }: { idea: Idea }) {
  const [status, setStatus] = useState<IdeaStatus>(() => {
    return readIdeaRecords().find((record) => record.id === idea.id)?.status || idea.status || "active";
  });
  const [sheetOpen, setSheetOpen] = useState(false);

  const updateStatus = (next: IdeaStatus) => {
    upsertIdeaRecord(idea, { status: next });
    setStatus(next);
    setSheetOpen(true);
  };

  return (
    <>
      <div className="detail-actions" data-status={status}>
        <button className="save-button" type="button" onClick={() => updateStatus("saved")}>
          {status === "saved" ? <BookmarkFilledIcon /> : <BookmarkIcon />}
          <span>{status === "saved" ? "已收藏" : "存入收藏夹"}</span>
        </button>
        <button className="trash-button" type="button" onClick={() => updateStatus("trashed")}>
          <TrashIcon /><span>{status === "trashed" ? "已丢弃" : "扔进垃圾桶"}</span>
        </button>
      </div>
      <BottomSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        snap={0.36}
        title={status === "saved" ? "已收入镇店之宝" : "已完成无害化处理"}
        description={status === "saved" ? "改天再回来盘它。" : "世界暂时安全了。"}
      >
        <div className="decision-sheet-content">
          <span className={`decision-icon ${status}`}>
            {status === "saved" ? <BookmarkFilledIcon /> : <TrashIcon />}
          </span>
          <p>{status === "saved" ? "这个 Idea 已保存在当前设备的收藏夹中。" : "这个 Idea 已从收藏夹移入垃圾桶。"}</p>
          <button type="button" onClick={() => setSheetOpen(false)}>知道了</button>
        </div>
      </BottomSheet>
    </>
  );
}

function ReviewCard({
  reviewerId,
  review,
  loading,
  error,
  onRetry,
}: {
  reviewerId: PersonaId;
  review?: Review;
  loading?: boolean;
  error?: string;
  onRetry: () => void;
}) {
  const persona = personaMeta[review?.reviewerId || reviewerId];

  if (error && !review) {
    return (
      <article className={`review-card is-error tone-${persona.tone}`} aria-label={`${persona.name}评论失败`}>
        <header className="reviewer-row">
          <img src={persona.avatar} alt={`${persona.name}头像`} />
          <div><strong>{persona.name}</strong><small>{persona.subtitle}</small></div>
        </header>
        <strong>这位博主堵在路上</strong>
        <p>{error}</p>
        <button type="button" onClick={onRetry}><UpdateIcon /> 单独重试</button>
      </article>
    );
  }

  if (loading || !review) {
    return (
      <article className="review-card is-loading" aria-label="评论生成中">
        <div className="loading-avatar" />
        <div className="loading-lines"><i /><i /><i /></div>
        <span><UpdateIcon /> 探店中，正在组织攻击语言…</span>
      </article>
    );
  }

  return (
    <article className={`review-card tone-${persona.tone}`} data-testid={`review-${review.reviewerId}`}>
      <header className="reviewer-row">
        <img src={persona.avatar} alt={`${persona.name}头像`} />
        <div>
          <strong>{persona.name}</strong>
          <small>{persona.subtitle}</small>
        </div>
        <span className="review-date">刚刚</span>
      </header>
      <div className="review-score-row">
        <StarRating value={review.stars} compact />
        <strong>{review.reactionTag}</strong>
      </div>
      <p className="review-copy">{review.review}</p>
      <div className="insight-block fatal">
        <span>最致命的问题</span>
        <p>{review.fatalFlaw}</p>
      </div>
      <div className="insight-block test">
        <span><LightningBoltIcon /> 明天就能验证</span>
        <p>{review.nextTest}</p>
      </div>
    </article>
  );
}

function SummaryCard({ summary }: { summary: Summary }) {
  return (
    <section className={`summary-card verdict-${summary.verdict.toLowerCase()}`} data-testid="summary-card">
      <div className="summary-topline">
        <span><MagicWandIcon /> @Idea 最终审判</span>
        <strong>{summary.verdictLabel}</strong>
      </div>
      <h3>{summary.oneLine}</h3>
      <div className="risk-list">
        {summary.consensusRisks.map((risk, index) => <span key={risk}><i>{index + 1}</i>{risk}</span>)}
      </div>
      <div className="test-brief">
        <span>48 小时真人验证任务</span>
        <p>{summary.test48h}</p>
      </div>
    </section>
  );
}

function IdeaDetail({ idea, live }: { idea: Idea; live: boolean }) {
  const isSample = sampleIdeaIds.has(idea.id);
  const fallbackReviews = useMemo(() => buildDynamicReviews(idea), [idea]);
  const [reviews, setReviews] = useState<Review[]>(() => idea.reviews || (isSample ? fallbackReviews : []));
  const [summary, setSummary] = useState<Summary | undefined>(() => idea.summary || (isSample ? buildDynamicSummary(idea) : undefined));
  const [summarizing, setSummarizing] = useState(false);
  const [summaryError, setSummaryError] = useState("");
  const [reviewErrors, setReviewErrors] = useState<Partial<Record<PersonaId, string>>>({});
  const requestsInFlight = useRef(new Set<PersonaId>());

  const requestReview = async (reviewerId: PersonaId) => {
    if (requestsInFlight.current.has(reviewerId) || reviews.some((review) => review.reviewerId === reviewerId)) return;
    requestsInFlight.current.add(reviewerId);
    setReviewErrors((current) => ({ ...current, [reviewerId]: undefined }));

    try {
      let review: Review;
      if (import.meta.env.DEV) {
        await new Promise((resolve) => window.setTimeout(resolve, 420 + personaIds.indexOf(reviewerId) * 260));
        review = fallbackReviews.find((item) => item.reviewerId === reviewerId)!;
      } else {
        review = await postJson<Review>("/api/review", { ideaId: idea.id, ideaText: idea.description, persona: reviewerId });
      }

      setReviews((current) => {
        const next = [...current.filter((item) => item.reviewerId !== reviewerId), review];
        upsertIdeaRecord(idea, { reviews: next });
        return next;
      });
    } catch (error) {
      setReviewErrors((current) => ({
        ...current,
        [reviewerId]: error instanceof Error ? error.message : "评论生成失败",
      }));
    } finally {
      requestsInFlight.current.delete(reviewerId);
    }
  };

  useEffect(() => {
    if (!live) return;
    personaIds.forEach((reviewerId) => {
      if (!reviews.some((review) => review.reviewerId === reviewerId)) void requestReview(reviewerId);
    });
  }, [idea.id, live]);

  const average = reviews.length ? reviews.reduce((sum, review) => sum + review.stars, 0) / reviews.length : 0;

  const requestSummary = async () => {
    if (reviews.length < 2 || summarizing) return;
    setSummarizing(true);
    setSummaryError("");
    try {
      let nextSummary: Summary;
      if (isSample || import.meta.env.DEV) {
        await new Promise((resolve) => window.setTimeout(resolve, 520));
        nextSummary = idea.summary || buildDynamicSummary(idea);
      } else {
        nextSummary = await postJson<Summary>("/api/summary", { ideaId: idea.id, ideaText: idea.description, reviews });
      }
      setSummary(nextSummary);
      upsertIdeaRecord(idea, { reviews, summary: nextSummary });
    } catch (error) {
      setSummaryError(error instanceof Error ? error.message : "总结失败，请重试");
    } finally {
      setSummarizing(false);
    }
  };

  return (
    <MobileScroll className="app-screen detail-screen">
      <main className="detail-content" data-testid="detail-screen">
        <section className="shop-header">
          <div className="shop-label"><span>NEW</span> IDEA 试营业</div>
          <h1>{idea.name}</h1>
          <p>{idea.description}</p>
          <div className="shop-rating">
            <strong>{average ? average.toFixed(1) : "--"}</strong>
            <span>
              <StarRating value={average} />
              <small>{reviews.length}/3 位 AI 探店博主已到店</small>
            </span>
          </div>
          <div className="shop-tags">{idea.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
          <div className="truth-notice"><CheckCircledIcon /> AI 预检 ≠ 真实市场验证</div>
        </section>

        <section className="review-section" aria-labelledby="reviews-title">
          <div className="section-heading review-heading">
            <div>
              <span className="section-eyebrow">探店报告</span>
              <h2 id="reviews-title">评价（3）</h2>
            </div>
            <span className="arrival-count">{reviews.length}/3 已到店</span>
          </div>

          <div className="review-list">
            {personaIds.map((reviewerId) => {
              const review = reviews.find((item) => item.reviewerId === reviewerId);
              return (
                <ReviewCard
                  key={reviewerId}
                  reviewerId={reviewerId}
                  review={review}
                  loading={!review && !reviewErrors[reviewerId]}
                  error={reviewErrors[reviewerId]}
                  onRetry={() => void requestReview(reviewerId)}
                />
              );
            })}
          </div>

          {!summary ? (
            <button
              className="summary-button"
              type="button"
              disabled={reviews.length < 2 || summarizing}
              onClick={requestSummary}
            >
              {summarizing ? <><UpdateIcon className="spin" /> 店长正在核对差评…</> : <><MagicWandIcon /> @Idea 总结一下</>}
            </button>
          ) : <SummaryCard summary={summary} />}
          {summaryError && !summary ? <p className="summary-error">{summaryError}，点击按钮重试。</p> : null}
        </section>
      </main>
    </MobileScroll>
  );
}

function createDetailScreen(idea: Idea, live: boolean): FlowScreen {
  return {
    id: `detail-${idea.id}`,
    title: idea.name,
    headerHeight: 54,
    header: (flow) => <DetailHeader flow={flow} idea={idea} />,
    footerHeight: 78,
    footer: () => <ActionFooter idea={idea} />,
    render: () => <IdeaDetail idea={idea} live={live} />,
  };
}

export default function Prototype() {
  const initialScreen = useMemo<FlowScreen>(
    () => ({ id: "home", render: (flow) => <HomeScreen flow={flow} /> }),
    [],
  );

  return <FlowStack initial={initialScreen} />;
}
