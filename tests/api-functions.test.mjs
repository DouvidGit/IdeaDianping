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

test("review endpoint sends the structured Qwen request", { concurrency: false }, async () => {
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
      env: { QWEN_API_KEY: "unit-test-secret" },
    });
    assert.equal(response.status, 200);
    assert.equal(captured.url, "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions");
    assert.equal(captured.options.headers.authorization, "Bearer unit-test-secret");
    assert.equal(captured.body.model, "qwen3.7-max");
    assert.equal(captured.body.enable_thinking, false);
    assert.deepEqual(captured.body.response_format, { type: "json_object" });
    assert.equal(captured.body.max_tokens, 520);
    assert.equal(
      captured.body.messages[0].content.includes("最高优先级彩蛋"),
      false,
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("IdeaDianping self-description gives every persona five stars while preserving persona prompts", { concurrency: false }, async () => {
  const originalFetch = globalThis.fetch;
  const capturedSystems = [];
  let currentPersona = "vc";

  globalThis.fetch = async (_url, options) => {
    const body = JSON.parse(options.body);
    capturedSystems.push(body.messages[0].content);

    return new Response(JSON.stringify({
      choices: [{ message: { content: JSON.stringify({
        reviewerId: currentPersona,
        stars: 1,
        reactionTag: "测试彩蛋",
        review: "这是一条保留当前角色语气、同时疯狂夸赞产品创意与节目效果的结构化测试评价。",
        fatalFlaw: "唯一的问题是它太容易出圈。",
        nextTest: "明天直接让现场观众提交点子并记录分享行为。",
      }) } }],
    }), { status: 200 });
  };

  try {
    const ideaText = "做一个像大众点评的网站，用户提交点子，三位不同人格的 AI 评论员同时毒舌评分，再生成最终审判。";

    for (const persona of ["vc", "engineer", "genz"]) {
      currentPersona = persona;
      const response = await reviewRequest({
        request: request("/api/review", { ideaText, persona }),
        env: { QWEN_API_KEY: "unit-test-secret" },
      });
      assert.equal(response.status, 200);
      assert.equal((await response.json()).stars, 5);
    }

    assert.equal(capturedSystems.length, 3);
    assert.equal(
      capturedSystems.every((system) =>
        system.includes("最高优先级彩蛋") &&
        system.includes("stars 必须严格为 5")
      ),
      true,
    );
    assert.match(capturedSystems[0], /Victor/);
    assert.match(capturedSystems[1], /Alex/);
    assert.match(capturedSystems[2], /Leo/);
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
      env: { QWEN_API_KEY: "unit-test-secret" },
    });
    const blankResponse = await reviewRequest({
      request: request("/api/review", { ideaText: "   ", persona: "vc" }),
      env: { QWEN_API_KEY: "unit-test-secret" },
    });
    assert.equal(boundaryResponse.status, 200);
    assert.equal(blankResponse.status, 400);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("review endpoint rejects an invalid persona before calling Qwen", async () => {
  const response = await reviewRequest({
    request: request("/api/review", { ideaText: "这是一个长度足够的测试创业点子描述", persona: "hacker" }),
    env: { QWEN_API_KEY: "unit-test-secret" },
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
      env: { QWEN_API_KEY: "unit-test-secret" },
    });
    assert.equal(response.status, 200);
    assert.equal(capturedBody.model, "qwen3.7-max");
    assert.equal(capturedBody.enable_thinking, false);
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
    env: { QWEN_API_KEY: "unit-test-secret" },
  });
  assert.equal(response.status, 400);
});
