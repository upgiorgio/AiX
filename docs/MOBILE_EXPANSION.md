# AiX Card Suite · 移动端扩展指南

> **面向**：iOS App / Android APK / 微信小程序开发
> **更新**：2026-02-23
> **依赖文档**：`/PROJECT_INDEX.md`（必读）

---

## 📋 目录

1. [后端 API 直接复用](#1-后端-api-直接复用)
2. [数据模型迁移](#2-数据模型迁移)
3. [AI Prompt 模板库](#3-ai-prompt-模板库)
4. [iOS 开发指南](#4-ios-开发指南)
5. [微信小程序开发指南](#5-微信小程序开发指南)
6. [Android 开发指南](#6-android-开发指南)
7. [卡片模板移植方案](#7-卡片模板移植方案)
8. [平台品牌色常量](#8-平台品牌色常量)
9. [功能优先级矩阵](#9-功能优先级矩阵)

---

## 1. 后端 API 直接复用

### ✅ 无需修改，三端直接调用

**Base URL**: `https://aix-ai-api.musd-app.workers.dev`

> CORS 已全部放开（`Access-Control-Allow-Origin: *`），iOS/Android/小程序可直接请求。

### 1.1 iOS — URLSession 示例

```swift
// AI 流式生成
func streamGenerate(prompt: String, system: String = "", onChunk: @escaping (String) -> Void, onDone: @escaping () -> Void) {
    let url = URL(string: "https://aix-ai-api.musd-app.workers.dev/ai/stream")!
    var request = URLRequest(url: url)
    request.httpMethod = "POST"
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    request.httpBody = try? JSONEncoder().encode([
        "prompt": prompt,
        "system": system,
        "fast": false
    ])

    let session = URLSession(configuration: .default, delegate: SSEDelegate(onChunk: onChunk, onDone: onDone), delegateQueue: nil)
    session.dataTask(with: request).resume()
}

// URL 内容提取
func extractURL(_ urlString: String) async throws -> ArticleExtract {
    let url = URL(string: "https://aix-ai-api.musd-app.workers.dev/url/extract")!
    var request = URLRequest(url: url)
    request.httpMethod = "POST"
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    request.httpBody = try? JSONEncoder().encode(["url": urlString])

    let (data, _) = try await URLSession.shared.data(for: request)
    return try JSONDecoder().decode(ArticleExtract.self, from: data)
}

struct ArticleExtract: Codable {
    let title: String
    let points: [String]
    let quote: String
    let summary: String
}
```

### 1.2 微信小程序 — wx.request 示例

```javascript
// 单次生成
function aiGenerate(prompt, system = '') {
  return new Promise((resolve, reject) => {
    wx.request({
      url: 'https://aix-ai-api.musd-app.workers.dev/ai/generate',
      method: 'POST',
      header: { 'Content-Type': 'application/json' },
      data: { prompt, system, fast: false },
      success: (res) => resolve(res.data.content),
      fail: reject
    })
  })
}

// 注意：小程序不支持 SSE 流式，改用单次生成接口
// 可在 loading 状态下使用 /ai/generate，用户体验也可接受
```

### 1.3 Android — Retrofit 示例

```kotlin
// API Interface
interface AixApiService {
    @POST("ai/generate")
    suspend fun generate(@Body request: GenerateRequest): GenerateResponse

    @POST("url/extract")
    suspend fun extractUrl(@Body request: ExtractRequest): ArticleExtract

    // 流式：使用 OkHttp SSE
    @Streaming
    @POST("ai/stream")
    suspend fun stream(@Body request: GenerateRequest): ResponseBody
}

data class GenerateRequest(
    val prompt: String,
    val system: String = "",
    val fast: Boolean = false
)
data class GenerateResponse(val content: String)
data class ExtractRequest(val url: String)
data class ArticleExtract(
    val title: String,
    val points: List<String>,
    val quote: String,
    val summary: String
)

// Retrofit 初始化
val retrofit = Retrofit.Builder()
    .baseUrl("https://aix-ai-api.musd-app.workers.dev/")
    .addConverterFactory(GsonConverterFactory.create())
    .build()
```

---

## 2. 数据模型迁移

### 2.1 草稿数据模型 → SQLite / Core Data / Room

```sql
-- 草稿表（对应 localStorage: x-articles-studio-draft）
CREATE TABLE drafts (
    id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    topic       TEXT,
    point       TEXT,
    platform    TEXT,        -- 'x','wechat','zhihu','xiaohongshu','bilibili'
    tone        TEXT,        -- '专业','轻松','故事感'
    length_type TEXT,        -- '短','中','长'
    article     TEXT,        -- 生成的完整文章
    title       TEXT,        -- 生成的标题
    hook        TEXT,        -- 开头钩子
    created_at  INTEGER,
    updated_at  INTEGER
);

-- 文案版本表（对应 aix-copy-versions-v1）
CREATE TABLE copy_versions (
    id         TEXT PRIMARY KEY,
    draft_id   TEXT REFERENCES drafts(id),
    version    INTEGER,     -- 0=A, 1=B, 2=C
    content    TEXT,
    scenario   TEXT,
    platform   TEXT,
    created_at INTEGER
);

-- Thread 表
CREATE TABLE threads (
    id         TEXT PRIMARY KEY,
    draft_id   TEXT REFERENCES drafts(id),
    position   INTEGER,
    content    TEXT
);

-- AI 设置表（对应 aix-ai-settings-v1）
CREATE TABLE ai_settings (
    id           INTEGER PRIMARY KEY DEFAULT 1,
    provider     TEXT DEFAULT 'cf',   -- 'cf' | 'openai'
    openai_key   TEXT,
    model        TEXT DEFAULT 'gpt-4o-mini'
);
```

### 2.2 Swift 数据模型

```swift
// Draft.swift
struct Draft: Codable, Identifiable {
    var id: UUID = UUID()
    var topic: String = ""
    var point: String = ""
    var platform: Platform = .x
    var tone: String = "专业"
    var article: String = ""
    var title: String = ""
    var createdAt: Date = Date()
    var updatedAt: Date = Date()
}

enum Platform: String, Codable, CaseIterable {
    case x            = "x"
    case xiaohongshu  = "xiaohongshu"
    case wechat       = "wechat"
    case zhihu        = "zhihu"
    case bilibili     = "bilibili"
    case linkedin     = "linkedin"

    var displayName: String {
        switch self {
        case .x:           return "X / Twitter"
        case .xiaohongshu: return "小红书"
        case .wechat:      return "公众号"
        case .zhihu:       return "知乎"
        case .bilibili:    return "B站"
        case .linkedin:    return "LinkedIn"
        }
    }

    var charLimit: Int {
        switch self {
        case .x:           return 280
        case .xiaohongshu: return 1000
        case .wechat:      return 2000
        case .zhihu:       return 5000
        case .bilibili:    return 2000
        case .linkedin:    return 3000
        }
    }

    var brandColor: Color {
        switch self {
        case .x:           return Color(hex: "#1d9bf0")
        case .xiaohongshu: return Color(hex: "#ff2442")
        case .wechat:      return Color(hex: "#07c160")
        case .zhihu:       return Color(hex: "#0084ff")
        case .bilibili:    return Color(hex: "#fb7299")
        case .linkedin:    return Color(hex: "#0a66c2")
        }
    }
}
```

---

## 3. AI Prompt 模板库

> 直接复制到移动端常量文件，无需修改。

### 3.1 场景模板指南

```swift
// Swift
let scenarioGuides: [String: String] = [
    "xhs":      "开场先给场景冲突 + 3条清单 + 结尾互动问题，多用表情符号",
    "x-thread": "首条用强钩子，后续按观点分段，末条回流主文，英中混排",
    "wechat":   "标题价值明确，正文小标题分段，结尾给行动建议",
    "quote":    "一句核心观点 + 一句解释 + 一句行动，精炼有力",
    "ad":       "用户痛点-方案-证据-行动，避免绝对化承诺"
]

let platformTones: [String: String] = [
    "xiaohongshu": "口语化、亲切、多用表情符号、像在跟朋友聊天",
    "x":           "简短有力、英中混排、带 hashtag、推文风格",
    "wechat":      "正式、段落清晰、适合深度阅读",
    "zhihu":       "专业权威、结论先行、有数据有案例",
    "bilibili":    "活泼轻松、带弹幕梗、适合年轻用户",
    "linkedin":    "专业积极、结合数据与个人经验、适合职场话题"
]
```

### 3.2 主生成 Prompt 构建函数

```swift
func buildCopyPrompt(scenario: String, platform: String, tone: String,
                     length: String, topic: String, audience: String,
                     thesis: String, cta: String) -> String {
    let guide = scenarioGuides[scenario] ?? ""
    let ptone = platformTones[platform] ?? tone

    return """
    你是资深内容主编。请按以下参数直接输出一篇可发布的\(platform)文案，不要解释，不要前言。

    【参数】
    场景：\(scenario)（要求：\(guide)）
    平台：\(platform)（语气：\(ptone)）
    语气风格：\(tone)
    长度目标：\(length)
    主题：\(topic.isEmpty ? "AI工作流提效" : topic)
    目标受众：\(audience.isEmpty ? "自媒体创作者" : audience)
    核心观点：\(thesis.isEmpty ? "AI工具能大幅提升创作效率" : thesis)
    行动引导：\(cta.isEmpty ? "收藏并尝试一次" : cta)

    【输出格式】
    - Markdown格式（标题/正文/结尾）
    - 适合移动端扫读，段落2-4行
    - 自然融入1-2个相关话题标签
    - 不要有多余的说明文字，直接给文案
    """
}
```

### 3.3 AI 迭代优化 Prompt

```swift
let refineInstructions: [(label: String, instruction: String)] = [
    ("✂️ 精简", "更精简，控制在100字以内"),
    ("💬 口语化", "更口语化，像真人说话"),
    ("🎣 强钩子", "加强开头，更有吸引力"),
    ("📢 优化CTA", "优化结尾CTA，更有行动力")
]

func buildRefinePrompt(instruction: String, original: String) -> String {
    return """
    请根据以下指令优化这篇文案，直接输出优化后的完整文案，不要解释：

    【优化指令】\(instruction)

    【原文案】
    \(original)
    """
}
```

---

## 4. iOS 开发指南

### 4.1 推荐技术栈

| 层 | 技术 | 说明 |
|---|------|------|
| UI | SwiftUI | 现代声明式UI，适合快速迭代 |
| 状态管理 | @StateObject + Combine | 响应式数据流 |
| 本地存储 | Core Data + UserDefaults | 草稿持久化 |
| 网络 | URLSession + async/await | 调用 Worker API |
| 流式输出 | URLSessionDataDelegate (SSE) | 实时显示AI生成文字 |
| 卡片渲染 | WKWebView（嵌入Web模板） | 复用现有18套CSS模板 |
| 图片导出 | UIGraphicsImageRenderer | 截图导出PNG |

### 4.2 SSE 流式输出处理

```swift
// SSEManager.swift
class SSEManager: NSObject, URLSessionDataDelegate {
    var onChunk: ((String) -> Void)?
    var onDone: (() -> Void)?
    private var buffer = ""

    func urlSession(_ session: URLSession, dataTask: URLSessionDataTask,
                    didReceive data: Data) {
        guard let text = String(data: data, encoding: .utf8) else { return }
        buffer += text
        let lines = buffer.components(separatedBy: "\n")
        buffer = lines.last ?? ""

        for line in lines.dropLast() {
            guard line.hasPrefix("data: ") else { continue }
            let raw = String(line.dropFirst(6)).trimmingCharacters(in: .whitespaces)
            if raw == "[DONE]" { onDone?(); return }

            if let data = raw.data(using: .utf8),
               let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
               let chunk = (json["response"] ?? json["choices"] as? [[String: Any]])?
                           .first.flatMap({ ($0["delta"] as? [String: Any])?["content"] }) as? String {
                onChunk?(chunk)
            }
        }
    }
}
```

### 4.3 卡片设计器（WKWebView 方案）

最快方式：用 WKWebView 加载现有的 `card-designer.html`，添加原生导出按钮。

```swift
// CardDesignerView.swift
struct CardDesignerView: View {
    let draftText: String
    @State private var webView = WKWebView()

    var body: some View {
        VStack {
            WebView(webView: webView)
                .onAppear {
                    // 加载本地 HTML
                    if let url = Bundle.main.url(forResource: "card-designer", withExtension: "html",
                                                  subdirectory: "card-suite") {
                        webView.loadFileURL(url, allowingReadAccessTo: url.deletingLastPathComponent())
                    }
                    // 注入草稿文本
                    let script = "localStorage.setItem('aix-card-suite-designer-input', '\(draftText.jsonEscaped)');"
                    webView.evaluateJavaScript(script)
                }

            Button("导出 PNG") {
                exportCardAsPNG()
            }
        }
    }

    func exportCardAsPNG() {
        // 截取 WKWebView 内容
        let config = WKSnapshotConfiguration()
        webView.takeSnapshot(with: config) { image, _ in
            if let image = image {
                UIImageWriteToSavedPhotosAlbum(image, nil, nil, nil)
            }
        }
    }
}
```

### 4.4 最小可行产品（MVP）功能清单

```
✅ Phase 1 iOS MVP:
□ 文案工场页面（SwiftUI重写）
  □ 场景/平台/语气/长度选择器
  □ 主题/受众/观点输入
  □ AI生成按钮 + 流式输出展示
  □ 3版本切换（A/B/C）
  □ 迭代优化按钮（精简/口语化/钩子/CTA）
  □ 复制/分享按钮

□ 草稿列表
  □ Core Data 持久化
  □ 列表/搜索/删除

□ AI 设置
  □ 免费CF层 vs OpenAI Key 切换
  □ 测试连接

□ 卡片设计器（WKWebView嵌入）
  □ 模板选择
  □ 导出PNG到相册
```

---

## 5. 微信小程序开发指南

### 5.1 推荐框架

**uni-app**（Vue3语法）：一套代码编译到小程序+H5+App

### 5.2 网络请求封装

```javascript
// utils/aiService.js
const AI_BASE = 'https://aix-ai-api.musd-app.workers.dev'

// 注意：小程序需要在微信公众平台将此域名加入「request合法域名」
// 微信公众平台 → 开发 → 开发管理 → 开发设置 → 服务器域名

export const aiGenerate = (prompt, system = '', fast = false) => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${AI_BASE}/ai/generate`,
      method: 'POST',
      header: { 'Content-Type': 'application/json' },
      data: { prompt, system, fast },
      success: res => {
        if (res.statusCode === 200) resolve(res.data.content)
        else reject(new Error(res.statusCode))
      },
      fail: err => reject(err)
    })
  })
}

export const extractUrl = (url) => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${AI_BASE}/url/extract`,
      method: 'POST',
      header: { 'Content-Type': 'application/json' },
      data: { url },
      success: res => resolve(res.data),
      fail: err => reject(err)
    })
  })
}
```

### 5.3 微信小程序配置要求

```json
// app.json
{
  "networkTimeout": {
    "request": 30000,
    "connectSocket": 30000
  },
  "permission": {}
}
```

**域名白名单**（微信公众平台必须配置）：
```
request合法域名：
  https://aix-ai-api.musd-app.workers.dev
```

### 5.4 小程序卡片导出方案

```javascript
// 使用 canvas 2D API 渲染卡片
Page({
  async exportCard() {
    const query = wx.createSelectorQuery()
    query.select('#card-canvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        const canvas = res[0].node
        const ctx = canvas.getContext('2d')

        // 设置渐变背景（以 Aurora 模板为例）
        const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
        grad.addColorStop(0, '#0f1c35')
        grad.addColorStop(1, '#0a1628')
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // 写入文字
        ctx.fillStyle = '#eaf4ff'
        ctx.font = 'bold 28px PingFang SC'
        ctx.fillText(this.data.content, 40, 80)

        // 导出为图片
        wx.canvasToTempFilePath({
          canvas,
          success: (res) => {
            wx.saveImageToPhotosAlbum({ filePath: res.tempFilePath })
          }
        })
      })
  }
})
```

---

## 6. Android 开发指南

### 6.1 推荐技术栈

| 层 | 技术 |
|---|------|
| UI | Jetpack Compose |
| 网络 | Retrofit 2 + OkHttp |
| SSE 流式 | OkHttp EventSource |
| 本地存储 | Room Database |
| 状态 | ViewModel + StateFlow |
| 卡片渲染 | WebView（复用HTML模板）|

### 6.2 OkHttp SSE 流式接收

```kotlin
// AiStreamClient.kt
class AiStreamClient(private val baseUrl: String) {
    private val client = OkHttpClient.Builder()
        .readTimeout(30, TimeUnit.SECONDS)
        .build()

    fun stream(
        prompt: String,
        system: String = "",
        onChunk: (String) -> Unit,
        onDone: () -> Unit,
        onError: (String) -> Unit
    ) {
        val body = JSONObject()
            .put("prompt", prompt)
            .put("system", system)
            .put("fast", false)
            .toString()
            .toRequestBody("application/json".toMediaType())

        val request = Request.Builder()
            .url("$baseUrl/ai/stream")
            .post(body)
            .build()

        client.newCall(request).enqueue(object : Callback {
            override fun onResponse(call: Call, response: Response) {
                response.body?.source()?.let { source ->
                    while (!source.exhausted()) {
                        val line = source.readUtf8Line() ?: break
                        if (!line.startsWith("data: ")) continue
                        val raw = line.removePrefix("data: ").trim()
                        if (raw == "[DONE]") { onDone(); return }
                        try {
                            val json = JSONObject(raw)
                            val chunk = json.optString("response")
                                ?: json.optJSONArray("choices")
                                    ?.getJSONObject(0)
                                    ?.getJSONObject("delta")
                                    ?.optString("content") ?: ""
                            if (chunk.isNotEmpty()) onChunk(chunk)
                        } catch (_: Exception) {}
                    }
                }
                onDone()
            }
            override fun onFailure(call: Call, e: IOException) {
                onError(e.message ?: "网络错误")
            }
        })
    }
}
```

### 6.3 Room 数据库定义

```kotlin
// Draft.kt
@Entity(tableName = "drafts")
data class Draft(
    @PrimaryKey val id: String = UUID.randomUUID().toString(),
    val topic: String = "",
    val article: String = "",
    val platform: String = "x",
    val scenario: String = "xhs",
    val tone: String = "专业理性",
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
)

@Dao
interface DraftDao {
    @Query("SELECT * FROM drafts ORDER BY updatedAt DESC")
    fun getAllDrafts(): Flow<List<Draft>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun saveDraft(draft: Draft)

    @Delete
    suspend fun deleteDraft(draft: Draft)
}
```

---

## 7. 卡片模板移植方案

### 7.1 模板参数化（3种移植策略）

**策略A：WKWebView/WebView 直接嵌入（最快，推荐 MVP 阶段）**
- 将 `card-suite/` 目录打包进 App Bundle
- WebView 加载本地 HTML，原生注入内容
- 导出使用 `takeSnapshot` / `canvasToTempFilePath`

**策略B：Canvas 原生重绘（性能最好）**
- 将18套模板的渐变参数迁移为配置表
- 原生 Canvas API 绘制
- 适合模板数量稳定后再实施

**策略C：图片模板（最简单）**
- 预渲染18套模板背景为图片
- App 内叠加文字渲染
- 适合小程序（Canvas API限制较多）

### 7.2 模板参数配置表

```swift
// 可直接移植到 Swift / Kotlin / JS

struct CardTemplate {
    let id: String
    let name: String
    let gradient: [String]  // 渐变色数组
    let textColor: String
    let accentColor: String
    let fontStyle: String   // "sans" | "serif"
    let category: String    // "cold" | "warm" | "nature" | "pro" | "light"
}

let cardTemplates: [CardTemplate] = [
    CardTemplate(id:"a", name:"Aurora 极光蓝", gradient:["#0f1c35","#0a1628"], textColor:"#eaf4ff", accentColor:"#53c0ff", fontStyle:"sans", category:"cold"),
    CardTemplate(id:"b", name:"Void 深空",     gradient:["#06080f","#0a0d18"], textColor:"#d0e8ff", accentColor:"#6eb8ff", fontStyle:"sans", category:"cold"),
    CardTemplate(id:"c", name:"Sage 苍翠",     gradient:["#0d2218","#091a10"], textColor:"#d6f0e0", accentColor:"#4dbb7a", fontStyle:"sans", category:"nature"),
    CardTemplate(id:"d", name:"Ember 琥珀橙",  gradient:["#2a1200","#1e0d00"], textColor:"#ffe8c0", accentColor:"#ffb46a", fontStyle:"sans", category:"warm"),
    CardTemplate(id:"e", name:"Blossom 樱花",  gradient:["#2a0d1a","#1e0912"], textColor:"#ffd6e8", accentColor:"#ff7eb3", fontStyle:"sans", category:"warm"),
    CardTemplate(id:"g", name:"Paper 稿纸",    gradient:["#f7f6f3","#eeecea"], textColor:"#2c2c2c", accentColor:"#555555", fontStyle:"serif", category:"light"),
    CardTemplate(id:"j", name:"Cyber 赛博",    gradient:["#000000","#050505"], textColor:"#e0e0e0", accentColor:"#00ff88", fontStyle:"sans", category:"pro"),
    CardTemplate(id:"k", name:"Latte 拿铁",    gradient:["#f5f0eb","#ede8e3"], textColor:"#3c2e1e", accentColor:"#8b6349", fontStyle:"serif", category:"light"),
    CardTemplate(id:"l", name:"Noir 碳黑",     gradient:["#0a0a0a","#111111"], textColor:"#ffffff", accentColor:"#cccccc", fontStyle:"sans", category:"pro"),
    CardTemplate(id:"n", name:"Gold 烫金",     gradient:["#1a1200","#120d00"], textColor:"#f5e6c0", accentColor:"#d4a843", fontStyle:"serif", category:"pro"),
]
```

---

## 8. 平台品牌色常量

### Swift

```swift
extension Color {
    // 平台品牌色
    static let platformX          = Color(hex: "#1d9bf0")  // X/Twitter
    static let platformXHS        = Color(hex: "#ff2442")  // 小红书
    static let platformWeChat     = Color(hex: "#07c160")  // 公众号
    static let platformZhihu      = Color(hex: "#0084ff")  // 知乎
    static let platformBilibili   = Color(hex: "#fb7299")  // B站
    static let platformLinkedIn   = Color(hex: "#0a66c2")  // LinkedIn
    static let platformInstagram  = Color(hex: "#e1306c")  // Instagram
    static let platformYouTube    = Color(hex: "#ff0000")  // YouTube
    static let platformTikTok     = Color(hex: "#010101")  // TikTok
    static let platformWeibo      = Color(hex: "#e6162d")  // 微博
    static let platformDouyin     = Color(hex: "#161823")  // 抖音
    static let platformKuaishou   = Color(hex: "#ff5500")  // 快手
}
```

### Kotlin

```kotlin
object PlatformColors {
    val X           = Color(0xFF1d9bf0)
    val Xiaohongshu = Color(0xFFff2442)
    val WeChat      = Color(0xFF07c160)
    val Zhihu       = Color(0xFF0084ff)
    val Bilibili    = Color(0xFFfb7299)
    val LinkedIn    = Color(0xFF0a66c2)
    val Instagram   = Color(0xFFe1306c)
    val YouTube     = Color(0xFFff0000)
    val TikTok      = Color(0xFF010101)
    val Weibo       = Color(0xFFe6162d)
    val Douyin      = Color(0xFF161823)
    val Kuaishou    = Color(0xFFff5500)
}
```

### JavaScript / 小程序

```javascript
// 直接从 common.css 提取
export const PLATFORM_COLORS = {
  x:           '#1d9bf0',
  xiaohongshu: '#ff2442',
  wechat:      '#07c160',
  zhihu:       '#0084ff',
  bilibili:    '#fb7299',
  linkedin:    '#0a66c2',
  instagram:   '#e1306c',
  youtube:     '#ff0000',
  tiktok:      '#010101',
  weibo:       '#e6162d',
  douyin:      '#161823',
  kuaishou:    '#ff5500',
}

export const PLATFORM_CHAR_LIMITS = {
  x:           280,
  xiaohongshu: 1000,
  wechat:      2000,
  zhihu:       5000,
  bilibili:    2000,
  linkedin:    3000,
}
```

---

## 9. 功能优先级矩阵

| 功能 | iOS | 小程序 | Android | 难度 | 价值 |
|------|:---:|:-----:|:-------:|:---:|:----:|
| AI 文案生成（流式） | ✅ P1 | ✅ P1 | ✅ P1 | ★★ | ⭐⭐⭐⭐⭐ |
| 3版本草稿管理 | ✅ P1 | ✅ P1 | ✅ P1 | ★ | ⭐⭐⭐⭐ |
| 平台选择 + 品牌色 | ✅ P1 | ✅ P1 | ✅ P1 | ★ | ⭐⭐⭐⭐⭐ |
| AI 迭代优化 | ✅ P1 | ✅ P1 | ✅ P1 | ★ | ⭐⭐⭐⭐ |
| 卡片设计器（WebView） | ✅ P1 | ⚠️ P2 | ✅ P1 | ★★ | ⭐⭐⭐⭐⭐ |
| PNG 卡片导出 | ✅ P1 | ✅ P2 | ✅ P1 | ★★ | ⭐⭐⭐⭐⭐ |
| URL 内容导入 | ✅ P2 | ✅ P2 | ✅ P2 | ★ | ⭐⭐⭐ |
| 草稿历史记录 | ✅ P2 | ✅ P2 | ✅ P2 | ★ | ⭐⭐⭐⭐ |
| 多平台发布清单 | ✅ P2 | ✅ P2 | ✅ P2 | ★ | ⭐⭐⭐ |
| 热点话题雷达 | ✅ P3 | ✅ P3 | ✅ P3 | ★★ | ⭐⭐⭐ |
| 平台仿真发帖窗口 | ✅ P2 | ⚠️ P3 | ✅ P2 | ★★★ | ⭐⭐⭐⭐⭐ |
| MD 排版工坊 | ⚠️ P3 | ❌ - | ⚠️ P3 | ★★★ | ⭐⭐ |
| 内容日历 | ✅ P3 | ✅ P3 | ✅ P3 | ★★ | ⭐⭐⭐ |
| 视频脚本生成 | ✅ P2 | ✅ P2 | ✅ P2 | ★ | ⭐⭐⭐⭐ |

> P1=首批上线 · P2=第二轮 · P3=后续 · ⚠️=需适配 · ❌=暂不支持

---

*文档由小C（Claude Agent）生成 · 2026-02-23*
*有更新请同步修改本文件及 PROJECT_INDEX.md*
