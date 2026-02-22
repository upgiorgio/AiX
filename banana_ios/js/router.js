/**
 * router.js - iOS 风格 SPA 路由系统
 *
 * 特性：
 * - Hash 路由（#home, #create, #templates, #publish, #profile）
 * - iOS 风格页面过渡动画（滑入/滑出）
 * - Tab Bar 状态自动管理
 * - 导航栈 + 返回支持
 * - Sheet / Modal 弹出层管理
 * - 路由守卫与中间件
 * - 滚动位置恢复
 */

;(function () {
  'use strict';

  // ============================================================
  // 路由配置
  // ============================================================
  const ROUTES = {
    home:      { title: '首页',   tab: 'home',      icon: 'house.fill',          largeTitle: true  },
    create:    { title: '创作',   tab: 'create',    icon: 'plus.circle.fill',    largeTitle: false },
    templates: { title: '模板',   tab: 'templates', icon: 'doc.text.fill',       largeTitle: true  },
    publish:   { title: '发布',   tab: 'publish',   icon: 'calendar',            largeTitle: true  },
    profile:   { title: '我的',   tab: 'profile',   icon: 'person.fill',         largeTitle: true  }
  };

  // 默认路由
  const DEFAULT_ROUTE = 'home';

  // 动画持续时间（毫秒）
  const TRANSITION_DURATION = 350;

  // ============================================================
  // Router 核心实现
  // ============================================================
  class Router {
    constructor() {
      /** @type {string} 当前路由 */
      this._currentRoute = DEFAULT_ROUTE;

      /** @type {string|null} 上一个路由 */
      this._previousRoute = null;

      /** @type {Array<string>} 导航栈 */
      this._navigationStack = [DEFAULT_ROUTE];

      /** @type {Map<string, number>} 页面滚动位置缓存 */
      this._scrollPositions = new Map();

      /** @type {Array<Function>} 路由守卫中间件 */
      this._guards = [];

      /** @type {Array<Function>} 路由变化后的回调 */
      this._afterHooks = [];

      /** @type {boolean} 是否正在过渡中 */
      this._transitioning = false;

      /** @type {Set<string>} 当前打开的 Sheet */
      this._openSheets = new Set();

      /** @type {boolean} 是否已初始化 */
      this._initialized = false;

      // 初始化
      this._init();
    }

    /**
     * 初始化路由系统
     * @private
     */
    _init() {
      // 监听 hashchange 事件
      window.addEventListener('hashchange', (e) => {
        this._onHashChange(e);
      });

      // 初始路由解析
      const hash = window.location.hash.slice(1) || DEFAULT_ROUTE;
      const route = ROUTES[hash] ? hash : DEFAULT_ROUTE;

      // 设置初始 hash
      if (!window.location.hash || !ROUTES[window.location.hash.slice(1)]) {
        window.location.hash = '#' + route;
      }

      this._currentRoute = route;
      this._navigationStack = [route];

      // 延迟执行初始页面显示（确保 DOM 就绪）
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          this._showPage(route, false);
          this._updateTabBar(route);
          this._initialized = true;
        });
      } else {
        requestAnimationFrame(() => {
          this._showPage(route, false);
          this._updateTabBar(route);
          this._initialized = true;
        });
      }

      // 监听大标题滚动折叠
      this._initLargeTitleCollapse();

      console.log('[Router] 路由系统已初始化，当前路由:', route);
    }

    /**
     * 处理 hash 变化
     * @private
     */
    _onHashChange(e) {
      const newHash = window.location.hash.slice(1) || DEFAULT_ROUTE;
      const route = ROUTES[newHash] ? newHash : DEFAULT_ROUTE;

      if (route === this._currentRoute) return;

      // 判断是否是后退操作
      const isBack = this._navigationStack.length > 1 &&
        this._navigationStack[this._navigationStack.length - 2] === route;

      if (isBack) {
        this.back(false); // 不修改 hash（已经变了）
      } else {
        this.navigate(route, { updateHash: false });
      }
    }

    /**
     * 导航到指定路由
     * @param {string} route - 目标路由名
     * @param {Object} [options={}] - 导航选项
     * @param {boolean} [options.animated=true] - 是否使用动画
     * @param {string} [options.transition='slide'] - 过渡类型 ('slide' | 'fade' | 'none')
     * @param {boolean} [options.updateHash=true] - 是否更新 URL hash
     * @param {boolean} [options.replace=false] - 替换当前路由（不入栈）
     * @param {*} [options.data=null] - 传递给目标页面的数据
     * @returns {boolean} 是否导航成功
     */
    navigate(route, options = {}) {
      const {
        animated = true,
        transition = 'slide',
        updateHash = true,
        replace = false,
        data = null
      } = options;

      // 校验路由
      if (!ROUTES[route]) {
        console.warn(`[Router] 未知路由: ${route}`);
        return false;
      }

      // 避免重复导航
      if (route === this._currentRoute) return false;

      // 防止过渡期间重复触发
      if (this._transitioning) return false;

      // 执行路由守卫
      const guardResult = this._runGuards(this._currentRoute, route, data);
      if (guardResult === false) {
        console.log(`[Router] 路由守卫拦截: ${this._currentRoute} → ${route}`);
        return false;
      }

      // 保存当前页面滚动位置
      this._saveScrollPosition(this._currentRoute);

      // 更新路由状态
      this._previousRoute = this._currentRoute;
      this._currentRoute = route;

      // 更新导航栈
      if (replace && this._navigationStack.length > 0) {
        this._navigationStack[this._navigationStack.length - 1] = route;
      } else {
        this._navigationStack.push(route);
        // 限制栈深度
        if (this._navigationStack.length > 20) {
          this._navigationStack.shift();
        }
      }

      // 更新 URL hash
      if (updateHash) {
        window.location.hash = '#' + route;
      }

      // 执行页面切换
      if (animated && this._initialized) {
        this._transitionPage(this._previousRoute, route, transition);
      } else {
        this._showPage(route, false);
      }

      // 更新 Tab Bar
      this._updateTabBar(route);

      // 执行 afterHooks
      this._runAfterHooks(this._previousRoute, route, data);

      return true;
    }

    /**
     * 返回上一页
     * @param {boolean} [updateHash=true] - 是否更新 hash
     */
    back(updateHash = true) {
      if (this._navigationStack.length <= 1) {
        console.log('[Router] 已经是最底层，无法返回');
        return;
      }

      if (this._transitioning) return;

      // 保存当前滚动位置
      this._saveScrollPosition(this._currentRoute);

      // 弹出当前路由
      this._navigationStack.pop();
      const prevRoute = this._navigationStack[this._navigationStack.length - 1];

      this._previousRoute = this._currentRoute;
      this._currentRoute = prevRoute;

      // 更新 hash
      if (updateHash) {
        window.location.hash = '#' + prevRoute;
      }

      // 反向动画
      if (this._initialized) {
        this._transitionPage(this._previousRoute, prevRoute, 'slide-back');
      } else {
        this._showPage(prevRoute, false);
      }

      // 更新 Tab Bar
      this._updateTabBar(prevRoute);

      // 恢复滚动位置
      this._restoreScrollPosition(prevRoute);
    }

    /**
     * 页面过渡动画
     * @private
     */
    _transitionPage(fromRoute, toRoute, type) {
      this._transitioning = true;

      const fromPage = document.getElementById('page-' + fromRoute);
      const toPage = document.getElementById('page-' + toRoute);

      if (!fromPage || !toPage) {
        this._showPage(toRoute, false);
        this._transitioning = false;
        return;
      }

      // 准备目标页面
      toPage.classList.remove('page-hidden');
      toPage.style.display = '';

      switch (type) {
        case 'slide':
          // 新页面从右侧滑入
          toPage.style.transform = 'translateX(100%)';
          toPage.style.opacity = '1';
          requestAnimationFrame(() => {
            toPage.style.transition = `transform ${TRANSITION_DURATION}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
            fromPage.style.transition = `transform ${TRANSITION_DURATION}ms cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity ${TRANSITION_DURATION}ms ease`;
            toPage.style.transform = 'translateX(0)';
            fromPage.style.transform = 'translateX(-30%)';
            fromPage.style.opacity = '0.5';
          });
          break;

        case 'slide-back':
          // 当前页面向右滑出，上一页面从左侧回来
          toPage.style.transform = 'translateX(-30%)';
          toPage.style.opacity = '0.5';
          requestAnimationFrame(() => {
            toPage.style.transition = `transform ${TRANSITION_DURATION}ms cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity ${TRANSITION_DURATION}ms ease`;
            fromPage.style.transition = `transform ${TRANSITION_DURATION}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
            toPage.style.transform = 'translateX(0)';
            toPage.style.opacity = '1';
            fromPage.style.transform = 'translateX(100%)';
          });
          break;

        case 'fade':
          toPage.style.opacity = '0';
          toPage.style.transform = 'none';
          requestAnimationFrame(() => {
            toPage.style.transition = `opacity ${TRANSITION_DURATION}ms ease`;
            fromPage.style.transition = `opacity ${TRANSITION_DURATION}ms ease`;
            toPage.style.opacity = '1';
            fromPage.style.opacity = '0';
          });
          break;

        default:
          // 无动画
          this._showPage(toRoute, false);
          this._transitioning = false;
          return;
      }

      // 动画结束后清理
      setTimeout(() => {
        fromPage.classList.add('page-hidden');
        fromPage.style.display = 'none';
        fromPage.style.transform = '';
        fromPage.style.opacity = '';
        fromPage.style.transition = '';
        toPage.style.transform = '';
        toPage.style.opacity = '';
        toPage.style.transition = '';
        this._transitioning = false;

        // 恢复目标页面的滚动位置
        this._restoreScrollPosition(toRoute);
      }, TRANSITION_DURATION + 20);
    }

    /**
     * 直接显示指定页面（无动画）
     * @private
     */
    _showPage(route, restoreScroll = true) {
      // 隐藏所有页面
      document.querySelectorAll('.page').forEach(page => {
        page.classList.add('page-hidden');
        page.style.display = 'none';
        page.style.transform = '';
        page.style.opacity = '';
        page.style.transition = '';
      });

      // 显示目标页面
      const targetPage = document.getElementById('page-' + route);
      if (targetPage) {
        targetPage.classList.remove('page-hidden');
        targetPage.style.display = '';
      }

      // 恢复滚动
      if (restoreScroll) {
        this._restoreScrollPosition(route);
      }
    }

    /**
     * 更新 Tab Bar 激活状态
     * @private
     */
    _updateTabBar(route) {
      const config = ROUTES[route];
      if (!config) return;

      // 移除所有激活状态
      document.querySelectorAll('.tab-item').forEach(tab => {
        tab.classList.remove('active');
      });

      // 激活当前标签
      const activeTab = document.querySelector(`.tab-item[data-tab="${config.tab}"]`);
      if (activeTab) {
        activeTab.classList.add('active');
      }
    }

    // ============================================================
    // Sheet / Modal 管理
    // ============================================================

    /**
     * 显示底部弹出面板
     * @param {string} sheetId - Sheet 元素的 ID
     * @param {Object} [options={}] - 选项
     * @param {boolean} [options.fullScreen=false] - 是否全屏
     */
    showSheet(sheetId, options = {}) {
      const { fullScreen = false } = options;

      const overlay = document.getElementById(sheetId + '-overlay') ||
                     document.querySelector('.sheet-overlay');
      const sheet = document.getElementById(sheetId);

      if (!sheet) {
        console.warn(`[Router] Sheet 未找到: ${sheetId}`);
        return;
      }

      // 创建遮罩层（如果不存在）
      let backdropEl = document.getElementById(sheetId + '-backdrop');
      if (!backdropEl) {
        backdropEl = document.createElement('div');
        backdropEl.id = sheetId + '-backdrop';
        backdropEl.className = 'sheet-backdrop';
        backdropEl.style.cssText = `
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0); z-index: 999;
          transition: background ${TRANSITION_DURATION}ms ease;
        `;
        backdropEl.addEventListener('click', () => this.hideSheet(sheetId));
        document.body.appendChild(backdropEl);
      }

      // 显示遮罩
      backdropEl.style.display = 'block';
      requestAnimationFrame(() => {
        backdropEl.style.background = 'rgba(0,0,0,0.4)';
      });

      // 显示 Sheet
      sheet.style.display = 'block';
      sheet.style.transform = 'translateY(100%)';
      document.body.style.overflow = 'hidden';

      requestAnimationFrame(() => {
        sheet.style.transition = `transform ${TRANSITION_DURATION}ms cubic-bezier(0.32, 0.72, 0, 1)`;
        sheet.style.transform = fullScreen ? 'translateY(0)' : 'translateY(0)';
      });

      this._openSheets.add(sheetId);

      // 触觉反馈
      this._hapticFeedback('light');
    }

    /**
     * 隐藏底部弹出面板
     * @param {string} sheetId - Sheet 元素的 ID
     */
    hideSheet(sheetId) {
      const sheet = document.getElementById(sheetId);
      const backdropEl = document.getElementById(sheetId + '-backdrop');

      if (sheet) {
        sheet.style.transition = `transform ${TRANSITION_DURATION}ms cubic-bezier(0.32, 0.72, 0, 1)`;
        sheet.style.transform = 'translateY(100%)';
      }

      if (backdropEl) {
        backdropEl.style.background = 'rgba(0,0,0,0)';
      }

      setTimeout(() => {
        if (sheet) {
          sheet.style.display = 'none';
          sheet.style.transition = '';
        }
        if (backdropEl) {
          backdropEl.style.display = 'none';
        }
        // 只在没有其他 sheet 打开时恢复滚动
        this._openSheets.delete(sheetId);
        if (this._openSheets.size === 0) {
          document.body.style.overflow = '';
        }
      }, TRANSITION_DURATION);
    }

    /**
     * 隐藏所有打开的 Sheet
     */
    hideAllSheets() {
      this._openSheets.forEach(id => this.hideSheet(id));
    }

    // ============================================================
    // 路由守卫 / 中间件
    // ============================================================

    /**
     * 添加路由守卫（导航前执行）
     * @param {Function} guard - (from, to, data) => boolean，返回 false 则拦截
     * @returns {Function} 移除守卫的函数
     */
    beforeEach(guard) {
      if (typeof guard !== 'function') return () => {};
      this._guards.push(guard);
      return () => {
        const idx = this._guards.indexOf(guard);
        if (idx !== -1) this._guards.splice(idx, 1);
      };
    }

    /**
     * 添加导航后回调
     * @param {Function} hook - (from, to, data) => void
     * @returns {Function} 移除回调的函数
     */
    afterEach(hook) {
      if (typeof hook !== 'function') return () => {};
      this._afterHooks.push(hook);
      return () => {
        const idx = this._afterHooks.indexOf(hook);
        if (idx !== -1) this._afterHooks.splice(idx, 1);
      };
    }

    /**
     * 执行路由守卫
     * @private
     */
    _runGuards(from, to, data) {
      for (const guard of this._guards) {
        try {
          if (guard(from, to, data) === false) {
            return false;
          }
        } catch (err) {
          console.error('[Router] 路由守卫异常:', err);
        }
      }
      return true;
    }

    /**
     * 执行导航后回调
     * @private
     */
    _runAfterHooks(from, to, data) {
      this._afterHooks.forEach(hook => {
        try {
          hook(from, to, data);
        } catch (err) {
          console.error('[Router] afterEach 回调异常:', err);
        }
      });
    }

    // ============================================================
    // 滚动位置管理
    // ============================================================

    /**
     * 保存页面滚动位置
     * @private
     */
    _saveScrollPosition(route) {
      const page = document.getElementById('page-' + route);
      if (page) {
        const scrollable = page.querySelector('.page-scroll-content') || page;
        this._scrollPositions.set(route, scrollable.scrollTop || 0);
      }
    }

    /**
     * 恢复页面滚动位置
     * @private
     */
    _restoreScrollPosition(route) {
      const pos = this._scrollPositions.get(route);
      if (pos !== undefined) {
        const page = document.getElementById('page-' + route);
        if (page) {
          const scrollable = page.querySelector('.page-scroll-content') || page;
          requestAnimationFrame(() => {
            scrollable.scrollTop = pos;
          });
        }
      }
    }

    // ============================================================
    // 大标题折叠效果
    // ============================================================

    /**
     * 初始化大标题滚动折叠
     * @private
     */
    _initLargeTitleCollapse() {
      // 使用事件委托，监听所有可滚动区域
      document.addEventListener('scroll', (e) => {
        const target = e.target;
        if (!target.classList || !target.classList.contains('page-scroll-content')) return;

        const page = target.closest('.page');
        if (!page) return;

        const navBar = page.querySelector('.ios-nav-bar');
        const largeTitle = page.querySelector('.large-title');
        if (!navBar || !largeTitle) return;

        const scrollY = target.scrollTop;
        const threshold = 44; // 大标题高度阈值

        if (scrollY > threshold) {
          navBar.classList.add('nav-bar-collapsed');
          largeTitle.style.opacity = Math.max(0, 1 - (scrollY - threshold) / 30);
          largeTitle.style.transform = `translateY(-${Math.min(scrollY - threshold, 50)}px)`;
        } else {
          navBar.classList.remove('nav-bar-collapsed');
          largeTitle.style.opacity = '1';
          largeTitle.style.transform = 'translateY(0)';
        }
      }, true); // 使用捕获模式监听子元素滚动
    }

    // ============================================================
    // 工具方法
    // ============================================================

    /**
     * 获取当前路由名
     * @returns {string}
     */
    get current() {
      return this._currentRoute;
    }

    /**
     * 获取当前路由配置
     * @returns {Object}
     */
    get currentConfig() {
      return ROUTES[this._currentRoute] || {};
    }

    /**
     * 获取路由配置
     * @param {string} route - 路由名
     * @returns {Object|null}
     */
    getRouteConfig(route) {
      return ROUTES[route] || null;
    }

    /**
     * 是否可以返回
     * @returns {boolean}
     */
    get canGoBack() {
      return this._navigationStack.length > 1;
    }

    /**
     * 获取导航栈（调试用）
     * @returns {Array<string>}
     */
    get stack() {
      return [...this._navigationStack];
    }

    /**
     * 触觉反馈
     * @private
     */
    _hapticFeedback(style = 'light') {
      try {
        if (navigator.vibrate) {
          const durations = {
            light: 10,
            medium: 20,
            heavy: 30
          };
          navigator.vibrate(durations[style] || 10);
        }
      } catch (e) {
        // 静默失败
      }
    }

    /**
     * 当前是否有 sheet 打开
     * @returns {boolean}
     */
    get hasOpenSheet() {
      return this._openSheets.size > 0;
    }
  }

  // ============================================================
  // 导出全局单例
  // ============================================================
  const router = new Router();

  window.router = router;
  window.ROUTES = ROUTES;

  console.log('[Router] 模块加载完成，可通过 window.router 访问');

})();
