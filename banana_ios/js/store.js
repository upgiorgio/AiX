/**
 * store.js - 轻量级响应式状态管理系统
 *
 * 提供全局状态管理、订阅通知、LocalStorage 持久化
 * 类似 Vuex / Zustand 的极简实现，适配 iOS 风格应用
 */

;(function () {
  'use strict';

  // ============================================================
  // 默认模板数据（12+ 条中文社交媒体模板）
  // ============================================================
  const DEFAULT_TEMPLATES = [
    {
      id: 'tpl_001',
      title: '小红书种草 · 美食探店',
      category: '种草',
      platform: 'xiaohongshu',
      content: '姐妹们！！！这家店我真的要吹爆 🔥\n\n📍 坐标：[城市/商圈]\n💰 人均：[价格]\n\n👉 必点推荐：\n1️⃣ [菜品1] — 一口下去直接封神\n2️⃣ [菜品2] — 颜值高到不舍得吃\n3️⃣ [菜品3] — 性价比之王\n\n📸 环境超级出片，随手一拍就是大片\n⏰ 建议避开周末高峰，工作日去体验更好\n\n#美食探店 #吃货日记 #探店打卡 #[城市]美食',
      previewText: '美食探店种草模板，适合分享新发现的餐厅',
      usageCount: 2847
    },
    {
      id: 'tpl_002',
      title: '小红书种草 · 好物分享',
      category: '种草',
      platform: 'xiaohongshu',
      content: '用了一个月，终于可以来交作业了 ✨\n\n🏷 产品：[产品名称]\n💰 价格：[价格区间]\n📦 购入渠道：[渠道]\n\n✅ 优点：\n• [优点1]\n• [优点2]\n• [优点3]\n\n❌ 小缺点：\n• [缺点1]（但瑕不掩瑜）\n\n💯 总体评分：⭐⭐⭐⭐⭐\n📝 一句话总结：[总结语]\n\n#好物分享 #真实测评 #购物攻略',
      previewText: '好物推荐模板，适合产品测评与种草',
      usageCount: 3156
    },
    {
      id: 'tpl_003',
      title: '抖音视频 · 知识科普',
      category: '教育',
      platform: 'douyin',
      content: '你知道吗？[一个反常识的知识点] 🤯\n\n很多人以为[常见误解]，但实际上[正确解释]\n\n今天用1分钟给大家讲清楚：\n\n第一，[要点1]\n第二，[要点2]\n第三，[要点3]\n\n看完记得点赞收藏，下次就不用到处找了 👆\n\n#涨知识 #科普 #[领域]知识 #干货分享',
      previewText: '知识科普短视频文案，适合教育类内容',
      usageCount: 1893
    },
    {
      id: 'tpl_004',
      title: '抖音视频 · 生活Vlog',
      category: '生活',
      platform: 'douyin',
      content: '📹 [城市]的第[N]天\n\n早上 ☀️ [晨间活动]\n中午 🍜 [午餐/活动]\n下午 ☕ [下午活动]\n晚上 🌙 [晚间活动]\n\n今天最开心的事：[一件小事]\n今天的花费：💰 [金额]\n\n生活就是这些平凡又美好的瞬间 ❤️\n\n#日常vlog #生活记录 #[城市]生活',
      previewText: '日常Vlog文案模板，记录生活点滴',
      usageCount: 2234
    },
    {
      id: 'tpl_005',
      title: '微信公众号 · 深度干货',
      category: '教育',
      platform: 'wechat',
      content: '# [标题：用数字+痛点，如"3个方法让你的XXX提升200%"]\n\n你是不是也遇到过这样的困扰？\n\n[描述一个具体场景，让读者产生共鸣]\n\n今天这篇文章，我将结合[X年/个]经验，给你分享[N]个经过验证的方法。\n\n---\n\n## 01 [方法一标题]\n\n[详细阐述，配合案例或数据]\n\n> 💡 关键要点：[一句话总结]\n\n## 02 [方法二标题]\n\n[详细阐述，配合案例或数据]\n\n> 💡 关键要点：[一句话总结]\n\n## 03 [方法三标题]\n\n[详细阐述，配合案例或数据]\n\n> 💡 关键要点：[一句话总结]\n\n---\n\n## 写在最后\n\n[总结全文，给出行动建议]\n\n**觉得有用的话，记得点赞、在看、分享三连 👇**',
      previewText: '公众号深度文章模板，适合干货分享',
      usageCount: 4521
    },
    {
      id: 'tpl_006',
      title: '微信公众号 · 热点解读',
      category: '营销',
      platform: 'wechat',
      content: '# [热点事件] + 我的看法\n\n最近 [热点事件简述] 刷屏了。\n\n看完各方观点后，我想从 [独特角度] 聊聊我的理解。\n\n## 事件回顾\n\n[简要还原事件经过，保持客观]\n\n## 我的三个观点\n\n**第一，[观点1]**\n\n[展开论述]\n\n**第二，[观点2]**\n\n[展开论述]\n\n**第三，[观点3]**\n\n[展开论述]\n\n## 对我们的启示\n\n[回到读者自身，给出实际建议]\n\n---\n\n💬 你怎么看这件事？欢迎在评论区交流。',
      previewText: '热点解读模板，适合追热点内容',
      usageCount: 2087
    },
    {
      id: 'tpl_007',
      title: 'B站视频 · 技术教程',
      category: '教育',
      platform: 'bilibili',
      content: '【[主题] 保姆级教程】从零开始，手把手教你 [目标]\n\n⏱ 本期内容：\n00:00 开场介绍\n[MM:SS] [章节1]\n[MM:SS] [章节2]\n[MM:SS] [章节3]\n[MM:SS] 总结与避坑指南\n\n📋 你将学到：\n✅ [学习成果1]\n✅ [学习成果2]\n✅ [学习成果3]\n\n🔗 相关资源：\n• 文档：[链接]\n• 代码：[链接]\n• 工具：[链接]\n\n觉得有帮助的话一键三连支持一下吧～\n有问题评论区见 💬\n\n#[技术标签] #教程 #保姆级教学',
      previewText: 'B站技术教程简介模板',
      usageCount: 3890
    },
    {
      id: 'tpl_008',
      title: 'B站视频 · 数码评测',
      category: '种草',
      platform: 'bilibili',
      content: '【深度评测】[产品名称]：用了[N]天后的真实感受\n\n📱 产品参数：\n• 处理器：[型号]\n• 屏幕：[参数]\n• 续航：[参数]\n• 价格：[价格]\n\n⏱ 视频章节：\n00:00 开箱第一印象\n[MM:SS] 外观设计\n[MM:SS] 性能测试\n[MM:SS] 续航体验\n[MM:SS] 拍照对比\n[MM:SS] 购买建议\n\n🏆 综合评分：[X]/10\n💰 值不值得买：[一句话建议]\n\n#数码评测 #[产品名] #科技 #开箱',
      previewText: 'B站数码评测视频简介模板',
      usageCount: 1567
    },
    {
      id: 'tpl_009',
      title: 'X/Twitter · 观点输出',
      category: '营销',
      platform: 'twitter',
      content: '[一句犀利的观点或洞察]\n\n原因有三：\n\n1/ [论据1 — 简洁有力]\n\n2/ [论据2 — 数据支撑]\n\n3/ [论据3 — 反常识角度]\n\n你怎么看？👇',
      previewText: '推特观点输出模板，适合引发讨论',
      usageCount: 1245
    },
    {
      id: 'tpl_010',
      title: 'X/Twitter · 产品发布',
      category: '营销',
      platform: 'twitter',
      content: '🚀 Excited to announce [产品/功能名称]!\n\nAfter [N] months of building, it\'s finally here.\n\nWhat it does:\n→ [功能1]\n→ [功能2]\n→ [功能3]\n\nWhy it matters:\n[一句话价值主张]\n\nTry it free → [链接]\n\nRT to spread the word 🙏',
      previewText: '产品发布推文模板',
      usageCount: 987
    },
    {
      id: 'tpl_011',
      title: '营销活动 · 限时促销',
      category: '营销',
      platform: 'xiaohongshu',
      content: '🔥🔥🔥 [活动名称] 来啦！！！\n\n⏰ 活动时间：[起止日期]\n🎁 活动力度：[折扣/满减/赠品]\n\n📢 爆款清单：\n1️⃣ [产品1] 原价¥[X] → 现价¥[Y]（省¥[Z]）\n2️⃣ [产品2] 买一送一\n3️⃣ [产品3] 前[N]名额外赠[赠品]\n\n🔔 温馨提示：\n• 活动库存有限，先到先得\n• 可叠加 [优惠券/满减]\n• 支持 [退换政策]\n\n👉 点击链接直达：[链接]\n📱 也可搜索 [关键词] 找到我们\n\n#限时优惠 #[品牌名] #薅羊毛 #好物推荐',
      previewText: '限时促销活动文案模板',
      usageCount: 5234
    },
    {
      id: 'tpl_012',
      title: '个人日常 · 情感共鸣',
      category: '情感',
      platform: 'xiaohongshu',
      content: '今天想和你们聊聊「[主题，如：独居的第100天]」\n\n[第一段：描述一个具体的生活场景]\n\n[第二段：由场景引发的感悟]\n\n[第三段：升华，给读者温暖或力量]\n\n有时候觉得，生活不需要多轰轰烈烈\n那些微小的、确定的幸福\n才是最珍贵的 ❤️\n\n你们最近有什么让自己开心的小事吗？\n评论区分享一下叭 👇\n\n#生活感悟 #日常碎片 #治愈系 #文字',
      previewText: '情感共鸣日常分享模板',
      usageCount: 6781
    },
    {
      id: 'tpl_013',
      title: '教育分享 · 学习方法',
      category: '教育',
      platform: 'xiaohongshu',
      content: '📚 从[起点]到[终点]，我用了[时间]\n\n先说结果：[成果展示，如考试分数/技能掌握]\n\n以下是我总结的[N]个核心方法 👇\n\n📌 方法一：[方法名称]\n[具体怎么做 + 为什么有效]\n\n📌 方法二：[方法名称]\n[具体怎么做 + 为什么有效]\n\n📌 方法三：[方法名称]\n[具体怎么做 + 为什么有效]\n\n⚠️ 最容易踩的坑：\n• [常见错误1]\n• [常见错误2]\n\n💪 记住：[一句鼓励的话]\n\n需要更详细的资料可以评论区留言～\n\n#学习方法 #自我提升 #干货 #[领域]学习',
      previewText: '学习方法分享模板，适合教育类内容',
      usageCount: 4123
    },
    {
      id: 'tpl_014',
      title: '小红书 · 旅行攻略',
      category: '生活',
      platform: 'xiaohongshu',
      content: '🗺 [目的地] [N]天[N]晚攻略（超详细版）\n\n💰 总花费：约¥[金额]/人\n✈️ 交通：[出行方式]\n🏨 住宿：[推荐酒店/民宿]\n\n📅 行程安排：\n\nDay 1️⃣\n🕐 上午：[景点/活动]\n🕑 下午：[景点/活动]\n🕕 晚上：[美食/活动]\n\nDay 2️⃣\n🕐 上午：[景点/活动]\n🕑 下午：[景点/活动]\n🕕 晚上：[美食/活动]\n\n⚠️ 避坑指南：\n❌ [坑1]\n❌ [坑2]\n✅ [正确做法]\n\n📸 最佳拍照点：[推荐]\n🍽 必吃美食：[推荐]\n\n#旅行攻略 #[目的地] #旅行日记 #出行指南',
      previewText: '旅行攻略模板，适合分享出行经验',
      usageCount: 7892
    },
    {
      id: 'tpl_015',
      title: '抖音 · 职场干货',
      category: '教育',
      platform: 'douyin',
      content: '在[行业]工作[N]年，这[N]条经验我希望早点知道 💼\n\n第1条：[经验1]\n→ [简短解释]\n\n第2条：[经验2]\n→ [简短解释]\n\n第3条：[经验3]\n→ [简短解释]\n\n最后一条最重要：[压轴经验]\n\n这些都是花了真金白银换来的教训\n希望能帮到正在[行业]打拼的你 💪\n\n#职场干货 #职场经验 #[行业] #工作心得',
      previewText: '职场经验分享模板',
      usageCount: 3456
    }
  ];

  // ============================================================
  // 默认热门话题数据
  // ============================================================
  const DEFAULT_HOT_TOPICS = [
    { id: 'hot_001', title: 'AI 绘画工具大比拼', heat: 98, platform: 'xiaohongshu', trend: 'up' },
    { id: 'hot_002', title: '2026 春季穿搭指南', heat: 95, platform: 'xiaohongshu', trend: 'up' },
    { id: 'hot_003', title: '居家办公效率神器', heat: 92, platform: 'douyin', trend: 'up' },
    { id: 'hot_004', title: '新能源车深度对比', heat: 89, platform: 'bilibili', trend: 'stable' },
    { id: 'hot_005', title: '副业赚钱真实经历', heat: 87, platform: 'xiaohongshu', trend: 'up' },
    { id: 'hot_006', title: '数码产品选购避坑', heat: 85, platform: 'bilibili', trend: 'stable' },
    { id: 'hot_007', title: '健康饮食新趋势', heat: 83, platform: 'douyin', trend: 'up' },
    { id: 'hot_008', title: '独居生活好物清单', heat: 80, platform: 'xiaohongshu', trend: 'down' },
    { id: 'hot_009', title: '程序员转型方向', heat: 78, platform: 'twitter', trend: 'up' },
    { id: 'hot_010', title: '旅行平替目的地', heat: 76, platform: 'xiaohongshu', trend: 'stable' }
  ];

  // ============================================================
  // 平台配置（字符限制、图标、颜色等）
  // ============================================================
  const PLATFORM_CONFIG = {
    xiaohongshu: { name: '小红书', maxChars: 1000, icon: '📕', color: '#FE2C55' },
    douyin:      { name: '抖音',   maxChars: 500,  icon: '🎵', color: '#000000' },
    wechat:      { name: '公众号', maxChars: 5000, icon: '💬', color: '#07C160' },
    bilibili:    { name: 'B站',   maxChars: 2000, icon: '📺', color: '#00A1D6' },
    twitter:     { name: 'X',     maxChars: 280,  icon: '🐦', color: '#1DA1F2' },
    weibo:       { name: '微博',   maxChars: 2000, icon: '🔴', color: '#E6162D' }
  };

  // ============================================================
  // 初始状态定义
  // ============================================================
  const INITIAL_STATE = {
    // 用户信息
    user: {
      name: '创作者',
      avatar: null,
      settings: {
        notifications: true,
        autoSave: true,
        autoSaveInterval: 30000, // 30秒
        defaultPlatform: 'xiaohongshu',
        language: 'zh-CN'
      }
    },

    // 草稿列表
    drafts: [],

    // 模板列表
    templates: DEFAULT_TEMPLATES,

    // 定时发布列表
    scheduledPosts: [],

    // 当前选中平台
    currentPlatform: 'xiaohongshu',

    // 主题模式
    theme: 'light',

    // 加载状态
    isLoading: {
      global: false,
      drafts: false,
      templates: false,
      publishing: false,
      ai: false
    },

    // AI 对话历史
    aiHistory: [],

    // 热门话题
    hotTopics: DEFAULT_HOT_TOPICS,

    // 平台配置
    platformConfig: PLATFORM_CONFIG,

    // 应用元信息
    appMeta: {
      version: '1.0.0',
      buildNumber: '20260223',
      lastSync: null
    }
  };

  // ============================================================
  // 持久化键名
  // ============================================================
  const STORAGE_KEY = 'banana_card_suite_state';

  // 需要持久化的 state 键（避免存储临时状态）
  const PERSIST_KEYS = [
    'user', 'drafts', 'templates', 'scheduledPosts',
    'currentPlatform', 'theme', 'aiHistory', 'appMeta'
  ];

  // ============================================================
  // Store 核心实现
  // ============================================================
  class Store {
    constructor() {
      /** @type {Object} 状态对象 */
      this._state = {};

      /** @type {Map<string, Set<Function>>} 订阅者映射 */
      this._subscribers = new Map();

      /** @type {number|null} 持久化防抖定时器 */
      this._saveTimer = null;

      /** @type {boolean} 是否已初始化 */
      this._initialized = false;

      // 初始化
      this._init();
    }

    /**
     * 初始化状态：从 localStorage 恢复 或 使用默认值
     * @private
     */
    _init() {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          // 将已保存的状态与默认状态深度合并（保证新增字段生效）
          this._state = this._deepMerge(
            JSON.parse(JSON.stringify(INITIAL_STATE)),
            parsed
          );
        } else {
          this._state = JSON.parse(JSON.stringify(INITIAL_STATE));
        }
      } catch (err) {
        console.warn('[Store] 从 localStorage 恢复失败，使用默认状态:', err);
        this._state = JSON.parse(JSON.stringify(INITIAL_STATE));
      }

      this._initialized = true;
      console.log('[Store] 状态管理系统已初始化');
    }

    /**
     * 获取状态值（支持点号路径，如 'user.name'）
     * @param {string} key - 状态键名，支持嵌套路径
     * @returns {*} 状态值
     */
    get(key) {
      if (!key) return this._state;

      const parts = key.split('.');
      let current = this._state;

      for (const part of parts) {
        if (current == null || typeof current !== 'object') {
          return undefined;
        }
        current = current[part];
      }

      return current;
    }

    /**
     * 设置状态值并通知订阅者
     * @param {string} key - 状态键名，支持嵌套路径
     * @param {*} value - 新的状态值
     * @param {boolean} [silent=false] - 是否静默更新（不通知订阅者）
     */
    set(key, value, silent = false) {
      if (!key) return;

      const parts = key.split('.');
      const topLevelKey = parts[0];

      // 设置嵌套值
      if (parts.length === 1) {
        this._state[key] = value;
      } else {
        let current = this._state;
        for (let i = 0; i < parts.length - 1; i++) {
          if (current[parts[i]] == null || typeof current[parts[i]] !== 'object') {
            current[parts[i]] = {};
          }
          current = current[parts[i]];
        }
        current[parts[parts.length - 1]] = value;
      }

      // 通知订阅者
      if (!silent) {
        this._notify(key, value);
        // 顶层键也通知（当设置嵌套路径时）
        if (parts.length > 1) {
          this._notify(topLevelKey, this._state[topLevelKey]);
        }
      }

      // 防抖持久化
      this._scheduleSave();
    }

    /**
     * 批量更新状态
     * @param {Object} updates - 键值对对象
     */
    batchSet(updates) {
      if (!updates || typeof updates !== 'object') return;

      const changedKeys = new Set();

      Object.entries(updates).forEach(([key, value]) => {
        this.set(key, value, true); // 静默更新
        changedKeys.add(key);
        changedKeys.add(key.split('.')[0]); // 顶层键
      });

      // 统一通知
      changedKeys.forEach(key => {
        this._notify(key, this.get(key));
      });

      this._scheduleSave();
    }

    /**
     * 订阅状态变化
     * @param {string} key - 监听的状态键
     * @param {Function} callback - 回调函数 (newValue, key) => void
     * @returns {Function} 取消订阅的函数
     */
    subscribe(key, callback) {
      if (typeof callback !== 'function') {
        console.warn('[Store] subscribe 的 callback 必须是函数');
        return () => {};
      }

      if (!this._subscribers.has(key)) {
        this._subscribers.set(key, new Set());
      }

      this._subscribers.get(key).add(callback);

      // 返回取消订阅函数
      return () => {
        const subs = this._subscribers.get(key);
        if (subs) {
          subs.delete(callback);
          if (subs.size === 0) {
            this._subscribers.delete(key);
          }
        }
      };
    }

    /**
     * 一次性订阅（触发后自动取消）
     * @param {string} key - 监听的状态键
     * @param {Function} callback - 回调函数
     */
    once(key, callback) {
      const unsubscribe = this.subscribe(key, (value, k) => {
        unsubscribe();
        callback(value, k);
      });
      return unsubscribe;
    }

    /**
     * 通知订阅者
     * @private
     * @param {string} key - 变更的键
     * @param {*} value - 新值
     */
    _notify(key, value) {
      const subs = this._subscribers.get(key);
      if (subs && subs.size > 0) {
        subs.forEach(callback => {
          try {
            callback(value, key);
          } catch (err) {
            console.error(`[Store] 订阅者回调异常 (key: ${key}):`, err);
          }
        });
      }

      // 通配符订阅（监听所有变化）
      const wildcardSubs = this._subscribers.get('*');
      if (wildcardSubs && wildcardSubs.size > 0) {
        wildcardSubs.forEach(callback => {
          try {
            callback(value, key);
          } catch (err) {
            console.error('[Store] 通配符订阅回调异常:', err);
          }
        });
      }
    }

    /**
     * 防抖持久化到 localStorage
     * @private
     */
    _scheduleSave() {
      if (this._saveTimer) {
        clearTimeout(this._saveTimer);
      }

      this._saveTimer = setTimeout(() => {
        this._save();
      }, 300); // 300ms 防抖
    }

    /**
     * 立即保存到 localStorage
     * @private
     */
    _save() {
      try {
        const toSave = {};
        PERSIST_KEYS.forEach(key => {
          if (this._state[key] !== undefined) {
            toSave[key] = this._state[key];
          }
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
      } catch (err) {
        console.error('[Store] 持久化保存失败:', err);
        // 存储满时尝试清理旧数据
        if (err.name === 'QuotaExceededError') {
          this._handleStorageFull();
        }
      }
    }

    /**
     * 存储空间不足时的处理
     * @private
     */
    _handleStorageFull() {
      try {
        // 清理 AI 历史（保留最近 20 条）
        const history = this._state.aiHistory || [];
        if (history.length > 20) {
          this._state.aiHistory = history.slice(-20);
        }
        // 重试保存
        this._save();
      } catch (err) {
        console.error('[Store] 存储空间清理后仍无法保存:', err);
      }
    }

    /**
     * 深度合并对象
     * @private
     */
    _deepMerge(target, source) {
      if (!source || typeof source !== 'object') return target;
      if (!target || typeof target !== 'object') return source;

      const result = { ...target };

      Object.keys(source).forEach(key => {
        if (
          source[key] &&
          typeof source[key] === 'object' &&
          !Array.isArray(source[key]) &&
          target[key] &&
          typeof target[key] === 'object' &&
          !Array.isArray(target[key])
        ) {
          result[key] = this._deepMerge(target[key], source[key]);
        } else {
          result[key] = source[key];
        }
      });

      return result;
    }

    // ============================================================
    // 便捷方法：草稿管理
    // ============================================================

    /**
     * 添加草稿
     * @param {Object} draft - 草稿对象
     * @returns {string} 草稿 ID
     */
    addDraft(draft) {
      const id = 'draft_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
      const newDraft = {
        id,
        title: draft.title || '未命名草稿',
        content: draft.content || '',
        platform: draft.platform || this._state.currentPlatform,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...draft
      };

      const drafts = [...(this._state.drafts || [])];
      drafts.unshift(newDraft); // 新草稿在前
      this.set('drafts', drafts);

      return id;
    }

    /**
     * 更新草稿
     * @param {string} id - 草稿 ID
     * @param {Object} updates - 更新字段
     */
    updateDraft(id, updates) {
      const drafts = (this._state.drafts || []).map(d => {
        if (d.id === id) {
          return { ...d, ...updates, updatedAt: new Date().toISOString() };
        }
        return d;
      });
      this.set('drafts', drafts);
    }

    /**
     * 删除草稿
     * @param {string} id - 草稿 ID
     */
    deleteDraft(id) {
      const drafts = (this._state.drafts || []).filter(d => d.id !== id);
      this.set('drafts', drafts);
    }

    /**
     * 获取草稿
     * @param {string} id - 草稿 ID
     * @returns {Object|null}
     */
    getDraft(id) {
      return (this._state.drafts || []).find(d => d.id === id) || null;
    }

    // ============================================================
    // 便捷方法：定时发布管理
    // ============================================================

    /**
     * 添加定时发布
     * @param {Object} post - 发布对象
     * @returns {string} 发布 ID
     */
    addScheduledPost(post) {
      const id = 'post_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
      const newPost = {
        id,
        title: post.title || '未命名帖子',
        content: post.content || '',
        platform: post.platform || this._state.currentPlatform,
        scheduledAt: post.scheduledAt || null,
        status: 'draft', // draft / scheduled / published / failed
        createdAt: new Date().toISOString(),
        ...post
      };

      const posts = [...(this._state.scheduledPosts || [])];
      posts.push(newPost);
      // 按计划发布时间排序
      posts.sort((a, b) => {
        if (!a.scheduledAt) return 1;
        if (!b.scheduledAt) return -1;
        return new Date(a.scheduledAt) - new Date(b.scheduledAt);
      });

      this.set('scheduledPosts', posts);
      return id;
    }

    /**
     * 更新定时发布
     * @param {string} id - 发布 ID
     * @param {Object} updates - 更新字段
     */
    updateScheduledPost(id, updates) {
      const posts = (this._state.scheduledPosts || []).map(p => {
        if (p.id === id) {
          return { ...p, ...updates };
        }
        return p;
      });
      this.set('scheduledPosts', posts);
    }

    /**
     * 删除定时发布
     * @param {string} id - 发布 ID
     */
    deleteScheduledPost(id) {
      const posts = (this._state.scheduledPosts || []).filter(p => p.id !== id);
      this.set('scheduledPosts', posts);
    }

    // ============================================================
    // 便捷方法：AI 历史管理
    // ============================================================

    /**
     * 添加 AI 对话消息
     * @param {Object} message - { role: 'user'|'assistant', content: string }
     */
    addAIMessage(message) {
      const history = [...(this._state.aiHistory || [])];
      history.push({
        ...message,
        id: 'msg_' + Date.now(),
        timestamp: new Date().toISOString()
      });

      // 最多保留 100 条
      if (history.length > 100) {
        history.splice(0, history.length - 100);
      }

      this.set('aiHistory', history);
    }

    /**
     * 清空 AI 历史
     */
    clearAIHistory() {
      this.set('aiHistory', []);
    }

    // ============================================================
    // 便捷方法：主题切换
    // ============================================================

    /**
     * 切换深色/浅色主题
     * @returns {string} 新的主题名
     */
    toggleTheme() {
      const newTheme = this._state.theme === 'light' ? 'dark' : 'light';
      this.set('theme', newTheme);
      return newTheme;
    }

    // ============================================================
    // 工具方法
    // ============================================================

    /**
     * 重置状态为初始值
     * @param {boolean} [clearStorage=true] - 是否同时清空 localStorage
     */
    reset(clearStorage = true) {
      this._state = JSON.parse(JSON.stringify(INITIAL_STATE));
      if (clearStorage) {
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch (err) {
          console.warn('[Store] 清除 localStorage 失败:', err);
        }
      }
      this._notify('*', this._state);
      console.log('[Store] 状态已重置');
    }

    /**
     * 获取完整状态快照（调试用）
     * @returns {Object}
     */
    snapshot() {
      return JSON.parse(JSON.stringify(this._state));
    }

    /**
     * 获取订阅者统计（调试用）
     * @returns {Object}
     */
    subscriberStats() {
      const stats = {};
      this._subscribers.forEach((subs, key) => {
        stats[key] = subs.size;
      });
      return stats;
    }
  }

  // ============================================================
  // 导出全局单例
  // ============================================================
  const store = new Store();

  // 同时挂载到 window 上，方便调试和其他模块访问
  window.store = store;
  window.PLATFORM_CONFIG = PLATFORM_CONFIG;

  console.log('[Store] 模块加载完成，可通过 window.store 访问');

})();
