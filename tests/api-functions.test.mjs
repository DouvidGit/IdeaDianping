import assert from "node:assert/strict";
import test from "node:test";
import { onRequestPost as reviewRequest } from "../functions/api/review.js";
import { onRequestPost as summaryRequest } from "../functions/api/summary.js";

const request = (path, body) => new Request(`https://example.test${path}`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify(body),
});

test("review endpoint requires a server-side secret", async () => {
  const response = await reviewRequest({
    request: request("/api/review", { ideaText: "这是一个长度足够的测试创业点子描述", persona: "vc" }),
    env: {},
  });
  assert.equal(response.status, 503);
  assert.equal(JSON.stringify(await response.json()).includes("sk-"), false);
});

test("review endpoint sends the low-cost structured request", { concurrency: false }, async () => {
  const originalFetch = globalThis.fetch;
  let captured;
  globalThis.fetch = async (url, options) => {
    captured = { url, options, body: JSON.parse(options.body) };
    return new Response(JSON.stringify({
      choices: [{ message: { content: JSON.stringify({
        reviewerId: "vc",
        stars: 1,
        reactionTag: "估值当场归零",
        review: "这是一条测试锐评，明确指出获客、付费方和复购逻辑都还没有被真实行为验证。",
        fatalFlaw: "付费意愿未经验证。",
        nextTest: "明天向十位目标用户展示价格并记录付款承诺。",
      }) } }],
    }), { status: 200 });
  };

  try {
    const response = await reviewRequest({
      request: request("/api/review", { ideaText: "点", persona: "vc" }),
      env: { DEEPSEEK_API_KEY: "unit-test-secret" },
    });
    assert.equal(response.status, 200);
    assert.equal(captured.url, "https://api.deepseek.com/chat/completions");
    assert.equal(captured.options.headers.authorization, "Bearer unit-test-secret");
    assert.equal(captured.body.model, "deepseek-v4-flash");
    assert.deepEqual(captured.body.thinking, { type: "disabled" });
    assert.deepEqual(captured.body.response_format, { type: "json_object" });
    assert.equal(captured.body.max_tokens, 520);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("review endpoint accepts the 300 character boundary and rejects blank ideas", { concurrency: false }, async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({
    choices: [{ message: { content: JSON.stringify({
      reviewerId: "vc",
      stars: 1,
      reactionTag: "边界测试",
      review: "这是一条用于验证三百字输入边界的结构化测试评论。",
      fatalFlaw: "边界仍需验证。",
      nextTest: "提交真实行为测试。",
    }) } }],
  }), { status: 200 });

  try {
    const boundaryResponse = await reviewRequest({
      request: request("/api/review", { ideaText: "点".repeat(300), persona: "vc" }),
      env: { DEEPSEEK_API_KEY: "unit-test-secret" },
    });
    const blankResponse = await reviewRequest({
      request: request("/api/review", { ideaText: "   ", persona: "vc" }),
      env: { DEEPSEEK_API_KEY: "unit-test-secret" },
    });
    assert.equal(boundaryResponse.status, 200);
    assert.equal(blankResponse.status, 400);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("review endpoint rejects an invalid persona before calling DeepSeek", async () => {
  const response = await reviewRequest({
    request: request("/api/review", { ideaText: "这是一个长度足够的测试创业点子描述", persona: "hacker" }),
    env: { DEEPSEEK_API_KEY: "unit-test-secret" },
  });
  assert.equal(response.status, 400);
});

test("summary endpoint validates and returns structured judgment", { concurrency: false }, async () => {
  const originalFetch = globalThis.fetch;
  let capturedBody;
  globalThis.fetch = async (_url, options) => {
    capturedBody = JSON.parse(options.body);
    return new Response(JSON.stringify({
      choices: [{ message: { content: JSON.stringify({
        verdict: "PIVOT",
        verdictLabel: "建议转向",
        oneLine: "先证明需求，再继续写代码。",
        consensusRisks: ["付费不明", "边界复杂", "留存未知"],
        test48h: "向三十位目标用户展示价格，以真实付款承诺作为继续标准。",
      }) } }],
    }), { status: 200 });
  };

  try {
    const reviews = [
      { reviewerId: "vc", stars: 1, review: "a" },
      { reviewerId: "engineer", stars: 2, review: "b" },
    ];
    const response = await summaryRequest({
      request: request("/api/summary", { ideaText: "点", reviews }),
      env: { DEEPSEEK_API_KEY: "unit-test-secret" },
    });
    assert.equal(response.status, 200);
    assert.equal(capturedBody.model, "deepseek-v4-flash");
    assert.equal(capturedBody.max_tokens, 620);
    assert.equal((await response.json()).verdict, "PIVOT");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("summary endpoint rejects a blank idea", async () => {
  const response = await summaryRequest({
    request: request("/api/summary", {
      ideaText: "   ",
      reviews: [{ reviewerId: "vc" }, { reviewerId: "engineer" }],
    }),
    env: { DEEPSEEK_API_KEY: "unit-test-secret" },
  });
  assert.equal(response.status, 400);
});
