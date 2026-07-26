const personaMeta: Record<
  PersonaId,
  { name: string; subtitle: string; avatar: string; tone: string }
> = {
  vc: {
    name: "Victor",
    subtitle: "挑剔风投 · 专治伪需求",
    avatar: "/assets/reviewers/vc.png",
    tone: "vc",
  },
  engineer: {
    name: "Alex",
    subtitle: "15 年工程师 · “加 AI”不是方案",
    avatar: "/assets/reviewers/engineer.png",
    tone: "engineer",
  },
  genz: {
    name: "Leo",
    subtitle: "00 后用户 · 3 秒不爽就卸载",
    avatar: "/assets/reviewers/genz.png",
    tone: "genz",
  },
};

const personaPreview: Record<
  PersonaId,
  { label: string; quote: string }
> = {
  vc: {
    label: "商业审判",
    quote: "有意思，但这到底是一家公司，还是一个功能？",
  },
  engineer: {
    label: "技术拆台",
    quote: "很好。现在告诉我，你的数据到底在哪里？",
  },
  genz: {
    label: "用户暴击",
    quote: "听起来挺酷，但我为什么要专门下载？",
  },
};

function HomeScreen({ flow }: { flow: FlowControls }) {
  const keyboard = useKeyboard();
  const [ideaText, setIdeaText] = useState("");
  const [error, setError] = useState("");
  const trimmedLength = ideaText.trim().length;

  const openIdea = (idea: Idea, live = false) => {
    flow.push(createDetailScreen(idea, live));
  };

  const submitIdea = () => {
    if (trimmedLength < 12) {
      setError("至少说清楚：给谁用、解决什么问题");
      return;
    }

    keyboard.hide();

    const idea: Idea = {
      id: `idea-${crypto.randomUUID?.() || Date.now()}`,
      name: makeDisplayName(ideaText),
      description: ideaText.trim(),
      tags: inferTags(ideaText),
      buzz: "Victor 已经皱眉，Alex 正在找技术漏洞，Leo 可能马上划走。",
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
            <span className="brand-mark">
              <LightningBoltIcon />
            </span>
            <span>
              <strong>IdeaDianping</strong>
              <small>创业点子压力测试</small>
            </span>
          </div>

          <button
            className="icon-button soft"
            type="button"
            aria-label="我的 Idea"
            onClick={() => flow.push(createProfileScreen())}
          >
            <PersonIcon />
          </button>
        </header>

        <section className="roast-hero" aria-labelledby="hero-title">
          <div className="hero-kicker">
            <LightningBoltIcon />
            三位难伺候的评论员已上线
          </div>

          <h1 id="hero-title">
            别急着改变世界，
            <br />
            <em>先证明它不是伪需求。</em>
          </h1>

          <p>
            Victor 审商业，Alex 拆技术，Leo 决定用户会不会三秒卸载。
            不鼓掌，只找最可能让项目失败的问题。
          </p>

          <div className={`idea-composer ${error ? "has-error" : ""}`}>
            <KeyboardTextarea
              value={ideaText}
              maxLength={300}
              onChange={(event) => {
                setIdeaText(event.target.value);
                if (error) setError("");
              }}
              placeholder="说清楚：谁遇到了什么问题，你准备怎么解决？"
              aria-label="输入创业点子"
              data-testid="idea-input"
            />

            <div className="composer-meta">
              <span>
                {error ||
                  "例：给大学生做一个 AI 工具，自动回复父母的微信消息"}
              </span>
              <b>{trimmedLength}/300</b>
            </div>

            <button
              className="primary-button"
              type="button"
              disabled={trimmedLength < 12}
              onClick={submitIdea}
              data-testid="roast-button"
            >
              开始压力测试
              <span>ROAST MY IDEA</span>
              <LightningBoltIcon />
            </button>
          </div>
        </section>

        <section className="idea-feed" aria-labelledby="reviewers-title">
          <div className="section-heading">
            <div>
              <span className="section-eyebrow">你的审判团</span>
              <h2 id="reviewers-title">没有一个负责哄你</h2>
            </div>

            <span className="live-indicator">
              <i /> 三人意见互不统一
            </span>
          </div>

          <div className="review-list">
            {personaIds.map((personaId) => {
              const persona = personaMeta[personaId];
              const preview = personaPreview[personaId];

              return (
                <article
                  className={`review-card tone-${persona.tone}`}
                  key={personaId}
                >
                  <header className="reviewer-row">
                    <img
                      src={persona.avatar}
                      alt={`${persona.name}头像`}
                    />
                    <div>
                      <strong>{persona.name}</strong>
                      <small>{persona.subtitle}</small>
                    </div>
                    <span className="review-date">{preview.label}</span>
                  </header>

                  <p className="review-copy">“{preview.quote}”</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="idea-feed" aria-labelledby="feed-title">
          <div className="section-heading">
            <div>
              <span className="section-eyebrow">公开处刑现场</span>
              <h2 id="feed-title">最近接受暴击的 Idea</h2>
            </div>

            <span className="live-indicator">
              <i /> 43 秒前有新评价
            </span>
          </div>

          <div className="idea-list">
            {sampleIdeas.map((idea, index) => {
              const rating =
                index === 0 ? 2.7 : 2.1 + (index % 3) * 0.5;

              return (
                <button
                  className="idea-card"
                  type="button"
                  key={idea.id}
                  onClick={() => openIdea(idea)}
                >
                  <span className="rank-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <span className="idea-card-main">
                    <span className="card-title-row">
                      <strong>{idea.name}</strong>
                      <ChevronRightIcon />
                    </span>

                    <span className="idea-card-desc">
                      {idea.description}
                    </span>

                    <span className="tag-row">
                      {idea.tags.map((tag) => (
                        <i key={tag}>{tag}</i>
                      ))}
                    </span>

                    <span className="card-rating-row">
                      <StarRating value={rating} compact />
                      <b>{rating.toFixed(1)}</b>
                      <small>{12 + index * 7} 条评价</small>
                    </span>

                    <span className="featured-roast">
                      <ChatBubbleIcon /> “{idea.buzz}”
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <footer className="home-footer-note">
          AI 评价只负责发现风险，不等于真实用户反馈或市场验证
        </footer>
      </main>
    </MobileScroll>
  );
}
