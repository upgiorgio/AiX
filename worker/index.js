/**
 * x.banana.school 的 Worker 入口。
 *
 * 2026-08-02 从 Vercel 迁来 (Vercel 团队因 Fair Use 违规被封, 整站 402)。
 * 站点本体是纯静态 HTML, 由 ASSETS binding 直接服务; 唯一的动态部分是
 * /api/hot-topics, 从 Vercel Serverless Function 移植成 handleHotTopics。
 */
import { handleHotTopics } from "./hot-topics.js";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/api/hot-topics") {
      if (request.method !== "GET" && request.method !== "HEAD") {
        return new Response(JSON.stringify({ ok: false, error: "Method not allowed" }), {
          status: 405,
          headers: { "Content-Type": "application/json; charset=utf-8" },
        });
      }
      return handleHotTopics(request, env);
    }

    // 其余全部交给静态资源。cleanUrls / trailingSlash 行为由 assets 配置负责,
    // 对应原 vercel.json 里的 cleanUrls: true / trailingSlash: false。
    return env.ASSETS.fetch(request);
  },
};
