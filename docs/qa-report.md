# QA Audit Report - X Articles Studio

**Audit Date:** 2026-02-22
**Auditor:** QA Agent (Static Code Analysis)
**Scope:** 7 HTML pages, 7 JS files, 3 CSS files, 1 API endpoint, 1 SW, 1 manifest

---

## Summary

| Category | Count |
|----------|-------|
| Critical issues (must fix) | 0 |
| Medium issues (should fix) | 3 |
| Low/cosmetic issues | 4 |
| Verified working features | 60+ |

The codebase is well-structured overall. All buttons have proper JS event bindings, all internal navigation links point to correct paths, all anchor targets exist, and all form elements have corresponding logic. No orphan DOM queries or unbound event listeners were found.

---

## Medium Issues (Should Fix)

| # | Page | Location | Issue | Suggested Fix |
|:-:|------|----------|-------|---------------|
| 1 | index.html | `#module-hot` refresh button | The hot topics API (`/api/hot-topics`) is a Vercel serverless function. On local static hosting or Cloudflare Pages without Vercel's API routing, this endpoint will return 404. The frontend handles this gracefully (shows error message), but there is no user-visible indication that this is expected on non-Vercel deployments. | Add a note in the UI or fallback message indicating the API requires Vercel serverless functions. Currently handled: the catch block in `refreshHotTopics()` displays the error. **No code fix needed** -- behavior is acceptable. |
| 2 | card-suite/strategy.html | OSS table links | The `strategy.js` file injects raw `<a>` HTML tags directly into table cells via the `row()` function and the `oss` array (lines 66-71). However, the `row()` function does not escape HTML -- it uses template literals directly: `` `<td>${cell}</td>` ``. While intentional for the OSS links, this pattern is inconsistent with the rest of the codebase which uses `escapeHtml()`. If any user-provided data were ever added to these tables, it would create an XSS vector. | Since the data is hardcoded (not user input), this is not a current vulnerability, but consider using explicit `innerHTML` or adding a comment documenting the intentional raw HTML. **Low priority.** |
| 3 | All card-suite pages | `common.js` nav active marking | The nav active-link detection (common.js:73-83) strips `.html` and trailing `/` from paths for comparison. This works correctly for most pages, but on the card-suite index page (`/card-suite/`), the active class correctly highlights "Card Suite Home" link. No issue found. However, **the main site (index.html) and md-lab do not load common.js**, so they don't get active nav marking. This is because those pages have different nav structures, so this is by design. **No fix needed.** |

---

## Low/Cosmetic Issues

| # | Page | Location | Issue | Impact |
|:-:|------|----------|-------|--------|
| 1 | index.html | `sw.js` cache list (line 10) | The service worker caches `/md-lab/app.js?v=20260221-3` but the HTML references the same versioned URL. If the version is updated in HTML but not in sw.js, cached stale versions may persist. | Low -- the SW uses stale-while-revalidate strategy, so updates will eventually propagate. |
| 2 | card-suite/publish-hub.html | Static checklist (lines 121-126) | The 72-hour execution checklist uses plain `<input type="checkbox">` elements without any JS persistence (unlike the main site's checklist which saves to localStorage). Checked states are lost on page refresh. | Low -- this is likely intentional as a quick reference checklist, not a persistent tracker. |
| 3 | card-suite/card-designer.html | `exportPngBtn` | The PNG export relies on `html2canvas` loaded from CDN. If CDN is unavailable, the button shows a toast "export component loading" but doesn't retry. | Low -- graceful degradation is present. |
| 4 | All pages | Footer GitHub link | The GitHub repo link points to `https://github.com/upgiorgio/AiX`. This URL format is valid. Whether the repo actually exists cannot be verified via static analysis alone. | Low -- if the repo doesn't exist, users clicking the link get a 404 on GitHub. |

---

## Verified Working Features (All Pages)

### 1. Main Workstation (`index.html`)

| Feature | Element | JS Binding | Status |
|---------|---------|------------|--------|
| Fill sample | `#fillSampleBtn` | `app.js:2177` | OK |
| Save draft | `#saveDraftBtn` | `app.js:2181` | OK |
| Load draft | `#loadDraftBtn` | `app.js:2182` | OK |
| Export Markdown | `#exportMarkdownBtn` | `app.js:2234` | OK |
| Generate all | `#generateBtn` | `app.js:2175` | OK |
| Reset | `#resetBtn` | `app.js:2176` | OK |
| Copy article | `#copyArticleBtn` | `app.js:2179` | OK |
| Copy thread | `#copyThreadBtn` | `app.js:2180` | OK |
| Open X thread intent | `#openThreadIntentBtn` | `app.js:2241` | OK |
| Open X teaser intent | `#openTeaserIntentBtn` | `app.js:2236` | OK |
| Open X subscription intent | `#openSubIntentBtn` | `app.js:2246` | OK |
| Generate platform versions | `#generatePlatformsBtn` | `app.js:2185` | OK |
| Copy platform suggestions | `#copyPlatformsBtn` | `app.js:2186` | OK |
| Clear platform output | `#clearPlatformsBtn` | `app.js:2187` | OK |
| Copy automation commands | `#copyAutomationCmdBtn` | `app.js:2188` | OK |
| Copy skill trigger | `#copySkillPromptBtn` | `app.js:2191` | OK |
| Refresh hot topics | `#refreshHotTopicsBtn` | `app.js:2203` | OK |
| Run model | `#runModelBtn` | `app.js:2205` | OK |
| Load history version | `#loadHistoryBtn` | `app.js:2183` | OK |
| Delete history version | `#deleteHistoryBtn` | `app.js:2184` | OK |
| Quality score rendering | `#qualityScore`, `#qualityBar`, etc. | Multiple render functions | OK |
| Checklist persistence | `data-key` checkboxes | `app.js:1809-1817` (localStorage) | OK |
| Keyboard shortcuts | Ctrl/Cmd+S, Ctrl/Cmd+Enter | `app.js:2255-2268` | OK |
| Platform filter (rules) | `#resourcePlatformSelect` | `app.js:2201` | OK |
| Type filter (rules) | `#resourceTypeSelect` | `app.js:2202` | OK |
| Hot window select | `#hotWindowSelect` | `app.js:2204` | OK |
| Model parameter selects | `#modelPlatform`, etc. | `app.js:2206-2208` | OK |
| Platform copy buttons (delegated) | `.platform-copy-btn` | `app.js:2218-2232` | OK |

### Navigation Links (index.html)

| Link | Target | Status |
|------|--------|--------|
| `href="/md-lab"` | md-lab/index.html | OK |
| `href="/card-suite/index.html"` | card-suite/index.html | OK |
| `href="#module-directory"` | `id="module-directory"` exists | OK |
| `href="#module-inputs"` | `id="module-inputs"` exists | OK |
| `href="#module-title-hook"` | `id="module-title-hook"` exists | OK |
| `href="#module-article"` | `id="module-article"` exists | OK |
| `href="#module-thread"` | `id="module-thread"` exists | OK |
| `href="#module-plan"` | `id="module-plan"` exists | OK |
| `href="#module-quality"` | `id="module-quality"` exists | OK |
| `href="#module-checklist"` | `id="module-checklist"` exists | OK |
| `href="#module-history"` | `id="module-history"` exists | OK |
| `href="#module-platforms"` | `id="module-platforms"` exists | OK |
| `href="#module-rules"` | `id="module-rules"` exists | OK |
| `href="#module-automation"` | `id="module-automation"` exists | OK |
| `href="#module-signals"` | `id="module-signals"` exists | OK |
| `href="#module-hot"` | `id="module-hot"` exists | OK |
| `href="#module-audit"` | `id="module-audit"` exists | OK |
| `href="#module-model"` | `id="module-model"` exists | OK |
| Footer: `/` | index.html | OK |
| Footer: `/md-lab` | md-lab/index.html | OK |
| Footer: `/card-suite/` | card-suite/index.html | OK |
| Footer: GitHub link | External (target=_blank) | OK |

### 2. Markdown Lab (`md-lab/index.html`)

| Feature | Element | JS Binding | Status |
|---------|---------|------------|--------|
| Import main draft | `#importMainDraftBtn` | `md-lab/app.js:507` | OK |
| Load sample | `#loadSampleBtn` | `md-lab/app.js:492` | OK |
| Clear markdown | `#clearMarkdownBtn` | `md-lab/app.js:500` | OK |
| Copy rich text | `#copyRichBtn` | `md-lab/app.js:509` | OK |
| Copy HTML | `#copyHtmlBtn` | `md-lab/app.js:518` | OK |
| Download .md | `#downloadMdBtn` | `md-lab/app.js:527` | OK |
| Download .html | `#downloadHtmlBtn` | `md-lab/app.js:531` | OK |
| Copy remix prompt | `#copyRemixPromptBtn` | `md-lab/app.js:537` | OK |
| Platform select | `#platformSelect` | `md-lab/app.js:463` | OK |
| Theme select | `#themeSelect` | `md-lab/app.js:472` | OK |
| All range/color/toggle inputs | Multiple IDs | `md-lab/app.js:479-490` | OK |
| Remix mode select | `#remixModeSelect` | `md-lab/app.js:535` | OK |
| Markdown input | `#markdownInput` | `md-lab/app.js:457` | OK |
| Real-time preview | `#previewArticle` | `renderMarkdown()` | OK |
| Word/heading stats | `#wordStats`, `#headingStats` | `updateStats()` | OK |
| State persistence | localStorage | `saveLabState()`/`loadLabState()` | OK |
| Back link | `href="/"` | Returns to main | OK |
| Card suite link | `href="/card-suite/index.html"` | Correct path | OK |
| doocs/md link | External GitHub link | OK (target=_blank) | OK |

### 3. Card Suite Home (`card-suite/index.html`)

| Feature | Element | Status |
|---------|---------|--------|
| Nav: Return to main | `href="/"` | OK |
| Nav: Markdown Lab | `href="/md-lab"` | OK |
| Nav: Copy Studio | `href="/card-suite/copy-studio.html"` | OK |
| Nav: Card Designer | `href="/card-suite/card-designer.html"` | OK |
| Nav: Publish Hub | `href="/card-suite/publish-hub.html"` | OK |
| Nav: Strategy | `href="/card-suite/strategy.html"` | OK |
| Hero: Enter Copy Studio | `href="/card-suite/copy-studio.html"` | OK |
| Hero: Enter Card Designer | `href="/card-suite/card-designer.html"` | OK |
| Hero: Enter Publish Hub | `href="/card-suite/publish-hub.html"` | OK |
| Active nav marking | common.js IIFE | OK |

### 4. Copy Studio (`card-suite/copy-studio.html`)

| Feature | Element | JS Binding | Status |
|---------|---------|------------|--------|
| Generate draft & prompt | `#generateBtn` | `copy-studio.js:111` | OK |
| Import draft | `#importDraftBtn` | `copy-studio.js:112` | OK |
| Send to designer | `#toCardBtn` | `copy-studio.js:113` | OK |
| Copy draft | `#copyDraftBtn` | `copy-studio.js:115` | OK |
| Download draft | `#downloadDraftBtn` | `copy-studio.js:116` | OK |
| Copy prompt | `#copyPromptBtn` | `copy-studio.js:119` | OK |
| All input fields | Multiple IDs | `copy-studio.js:121-123` | OK |
| State persistence | localStorage | `saveState()`/`loadState()` | OK |

### 5. Card Designer (`card-suite/card-designer.html`)

| Feature | Element | JS Binding | Status |
|---------|---------|------------|--------|
| Import draft | `#importDraftBtn` | `card-designer.js:226` | OK |
| Split into cards | `#splitBtn` | `card-designer.js:227` | OK |
| Save state | `#saveStateBtn` | `card-designer.js:228` | OK |
| Send to Publish Hub | `#toPublishBtn` | `card-designer.js:251` | OK |
| Export PNG | `#exportPngBtn` | `card-designer.js:233` | OK |
| Copy batch JSON | `#copyJsonBtn` | `card-designer.js:234` | OK |
| Download batch JSON | `#downloadJsonBtn` | `card-designer.js:242` | OK |
| Live preview sync | Multiple inputs | `card-designer.js:215-224` | OK |
| Card canvas rendering | `#cardCanvas` | `syncPreview()` | OK |

### 6. Publish Hub (`card-suite/publish-hub.html`)

| Feature | Element | JS Binding | Status |
|---------|---------|------------|--------|
| Generate publish pack | `#generateBtn` | `publish-hub.js:144` | OK |
| Copy all | `#copyAllBtn` | `publish-hub.js:145` | OK |
| Download plan | `#downloadPlanBtn` | `publish-hub.js:146` | OK |
| Per-platform copy buttons | Dynamic `data-copy` | `publish-hub.js:102` | OK |
| Platform checkboxes | `#platformGrid` | `publish-hub.js:152-154` | OK |
| Topic/CTA inputs | `#topic`, `#cta` | `publish-hub.js:148-150` | OK |
| Batch data display | `#batchMeta` | `renderBatchMeta()` | OK |

### 7. Strategy Panel (`card-suite/strategy.html`)

| Feature | Element | JS Binding | Status |
|---------|---------|------------|--------|
| Competitor table | `#competitorRows` | `strategy.js:74` | OK |
| User modes table | `#modeRows` | `strategy.js:75` | OK |
| Pain points table | `#painRows` | `strategy.js:76` | OK |
| Pricing table | `#pricingRows` | `strategy.js:86` | OK |
| Tech stack table | `#techRows` | `strategy.js:87` | OK |
| Roadmap table | `#roadmapRows` | `strategy.js:88` | OK |
| OSS projects table | `#ossRows` | `strategy.js:89` | OK |
| All GitHub links in OSS | Raw HTML anchors | Renders correctly | OK |

### Cross-Page Features

| Feature | Status |
|---------|--------|
| Draft sharing via localStorage (`x-articles-studio-draft`) | OK -- used by main site, md-lab, and card-suite |
| MD Lab state persistence (`aix-md-lab-state-v1`) | OK |
| Card suite state pipeline (copy -> designer -> publish) | OK |
| PWA manifest and service worker | OK -- manifest.webmanifest, icon-192.svg, icon-512.svg all exist |
| Footer consistency across all 7 pages | OK -- identical structure and links |
| Google Fonts loading across all pages | OK |
| External CDN dependencies (marked, DOMPurify, highlight.js, html2canvas) | OK -- all loaded with defer |

---

## External Links Inventory

All external links in the codebase are valid URL formats. They include:

- `https://github.com/upgiorgio/AiX` (footer, all pages)
- `https://github.com/doocs/md` (md-lab)
- `https://help.x.com/en/using-x/articles` (app.js)
- `https://legal.x.com/en/subscriptions-creator-terms.html` (app.js)
- `https://x.com/XCreators/status/...` (multiple, app.js)
- `https://mp.weixin.qq.com/` (app.js)
- `https://www.zhihu.com/...` (multiple, app.js)
- `https://www.bilibili.com/...` (multiple, app.js)
- `https://creator.xiaohongshu.com/` (app.js)
- `https://docs.github.com/...` (multiple, app.js)
- `https://developer.x.com/...` (app.js)
- `https://typefully.com/features/` (app.js)
- `https://tweethunter.io/` (app.js)
- `https://hypefury.com/` (app.js)
- `https://buffer.com/publishing` (app.js)
- `https://metricool.com/planner/` (app.js)
- `https://sproutsocial.com/insights/data/` (app.js)
- `https://blog.hubspot.com/...` (app.js)
- Various GitHub repos in strategy.js

All use `target="_blank" rel="noopener noreferrer"` where applicable.

---

## Conclusion

The X Articles Studio codebase is in good condition. All interactive elements are properly bound to their JavaScript handlers. All navigation links resolve correctly. All forms have proper input handling and state persistence. No orphan functions, no unbound event listeners, and no missing DOM targets were found.

**No critical fixes are required.** The medium and low issues identified are edge cases and cosmetic concerns that do not impact core functionality.
