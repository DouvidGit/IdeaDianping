const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });

async function callQwen(apiKey, messages) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 18_000);

  try {
    const response = await fetch("https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "qwen3.7-max",
        messages,
        enable_thinking: false,
        response_format: { type: "json_object" },
        max_tokens: 620,
        stream: false,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      console.error("Qwen summary request failed", response.status);
      throw new Error("UPSTREAM_ERROR");
    }

    const payload = await response.json();
    const content = payload?.choices?.[0]?.message?.content;
    if (!content) throw new Error("EMPTY_RESPONSE");
    return JSON.parse(content);
  } finally {
    clearTimeout(timeout);
  }
}

function validSummary(value) {
  return value &&
    ["SAVE", "PIVOT", "TRASH"].includes(value.verdict) &&
    [value.verdictLabel, value.oneLine, value.test48h].every(
      (field) => typeof field === "string" && field.trim().length > 0,
    ) &&
    Array.isArray(value.consensusRisks) &&
    value.consensusRisks.length === 3 &&
    value.consensusRisks.every((risk) => typeof risk === "string" && risk.trim().length > 0);
}

export async function onRequestPost({ request, env }) {
  if (!env.QWEN_API_KEY) return json({ error: "服务端尚未配置 Qwen Key" }, 503);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "请求格式无效" }, 400);
  }

  const ideaText = typeof body.ideaText === "string" ? body.ideaText.trim() : "";
  const reviews = Array.isArray(body.reviews) ? body.reviews.slice(0, 3) : [];
  if (ideaText.length < 1 || ideaText.length > 300 || reviews.length < 2) {
    return json({ error: "至少需要两条合法评论" }, 400);
  }

  const system = `你是 IdeaDianping 的店长，只根据用户原始 Idea 和现有评论做综合判断，不假装做过外部市场调研。
输出必须是 JSON，不要 Markdown。JSON 格式示例：{"verdict":"PIVOT","verdictLabel":"建议转向","oneLine":"一句总判词","consensusRisks":["风险1","风险2","风险3"],"test48h":"48小时内能完成、以真实行为为证据的测试"}`;
  const user = `原始 Idea：${ideaText}\n\n评论 JSON：${JSON.stringify(reviews)}`;

  try {
    const summary = await callQwen(
      env.QWEN_API_KEY,
      [{ role: "system", content: system }, { role: "user", content: user }],
    );
    if (!validSummary(summary)) return json({ error: "AI 返回的总结结构无效" }, 502);
    return json(summary);
  } catch (error) {
    const status = error?.name === "AbortError" ? 504 : 502;
    return json({ error: status === 504 ? "总结超时，请重试" : "店长暂时无法总结" }, status);
  }
}

export function onRequestGet() {
  return json({ error: "Method not allowed" }, 405);
}
