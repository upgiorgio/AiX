const $ = (id) => document.getElementById(id);

const DRAFT_KEY = "x-articles-studio-draft";
const HISTORY_KEY = "x-articles-studio-history-v2";
const CHECKLIST_KEY = "x-article-checklist";
const MAX_HISTORY = 12;

const state = {
  titles: [],
  hooks: [],
  article: "",
  thread: [],
  plan: [],
  monetize: "",
  quality: null,
  platformPackages: {}
};

const platformProfiles = {
  x: {
    label: "X",
    fit: "长文 + Thread 回流 + 72h 二次分发",
    targetLength: "1200-4000 字（文章）",
    checklist: [
      "标题具体、好奇、有价值承诺",
      "首段 1 句给结论/冲突",
      "5-12 条 Thread 回流原文",
      "发布后 24-72 小时置顶与复投"
    ],
    riskWarnings: [
      "避免诱导互刷或机械互动",
      "不要伪造数据与截图",
      "订阅内容要明确免费/付费边界"
    ],
    officialLinks: [
      { label: "X Help - Articles", url: "https://help.x.com/en/using-x/articles" },
      { label: "X Legal - Subscriptions Terms", url: "https://legal.x.com/en/subscriptions-creator-terms.html" },
      { label: "XCreators 指南原文", url: "https://x.com/XCreators/status/2011957172821737574" }
    ],
    caseLinks: [{ label: "XCreators 官方账号", url: "https://x.com/XCreators" }]
  },
  wechat: {
    label: "公众号",
    fit: "深度图文 + 私域沉淀 + 菜单导流",
    targetLength: "1500-3000 字",
    checklist: [
      "封面、摘要、首屏信息足够明确",
      "文章结构分节，段落短，图文配比稳定",
      "外链与引导行为符合平台规范",
      "结尾加入关注引导与相关阅读"
    ],
    riskWarnings: [
      "避免绝对化承诺、虚假收益承诺",
      "避免医疗、金融等高风险结论化表述",
      "敏感词与违规场景以后台实时拦截为准"
    ],
    officialLinks: [
      { label: "微信公众平台", url: "https://mp.weixin.qq.com/" },
      { label: "微信外部链接内容管理规范", url: "https://weixin.qq.com/cgi-bin/readtemplate?t=weixin_external_links_content_management_specification" }
    ],
    caseLinks: [{ label: "公众号运营中心（后台）", url: "https://mp.weixin.qq.com/" }]
  },
  zhihu: {
    label: "知乎",
    fit: "问题导向 + 论证链 + 引用来源",
    targetLength: "1000-2500 字",
    checklist: [
      "标题尽量问题化、结论先行",
      "观点后立刻补证据与反例",
      "结尾给可执行清单",
      "避免情绪性攻击和无依据判断"
    ],
    riskWarnings: [
      "区分事实、推断、个人经验",
      "引用来源尽量可追溯",
      "避免夸大性结论与误导性标题"
    ],
    officialLinks: [
      { label: "知乎盐值与社区信用", url: "https://www.zhihu.com/term/credit" },
      { label: "知乎机构号使用规范", url: "https://www.zhihu.com/term/institution-usage" },
      { label: "知乎 Live 内容规则", url: "https://www.zhihu.com/lives/rules" }
    ],
    caseLinks: [{ label: "知乎官方", url: "https://www.zhihu.com/" }]
  },
  bilibili: {
    label: "哔哩哔哩",
    fit: "视频脚本化表达 + 分段标题 + 弹幕互动",
    targetLength: "800-1800 字（口播脚本）",
    checklist: [
      "前 15 秒给冲突/结果",
      "按章节拆为可口播段落",
      "每段保留可视化提示点（图示/截图）",
      "结尾引导评论关键词互动"
    ],
    riskWarnings: [
      "避免低俗、攻击、引战与擦边内容",
      "避免版权不明素材与搬运",
      "商业推广内容要按规则披露"
    ],
    officialLinks: [
      { label: "B站社区规则入口", url: "https://www.bilibili.com/blackboard/blackroom.html#/rule" },
      { label: "B站社区规范更新公告", url: "https://www.bilibili.com/opus/1120422863985537024" }
    ],
    caseLinks: [{ label: "B站创作中心", url: "https://member.bilibili.com/" }]
  },
  xiaohongshu: {
    label: "小红书",
    fit: "场景化种草 + 清单化表达 + 图文卡片",
    targetLength: "500-1200 字",
    checklist: [
      "首段说明场景和痛点",
      "正文尽量步骤化/清单化",
      "结尾给收藏/评论触发语",
      "封面和标题避免夸张承诺"
    ],
    riskWarnings: [
      "避免夸大功效、绝对化用语",
      "避免引流到站外的违规表达",
      "商业合作需按平台要求标注"
    ],
    officialLinks: [
      { label: "小红书开发者文档（社区治理）", url: "https://miniapp.xiaohongshu.com/doc/DC246380" },
      { label: "小红书开发者文档（内容安全）", url: "https://miniapp.xiaohongshu.com/doc/DC156095" }
    ],
    caseLinks: [{ label: "小红书创作者服务", url: "https://creator.xiaohongshu.com/" }]
  }
};

const resourceTypeLabels = {
  official: "官方规则",
  tips: "填写技巧",
  case: "优秀案例",
  audit: "审核与敏感词",
  share: "X 与 GitHub 分享"
};

const resourcePlatformLabels = {
  x: "X",
  wechat: "公众号",
  zhihu: "知乎",
  bilibili: "哔哩哔哩",
  xiaohongshu: "小红书",
  github: "GitHub"
};

const resourceCatalog = [
  {
    title: "X Articles 官方写作指南",
    type: "official",
    platforms: ["x"],
    links: [
      { label: "X Help - Articles", url: "https://help.x.com/en/using-x/articles" },
      { label: "XCreators 指南原文", url: "https://x.com/XCreators/status/2011957172821737574" }
    ]
  },
  {
    title: "X 订阅与分成规则",
    type: "audit",
    platforms: ["x"],
    links: [
      { label: "Subscriptions Terms", url: "https://legal.x.com/en/subscriptions-creator-terms.html" },
      { label: "Premium 权重与反作弊信号（2026）", url: "https://x.com/XCreators/status/2012253930344898681" }
    ]
  },
  {
    title: "X 社区优秀长文案例",
    type: "case",
    platforms: ["x"],
    links: [
      { label: "The Prison Of Financial Mediocrity（systematicls）", url: "https://x.com/systematicls/article/2004900241745883205" },
      { label: "How to fix your entire life in 1 day（thedankoe）", url: "https://x.com/thedankoe/article/2010751592346030461" },
      { label: "Steam, Steel, and Infinite Minds（@ivanhzhao）", url: "https://x.com/ivanhzhao" },
      { label: "AI’s trillion-dollar opportunity: Context graphs（@JayaGup10）", url: "https://x.com/JayaGup10" }
    ]
  },
  {
    title: "公众号官方入口与规范",
    type: "official",
    platforms: ["wechat"],
    links: [
      { label: "微信公众平台", url: "https://mp.weixin.qq.com/" },
      { label: "微信外部链接内容管理规范", url: "https://weixin.qq.com/cgi-bin/readtemplate?t=weixin_external_links_content_management_specification" }
    ]
  },
  {
    title: "公众号填写技巧（模板向）",
    type: "tips",
    platforms: ["wechat"],
    links: [{ label: "公众号运营中心（后台）", url: "https://mp.weixin.qq.com/" }]
  },
  {
    title: "知乎官方规则",
    type: "official",
    platforms: ["zhihu"],
    links: [
      { label: "知乎盐值与社区信用", url: "https://www.zhihu.com/term/credit" },
      { label: "知乎机构号使用规范", url: "https://www.zhihu.com/term/institution-usage" },
      { label: "知乎 Live 内容规则", url: "https://www.zhihu.com/lives/rules" }
    ]
  },
  {
    title: "知乎写作与分发入口",
    type: "tips",
    platforms: ["zhihu"],
    links: [
      { label: "知乎创作中心", url: "https://www.zhihu.com/creator" },
      { label: "知乎官方站点", url: "https://www.zhihu.com/" }
    ]
  },
  {
    title: "B 站官方规则与创作中心",
    type: "official",
    platforms: ["bilibili"],
    links: [
      { label: "B站社区规则入口", url: "https://www.bilibili.com/blackboard/blackroom.html#/rule" },
      { label: "B站社区规则（V12）", url: "https://www.bilibili.com/blackboard/blackroomrule_v12.html" },
      { label: "B站创作中心", url: "https://member.bilibili.com/" }
    ]
  },
  {
    title: "小红书官方规则与创作中心",
    type: "official",
    platforms: ["xiaohongshu"],
    links: [
      { label: "小红书创作者服务", url: "https://creator.xiaohongshu.com/" },
      { label: "小红书开发者文档（社区治理）", url: "https://miniapp.xiaohongshu.com/doc/DC246380" },
      { label: "小红书开发者文档（内容安全）", url: "https://miniapp.xiaohongshu.com/doc/DC156095" }
    ]
  },
  {
    title: "GitHub 内容发布规范",
    type: "official",
    platforms: ["github"],
    links: [
      {
        label: "GitHub Markdown 官方语法",
        url: "https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax"
      },
      {
        label: "GitHub Profile README 指南",
        url: "https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-github-profile/customizing-your-profile/managing-your-profile-readme"
      },
      {
        label: "GitHub Social Preview",
        url: "https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-your-repositorys-social-media-preview"
      }
    ]
  },
  {
    title: "X 与 GitHub 联动分享",
    type: "share",
    platforms: ["x", "github"],
    links: [
      {
        label: "X Card Markup（链接卡片）",
        url: "https://developer.x.com/en/docs/x-for-websites/cards/overview/abouts-cards"
      },
      { label: "X Post Button 文档", url: "https://developer.x.com/en/docs/x-for-websites/tweet-button/overview" },
      {
        label: "GitHub Releases 指南",
        url: "https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository"
      }
    ]
  },
  {
    title: "XCreators 最近动态（官方 + 镜像）",
    type: "case",
    platforms: ["x"],
    links: [
      { label: "XCreators 官方账号", url: "https://x.com/XCreators" },
      { label: "订阅者徽章更新（2026-02-19）", url: "https://x.com/XCreators/status/2024273692952281097" },
      { label: "$1M Top Article Contest（公告）", url: "https://x.com/XCreators/status/2012306731867717852" },
      { label: "XCreators 镜像时间线（便于快速浏览）", url: "https://twstalker.com/XCreators" }
    ]
  }
];

const platformSensitiveRules = {
  x: [
    { regex: /100%|稳赚|保赚|包过|绝对/g, suggestion: "改成“有机会提升/在特定条件下有效”，避免绝对化承诺。" },
    { regex: /互粉|互赞|刷量|代刷/g, suggestion: "删除诱导互刷表达，改为真实互动引导。" }
  ],
  wechat: [
    { regex: /100%|稳赚|包过|永久有效|唯一/g, suggestion: "替换为“可能/通常/在样本中观察到”，避免虚假或绝对化承诺。" },
    { regex: /加微信|vx|v信|私信领资料|拉群/g, suggestion: "避免违规导流，改为平台内合法关注和菜单引导。" },
    { regex: /治愈|根治|无副作用|速效/g, suggestion: "医疗健康相关表述需审慎，删除功效承诺词。" }
  ],
  zhihu: [
    { regex: /绝对|必然|肯定|毫无疑问/g, suggestion: "结论降级并补充证据来源，区分事实与推断。" },
    { regex: /内幕|黑幕|全网都在骗你/g, suggestion: "避免煽动性标题，改为可验证的问题式标题。" }
  ],
  bilibili: [
    { regex: /互粉|互赞|刷播放|冲榜/g, suggestion: "删除异常增长导向文案，改为内容互动问题。" },
    { regex: /搬运|未授权|盗版/g, suggestion: "涉及素材时补充版权来源或更换为自有素材。" }
  ],
  xiaohongshu: [
    { regex: /最强|第一|无敌|必买|闭眼入/g, suggestion: "减少夸张种草词，改成体验条件和适用人群。" },
    { regex: /无副作用|立刻见效|7天见效|根治/g, suggestion: "删除功效承诺，改为个人体验并提示差异性。" },
    { regex: /加微信|私信我发链接|站外下单/g, suggestion: "避免站外导流表达，改为平台内合规路径。" }
  ]
};

const xCreatorsRecentSignals = [
  {
    date: "2026-02-19",
    title: "订阅者徽章进入 X Chat",
    action: "可在文章结尾增加“订阅者专属互动”引导，强化留存与社群身份识别。",
    source: "https://x.com/XCreators/status/2024273692952281097",
    sourceType: "官方 X"
  },
  {
    date: "2026-02 中旬（抓取日：2026-02-21）",
    title: "$1M Video Contest 启动",
    action: "可把“文章主内容 + 视频二次分发”加入统一发布流程，扩大触达入口。",
    source: "https://x.com/XCreators/status/2023505771573616938",
    sourceType: "镜像转引",
    note: "来自 twstalker 抓取，建议登录 X 复核原帖。"
  },
  {
    date: "2026-02 上旬（抓取日：2026-02-21）",
    title: "$1M Grok Ad Contest 公布赢家",
    action: "官方持续用高额激励拉动优质创作，建议保留“活动制内容产线”。",
    source: "https://x.com/XCreators/status/2020587351467069777",
    sourceType: "镜像转引",
    note: "来自 twstalker 抓取，建议登录 X 复核原帖。"
  },
  {
    date: "2026-02 上旬（抓取日：2026-02-21）",
    title: "活动窗口关闭后，官方通过 X Chat 联络获奖者",
    action: "活动型内容要提前准备交付格式与私信响应节奏，避免错过官方沟通窗口。",
    source: "https://x.com/XCreators/status/2020192026793504889",
    sourceType: "镜像转引",
    note: "来自 twstalker 抓取，建议登录 X 复核原帖。"
  },
  {
    date: "2026-02 上旬（抓取日：2026-02-21）",
    title: "活动评选强调 Verified Home Timeline impressions + 创造力",
    action: "内容评估应同时记录曝光质量与创意指标，不只看单点阅读。",
    source: "https://x.com/XCreators/status/2019839294165381378",
    sourceType: "镜像转引",
    note: "来自 twstalker 抓取，建议登录 X 复核原帖。"
  },
  {
    date: "2026-01 下旬",
    title: "Articles 扩展到全部 Premium 用户",
    action: "X 长文已是基础能力，建议默认采用“长文 + Thread”双轨发布。",
    source: "https://x.com/XCreators/status/2012306734568849653",
    sourceType: "官方 X"
  },
  {
    date: "2026-01 下旬（抓取日：2026-02-21）",
    title: "Creator Studio 入口进入侧边栏",
    action: "将资格检查、内容管理和分发复盘固定在 Creator Studio 入口，减少漏操作。",
    source: "https://x.com/XCreators/status/2023118522394687998",
    sourceType: "镜像转引",
    note: "来自 twstalker 抓取，建议登录 X 复核原帖。"
  },
  {
    date: "2026-01 下旬",
    title: "$1M Top Article Contest 明确“写作优先”",
    action: "可把深度文章作为主产能，短帖承担预热与二次分发职能。",
    source: "https://x.com/XCreators/status/2012306731867717852",
    sourceType: "官方 X"
  },
  {
    date: "2026-01 下旬",
    title: "分成继续强调高等级 Premium 权重 + 反作弊",
    action: "减少低质互刷策略，优先优化高质量讨论与订阅转化。",
    source: "https://x.com/XCreators/status/2012253930344898681",
    sourceType: "镜像转引",
    note: "来自 twstalker 抓取，建议登录 X 复核原帖。"
  },
  {
    date: "2026-01 下旬",
    title: "2026 创作者扶持方向明确",
    action: "建议把发文节奏升级为“稳定更新 + 周复盘 + 下一篇预告”。",
    source: "https://x.com/XCreators/status/2012253925202919521",
    sourceType: "官方 X"
  }
];

const SKILL_TRIGGER_PROMPT = `请使用 project-indexer 技能记录当前项目并更新全局索引；再用 x-articles-growth 技能生成 X 长文；最后用 multiplatform-content-ops 技能输出公众号/知乎/B站/小红书改写与合规提醒。`;

const checklist = [
  {
    title: "A. 选题与定位",
    items: [
      "一个核心人群，一个核心问题",
      "只保留一个核心观点",
      "读后动作明确（评论/转发/收藏/订阅）"
    ]
  },
  {
    title: "B. 标题与开头",
    items: [
      "标题满足：具体 + 好奇 + 价值",
      "首段先给结论/冲突/代价",
      "封面图主题相关且移动端清晰"
    ]
  },
  {
    title: "C. 结构与可读性",
    items: [
      "段落大多 2-4 行",
      "每 3-5 段一个小标题",
      "高密度信息列表化",
      "每段只讲一个观点"
    ]
  },
  {
    title: "D. 证据与可信度",
    items: [
      "关键观点配至少一种证据",
      "事实与推断明确区分",
      "不可验证数据已删或标注假设"
    ]
  },
  {
    title: "E. 合规与风控",
    items: [
      "避免互刷和诱导式互动",
      "素材来源可追溯，原创归属清晰",
      "若参与活动，已核对当期资格和规则"
    ]
  },
  {
    title: "F. 72 小时分发",
    items: [
      "发布前 2-6 小时发预热帖",
      "发布后置顶 24-72 小时",
      "已拆 5-12 条 Thread 回流",
      "预留首波评论回复窗口"
    ]
  },
  {
    title: "G. 订阅变现",
    items: [
      "订阅价值说清楚",
      "免费与付费边界清晰",
      "文末有下一期预告"
    ]
  },
  {
    title: "H. 发布后复盘",
    items: [
      "记录 24h 与 72h 曝光与互动",
      "标记最有效的标题-开头组合",
      "下一篇只保留 1 个动作、删除 1 个动作"
    ]
  }
];

function safeParse(raw, fallback) {
  try {
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function readInput() {
  return {
    topic: $("topic").value.trim() || "你的主题",
    audience: $("audience").value.trim() || "目标读者",
    thesis: $("thesis").value.trim() || "一个明确的核心观点",
    ctaGoal: $("ctaGoal").value.trim() || "执行你文章中的一个动作",
    tone: $("tone").value,
    username: $("username").value.trim().replace(/^@/, ""),
    evidence: $("evidence")
      .value.split("\n")
      .map((line) => line.replace(/^[-*]\s*/, "").trim())
      .filter(Boolean)
  };
}

function buildTitles(input) {
  const { topic, audience, thesis } = input;
  return [
    `为什么 90% 的人写不好「${topic}」，但你可以用这套方法直接超车`,
    `给 ${audience} 的 ${topic} 实战手册：从 0 到可复制增长`,
    `别再盲目发帖了：用「${thesis}」重构你的 X 内容策略`,
    `我用 72 小时把「${topic}」做成可增长系统，过程全拆开给你`,
    `关于 ${topic}，真正有效的不是努力，而是结构化执行`,
    `${audience} 最容易忽略的 3 个增长杠杆（第 2 个最关键）`,
    `把 ${topic} 做出结果：一篇长文 + 一条 Thread 的组合打法`,
    `你不需要更多技巧，你只需要这份 ${topic} 的发布清单`
  ];
}

function buildHooks(input) {
  return [
    `你以为 ${input.topic} 靠的是灵感，但真正拉开差距的是结构和节奏。`,
    `如果你还在凭感觉发布内容，你正在把本该属于你的增长机会拱手让人。`,
    `我把一套可复用的 ${input.topic} 流程跑了 30 天，结果比我预期更稳也更快。`
  ];
}

function buildArticle(input, titles, hooks) {
  const evidenceLines = input.evidence.length
    ? input.evidence.map((e, i) => `${i + 1}. ${e}`).join("\n")
    : "1. 在这里补充你的数据、案例或亲历证据\n2. 至少保留一个可验证的前后对比";

  return `# ${titles[0]}

**给谁看：** ${input.audience}

**核心观点：** ${input.thesis}

## 开场

${hooks[0]}

你不需要一次做对所有事。你只要把这篇文章读完，并执行后面的动作清单，就能开始看到变化。

## 为什么多数人做不出稳定结果

大部分人把重点放在“发了多少”，却忽略了“是否被推荐到正确人群的主页时间线”。

当你没有结构、没有证据、没有分发节奏时，内容再努力也很难持续放大。

## 一套可复制的执行框架

### 1) 先定义目标，而不是先写字

先写清楚三件事：谁是读者、核心判断是什么、读后动作是什么。

**没有目标的文章，通常只有信息，没有结果。**

### 2) 用标题和首段拿下前 8 秒

标题必须同时满足“具体 + 好奇 + 价值”。首段不要写背景，直接给结论或冲突。

### 3) 结构必须服务扫读

每段 2-4 行；每 3-5 段一个小标题；高密度信息列表化；每段一个观点。

### 4) 每个观点都要有证据

没有证据的观点只能叫观点，不叫说服力。你可以用数据、案例、亲历、前后对比。

## 证据示例（请替换为你的真实素材）

${evidenceLines}

## 发布与放大（72 小时）

- 发布前 2-6 小时：发预热帖，抛出问题或结果预告
- 发布后 0-2 小时：置顶 + 回复首波评论
- 发布后 6-24 小时：拆成 Thread 回流原文
- 发布后 24-72 小时：结合热点二次分发

## 结尾

如果你只做一件事，就先把这篇文章的框架照着跑一遍。

**行动建议：** ${input.ctaGoal}

你下一篇准备写什么主题？可以直接在评论区告诉我。`;
}

function splitPostAtBestPoint(text) {
  if (!text || text.length < 120) return [text, ""];

  const midpoint = Math.floor(text.length / 2);
  const delimiters = ["\n", "。", "！", "？", "；", "，", " "];

  let bestIndex = -1;
  let bestDistance = Infinity;

  for (let i = 0; i < text.length; i += 1) {
    if (!delimiters.includes(text[i])) continue;
    const distance = Math.abs(i - midpoint);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = i;
    }
  }

  if (bestIndex < 30 || bestIndex > text.length - 30) {
    bestIndex = midpoint;
  }

  const left = text.slice(0, bestIndex + 1).trim();
  const right = text.slice(bestIndex + 1).trim();
  return [left, right];
}

function enforceThreadCount(thread, minPosts = 5, maxPosts = 12) {
  const posts = [...thread];
  let guard = 0;

  while (posts.length < minPosts && guard < 40) {
    let maxIndex = 0;
    for (let i = 1; i < posts.length; i += 1) {
      if (posts[i].length > posts[maxIndex].length) {
        maxIndex = i;
      }
    }

    const [left, right] = splitPostAtBestPoint(posts[maxIndex]);
    if (!right) break;

    posts.splice(maxIndex, 1, left, right);
    guard += 1;
  }

  return posts.slice(0, maxPosts);
}

function splitThread(article) {
  const paragraphs = article
    .replace(/^#\s+/m, "")
    .split("\n\n")
    .map((p) => p.trim())
    .filter(Boolean);

  const thread = [];
  let current = "";

  for (const para of paragraphs) {
    const next = current ? `${current}\n\n${para}` : para;
    if (next.length > 260 && current) {
      thread.push(current);
      current = para;
    } else {
      current = next;
    }
  }

  if (current) thread.push(current);
  return enforceThreadCount(thread, 5, 12);
}

function buildPlan(input) {
  return [
    `T-6h 至 T-2h：发预热帖，聚焦「${input.topic}」的痛点问题，收集首波反馈。`,
    "T+0h：发布文章并置顶，首条评论补充行动清单或资源链接。",
    "T+1h：重点回复首波高质量评论，放大可信互动信号。",
    "T+6h：发布 Thread 摘要并回流到文章原文。",
    "T+24h：复盘标题点击与阅读深度，微调封面和引导文案。",
    "T+48h：结合相关热点做二次分发，保持语义一致。",
    "T+72h：记录曝光与订阅转化，提炼下篇保留动作与删除动作。"
  ];
}

function buildMonetize(input) {
  const link = input.username
    ? `https://x.com/${input.username}/creator-subscriptions/subscribe`
    : "https://x.com/YOURUSERNAME/creator-subscriptions/subscribe";

  return `订阅价值（建议放在文末）：
- 每周一次深度拆解：从选题到分发的完整复盘
- 提前发布：下篇文章草稿提前 24 小时开放
- 专属问答：每周集中回答 3 个订阅者问题

软付费墙设计：
- 免费部分：方法框架 + 一个案例
- 订阅部分：完整模板、素材库、执行复盘表

下一期预告：
- 下周我会公开「标题 AB 测试 + 72 小时分发实录」

订阅引导链接：
${link}`;
}

function renderTitles(titles) {
  $("titlesOutput").innerHTML = titles.map((t) => `<li>${escapeHtml(t)}</li>`).join("");
}

function renderHooks(hooks) {
  $("hooksOutput").innerHTML = hooks.map((h) => `<li>${escapeHtml(h)}</li>`).join("");
}

function renderThread(posts) {
  if (!posts.length) {
    $("threadOutput").innerHTML = '<p class="muted">还没有生成 Thread。</p>';
    return;
  }

  $("threadOutput").innerHTML = posts
    .map(
      (post, i) => `
      <article class="thread-item">
        <div class="thread-head">
          <strong>Post ${i + 1}</strong>
          <span>${post.length}/280</span>
        </div>
        <p class="thread-text">${escapeHtml(post)}</p>
      </article>
    `
    )
    .join("");
}

function renderPlan(plan) {
  $("planOutput").innerHTML = plan
    .map((item, i) => {
      const matched = item.match(/^([^：:]+)[：:]\s*(.+)$/);
      const time = matched ? matched[1] : `Step ${i + 1}`;
      const text = matched ? matched[2] : item;
      return `<li class="timeline-item"><span class="timeline-badge">${escapeHtml(time)}</span><p>${escapeHtml(
        text
      )}</p></li>`;
    })
    .join("");
}

function getSelectedPlatforms() {
  return Array.from(document.querySelectorAll("#platformChooser input[type='checkbox']:checked")).map((cb) => cb.value);
}

function stripMarkdown(text) {
  return String(text || "")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*/g, "")
    .replace(/`/g, "")
    .trim();
}

function collectKeyPoints(baseDraft, input) {
  const lines = stripMarkdown(baseDraft)
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  const points = lines
    .filter((line) => line.length >= 12 && line.length <= 90)
    .slice(0, 8);

  if (!points.length) {
    return [
      `围绕「${input.topic}」给出可执行方案`,
      `面向「${input.audience}」保持一个核心观点`,
      `最终引导读者完成动作：${input.ctaGoal}`
    ];
  }

  return points.slice(0, 6);
}

function limitText(text, maxLength) {
  const value = String(text || "").trim();
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1)}…`;
}

function buildPlatformTitles(platformKey, input) {
  switch (platformKey) {
    case "wechat":
      return [
        `给 ${input.audience} 的完整实操：${input.topic} 如何落地`,
        `${input.topic}：从思路到执行的 7 步清单`,
        `别再盲做了，这套 ${input.topic} 方法更稳`
      ];
    case "zhihu":
      return [
        `为什么很多人做不好「${input.topic}」？`,
        `${input.topic} 到底怎么做才高效？`,
        `${input.topic} 有哪些可复制的方法论？`
      ];
    case "bilibili":
      return [
        `我用 72 小时实测：${input.topic} 到底能不能打`,
        `${input.topic} 全流程拆解（附执行清单）`,
        `别再踩坑！${input.topic} 的关键 3 步`
      ];
    case "xiaohongshu":
      return [
        `${input.topic}｜我亲测有效的执行模板`,
        `做 ${input.topic} 的人，先看这份避坑清单`,
        `普通人也能上手的 ${input.topic} 方案`
      ];
    case "x":
    default:
      return [
        `为什么 90% 的人写不好「${input.topic}」，但你可以直接超车`,
        `给 ${input.audience} 的 ${input.topic} 实战手册`,
        `你不需要更多技巧，只要这份 ${input.topic} 发布框架`
      ];
  }
}

function buildPlatformDraft(platformKey, input, baseDraft, points) {
  const firstTitle = buildPlatformTitles(platformKey, input)[0];
  const base = stripMarkdown(baseDraft);
  const opening = limitText(base.split(/\n+/).find((line) => line.length > 30) || points[0], 110);
  const pointLines = points.slice(0, 5).map((p, i) => `${i + 1}. ${limitText(p, 88)}`).join("\n");

  if (platformKey === "wechat") {
    return `# ${firstTitle}

## 这篇给谁看
${input.audience}

## 你会拿到什么
${pointLines}

## 先说结论
${opening}

## 实操流程
1. 明确目标：${input.thesis}
2. 用短段落 + 小标题保证可扫读
3. 每个观点补至少一个证据
4. 结合发布时间线完成分发

## 结尾行动
${input.ctaGoal}

> 风险提醒：发布前请在公众号后台再次核对当日审核规则与违规词提示。`;
  }

  if (platformKey === "zhihu") {
    return `# ${firstTitle}

## 核心回答
${opening}

## 为什么会这样
${points.slice(0, 3).map((p) => `- ${limitText(p, 90)}`).join("\n")}

## 可执行方法
1. 目标读者：${input.audience}
2. 核心判断：${input.thesis}
3. 执行动作：${input.ctaGoal}

## 反例与边界
- 不建议只靠标题党放大曝光
- 不建议缺证据直接下结论

## 结语
如果你准备落地，可以先从一篇结构化长文开始。`;
  }

  if (platformKey === "bilibili") {
    return `# ${firstTitle}

【15 秒开场钩子】
${opening}

【本期你将看到】
${points.slice(0, 4).map((p, i) => `${i + 1}. ${limitText(p, 85)}`).join("\n")}

【正文脚本】
第一段：问题背景 + 错误做法  
第二段：正确框架（${input.thesis}）  
第三段：案例拆解（前后对比）  
第四段：72 小时分发动作（预热/首发/回流）  

【结尾互动】
如果你要我下一期继续拆解，评论区回复：模板。`;
  }

  if (platformKey === "xiaohongshu") {
    return `# ${firstTitle}

先说结果：${opening}

## 适用人群
${input.audience}

## 我的执行清单
${points.slice(0, 5).map((p) => `- ${limitText(p, 82)}`).join("\n")}

## 你可以直接照抄的动作
1. 先定 1 个核心观点：${input.thesis}
2. 再做 1 套发布节奏：预热 -> 正文 -> 回流
3. 文末一定给动作：${input.ctaGoal}

收藏这篇，发文前按清单对一遍。`;
  }

  return `# ${firstTitle}

${opening}

## 核心观点
${input.thesis}

## 关键要点
${points.slice(0, 5).map((p) => `- ${limitText(p, 90)}`).join("\n")}

## 下一步
${input.ctaGoal}`;
}

function detectSensitiveTerms(platformKey, text) {
  const raw = stripMarkdown(text);
  const rules = platformSensitiveRules[platformKey] || [];
  const hits = [];

  rules.forEach((rule) => {
    const regex = new RegExp(rule.regex.source, "i");
    const matched = raw.match(regex);
    if (!matched) return;
    hits.push({
      matched: matched[0],
      suggestion: rule.suggestion
    });
  });

  return hits;
}

function buildPlatformPackage(platformKey, input, baseDraft) {
  const profile = platformProfiles[platformKey];
  if (!profile) return null;

  const points = collectKeyPoints(baseDraft, input);
  const titles = buildPlatformTitles(platformKey, input);
  const draft = buildPlatformDraft(platformKey, input, baseDraft, points);
  const sensitiveHits = detectSensitiveTerms(platformKey, draft);

  return {
    key: platformKey,
    label: profile.label,
    fit: profile.fit,
    targetLength: profile.targetLength,
    titles,
    draft,
    checklist: profile.checklist,
    riskWarnings: profile.riskWarnings,
    sensitiveHits,
    officialLinks: profile.officialLinks,
    caseLinks: profile.caseLinks
  };
}

function renderPlatformCards(packages) {
  const entries = Object.values(packages || {});
  if (!entries.length) {
    $("platformCards").innerHTML = '<p class="muted">选择平台后点击“基于当前草稿生成所选平台版本”。</p>';
    return;
  }

  $("platformCards").innerHTML = entries
    .map(
      (pkg) => `
      <article class="platform-card">
        <div class="platform-card-head">
          <div>
            <div class="platform-name">${escapeHtml(pkg.label)}</div>
            <div class="platform-meta">${escapeHtml(pkg.fit)} ｜ 建议长度：${escapeHtml(pkg.targetLength)}</div>
          </div>
          <button class="btn btn-secondary platform-copy-btn" data-platform="${escapeHtml(pkg.key)}">复制该平台内容</button>
        </div>
        <div class="platform-columns">
          <section class="platform-block">
            <h4>标题候选</h4>
            <ul class="output-list">${pkg.titles.map((t) => `<li>${escapeHtml(t)}</li>`).join("")}</ul>
            <h4>发布前检查</h4>
            <ul class="output-list">${pkg.checklist.map((c) => `<li>${escapeHtml(c)}</li>`).join("")}</ul>
          </section>
          <section class="platform-block">
            <h4>审核风险提醒</h4>
            <ul class="output-list">${pkg.riskWarnings.map((r) => `<li>${escapeHtml(r)}</li>`).join("")}</ul>
            <h4>命中高风险表达</h4>
            <ul class="output-list">
              ${
                pkg.sensitiveHits.length
                  ? pkg.sensitiveHits
                      .map(
                        (hit) =>
                          `<li>命中「${escapeHtml(hit.matched)}」：${escapeHtml(hit.suggestion)}</li>`
                      )
                      .join("")
                  : "<li>未命中常见高风险词（仍建议发布前走平台后台复检）。</li>"
              }
            </ul>
            <h4>官方参考</h4>
            <ul class="output-list">
              ${pkg.officialLinks
                .map((link) => `<li><a href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(link.label)}</a></li>`)
                .join("")}
            </ul>
          </section>
        </div>
        <textarea class="platform-draft" readonly>${escapeHtml(pkg.draft)}</textarea>
      </article>
    `
    )
    .join("");
}

function extractSensitiveKeywords(rule) {
  return rule.regex.source
    .split("|")
    .map((part) => part.replace(/[\\^$?*+()[\]{}]/g, "").trim())
    .filter(Boolean)
    .slice(0, 4)
    .join(" / ");
}

function renderSensitivePanel(platformFilter) {
  const keys =
    platformFilter === "all"
      ? Object.keys(platformSensitiveRules)
      : platformSensitiveRules[platformFilter]
        ? [platformFilter]
        : [];

  if (!keys.length) {
    $("resourceSensitivePanel").innerHTML = "";
    return;
  }

  const listItems = keys
    .map((key) => {
      const label = platformProfiles[key]?.label || resourcePlatformLabels[key] || key;
      const rules = (platformSensitiveRules[key] || []).slice(0, 2);
      if (!rules.length) return `<li><strong>${escapeHtml(label)}</strong>：暂无内置敏感词样例。</li>`;
      return `<li><strong>${escapeHtml(label)}</strong>：${rules
        .map((rule) => `${escapeHtml(extractSensitiveKeywords(rule))}（${escapeHtml(rule.suggestion)}）`)
        .join("；")}</li>`;
    })
    .join("");

  $("resourceSensitivePanel").innerHTML = `
    <h4>敏感表达速览（样例）</h4>
    <ul class="resource-links">${listItems}</ul>
  `;
}

function renderResourceCards() {
  const platformFilter = $("resourcePlatformSelect")?.value || "all";
  const typeFilter = $("resourceTypeSelect")?.value || "all";

  const cards = resourceCatalog.filter((card) => {
    const platformMatch = platformFilter === "all" || card.platforms.includes(platformFilter);
    const typeMatch = typeFilter === "all" || card.type === typeFilter;
    return platformMatch && typeMatch;
  });

  const platformLabel = platformFilter === "all" ? "全部平台" : platformProfiles[platformFilter]?.label || resourcePlatformLabels[platformFilter];
  const typeLabel = typeFilter === "all" ? "全部分类" : resourceTypeLabels[typeFilter] || typeFilter;
  $("resourceSummary").textContent = `当前筛选：${platformLabel} / ${typeLabel}，共 ${cards.length} 组资源。`;
  renderSensitivePanel(platformFilter);

  if (!cards.length) {
    $("resourceCards").innerHTML = '<p class="muted">当前筛选下暂无资源，试试切换平台或分类。</p>';
    return;
  }

  $("resourceCards").innerHTML = cards
    .map(
      (card) => `
      <article class="resource-card">
        <h4>${escapeHtml(card.title)}</h4>
        <p class="platform-meta">分类：${escapeHtml(resourceTypeLabels[card.type] || card.type)} ｜ 平台：${escapeHtml(
          card.platforms.map((key) => platformProfiles[key]?.label || resourcePlatformLabels[key] || key).join(" / ")
        )}</p>
        <ul class="resource-links">
          ${card.links
            .map(
              (link) =>
                `<li><a href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(link.label)}</a></li>`
            )
            .join("")}
        </ul>
      </article>
    `
    )
    .join("");
}

function renderRecentSignals() {
  $("recentSignalsOutput").innerHTML = xCreatorsRecentSignals
    .map(
      (item) => {
        const sourceType = item.sourceType ? `<em>（${escapeHtml(item.sourceType)}）</em>` : "";
        const note = item.note ? ` <span class="muted">${escapeHtml(item.note)}</span>` : "";
        return (
        `<li><strong>[${escapeHtml(item.date)}] ${escapeHtml(item.title)}</strong>：${escapeHtml(item.action)} <a href="${escapeHtml(
          item.source
        )}" target="_blank" rel="noopener noreferrer">来源</a> ${sourceType}${note}</li>`
        );
      }
    )
    .join("");
}

function buildAutomationCommands() {
  const input = readInput();
  const selectedPlatforms = getSelectedPlatforms();
  const tags = ["content", "automation", "publishing", ...selectedPlatforms].join(",");
  const platforms = selectedPlatforms.length ? selectedPlatforms.join(",") : "x,wechat,zhihu,bilibili,xiaohongshu";
  const summary = limitText(
    input.topic
      ? `${input.topic}：支持 X 草稿共享到多平台改写、分发和审核提醒。`
      : "多平台内容发布工具：支持 X 草稿共享改写、分发与审核提醒。",
    100
  );

  return `# 注册或更新当前项目（把路径替换为你的项目绝对路径）
python3 ~/.codex/skills/project-indexer/scripts/upsert_project_index.py \\
  --cwd "/ABSOLUTE/PROJECT/PATH" \\
  --summary "${summary}" \\
  --tags "${tags}" \\
  --stack "HTML,CSS,Vanilla JS,PWA,Vercel" \\
  --platforms "${platforms}"

# 检索历史项目
python3 ~/.codex/skills/project-indexer/scripts/search_project_index.py "AiX"

# 技能串联（复制到对话中即可触发）
请使用 x-articles-growth 生成 X 长文与 Thread；再使用 multiplatform-content-ops 把同一草稿适配到 ${platforms}，并输出敏感词与审核提醒。

# 常用触发词
记录项目 / 建立索引 / 搜索项目 / 更新项目台账`;
}

function renderAutomationCommands() {
  $("automationCmdOutput").value = buildAutomationCommands();
}

function generatePlatformPackages(showFlash = true) {
  const selected = getSelectedPlatforms();
  if (!selected.length) {
    state.platformPackages = {};
    renderPlatformCards(state.platformPackages);
    if (showFlash) flash("请先选择至少一个平台");
    return;
  }

  const input = readInput();
  const baseDraft = $("articleOutput").value.trim() || state.article || buildArticle(input, buildTitles(input), buildHooks(input));
  const output = {};
  selected.forEach((key) => {
    const pkg = buildPlatformPackage(key, input, baseDraft);
    if (pkg) output[key] = pkg;
  });
  state.platformPackages = output;
  renderPlatformCards(state.platformPackages);
  if (showFlash) flash("平台版本已生成");
}

function copyPlatformPackages() {
  const entries = Object.values(state.platformPackages || {});
  if (!entries.length) {
    flash("还没有平台输出");
    return;
  }

  const content = entries
    .map(
      (pkg) => `## ${pkg.label}\n\n### 标题候选\n${pkg.titles.map((t) => `- ${t}`).join("\n")}\n\n### 草稿\n${pkg.draft}\n\n### 审核提醒\n${pkg.riskWarnings
        .map((r) => `- ${r}`)
        .join("\n")}\n\n### 高风险表达命中\n${
        pkg.sensitiveHits.length
          ? pkg.sensitiveHits.map((hit) => `- 命中「${hit.matched}」：${hit.suggestion}`).join("\n")
          : "- 未命中常见高风险词（仍建议后台复检）"
      }`
    )
    .join("\n\n---\n\n");

  copyText(content, "全部平台建议已复制");
}

function clearPlatformPackages() {
  state.platformPackages = {};
  renderPlatformCards(state.platformPackages);
}

function getChecklistStats() {
  const all = document.querySelectorAll("input[type='checkbox'][data-key]");
  if (!all.length) {
    const total = checklist.reduce((sum, section) => sum + section.items.length, 0);
    return { checked: 0, total, ratio: 0 };
  }
  const checked = document.querySelectorAll("input[type='checkbox'][data-key]:checked").length;
  const total = all.length;
  return { checked, total, ratio: checked / total };
}

function calculateQuality(input) {
  const article = $("articleOutput").value.trim();
  const paragraphs = article
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  const shortParagraphs = paragraphs.filter((p) => p.split("\n").length <= 4 && p.length <= 220).length;
  const subHeadingCount = (article.match(/^##\s+/gm) || []).length;
  const bulletCount = (article.match(/^\s*[-*]\s+/gm) || []).length;
  const checklistStats = getChecklistStats();

  const positioningScore = Math.round(
    [input.topic, input.audience, input.thesis, input.ctaGoal].filter((v) => Boolean(v && v.trim())).length * 3.75
  ); // /15

  const titleHookScore = Math.min(
    15,
    Math.round(
      (Math.min(state.titles.length, 6) / 6) * 9 +
        (Math.min(state.hooks.length, 3) / 3) * 4 +
        ((state.titles[0] || "").length >= 16 && (state.titles[0] || "").length <= 65 ? 2 : 0)
    )
  );

  const structureScore = Math.min(
    20,
    Math.round(
      Math.min(subHeadingCount, 5) * 2.4 +
        (paragraphs.length ? (shortParagraphs / paragraphs.length) * 8 : 0) +
        (bulletCount >= 3 ? 4 : bulletCount > 0 ? 2 : 0)
    )
  );

  const evidenceCount = input.evidence.length;
  const evidenceScore = evidenceCount >= 3 ? 15 : evidenceCount === 2 ? 11 : evidenceCount === 1 ? 6 : 0;

  let distributionScore = 0;
  if (state.thread.length >= 5 && state.thread.length <= 12) distributionScore += 8;
  else if (state.thread.length >= 3) distributionScore += 5;
  if (state.plan.length >= 6) distributionScore += 5;
  if ((state.thread[0] || "").length > 0 && (state.thread[0] || "").length <= 280) distributionScore += 2;
  distributionScore = Math.min(15, distributionScore);

  let monetizeScore = 0;
  if (input.username && input.username.trim()) monetizeScore += 3;
  if (state.monetize.includes("creator-subscriptions/subscribe")) monetizeScore += 4;
  if (/(下一期|下周)/.test(state.monetize)) monetizeScore += 3;
  monetizeScore = Math.min(10, monetizeScore);

  const executionScore = Math.round(checklistStats.ratio * 10);

  const metrics = [
    { name: "定位", score: positioningScore, max: 15 },
    { name: "标题钩子", score: titleHookScore, max: 15 },
    { name: "结构扫读", score: structureScore, max: 20 },
    { name: "证据力度", score: evidenceScore, max: 15 },
    { name: "分发准备", score: distributionScore, max: 15 },
    { name: "变现准备", score: monetizeScore, max: 10 },
    { name: "执行准备", score: executionScore, max: 10 }
  ];

  const total = metrics.reduce((sum, metric) => sum + metric.score, 0);

  const tips = [];
  if (positioningScore < 12) tips.push("补全“主题-人群-核心观点-读后动作”四要素，减少跑题风险。");
  if (titleHookScore < 11) tips.push("至少保留 5 个标题候选，并把首标题压到 16-65 字。");
  if (structureScore < 15) tips.push("增加小标题与列表，把段落尽量压缩到 2-4 行。");
  if (evidenceScore < 11) tips.push("至少准备 2-3 条可验证证据（数据、案例或前后对比）。");
  if (distributionScore < 12) tips.push("将 Thread 调整到 5-12 条，并确保 72h 节奏完整。");
  if (monetizeScore < 8) tips.push("补齐订阅链接、付费边界和下期预告。");
  if (executionScore < 6) tips.push("发布前先完成自检清单，避免执行断层。");
  if (!tips.length) tips.push("结构和执行已经达标，可以进入发布与复盘阶段。");

  let tag = "待优化";
  let level = "medium";
  if (total >= 85) {
    tag = "可直接发布";
    level = "good";
  } else if (total < 70) {
    tag = "建议先修改";
    level = "low";
  }

  return { total, metrics, tips, tag, level };
}

function renderQuality(quality) {
  if (!quality) {
    $("qualityScore").textContent = "0";
    $("qualityTag").textContent = "待生成";
    $("qualityTag").className = "score-tag";
    $("qualityBar").style.width = "0%";
    $("qualityMetrics").innerHTML = "";
    $("qualityTips").innerHTML = '<li class="muted">生成内容后会给出评分与建议。</li>';
    return;
  }

  $("qualityScore").textContent = String(quality.total);
  $("qualityTag").textContent = quality.tag;
  $("qualityTag").className = `score-tag ${quality.level}`;
  $("qualityBar").style.width = `${quality.total}%`;
  $("qualityMetrics").innerHTML = quality.metrics
    .map(
      (metric) =>
        `<article class="metric-item"><span class="name">${escapeHtml(metric.name)}</span><span class="value">${metric.score}/${metric.max}</span></article>`
    )
    .join("");
  $("qualityTips").innerHTML = quality.tips.map((tip) => `<li>${escapeHtml(tip)}</li>`).join("");
}

function renderChecklist() {
  $("checklistContainer").innerHTML = checklist
    .map(
      (section, sIndex) => `
        <section class="check-section">
          <h4>${escapeHtml(section.title)}</h4>
          ${section.items
            .map(
              (item, iIndex) => `
            <label class="check-item">
              <input type="checkbox" data-key="${sIndex}-${iIndex}" />
              <span>${escapeHtml(item)}</span>
            </label>`
            )
            .join("")}
        </section>
      `
    )
    .join("");

  const saved = safeParse(localStorage.getItem(CHECKLIST_KEY) || "{}", {});
  document.querySelectorAll("input[type='checkbox'][data-key]").forEach((cb) => {
    cb.checked = Boolean(saved[cb.dataset.key]);
    cb.addEventListener("change", () => {
      const latest = safeParse(localStorage.getItem(CHECKLIST_KEY) || "{}", {});
      latest[cb.dataset.key] = cb.checked;
      localStorage.setItem(CHECKLIST_KEY, JSON.stringify(latest));
      updateQuality();
    });
  });
}

function updateQuality() {
  const quality = calculateQuality(readInput());
  state.quality = quality;
  renderQuality(quality);
}

function generateAll() {
  const input = readInput();
  state.titles = buildTitles(input);
  state.hooks = buildHooks(input);
  state.article = buildArticle(input, state.titles, state.hooks);
  state.thread = splitThread(state.article);
  state.plan = buildPlan(input);
  state.monetize = buildMonetize(input);

  renderTitles(state.titles);
  renderHooks(state.hooks);
  $("articleOutput").value = state.article;
  renderThread(state.thread);
  renderPlan(state.plan);
  $("monetizeOutput").value = state.monetize;
  updateQuality();
  generatePlatformPackages(false);
}

function escapeHtml(text) {
  const value = String(text ?? "");
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function copyText(text, successMessage = "已复制") {
  if (!text.trim()) return;
  navigator.clipboard.writeText(text).then(() => {
    flash(successMessage);
  });
}

function flash(message) {
  const tip = document.createElement("div");
  tip.textContent = message;
  tip.style.position = "fixed";
  tip.style.right = "16px";
  tip.style.bottom = "16px";
  tip.style.background = "#0e2d42";
  tip.style.color = "#eaf6ff";
  tip.style.padding = "10px 14px";
  tip.style.borderRadius = "10px";
  tip.style.border = "1px solid rgba(140,231,255,.35)";
  tip.style.zIndex = "9999";
  tip.style.boxShadow = "0 10px 25px rgba(0,0,0,.35)";
  document.body.appendChild(tip);
  setTimeout(() => tip.remove(), 1300);
}

function buildMarkdownExport() {
  const article = $("articleOutput").value.trim();
  const monetize = $("monetizeOutput").value.trim();
  const thread = state.thread.map((p, i) => `### Post ${i + 1}\n${p}`).join("\n\n");
  const plan = state.plan.map((p) => `- ${p}`).join("\n");
  const platforms = Object.values(state.platformPackages || {})
    .map(
      (pkg) =>
        `### ${pkg.label}\n\n#### 标题候选\n${pkg.titles.map((t) => `- ${t}`).join("\n")}\n\n#### 草稿\n${pkg.draft}\n\n#### 审核提醒\n${pkg.riskWarnings
          .map((r) => `- ${r}`)
          .join("\n")}`
    )
    .join("\n\n");
  const qualitySummary = state.quality
    ? `- 总分：${state.quality.total}/100\n- 标签：${state.quality.tag}\n`
    : "- 尚未评分\n";

  return `# X Articles Studio 导出\n\n## 内容质量评分\n\n${qualitySummary}\n## 文章草稿\n\n${article}\n\n## Thread\n\n${thread}\n\n## 72 小时分发\n\n${plan}\n\n## 订阅变现\n\n${monetize}\n\n## 多平台版本\n\n${platforms || "暂无平台输出"}\n`;
}

function downloadMarkdown() {
  const content = buildMarkdownExport();
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `x-article-${Date.now()}.md`;
  a.click();
  URL.revokeObjectURL(url);
}

function openIntent(text) {
  const url = `https://x.com/intent/post?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

function snapshotState() {
  const platformPackages = Object.fromEntries(
    Object.entries(state.platformPackages || {}).map(([key, pkg]) => [
      key,
      {
        ...pkg,
        titles: [...(pkg.titles || [])],
        checklist: [...(pkg.checklist || [])],
        riskWarnings: [...(pkg.riskWarnings || [])],
        officialLinks: [...(pkg.officialLinks || [])],
        caseLinks: [...(pkg.caseLinks || [])]
      }
    ])
  );

  return {
    titles: [...state.titles],
    hooks: [...state.hooks],
    article: state.article,
    thread: [...state.thread],
    plan: [...state.plan],
    monetize: state.monetize,
    quality: state.quality ? { ...state.quality, metrics: [...state.quality.metrics], tips: [...state.quality.tips] } : null,
    platformPackages
  };
}

function createDraftPayload() {
  return {
    topic: $("topic").value,
    audience: $("audience").value,
    thesis: $("thesis").value,
    ctaGoal: $("ctaGoal").value,
    tone: $("tone").value,
    username: $("username").value,
    evidence: $("evidence").value,
    articleOutput: $("articleOutput").value,
    monetizeOutput: $("monetizeOutput").value,
    state: snapshotState(),
    savedAt: new Date().toISOString()
  };
}

function getHistory() {
  return safeParse(localStorage.getItem(HISTORY_KEY) || "[]", []);
}

function setHistory(history) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

function pushHistorySnapshot(payload) {
  const history = getHistory();
  const latest = history[0];

  const isDuplicate =
    latest &&
    latest.payload &&
    latest.payload.topic === payload.topic &&
    latest.payload.articleOutput === payload.articleOutput &&
    latest.payload.monetizeOutput === payload.monetizeOutput;

  if (isDuplicate) return;

  history.unshift({
    id: String(Date.now()),
    createdAt: new Date().toISOString(),
    topic: payload.topic || "未命名主题",
    audience: payload.audience || "",
    payload
  });

  setHistory(history.slice(0, MAX_HISTORY));
}

function formatDateTime(iso) {
  try {
    return new Date(iso).toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch {
    return iso;
  }
}

function renderHistoryMeta(historyItem) {
  if (!historyItem) {
    $("historyMeta").textContent = "点击“保存草稿”后，会自动沉淀历史版本（最多 12 条）。";
    return;
  }

  $("historyMeta").textContent = `保存时间：${formatDateTime(historyItem.createdAt)} ｜ 主题：${historyItem.topic || "未命名"} ｜ 受众：${
    historyItem.audience || "未填写"
  }`;
}

function renderHistory() {
  const history = getHistory();
  const select = $("historySelect");

  if (!history.length) {
    select.innerHTML = '<option value="">暂无历史版本</option>';
    renderHistoryMeta(null);
    return;
  }

  select.innerHTML = history
    .map((item) => {
      const label = `${formatDateTime(item.createdAt)} · ${(item.topic || "未命名主题").slice(0, 28)}`;
      return `<option value="${escapeHtml(item.id)}">${escapeHtml(label)}</option>`;
    })
    .join("");

  if (!history.some((item) => item.id === select.value)) {
    select.value = history[0].id;
  }

  const current = history.find((item) => item.id === select.value) || history[0];
  renderHistoryMeta(current);
}

function applyDraft(data) {
  $("topic").value = data.topic || "";
  $("audience").value = data.audience || "";
  $("thesis").value = data.thesis || "";
  $("ctaGoal").value = data.ctaGoal || "";
  $("tone").value = data.tone || "理性拆解";
  $("username").value = data.username || "";
  $("evidence").value = data.evidence || "";
  $("articleOutput").value = data.articleOutput || "";
  $("monetizeOutput").value = data.monetizeOutput || "";
  state.platformPackages = {};

  if (data.state) {
    state.titles = data.state.titles || [];
    state.hooks = data.state.hooks || [];
    state.article = data.state.article || data.articleOutput || "";
    state.thread = data.state.thread || [];
    state.plan = data.state.plan || [];
    state.monetize = data.state.monetize || data.monetizeOutput || "";
    state.platformPackages = data.state.platformPackages || {};
  }

  renderTitles(state.titles);
  renderHooks(state.hooks);
  renderThread(state.thread);
  renderPlan(state.plan);
  renderPlatformCards(state.platformPackages);
  updateQuality();
}

function saveDraft() {
  const payload = createDraftPayload();
  localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
  pushHistorySnapshot(payload);
  renderHistory();
  flash("草稿已保存并加入历史版本");
}

function loadDraft() {
  const raw = localStorage.getItem(DRAFT_KEY);
  if (!raw) {
    flash("没有可读取的草稿");
    return;
  }
  const data = safeParse(raw, null);
  if (!data) {
    flash("草稿读取失败");
    return;
  }
  applyDraft(data);
  flash("草稿已读取");
}

function loadHistoryVersion() {
  const selectedId = $("historySelect").value;
  const history = getHistory();
  const item = history.find((entry) => entry.id === selectedId);
  if (!item) {
    flash("请选择一个历史版本");
    return;
  }

  applyDraft(item.payload);
  renderHistoryMeta(item);
  flash("已加载历史版本");
}

function deleteHistoryVersion() {
  const selectedId = $("historySelect").value;
  const history = getHistory();
  const next = history.filter((item) => item.id !== selectedId);

  if (next.length === history.length) {
    flash("没有可删除的版本");
    return;
  }

  setHistory(next);
  renderHistory();
  flash("历史版本已删除");
}

function fillSample() {
  $("topic").value = "用 AI 流程化写作拿下 X 长文增长";
  $("audience").value = "想做 X 自媒体增长的个人创作者";
  $("thesis").value = "把写作拆成模板与复盘闭环，比凭感觉更新更快起量";
  $("ctaGoal").value = "按清单发布你的第一篇 X Article 并拆成 Thread";
  $("tone").value = "理性拆解";
  $("username").value = "demo_creator";
  $("evidence").value =
    "- 连续 4 周每周 2 篇长文，主页点击率提升 2.1 倍\n- 一篇长文拆成 8 条 Thread，回流阅读占比 37%\n- 文末加订阅预告后，订阅转化率从 0.6% 提升到 1.4%";
  generateAll();
  flash("示例内容已填充");
}

function resetAll() {
  ["topic", "audience", "thesis", "ctaGoal", "username", "evidence", "articleOutput", "monetizeOutput"].forEach((id) => {
    $(id).value = "";
  });
  $("tone").value = "理性拆解";
  $("resourcePlatformSelect").value = "all";
  $("resourceTypeSelect").value = "all";

  state.titles = [];
  state.hooks = [];
  state.article = "";
  state.thread = [];
  state.plan = [];
  state.monetize = "";
  state.quality = null;
  state.platformPackages = {};

  renderTitles([]);
  renderHooks([]);
  renderThread([]);
  renderPlan([]);
  renderPlatformCards({});
  renderQuality(null);
  renderAutomationCommands();
  renderResourceCards();
}

function bindEvents() {
  $("generateBtn").addEventListener("click", generateAll);
  $("resetBtn").addEventListener("click", resetAll);
  $("fillSampleBtn").addEventListener("click", fillSample);

  $("copyArticleBtn").addEventListener("click", () => copyText($("articleOutput").value, "文章已复制"));
  $("copyThreadBtn").addEventListener("click", () => copyText(state.thread.join("\n\n---\n\n"), "Thread 已复制"));
  $("saveDraftBtn").addEventListener("click", saveDraft);
  $("loadDraftBtn").addEventListener("click", loadDraft);
  $("loadHistoryBtn").addEventListener("click", loadHistoryVersion);
  $("deleteHistoryBtn").addEventListener("click", deleteHistoryVersion);
  $("generatePlatformsBtn").addEventListener("click", () => generatePlatformPackages(true));
  $("copyPlatformsBtn").addEventListener("click", copyPlatformPackages);
  $("clearPlatformsBtn").addEventListener("click", clearPlatformPackages);
  $("copyAutomationCmdBtn").addEventListener("click", () =>
    copyText($("automationCmdOutput").value, "索引命令已复制")
  );
  $("copySkillPromptBtn").addEventListener("click", () => copyText(SKILL_TRIGGER_PROMPT, "技能触发词已复制"));
  $("platformChooser").addEventListener("change", () => {
    if (Object.keys(state.platformPackages || {}).length) generatePlatformPackages(false);
    renderAutomationCommands();
  });
  $("historySelect").addEventListener("change", () => {
    const history = getHistory();
    const item = history.find((entry) => entry.id === $("historySelect").value);
    renderHistoryMeta(item || null);
  });
  $("resourcePlatformSelect").addEventListener("change", renderResourceCards);
  $("resourceTypeSelect").addEventListener("change", renderResourceCards);

  document.querySelector(".card-inputs").addEventListener("input", () => {
    renderAutomationCommands();
  });

  $("platformCards").addEventListener("click", (event) => {
    const button = event.target.closest(".platform-copy-btn");
    if (!button) return;
    const key = button.dataset.platform;
    const pkg = state.platformPackages[key];
    if (!pkg) return;
    const text = `# ${pkg.label}\n\n${pkg.draft}\n\n审核提醒：\n${pkg.riskWarnings
      .map((r) => `- ${r}`)
      .join("\n")}\n\n高风险表达命中：\n${
      pkg.sensitiveHits.length
        ? pkg.sensitiveHits.map((hit) => `- 命中「${hit.matched}」：${hit.suggestion}`).join("\n")
        : "- 未命中常见高风险词（仍建议后台复检）"
    }`;
    copyText(text, `${pkg.label} 内容已复制`);
  });

  $("exportMarkdownBtn").addEventListener("click", downloadMarkdown);

  $("openTeaserIntentBtn").addEventListener("click", () => {
    const input = readInput();
    openIntent(`我刚写完一篇关于「${input.topic}」的长文，重点拆解了：${input.thesis}。晚点发布，先把你最关心的问题留在评论区。`);
  });

  $("openThreadIntentBtn").addEventListener("click", () => {
    const text = state.thread[0] || "我把这篇文章拆成了 Thread，下面是核心要点。";
    openIntent(text);
  });

  $("openSubIntentBtn").addEventListener("click", () => {
    const input = readInput();
    const link = input.username
      ? `https://x.com/${input.username}/creator-subscriptions/subscribe`
      : "https://x.com/YOURUSERNAME/creator-subscriptions/subscribe";

    openIntent(`如果你想看我每周的深度拆解和下一篇提前版，可以订阅我：${link}`);
  });

  document.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();
    const hasMeta = event.metaKey || event.ctrlKey;

    if (hasMeta && key === "s") {
      event.preventDefault();
      saveDraft();
    }

    if (hasMeta && event.key === "Enter") {
      event.preventDefault();
      generateAll();
    }
  });
}

function initPwa() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js").catch(() => null);
  }
}

function init() {
  renderChecklist();
  renderHistory();
  renderQuality(null);
  renderPlatformCards({});
  renderResourceCards();
  renderAutomationCommands();
  renderRecentSignals();
  bindEvents();
  initPwa();
}

init();
