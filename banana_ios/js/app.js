/**
 * app.js - 主应用控制器
 *
 * 整合状态管理 (store.js) 和路由 (router.js)，
 * 实现首页、创作、模板、发布、个人中心全部业务逻辑。
 * 包含 Toast、Alert、AI 助手、离线检测等全局功能。
 */

;(function () {
  'use strict';

  // ============================================================
  // 常量
  // ============================================================
  const AUTO_SAVE_INTERVAL = 30000; // 30 秒自动保存
  const PULL_REFRESH_THRESHOLD = 80; // 下拉刷新触发阈值（px）
  const MAX_AI_HISTORY_DISPLAY = 50; // AI 对话最大显示条数

  // ============================================================
  // App 主类
  // ============================================================
  class App {
    constructor() {
      /** @type {number|null} 自动保存定时器 */
      this._autoSaveTimer = null;

      /** @type {string|null} 当前编辑的草稿 ID */
      this._currentDraftId = null;

      /** @type {string} 当前模板筛选分类 */
      this._templateFilter = 'all';

      /** @type {string} 发布页视图模式 */
      this._publishViewMode = 'list'; // 'list' | 'calendar'
      /** @type {string} 发布页平台筛选 */
      this._publishPlatformFilter = 'all';
      /** @type {string} 发布页状态筛选 */
      this._publishStatusFilter = 'all';

      /** @type {boolean} 是否在线 */
      this._isOnline = navigator.onLine;

      /** @type {Object|null} 下拉刷新状态 */
      this._pullRefreshState = null;

      this._init();
    }

    // ============================================================
    // 初始化
    // ============================================================

    _init() {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this._onReady());
      } else {
        this._onReady();
      }
    }

    _onReady() {
      // 应用主题
      this._applyTheme(store.get('theme'));

      // 绑定全局事件
      this._bindGlobalEvents();

      // 绑定 Tab Bar
      this._bindTabBar();

      // 初始化各页面
      this._initHomePage();
      this._initCreatePage();
      this._initTemplatesPage();
      this._initPublishPage();
      this._initProfilePage();

      // 初始化全局功能
      this._initOfflineDetection();
      this._initAIAssistant();

      // 订阅状态变化
      this._subscribeStoreChanges();

      // 路由变化后的初始化
      router.afterEach((from, to) => {
        this._onRouteChange(from, to);
      });

      // 启动自动保存
      this._startAutoSave();

      console.log('[App] 应用初始化完成');
    }

    // ============================================================
    // 全局事件绑定
    // ============================================================

    _bindGlobalEvents() {
      // 事件委托：全局点击
      document.addEventListener('click', (e) => {
        this._handleGlobalClick(e);
      });

      // 键盘快捷键
      document.addEventListener('keydown', (e) => {
        // Cmd/Ctrl + S 保存草稿
        if ((e.metaKey || e.ctrlKey) && e.key === 's') {
          e.preventDefault();
          if (router.current === 'create') {
            this.saveDraft();
          }
        }
      });

      // 页面卸载前保存
      window.addEventListener('beforeunload', () => {
        if (router.current === 'create') {
          this._saveCurrentDraftSilently();
        }
      });

      // 可见性变化（切后台/回前台）
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          this._saveCurrentDraftSilently();
        }
      });
    }

    /**
     * 全局点击事件委托
     * @private
     */
    _handleGlobalClick(e) {
      const target = e.target.closest('[data-action]');
      if (!target) return;

      const action = target.dataset.action;
      const value = target.dataset.value || '';

      switch (action) {
        // ===== 首页 =====
        case 'quick-create':
          router.navigate('create');
          break;
        case 'quick-template':
          router.navigate('templates');
          break;
        case 'quick-schedule':
          router.navigate('publish');
          break;
        case 'open-draft':
          this._openDraft(value);
          break;
        case 'use-topic':
          this._useHotTopic(value);
          break;
        case 'ai-assist':
          router.navigate('create');
          setTimeout(() => this._openAIAssistant(), 300);
          break;

        // ===== 创作页 =====
        case 'select-platform':
          this._selectPlatform(value);
          break;
        case 'ai-generate':
          this._aiGenerate();
          break;
        case 'save-draft':
          this.saveDraft();
          break;
        case 'preview-post':
          this._previewPost();
          break;
        case 'schedule-post':
          this._scheduleFromCreate();
          break;
        case 'insert-image':
          this._insertImage();
          break;
        case 'clear-editor':
          this._clearEditor();
          break;

        // ===== 模板页 =====
        case 'filter-template':
          this._filterTemplates(value);
          break;
        case 'preview-template':
          this._previewTemplate(value);
          break;
        case 'use-template':
          this._useTemplate(value);
          break;

        // ===== 发布页 =====
        case 'toggle-publish-view':
          this._togglePublishView();
          break;
        case 'filter-publish-platform':
          this._filterPublishPlatform(value);
          break;
        case 'filter-publish-status':
          this._filterPublishStatus(value);
          break;
        case 'edit-scheduled':
          this._editScheduledPost(value);
          break;
        case 'delete-scheduled':
          this._deleteScheduledPost(value);
          break;

        // ===== 个人页 =====
        case 'toggle-theme':
          e.preventDefault();
          this._toggleTheme();
          break;
        case 'clear-data':
          this._clearAllData();
          break;
        case 'show-about':
          this._showAbout();
          break;
        case 'export-data':
          this._exportData();
          break;
        case 'share-app':
          this._shareApp();
          break;

        // ===== AI 助手 =====
        case 'open-ai':
          this._openAIAssistant();
          break;
        case 'close-ai':
          this._closeAIAssistant();
          break;
        case 'send-ai-message':
          this._sendAIMessage();
          break;
        case 'ai-suggestion':
          this._applyAISuggestion(value);
          break;
        case 'clear-ai-history':
          this._clearAIHistory();
          break;

        // ===== Sheet =====
        case 'close-sheet':
          router.hideSheet(value);
          break;

        // ===== 首页补充 =====
        case 'view-all-drafts':
          router.navigate('create');
          break;
        case 'refresh-topics':
          this._renderHotTopics();
          this.showToast('话题已刷新');
          this._haptic('light');
          break;

        // ===== 个人页设置项 =====
        case 'account-settings':
        case 'platform-connect':
        case 'notification-settings':
        case 'storage-manage':
        case 'font-size':
        case 'help':
        case 'privacy':
        case 'terms':
          this.showToast('功能开发中，敬请期待');
          break;

        default:
          console.log('[App] 未处理的 action:', action, value);
      }
    }

    /**
     * 绑定 Tab Bar 点击
     * @private
     */
    _bindTabBar() {
      document.querySelectorAll('.tab-item').forEach(tab => {
        tab.addEventListener('click', (e) => {
          e.preventDefault();
          const route = tab.dataset.tab;
          if (route && route !== router.current) {
            this._haptic('light');
            router.navigate(route, { transition: 'fade' });
          }
        });
      });
    }

    // ============================================================
    // 状态订阅
    // ============================================================

    _subscribeStoreChanges() {
      // 主题变化
      store.subscribe('theme', (theme) => {
        this._applyTheme(theme);
      });

      // 草稿变化 → 更新首页
      store.subscribe('drafts', () => {
        if (router.current === 'home') {
          this._renderRecentDrafts();
        }
      });

      // 定时发布变化 → 更新发布页
      store.subscribe('scheduledPosts', () => {
        if (router.current === 'publish') {
          this._renderScheduledPosts();
        }
      });

      // 平台切换
      store.subscribe('currentPlatform', (platform) => {
        this._updatePlatformUI(platform);
      });
    }

    // ============================================================
    // 路由变化回调
    // ============================================================

    _onRouteChange(from, to) {
      // 进入创作页时聚焦编辑器
      if (to === 'create') {
        setTimeout(() => {
          const editor = document.getElementById('editor-content');
          if (editor) editor.focus();
        }, 400);
      }

      // 进入首页刷新数据
      if (to === 'home') {
        this._renderRecentDrafts();
        this._renderHotTopics();
      }

      // 进入模板页刷新
      if (to === 'templates') {
        this._renderTemplates();
      }

      // 进入发布页刷新
      if (to === 'publish') {
        this._renderScheduledPosts();
      }

      // 进入个人页刷新统计
      if (to === 'profile') {
        this._renderProfileStats();
      }
    }

    // ============================================================
    // 1. 首页逻辑
    // ============================================================

    _initHomePage() {
      this._renderRecentDrafts();
      this._renderHotTopics();
      this._initPullToRefresh('page-home');
    }

    /**
     * 渲染最近草稿
     */
    _renderRecentDrafts() {
      const container = document.getElementById('recent-drafts');
      if (!container) return;

      const drafts = store.get('drafts') || [];
      const platformConfig = store.get('platformConfig');

      if (drafts.length === 0) {
        container.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon">📝</div>
            <p class="empty-text">还没有草稿</p>
            <p class="empty-hint">点击下方"创作"开始写第一篇内容</p>
          </div>
        `;
        return;
      }

      // 只显示最近 5 条
      const recentDrafts = drafts.slice(0, 5);
      container.innerHTML = recentDrafts.map(draft => {
        const config = platformConfig[draft.platform] || { icon: '📄', name: '未知', color: '#999' };
        const timeStr = this._formatTimeAgo(draft.updatedAt);
        const preview = (draft.content || '').replace(/\n/g, ' ').slice(0, 60);

        return `
          <div class="draft-card" data-action="open-draft" data-value="${draft.id}">
            <div class="draft-card-header">
              <span class="draft-platform-icon" style="color: ${config.color}">${config.icon}</span>
              <span class="draft-platform-name">${config.name}</span>
              <span class="draft-time">${timeStr}</span>
            </div>
            <div class="draft-card-title">${this._escapeHtml(draft.title)}</div>
            <div class="draft-card-preview">${this._escapeHtml(preview)}${preview.length >= 60 ? '...' : ''}</div>
          </div>
        `;
      }).join('');
    }

    /**
     * 渲染热门话题
     */
    _renderHotTopics() {
      const container = document.getElementById('hot-topics');
      if (!container) return;

      const topics = store.get('hotTopics') || [];
      const platformConfig = store.get('platformConfig');

      container.innerHTML = topics.map((topic, index) => {
        const config = platformConfig[topic.platform] || { icon: '📄', color: '#999' };
        const trendIcon = topic.trend === 'up' ? '🔺' : topic.trend === 'down' ? '🔻' : '➖';

        return `
          <div class="topic-item" data-action="use-topic" data-value="${topic.id}">
            <span class="topic-rank ${index < 3 ? 'topic-rank-top' : ''}">${index + 1}</span>
            <div class="topic-info">
              <span class="topic-title">${this._escapeHtml(topic.title)}</span>
              <span class="topic-meta">${config.icon} ${trendIcon} ${topic.heat}</span>
            </div>
          </div>
        `;
      }).join('');
    }

    /**
     * 使用热门话题
     */
    _useHotTopic(topicId) {
      const topics = store.get('hotTopics') || [];
      const topic = topics.find(t => t.id === topicId);
      if (!topic) return;

      // 导航到创作页并填入话题
      router.navigate('create');
      setTimeout(() => {
        const editor = document.getElementById('editor-content');
        if (editor) {
          editor.innerText = `#${topic.title}\n\n`;
          this._updateCharCount();
          editor.focus();
        }
      }, 400);

      this.showToast(`已选择话题：${topic.title}`);
    }

    /**
     * 初始化下拉刷新
     */
    _initPullToRefresh(pageId) {
      const page = document.getElementById(pageId);
      if (!page) return;

      const scrollContent = page.querySelector('.page-scroll-content');
      if (!scrollContent) return;

      let startY = 0;
      let pulling = false;

      scrollContent.addEventListener('touchstart', (e) => {
        if (scrollContent.scrollTop <= 0) {
          startY = e.touches[0].clientY;
          pulling = true;
        }
      }, { passive: true });

      scrollContent.addEventListener('touchmove', (e) => {
        if (!pulling) return;
        const deltaY = e.touches[0].clientY - startY;

        if (deltaY > 0 && scrollContent.scrollTop <= 0) {
          const indicator = page.querySelector('.pull-refresh-indicator');
          if (indicator) {
            const progress = Math.min(deltaY / PULL_REFRESH_THRESHOLD, 1);
            indicator.style.transform = `translateY(${Math.min(deltaY * 0.5, 60)}px)`;
            indicator.style.opacity = progress;
            indicator.textContent = deltaY >= PULL_REFRESH_THRESHOLD ? '松开刷新' : '下拉刷新';
          }
        }
      }, { passive: true });

      scrollContent.addEventListener('touchend', (e) => {
        if (!pulling) return;
        pulling = false;

        const indicator = page.querySelector('.pull-refresh-indicator');
        if (indicator) {
          indicator.style.transform = '';
          indicator.style.opacity = '0';
        }

        // 模拟刷新
        const endY = e.changedTouches[0].clientY;
        if (endY - startY >= PULL_REFRESH_THRESHOLD && scrollContent.scrollTop <= 0) {
          this._simulateRefresh();
        }
      }, { passive: true });
    }

    /**
     * 模拟刷新操作
     */
    _simulateRefresh() {
      store.set('isLoading.global', true);
      this.showToast('正在刷新...');

      setTimeout(() => {
        this._renderRecentDrafts();
        this._renderHotTopics();
        store.set('isLoading.global', false);
        this.showToast('刷新完成');
        this._haptic('medium');
      }, 1000);
    }

    // ============================================================
    // 2. 创作页逻辑
    // ============================================================

    _initCreatePage() {
      // 初始化编辑器事件
      const editor = document.getElementById('editor-content');
      if (editor) {
        editor.addEventListener('input', () => {
          this._updateCharCount();
        });

        // 粘贴时去除格式
        editor.addEventListener('paste', (e) => {
          e.preventDefault();
          const text = e.clipboardData.getData('text/plain');
          document.execCommand('insertText', false, text);
        });
      }

      // 初始化平台选择器
      this._updatePlatformUI(store.get('currentPlatform'));
    }

    /**
     * 选择发布平台
     */
    _selectPlatform(platform) {
      store.set('currentPlatform', platform);
      this._haptic('light');
    }

    /**
     * 更新平台相关 UI
     */
    _updatePlatformUI(platform) {
      // 更新平台选择器高亮
      document.querySelectorAll('.platform-chip').forEach(chip => {
        chip.classList.toggle('active', chip.dataset.value === platform);
      });

      const config = (store.get('platformConfig') || {})[platform];
      if (!config) return;

      // 更新字符限制显示
      const limitEl = document.getElementById('char-limit');
      if (limitEl) {
        limitEl.textContent = config.maxChars;
      }

      this._updateCharCount();
    }

    /**
     * 更新字符计数
     */
    _updateCharCount() {
      const editor = document.getElementById('editor-content');
      const countEl = document.getElementById('char-count');
      const limitEl = document.getElementById('char-limit');

      if (!editor || !countEl) return;

      const text = editor.innerText || '';
      const count = text.length;
      countEl.textContent = count;

      // 获取当前平台限制
      const platform = store.get('currentPlatform');
      const config = (store.get('platformConfig') || {})[platform];
      const maxChars = config ? config.maxChars : 1000;

      if (limitEl) limitEl.textContent = maxChars;

      // 超出限制时变红
      const counter = countEl.closest('.char-counter');
      if (counter) {
        counter.classList.toggle('over-limit', count > maxChars);
        counter.classList.toggle('near-limit', count > maxChars * 0.9 && count <= maxChars);
      }
    }

    /**
     * 保存草稿
     */
    saveDraft() {
      const editor = document.getElementById('editor-content');
      if (!editor) return;

      const content = editor.innerText || '';
      if (!content.trim()) {
        this.showToast('内容为空，无法保存', 'warning');
        return;
      }

      const platform = store.get('currentPlatform');
      // 从内容中提取标题（第一行，去掉 # 和多余空格）
      const firstLine = content.split('\n')[0].replace(/^#+\s*/, '').trim();
      const title = firstLine.slice(0, 30) || '未命名草稿';

      if (this._currentDraftId) {
        // 更新已有草稿
        store.updateDraft(this._currentDraftId, { content, title, platform });
        this.showToast('草稿已更新');
      } else {
        // 创建新草稿
        const id = store.addDraft({ content, title, platform });
        this._currentDraftId = id;
        this.showToast('草稿已保存');
      }

      this._haptic('light');
    }

    /**
     * 静默保存当前草稿
     * @private
     */
    _saveCurrentDraftSilently() {
      const editor = document.getElementById('editor-content');
      if (!editor) return;

      const content = editor.innerText || '';
      if (!content.trim()) return;

      const platform = store.get('currentPlatform');
      const firstLine = content.split('\n')[0].replace(/^#+\s*/, '').trim();
      const title = firstLine.slice(0, 30) || '未命名草稿';

      if (this._currentDraftId) {
        store.updateDraft(this._currentDraftId, { content, title, platform });
      } else {
        this._currentDraftId = store.addDraft({ content, title, platform });
      }
    }

    /**
     * 打开已有草稿
     */
    _openDraft(draftId) {
      const draft = store.getDraft(draftId);
      if (!draft) {
        this.showToast('草稿不存在', 'error');
        return;
      }

      router.navigate('create');
      setTimeout(() => {
        const editor = document.getElementById('editor-content');
        if (editor) {
          editor.innerText = draft.content || '';
          this._currentDraftId = draft.id;
          store.set('currentPlatform', draft.platform);
          this._updateCharCount();
        }
      }, 400);
    }

    /**
     * AI 内容生成（Mock）
     */
    _aiGenerate() {
      const editor = document.getElementById('editor-content');
      if (!editor) return;

      const platform = store.get('currentPlatform');
      const config = (store.get('platformConfig') || {})[platform] || { name: '未知' };

      store.set('isLoading.ai', true);
      this.showToast('AI 正在生成内容...');

      // 模拟 AI 生成延迟
      setTimeout(() => {
        const mockContents = {
          xiaohongshu: '姐妹们看过来！今天给大家分享一个超级好用的生活小技巧 ✨\n\n说实话我之前也不知道，直到朋友推荐给我，用了之后真的回不去了！\n\n具体方法：\n1️⃣ 第一步：准备好需要的材料\n2️⃣ 第二步：按照步骤操作\n3️⃣ 第三步：等待效果呈现\n\n效果真的绝了！强烈建议大家试试 💯\n\n#生活小技巧 #好物分享 #实用干货',
          douyin: '你一定不知道的冷知识 🤯\n\n今天分享一个99%的人都不知道的小秘密\n\n看完这个视频，你会发现原来事情并不是你想象的那样\n\n关注我，每天学习一个新知识 📚\n\n#冷知识 #涨知识 #你不知道的事',
          wechat: '# 深度解析：这个被忽视的趋势正在改变一切\n\n你有没有注意到，最近身边越来越多人在讨论这个话题？\n\n今天，我想从三个角度来分析这个现象背后的本质。\n\n## 第一，市场环境的变化\n\n过去几年，我们见证了前所未有的变革...\n\n## 第二，技术驱动的升级\n\n当AI、大数据等技术不断渗透到各个领域...\n\n## 第三，用户需求的进化\n\n新一代消费者有着完全不同的需求和期待...\n\n---\n\n**觉得有启发？点个在看分享给更多人吧 👇**',
          bilibili: '【保姆级教程】从零开始，手把手教你掌握这个超实用技能！\n\n⏱ 本期目录：\n00:00 开场\n01:30 基础概念\n05:00 核心操作\n10:00 进阶技巧\n15:00 常见问题\n\n📋 学完你将掌握：\n✅ 核心基础知识\n✅ 实战操作技巧\n✅ 避坑经验总结\n\n一键三连支持一下吧～有问题评论区见 💬\n\n#教程 #干货 #学习',
          twitter: 'Hot take: The future of content creation isn\'t about posting more — it\'s about posting smarter.\n\nHere\'s what I\'ve learned after creating 500+ posts:\n\n1/ Quality > Quantity (always)\n2/ Consistency builds trust\n3/ Engage before you broadcast\n\nWhat\'s your content strategy? 👇',
          weibo: '今天想聊一个有意思的话题 💭\n\n你有没有发现，那些真正厉害的人，往往都有一个共同特点——他们从不停止学习。\n\n不是因为他们比普通人聪明，而是他们愿意在别人休息的时候多花一点时间去了解新事物。\n\n共勉 💪\n\n#每日感悟 #成长 #自律'
        };

        const content = mockContents[platform] || mockContents.xiaohongshu;
        editor.innerText = content;
        this._updateCharCount();
        store.set('isLoading.ai', false);
        this.showToast(`已生成 ${config.name} 风格内容`);
        this._haptic('medium');
      }, 1500);
    }

    /**
     * 预览帖子
     */
    _previewPost() {
      const editor = document.getElementById('editor-content');
      if (!editor || !editor.innerText.trim()) {
        this.showToast('请先输入内容', 'warning');
        return;
      }

      const platform = store.get('currentPlatform');
      const config = (store.get('platformConfig') || {})[platform] || { name: '平台', icon: '📱', color: '#333' };
      const content = editor.innerText;

      this._showPreviewSheet(content, config);
    }

    /**
     * 显示预览弹窗
     * @private
     */
    _showPreviewSheet(content, config) {
      // 动态创建预览 Sheet
      let sheet = document.getElementById('preview-sheet');
      if (!sheet) {
        sheet = document.createElement('div');
        sheet.id = 'preview-sheet';
        sheet.className = 'sheet-container';
        sheet.style.cssText = `
          position: fixed; bottom: 0; left: 0; right: 0;
          max-height: 85vh; background: var(--ios-bg-primary, #fff);
          border-radius: 16px 16px 0 0; z-index: 1000;
          display: none; overflow: hidden;
          box-shadow: 0 -4px 20px rgba(0,0,0,0.15);
        `;
        document.body.appendChild(sheet);
      }

      // 截断长内容用于预览
      const previewContent = content.length > 500 ? content.slice(0, 500) + '...' : content;

      sheet.innerHTML = `
        <div style="padding: 12px 16px; border-bottom: 1px solid var(--ios-separator, #3C3C4349);">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: 600; font-size: 17px;">预览效果</span>
            <button data-action="close-sheet" data-value="preview-sheet"
                    style="background: none; border: none; font-size: 16px; color: var(--ios-blue, #007AFF); cursor: pointer;">
              完成
            </button>
          </div>
          <div style="width: 36px; height: 5px; background: var(--ios-label-quaternary, #3C3C432E); border-radius: 3px; margin: 8px auto 0;"></div>
        </div>
        <div style="padding: 20px; overflow-y: auto; max-height: calc(85vh - 60px);">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px;">
            <span style="font-size: 24px;">${config.icon}</span>
            <span style="font-weight: 600; color: ${config.color};">${config.name} 预览</span>
          </div>
          <div style="background: var(--ios-bg-secondary, #F2F2F7); border-radius: 12px; padding: 16px;
                      white-space: pre-wrap; line-height: 1.7; font-size: 15px; color: var(--ios-label, #000);">
${this._escapeHtml(previewContent)}
          </div>
          <div style="margin-top: 16px; display: flex; gap: 12px;">
            <button data-action="schedule-post"
                    style="flex: 1; padding: 14px; background: var(--ios-blue, #007AFF); color: #fff;
                           border: none; border-radius: 12px; font-size: 16px; font-weight: 600; cursor: pointer;">
              定时发布
            </button>
            <button data-action="close-sheet" data-value="preview-sheet"
                    style="flex: 1; padding: 14px; background: var(--ios-bg-tertiary, #fff); color: var(--ios-label, #000);
                           border: none; border-radius: 12px; font-size: 16px; font-weight: 600; cursor: pointer;">
              继续编辑
            </button>
          </div>
        </div>
      `;

      router.showSheet('preview-sheet');
    }

    /**
     * 从创作页定时发布
     */
    _scheduleFromCreate() {
      const editor = document.getElementById('editor-content');
      if (!editor || !editor.innerText.trim()) {
        this.showToast('请先输入内容', 'warning');
        return;
      }

      const content = editor.innerText;
      const platform = store.get('currentPlatform');
      const firstLine = content.split('\n')[0].replace(/^#+\s*/, '').trim();
      const title = firstLine.slice(0, 30) || '未命名帖子';

      // 默认安排在 1 小时后
      const scheduledAt = new Date(Date.now() + 3600000).toISOString();

      store.addScheduledPost({
        title,
        content,
        platform,
        scheduledAt,
        status: 'scheduled'
      });

      router.hideAllSheets();
      this.showToast('已添加到定时发布');
      this._haptic('medium');

      // 清空编辑器
      editor.innerText = '';
      this._currentDraftId = null;
      this._updateCharCount();
    }

    /**
     * 插入图片（占位逻辑）
     */
    _insertImage() {
      this.showToast('图片功能开发中，敬请期待', 'info');
      this._haptic('light');
    }

    /**
     * 清空编辑器
     */
    _clearEditor() {
      this.showAlert({
        title: '清空内容',
        message: '确定要清空当前编辑的内容吗？此操作不可撤销。',
        confirmText: '清空',
        confirmDestructive: true,
        onConfirm: () => {
          const editor = document.getElementById('editor-content');
          if (editor) {
            editor.innerText = '';
            this._currentDraftId = null;
            this._updateCharCount();
            this.showToast('已清空');
          }
        }
      });
    }

    /**
     * 启动自动保存
     * @private
     */
    _startAutoSave() {
      if (this._autoSaveTimer) clearInterval(this._autoSaveTimer);

      this._autoSaveTimer = setInterval(() => {
        if (router.current === 'create') {
          const editor = document.getElementById('editor-content');
          if (editor && editor.innerText.trim()) {
            this._saveCurrentDraftSilently();
          }
        }
      }, AUTO_SAVE_INTERVAL);
    }

    // ============================================================
    // 3. 模板页逻辑
    // ============================================================

    _initTemplatesPage() {
      this._renderTemplates();
    }

    /**
     * 筛选模板分类
     */
    _filterTemplates(category) {
      this._templateFilter = category;

      // 更新筛选标签状态（仅模板页的筛选条）
      const filterContainer = document.getElementById('templateFilters');
      if (filterContainer) {
        filterContainer.querySelectorAll('.filter-chip').forEach(chip => {
          chip.classList.toggle('active', chip.dataset.value === category);
        });
      }

      this._renderTemplates();
      this._haptic('light');
    }

    /**
     * 渲染模板列表
     */
    _renderTemplates() {
      const container = document.getElementById('templates-grid');
      if (!container) return;

      let templates = store.get('templates') || [];

      // 筛选
      if (this._templateFilter !== 'all') {
        templates = templates.filter(t => t.category === this._templateFilter);
      }

      if (templates.length === 0) {
        container.innerHTML = `
          <div class="empty-state" style="grid-column: 1 / -1;">
            <div class="empty-icon">📋</div>
            <p class="empty-text">暂无此分类模板</p>
          </div>
        `;
        return;
      }

      const platformConfig = store.get('platformConfig') || {};

      container.innerHTML = templates.map(tpl => {
        const config = platformConfig[tpl.platform] || { icon: '📄', name: '未知', color: '#999' };
        const preview = (tpl.content || '').replace(/\n/g, ' ').slice(0, 50);

        return `
          <div class="template-card" data-action="preview-template" data-value="${tpl.id}">
            <div class="template-card-header">
              <span class="template-platform" style="color: ${config.color}">${config.icon} ${config.name}</span>
              <span class="template-usage">${this._formatNumber(tpl.usageCount)}次使用</span>
            </div>
            <div class="template-card-title">${this._escapeHtml(tpl.title)}</div>
            <div class="template-card-preview">${this._escapeHtml(preview)}...</div>
            <div class="template-card-footer">
              <span class="template-category-tag">${tpl.category}</span>
            </div>
          </div>
        `;
      }).join('');
    }

    /**
     * 预览模板
     */
    _previewTemplate(templateId) {
      const templates = store.get('templates') || [];
      const tpl = templates.find(t => t.id === templateId);
      if (!tpl) return;

      const platformConfig = store.get('platformConfig') || {};
      const config = platformConfig[tpl.platform] || { icon: '📄', name: '未知', color: '#999' };

      // 动态创建模板预览 Sheet
      let sheet = document.getElementById('template-preview-sheet');
      if (!sheet) {
        sheet = document.createElement('div');
        sheet.id = 'template-preview-sheet';
        sheet.className = 'sheet-container';
        sheet.style.cssText = `
          position: fixed; bottom: 0; left: 0; right: 0;
          max-height: 85vh; background: var(--ios-bg-primary, #fff);
          border-radius: 16px 16px 0 0; z-index: 1000;
          display: none; overflow: hidden;
          box-shadow: 0 -4px 20px rgba(0,0,0,0.15);
        `;
        document.body.appendChild(sheet);
      }

      sheet.innerHTML = `
        <div style="padding: 12px 16px; border-bottom: 1px solid var(--ios-separator, #3C3C4349);">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: 600; font-size: 17px;">模板预览</span>
            <button data-action="close-sheet" data-value="template-preview-sheet"
                    style="background: none; border: none; font-size: 16px; color: var(--ios-blue, #007AFF); cursor: pointer;">
              完成
            </button>
          </div>
          <div style="width: 36px; height: 5px; background: var(--ios-label-quaternary, #3C3C432E); border-radius: 3px; margin: 8px auto 0;"></div>
        </div>
        <div style="padding: 20px; overflow-y: auto; max-height: calc(85vh - 60px);">
          <div style="margin-bottom: 12px;">
            <h3 style="font-size: 20px; font-weight: 700; margin: 0 0 8px;">${this._escapeHtml(tpl.title)}</h3>
            <div style="display: flex; gap: 8px; align-items: center; font-size: 13px; color: var(--ios-label-secondary, #3C3C4399);">
              <span style="color: ${config.color}">${config.icon} ${config.name}</span>
              <span>·</span>
              <span>${tpl.category}</span>
              <span>·</span>
              <span>${this._formatNumber(tpl.usageCount)} 次使用</span>
            </div>
          </div>
          <div style="background: var(--ios-bg-secondary, #F2F2F7); border-radius: 12px; padding: 16px;
                      white-space: pre-wrap; line-height: 1.7; font-size: 15px; color: var(--ios-label, #000);
                      margin-bottom: 20px;">
${this._escapeHtml(tpl.content)}
          </div>
          <button data-action="use-template" data-value="${tpl.id}"
                  style="width: 100%; padding: 14px; background: var(--ios-blue, #007AFF); color: #fff;
                         border: none; border-radius: 12px; font-size: 16px; font-weight: 600; cursor: pointer;">
            使用此模板
          </button>
        </div>
      `;

      router.showSheet('template-preview-sheet');
    }

    /**
     * 使用模板
     */
    _useTemplate(templateId) {
      const templates = store.get('templates') || [];
      const tpl = templates.find(t => t.id === templateId);
      if (!tpl) return;

      // 关闭预览
      router.hideAllSheets();

      // 导航到创作页
      router.navigate('create');

      setTimeout(() => {
        const editor = document.getElementById('editor-content');
        if (editor) {
          editor.innerText = tpl.content;
          store.set('currentPlatform', tpl.platform);
          this._currentDraftId = null;
          this._updateCharCount();
          editor.focus();
        }
        this.showToast('模板已加载');
      }, 400);

      // 增加使用次数
      const idx = templates.findIndex(t => t.id === templateId);
      if (idx !== -1) {
        templates[idx] = { ...templates[idx], usageCount: (templates[idx].usageCount || 0) + 1 };
        store.set('templates', templates);
      }
    }

    // ============================================================
    // 4. 发布页逻辑
    // ============================================================

    _initPublishPage() {
      this._renderScheduledPosts();
    }

    /**
     * 切换发布页视图
     */
    _togglePublishView() {
      this._publishViewMode = this._publishViewMode === 'list' ? 'calendar' : 'list';

      // 更新 segmented control 高亮
      const segments = document.querySelectorAll('#publishViewToggle .segment');
      segments.forEach((seg, i) => {
        seg.classList.toggle('active',
          (this._publishViewMode === 'list' && i === 0) ||
          (this._publishViewMode === 'calendar' && i === 1)
        );
      });

      this._renderScheduledPosts();
      this._haptic('light');
    }

    /**
     * 发布页平台筛选
     */
    _filterPublishPlatform(platform) {
      this._publishPlatformFilter = platform;
      const container = document.getElementById('publishPlatformFilter');
      if (container) {
        container.querySelectorAll('.filter-chip').forEach(chip => {
          chip.classList.toggle('active', chip.dataset.value === platform);
        });
      }
      this._renderScheduledPosts();
      this._haptic('light');
    }

    /**
     * 发布页状态筛选
     */
    _filterPublishStatus(status) {
      this._publishStatusFilter = status;
      const container = document.getElementById('publishStatusFilter');
      if (container) {
        container.querySelectorAll('.status-filter-btn').forEach(btn => {
          btn.classList.toggle('active', btn.dataset.value === status);
        });
      }
      this._renderScheduledPosts();
      this._haptic('light');
    }

    /**
     * 渲染定时发布列表
     */
    _renderScheduledPosts() {
      const container = document.getElementById('scheduled-list');
      if (!container) return;

      const posts = store.get('scheduledPosts') || [];
      const platformConfig = store.get('platformConfig') || {};

      if (posts.length === 0) {
        container.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon">📅</div>
            <p class="empty-text">暂无定时发布</p>
            <p class="empty-hint">在创作页面完成内容后可添加定时发布</p>
          </div>
        `;
        return;
      }

      if (this._publishViewMode === 'calendar') {
        this._renderCalendarView(container, posts, platformConfig);
      } else {
        this._renderListView(container, posts, platformConfig);
      }
    }

    /**
     * 列表视图渲染
     * @private
     */
    _renderListView(container, posts, platformConfig) {
      container.innerHTML = posts.map(post => {
        const config = platformConfig[post.platform] || { icon: '📄', name: '未知', color: '#999' };
        const scheduleTime = post.scheduledAt
          ? this._formatDate(post.scheduledAt)
          : '未设定时间';

        const statusMap = {
          draft:     { label: '草稿',   color: '#8E8E93' },
          scheduled: { label: '待发布', color: '#FF9500' },
          published: { label: '已发布', color: '#34C759' },
          failed:    { label: '失败',   color: '#FF3B30' }
        };
        const status = statusMap[post.status] || statusMap.draft;

        return `
          <div class="scheduled-card">
            <div class="scheduled-card-header">
              <span style="color: ${config.color}; font-size: 18px;">${config.icon}</span>
              <span class="scheduled-platform">${config.name}</span>
              <span class="scheduled-status" style="color: ${status.color}; background: ${status.color}15;
                    padding: 2px 8px; border-radius: 10px; font-size: 12px;">${status.label}</span>
            </div>
            <div class="scheduled-title">${this._escapeHtml(post.title)}</div>
            <div class="scheduled-time">🕐 ${scheduleTime}</div>
            <div class="scheduled-actions">
              <button class="action-btn-sm" data-action="edit-scheduled" data-value="${post.id}">编辑</button>
              <button class="action-btn-sm danger" data-action="delete-scheduled" data-value="${post.id}">删除</button>
            </div>
          </div>
        `;
      }).join('');
    }

    /**
     * 日历视图渲染
     * @private
     */
    _renderCalendarView(container, posts, platformConfig) {
      // 按日期分组
      const grouped = {};
      posts.forEach(post => {
        const date = post.scheduledAt
          ? new Date(post.scheduledAt).toLocaleDateString('zh-CN')
          : '未排期';
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(post);
      });

      container.innerHTML = Object.entries(grouped).map(([date, datePosts]) => {
        const items = datePosts.map(post => {
          const config = platformConfig[post.platform] || { icon: '📄', color: '#999' };
          const time = post.scheduledAt
            ? new Date(post.scheduledAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
            : '--:--';

          return `
            <div class="calendar-item" data-action="edit-scheduled" data-value="${post.id}">
              <span class="calendar-time">${time}</span>
              <span style="color: ${config.color}">${config.icon}</span>
              <span class="calendar-title">${this._escapeHtml(post.title)}</span>
            </div>
          `;
        }).join('');

        return `
          <div class="calendar-group">
            <div class="calendar-date">${date}</div>
            ${items}
          </div>
        `;
      }).join('');
    }

    /**
     * 编辑定时发布（简化：打开到创作页）
     */
    _editScheduledPost(postId) {
      const posts = store.get('scheduledPosts') || [];
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      router.navigate('create');
      setTimeout(() => {
        const editor = document.getElementById('editor-content');
        if (editor) {
          editor.innerText = post.content || '';
          store.set('currentPlatform', post.platform);
          this._updateCharCount();
        }
      }, 400);
    }

    /**
     * 删除定时发布
     */
    _deleteScheduledPost(postId) {
      this.showAlert({
        title: '删除确认',
        message: '确定要删除这条定时发布吗？',
        confirmText: '删除',
        confirmDestructive: true,
        onConfirm: () => {
          store.deleteScheduledPost(postId);
          this.showToast('已删除');
          this._haptic('medium');
        }
      });
    }

    // ============================================================
    // 5. 个人页逻辑
    // ============================================================

    _initProfilePage() {
      this._renderProfileStats();
    }

    /**
     * 渲染个人统计
     */
    _renderProfileStats() {
      const statsContainer = document.getElementById('profile-stats');
      if (!statsContainer) return;

      const drafts = store.get('drafts') || [];
      const posts = store.get('scheduledPosts') || [];
      const templates = store.get('templates') || [];

      const publishedCount = posts.filter(p => p.status === 'published').length;
      const scheduledCount = posts.filter(p => p.status === 'scheduled').length;

      statsContainer.innerHTML = `
        <div class="stat-item">
          <div class="stat-number">${drafts.length}</div>
          <div class="stat-label">草稿</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">${scheduledCount}</div>
          <div class="stat-label">待发布</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">${publishedCount}</div>
          <div class="stat-label">已发布</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">${templates.length}</div>
          <div class="stat-label">模板</div>
        </div>
      `;

      // 更新版本号显示
      const versionEl = document.getElementById('app-version');
      if (versionEl) {
        const meta = store.get('appMeta') || {};
        versionEl.textContent = `v${meta.version || '1.0.0'} (${meta.buildNumber || '—'})`;
      }

      // 更新主题切换状态
      const themeToggle = document.getElementById('theme-toggle');
      if (themeToggle) {
        themeToggle.checked = store.get('theme') === 'dark';
      }
    }

    /**
     * 切换主题
     */
    _toggleTheme() {
      const newTheme = store.toggleTheme();
      this.showToast(newTheme === 'dark' ? '已切换到深色模式' : '已切换到浅色模式');
      this._haptic('medium');
    }

    /**
     * 应用主题
     * @private
     */
    _applyTheme(theme) {
      document.documentElement.setAttribute('data-theme', theme);
      document.body.classList.toggle('dark-mode', theme === 'dark');

      // 同步 toggle checkbox 状态
      const themeToggle = document.getElementById('theme-toggle');
      if (themeToggle) {
        themeToggle.checked = theme === 'dark';
      }

      // 更新 meta 主题色
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.content = theme === 'dark' ? '#1C1C1E' : '#F2F2F7';
      }
    }

    /**
     * 清空所有数据
     */
    _clearAllData() {
      this.showAlert({
        title: '清空所有数据',
        message: '这将删除所有草稿、定时发布和 AI 对话历史。模板将恢复为默认模板。此操作不可撤销！',
        confirmText: '清空',
        confirmDestructive: true,
        onConfirm: () => {
          store.reset(true);
          this._currentDraftId = null;
          this._templateFilter = 'all';
          this.showToast('所有数据已清空');
          this._haptic('heavy');

          // 刷新当前页面显示
          this._renderProfileStats();
        }
      });
    }

    /**
     * 显示关于信息
     */
    _showAbout() {
      this.showAlert({
        title: '关于 自媒体发布工具',
        message: '版本 1.0.0\n\n一站式社交媒体内容创作与管理工具。\n支持小红书、抖音、微信公众号、B站、X 等主流平台。\n\n内置 AI 助手、15+ 专业模板、定时发布等功能。',
        confirmText: '确定',
        showCancel: false
      });
    }

    /**
     * 导出数据
     */
    _exportData() {
      try {
        const data = store.snapshot();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `banana-card-backup-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();

        URL.revokeObjectURL(url);
        this.showToast('数据已导出');
      } catch (err) {
        console.error('[App] 导出数据失败:', err);
        this.showToast('导出失败', 'error');
      }
    }

    /**
     * 分享应用
     */
    _shareApp() {
      const shareData = {
        title: '自媒体发布工具',
        text: '一站式社交媒体内容创作工具，支持多平台发布、AI 辅助写作',
        url: window.location.href
      };

      if (navigator.share) {
        navigator.share(shareData).catch(() => {});
      } else {
        // 降级方案：复制链接
        this._copyToClipboard(window.location.href);
        this.showToast('链接已复制');
      }
    }

    // ============================================================
    // 6. 全局功能
    // ============================================================

    // ----- Toast 通知系统 -----

    /**
     * 显示 Toast 通知
     * @param {string} message - 消息内容
     * @param {string} [type='success'] - 类型 ('success' | 'error' | 'warning' | 'info')
     * @param {number} [duration=2500] - 显示时长（毫秒）
     */
    showToast(message, type = 'success', duration = 2500) {
      // 获取或创建 Toast 容器
      let container = document.getElementById('toast-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = `
          position: fixed; top: 60px; left: 50%; transform: translateX(-50%);
          z-index: 10000; pointer-events: none; display: flex;
          flex-direction: column; align-items: center; gap: 8px;
        `;
        document.body.appendChild(container);
      }

      const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
      };

      const toast = document.createElement('div');
      toast.className = 'toast-notification';
      toast.style.cssText = `
        background: var(--ios-bg-elevated, #fff);
        color: var(--ios-label, #000);
        padding: 12px 20px; border-radius: 14px;
        font-size: 15px; font-weight: 500;
        box-shadow: 0 4px 20px rgba(0,0,0,0.12);
        opacity: 0; transform: translateY(-20px) scale(0.95);
        transition: all 0.3s cubic-bezier(0.32, 0.72, 0, 1);
        pointer-events: auto; display: flex; align-items: center; gap: 8px;
        max-width: 90vw; backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
      `;

      toast.innerHTML = `<span>${icons[type] || ''}</span><span>${this._escapeHtml(message)}</span>`;
      container.appendChild(toast);

      // 动画：出现
      requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0) scale(1)';
      });

      // 动画：消失
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-20px) scale(0.95)';
        setTimeout(() => toast.remove(), 300);
      }, duration);
    }

    // ----- Alert 对话框系统 -----

    /**
     * 显示 Alert 对话框
     * @param {Object} options
     * @param {string} options.title - 标题
     * @param {string} options.message - 消息内容
     * @param {string} [options.confirmText='确定'] - 确认按钮文字
     * @param {string} [options.cancelText='取消'] - 取消按钮文字
     * @param {boolean} [options.showCancel=true] - 是否显示取消按钮
     * @param {boolean} [options.confirmDestructive=false] - 确认按钮是否为危险操作样式
     * @param {Function} [options.onConfirm] - 确认回调
     * @param {Function} [options.onCancel] - 取消回调
     */
    showAlert(options = {}) {
      const {
        title = '提示',
        message = '',
        confirmText = '确定',
        cancelText = '取消',
        showCancel = true,
        confirmDestructive = false,
        onConfirm,
        onCancel
      } = options;

      // 移除已有的 alert
      const existing = document.getElementById('app-alert-overlay');
      if (existing) existing.remove();

      const overlay = document.createElement('div');
      overlay.id = 'app-alert-overlay';
      overlay.style.cssText = `
        position: fixed; inset: 0; z-index: 20000;
        display: flex; align-items: center; justify-content: center;
        background: rgba(0,0,0,0); transition: background 0.25s ease;
      `;

      const alertBox = document.createElement('div');
      alertBox.style.cssText = `
        background: var(--ios-bg-elevated, #fff); border-radius: 14px;
        width: 270px; overflow: hidden;
        box-shadow: 0 8px 40px rgba(0,0,0,0.2);
        transform: scale(0.9); opacity: 0;
        transition: all 0.25s cubic-bezier(0.32, 0.72, 0, 1);
      `;

      const confirmColor = confirmDestructive ? '#FF3B30' : 'var(--ios-blue, #007AFF)';

      alertBox.innerHTML = `
        <div style="padding: 20px 16px 12px; text-align: center;">
          <div style="font-size: 17px; font-weight: 600; margin-bottom: 6px; color: var(--ios-label, #000);">
            ${this._escapeHtml(title)}
          </div>
          <div style="font-size: 13px; color: var(--ios-label-secondary, #3C3C4399); line-height: 1.5; white-space: pre-wrap;">
            ${this._escapeHtml(message)}
          </div>
        </div>
        <div style="border-top: 0.5px solid var(--ios-separator, #C6C6C8);
                    display: flex; ${showCancel ? '' : 'justify-content: center;'}">
          ${showCancel ? `
            <button id="alert-cancel" style="flex: 1; padding: 12px; border: none;
                    background: transparent; font-size: 17px; color: var(--ios-blue, #007AFF);
                    cursor: pointer; border-right: 0.5px solid var(--ios-separator, #C6C6C8);">
              ${this._escapeHtml(cancelText)}
            </button>
          ` : ''}
          <button id="alert-confirm" style="flex: 1; padding: 12px; border: none;
                  background: transparent; font-size: 17px; font-weight: 600;
                  color: ${confirmColor}; cursor: pointer;">
            ${this._escapeHtml(confirmText)}
          </button>
        </div>
      `;

      overlay.appendChild(alertBox);
      document.body.appendChild(overlay);

      // 动画
      requestAnimationFrame(() => {
        overlay.style.background = 'rgba(0,0,0,0.4)';
        alertBox.style.transform = 'scale(1)';
        alertBox.style.opacity = '1';
      });

      // 关闭函数
      const close = () => {
        overlay.style.background = 'rgba(0,0,0,0)';
        alertBox.style.transform = 'scale(0.9)';
        alertBox.style.opacity = '0';
        setTimeout(() => overlay.remove(), 250);
      };

      // 事件绑定
      const confirmBtn = alertBox.querySelector('#alert-confirm');
      const cancelBtn = alertBox.querySelector('#alert-cancel');

      confirmBtn.addEventListener('click', () => {
        close();
        if (onConfirm) onConfirm();
      });

      if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
          close();
          if (onCancel) onCancel();
        });
      }

      // 点击遮罩关闭（如果有取消按钮）
      if (showCancel) {
        overlay.addEventListener('click', (e) => {
          if (e.target === overlay) {
            close();
            if (onCancel) onCancel();
          }
        });
      }

      this._haptic('light');
    }

    // ----- 离线检测 -----

    _initOfflineDetection() {
      window.addEventListener('online', () => {
        this._isOnline = true;
        this.showToast('网络已恢复', 'success');
      });

      window.addEventListener('offline', () => {
        this._isOnline = false;
        this.showToast('网络已断开，部分功能不可用', 'warning', 4000);
      });
    }

    // ============================================================
    // 7. AI 助手
    // ============================================================

    _initAIAssistant() {
      // AI 输入框回车发送
      const aiInput = document.getElementById('ai-input');
      if (aiInput) {
        aiInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this._sendAIMessage();
          }
        });
      }
    }

    /**
     * 打开 AI 助手
     */
    _openAIAssistant() {
      const overlay = document.getElementById('aiPanelOverlay');
      if (!overlay) return;
      overlay.style.display = 'block';
      document.body.style.overflow = 'hidden';
      this._renderAIHistory();

      setTimeout(() => {
        const aiInput = document.getElementById('ai-input');
        if (aiInput) aiInput.focus();
      }, 400);
    }

    /**
     * 关闭 AI 助手
     */
    _closeAIAssistant() {
      const overlay = document.getElementById('aiPanelOverlay');
      if (!overlay) return;
      overlay.style.display = 'none';
      document.body.style.overflow = '';
    }

    /**
     * 发送 AI 消息
     */
    _sendAIMessage() {
      const aiInput = document.getElementById('ai-input');
      if (!aiInput) return;

      const message = aiInput.value.trim();
      if (!message) return;

      // 清空输入框
      aiInput.value = '';

      // 添加用户消息
      store.addAIMessage({ role: 'user', content: message });
      this._renderAIHistory();

      // 模拟 AI 回复
      store.set('isLoading.ai', true);
      this._scrollAIChatToBottom();

      setTimeout(() => {
        const reply = this._generateAIReply(message);
        store.addAIMessage({ role: 'assistant', content: reply });
        store.set('isLoading.ai', false);
        this._renderAIHistory();
        this._scrollAIChatToBottom();
        this._haptic('light');
      }, 800 + Math.random() * 1200);
    }

    /**
     * 生成 AI 回复（Mock）
     * @private
     */
    _generateAIReply(userMessage) {
      const msg = userMessage.toLowerCase();

      // 预定义回复映射
      const replies = [
        {
          keywords: ['小红书', '种草', '笔记'],
          reply: '小红书爆款笔记技巧：\n\n1. 标题要有数字+情绪词，如"绝了！这5个方法让我省了2000块"\n2. 首图决定打开率，建议使用对比图或教程图\n3. 正文多用 emoji 分段，提高可读性\n4. 结尾加互动引导，如"你们觉得呢？"\n5. 标签选3-5个热门+1-2个精准长尾\n\n需要我帮你生成一篇具体内容吗？'
        },
        {
          keywords: ['抖音', '短视频', '视频'],
          reply: '抖音文案黄金公式：\n\n开头3秒定生死：\n- "你知道吗？" 型悬念开场\n- "千万别..."  型反向开场\n- 直接展示结果（倒序叙事）\n\n中间要有信息密度：\n- 每句话都要有价值，删掉废话\n- 用123步骤化表达\n\n结尾要有行动指令：\n- "关注我" + 价值承诺\n- 设置互动话题引导评论'
        },
        {
          keywords: ['公众号', '微信', '文章'],
          reply: '微信公众号标题优化建议：\n\n高点击率标题公式：\n1. 数字法：《做到这3点，XXX提升200%》\n2. 悬念法：《XXX的真相，99%的人不知道》\n3. 痛点法：《还在XXX？难怪你总是XXX》\n4. 权威法：《前XX总监揭秘：XXX的核心逻辑》\n\n注意：标题控制在15-25字，核心关键词靠前。'
        },
        {
          keywords: ['b站', 'bilibili', '视频简介'],
          reply: 'B站视频简介优化指南：\n\n必备要素：\n1. 一句话概括视频核心价值\n2. 时间戳章节目录（提高完播率）\n3. 相关资源链接\n4. 互动引导（一键三连）\n\n标签策略：\n- 2-3个大流量标签\n- 1-2个精准垂类标签\n- 1个热点相关标签'
        },
        {
          keywords: ['twitter', 'x', '推特', '推文'],
          reply: 'X/Twitter 高互动推文技巧：\n\n1. 280字限制内表达完整观点\n2. 用 Thread（串推）写长内容\n3. 开头要有 hook（钩子）\n4. 善用换行和空行增加可读性\n5. 结尾用问句引导互动\n6. 发推最佳时间：工作日早8-9点、晚7-9点'
        },
        {
          keywords: ['营销', '推广', '卖货', '带货'],
          reply: '社交媒体营销文案框架（AIDA模型）：\n\nA - 注意力(Attention)：\n  用痛点或利益点抓眼球\n\nI - 兴趣(Interest)：\n  讲故事或展示使用场景\n\nD - 欲望(Desire)：\n  突出独特卖点，展示效果\n\nA - 行动(Action)：\n  限时优惠、立即购买引导\n\n记住：真实感 > 完美感，用户更信任有瑕疵的真实分享。'
        },
        {
          keywords: ['写不出', '没灵感', '不知道写什么', '帮我'],
          reply: '创作灵感激发方法：\n\n1. 浏览平台热搜/热榜，找当下热点\n2. 回顾自己最近的生活经历，挖掘故事\n3. 翻看收藏夹里的优质内容，找角度\n4. 评论区找痛点 — 用户问什么就写什么\n5. 用"如果...会怎样"造句激发创意\n\n或者告诉我你想写哪个领域的内容，我来帮你生成初稿！'
        }
      ];

      // 匹配关键词
      for (const item of replies) {
        if (item.keywords.some(kw => msg.includes(kw))) {
          return item.reply;
        }
      }

      // 默认回复
      return `收到你的问题！以下是一些建议：\n\n` +
        `1. 确定目标平台和受众\n` +
        `2. 研究该平台的爆款内容特征\n` +
        `3. 用模板快速产出初稿\n` +
        `4. 根据平台规范优化格式\n\n` +
        `你可以试试问我：\n` +
        `· "帮我写一篇小红书种草文案"\n` +
        `· "抖音视频文案怎么写"\n` +
        `· "公众号标题怎么取"\n\n` +
        `我会给出更具体的建议 😊`;
    }

    /**
     * 渲染 AI 对话历史
     * @private
     */
    _renderAIHistory() {
      const container = document.getElementById('ai-chat-messages');
      if (!container) return;

      const history = (store.get('aiHistory') || []).slice(-MAX_AI_HISTORY_DISPLAY);
      const isLoading = store.get('isLoading.ai');

      if (history.length === 0 && !isLoading) {
        container.innerHTML = `
          <div class="ai-welcome">
            <div style="font-size: 40px; margin-bottom: 12px;">🤖</div>
            <p style="font-weight: 600; font-size: 17px; margin-bottom: 4px;">AI 创作助手</p>
            <p style="color: var(--ios-label-secondary, #3C3C4399); font-size: 14px;">告诉我你想创作什么内容，我来帮你</p>
            <div class="ai-suggestions" style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px; justify-content: center;">
              <button class="ai-suggestion-btn" data-action="ai-suggestion" data-value="帮我写一篇小红书种草文案">小红书文案</button>
              <button class="ai-suggestion-btn" data-action="ai-suggestion" data-value="抖音视频文案怎么写才能火">抖音文案</button>
              <button class="ai-suggestion-btn" data-action="ai-suggestion" data-value="公众号标题取什么好">公众号标题</button>
              <button class="ai-suggestion-btn" data-action="ai-suggestion" data-value="我没灵感了，帮我想想写什么">找灵感</button>
            </div>
          </div>
        `;
        return;
      }

      let html = history.map(msg => {
        const isUser = msg.role === 'user';
        return `
          <div class="ai-message ${isUser ? 'ai-message-user' : 'ai-message-assistant'}">
            <div class="ai-message-bubble ${isUser ? 'user-bubble' : 'assistant-bubble'}">
              ${this._escapeHtml(msg.content).replace(/\n/g, '<br>')}
            </div>
          </div>
        `;
      }).join('');

      // 加载中指示器
      if (isLoading) {
        html += `
          <div class="ai-message ai-message-assistant">
            <div class="ai-message-bubble assistant-bubble">
              <span class="typing-indicator">
                <span class="dot"></span><span class="dot"></span><span class="dot"></span>
              </span>
            </div>
          </div>
        `;
      }

      container.innerHTML = html;
    }

    /**
     * 滚动 AI 聊天到底部
     * @private
     */
    _scrollAIChatToBottom() {
      const container = document.getElementById('ai-chat-messages');
      if (container) {
        requestAnimationFrame(() => {
          container.scrollTop = container.scrollHeight;
        });
      }
    }

    /**
     * 应用 AI 建议（快捷提问）
     */
    _applyAISuggestion(text) {
      const aiInput = document.getElementById('ai-input');
      if (aiInput) {
        aiInput.value = text;
      }
      this._sendAIMessage();
    }

    /**
     * 清空 AI 历史
     */
    _clearAIHistory() {
      store.clearAIHistory();
      this._renderAIHistory();
      this.showToast('对话历史已清空');
    }

    // ============================================================
    // 工具方法
    // ============================================================

    /**
     * HTML 转义
     * @private
     */
    _escapeHtml(str) {
      if (!str) return '';
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    }

    /**
     * 格式化时间（相对时间）
     * @private
     */
    _formatTimeAgo(dateStr) {
      if (!dateStr) return '';
      const now = Date.now();
      const date = new Date(dateStr).getTime();
      const diff = now - date;

      if (diff < 60000) return '刚刚';
      if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前';
      if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前';
      if (diff < 604800000) return Math.floor(diff / 86400000) + '天前';

      return new Date(dateStr).toLocaleDateString('zh-CN');
    }

    /**
     * 格式化日期
     * @private
     */
    _formatDate(dateStr) {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${month}月${day}日 ${hours}:${minutes}`;
    }

    /**
     * 格式化数字（如 2847 → 2.8k）
     * @private
     */
    _formatNumber(num) {
      if (!num && num !== 0) return '0';
      if (num >= 10000) return (num / 10000).toFixed(1) + 'w';
      if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
      return num.toString();
    }

    /**
     * 复制到剪贴板
     * @private
     */
    async _copyToClipboard(text) {
      try {
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(text);
        } else {
          // 降级方案
          const textarea = document.createElement('textarea');
          textarea.value = text;
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
        }
        return true;
      } catch (err) {
        console.error('[App] 复制失败:', err);
        return false;
      }
    }

    /**
     * 触觉反馈
     * @private
     */
    _haptic(style = 'light') {
      try {
        if (navigator.vibrate) {
          const durations = { light: 10, medium: 20, heavy: 30 };
          navigator.vibrate(durations[style] || 10);
        }
      } catch (e) {
        // 静默
      }
    }
  }

  // ============================================================
  // 启动应用
  // ============================================================
  const app = new App();
  window.app = app;

  console.log('[App] 模块加载完成，可通过 window.app 访问');

})();
