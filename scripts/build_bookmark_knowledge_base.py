#!/usr/bin/env python3
import concurrent.futures
import csv
import datetime as dt
import html
import json
import os
import plistlib
import re
import shutil
import textwrap
import urllib.parse
from collections import Counter, defaultdict
from pathlib import Path

import requests
from bs4 import BeautifulSoup, UnicodeDammit


OUTPUT_DIR = Path("/Users/mac/Documents/参考素材/来自收藏夹知识库")
BOOKMARKS_PATH = Path.home() / "Library/Safari/Bookmarks.plist"

MAX_BYTES = 900_000
WORKERS = 18
TIMEOUT = (5, 12)

USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15"
)

DOCS = {
    "index": "index.html",
    "all": "all-links-analysis.html",
    "tools": "tools-local-plan.html",
    "others": "other-links-suggestions.html",
    "knowledge-dev": "knowledge-dev-web.html",
    "knowledge-design": "knowledge-design-ui.html",
    "knowledge-device": "knowledge-device-systems.html",
    "knowledge-life": "knowledge-life-business.html",
    "knowledge-media": "knowledge-media-culture.html",
    "tutorial-dev": "tutorials-dev-web.html",
    "tutorial-design": "tutorials-design-modeling.html",
    "tutorial-device": "tutorials-device-systems.html",
}

TOPIC_LABELS = {
    "dev-web": "开发、建站与云服务",
    "design-ui": "设计、UI 与空间素材",
    "device-system": "数码设备与系统维护",
    "life-business": "生活、金融、车辆与商务",
    "media-culture": "影音、阅读与文化资源",
    "account-service": "账号、控制台与平台入口",
    "archive": "低价值归档或阶段性兴趣",
}

TYPE_LABELS = {
    "knowledge": "知识参考",
    "tutorial": "教程方法",
    "tool": "工具/平台",
    "other": "其他/归档",
}

TYPE_CLASS = {
    "knowledge": "type-knowledge",
    "tutorial": "type-tutorial",
    "tool": "type-tool",
    "other": "type-other",
}


HOST_TOPIC = {
    "github.com": "dev-web",
    "console.cloud.tencent.com": "dev-web",
    "wanwang.aliyun.com": "dev-web",
    "netcn.console.aliyun.com": "dev-web",
    "cp.hichina.com": "dev-web",
    "www.net.cn": "dev-web",
    "www.vpser.net": "dev-web",
    "bbs.idcspy.com": "dev-web",
    "www.bootcdn.cn": "dev-web",
    "www.bootcss.com": "dev-web",
    "codeigniter.org.cn": "dev-web",
    "www.webxml.com.cn": "dev-web",
    "www.phpnow.org": "dev-web",
    "www.cnfree.org": "dev-web",
    "www.lesishu.com": "dev-web",
    "my.hengtian.org": "dev-web",
    "hzfwq.com": "dev-web",
    "chat.openai.com": "dev-web",
    "www.coze.com": "dev-web",
    "www.360kb.com": "dev-web",
    "app.baidu.com": "dev-web",
    "fir.im": "dev-web",
    "key.deemind.com": "dev-web",
    "www.pypypy.cn": "dev-web",
    "yoursunny.com": "dev-web",
    "is.gd": "dev-web",
    "www.flagcounter.com": "dev-web",
    "www.51yuansu.com": "design-ui",
    "818ps.com": "design-ui",
    "www.ui.cn": "design-ui",
    "www.gaoding.com": "design-ui",
    "www.zcool.com.cn": "design-ui",
    "www.uisdc.com": "design-ui",
    "www.yfu.cn": "design-ui",
    "www.sj33.cn": "design-ui",
    "abduzeedo.com": "design-ui",
    "banjiajia.com": "design-ui",
    "www.banjiajia.com": "design-ui",
    "www.snren.com": "design-ui",
    "www.toprender.com": "design-ui",
    "www.tuozhe8.com": "design-ui",
    "yydes.com": "design-ui",
    "www.szbcd.cn": "design-ui",
    "findicons.com": "design-ui",
    "ui-cloud.com": "design-ui",
    "html5up.net": "design-ui",
    "tympanus.net": "design-ui",
    "paranimage.com": "design-ui",
    "xuui.net": "design-ui",
    "www.barrelny.com": "design-ui",
    "9ye.jp": "design-ui",
    "www.ordinateinfo.com": "design-ui",
    "blog.templatemonster.com": "design-ui",
    "imediapixel.com": "design-ui",
    "90sheji.com": "design-ui",
    "abc.2008php.com": "design-ui",
    "www.tineye.com": "design-ui",
    "www.ifixit.com": "device-system",
    "www.lidroid.com": "device-system",
    "samsung-updates.com": "device-system",
    "www.weiphone.com": "device-system",
    "iphone.sj.91.com": "device-system",
    "bbs.hiapk.com": "device-system",
    "mobile.91.com": "device-system",
    "51souapp.com": "device-system",
    "www.ntexe.com": "device-system",
    "soft.shouji.com.cn": "device-system",
    "www.52blackberry.com": "device-system",
    "www.blovestorm.com": "device-system",
    "hi.baidu.com": "device-system",
    "www.numberingplans.com": "device-system",
    "www.notebookcheck.com.cn": "device-system",
    "www.notebookcheck.net": "device-system",
    "www.dell.com": "device-system",
    "support.apple.com": "device-system",
    "www.appinn.com": "device-system",
    "bbs.ithome.com": "device-system",
    "www.dualwan.cn": "device-system",
    "www.right.com.cn": "device-system",
    "www.pc6.com": "device-system",
    "www.ventoy.net": "device-system",
    "www.smartisan.com": "device-system",
    "www.aichunjing.com": "device-system",
    "www.wsf1234.com": "device-system",
    "selfsolve.apple.com": "device-system",
    "www.pingguo110.com": "device-system",
    "www.gevey3.com": "device-system",
    "bbs.bhgbox.org": "device-system",
    "product.pconline.com.cn": "device-system",
    "dc.pconline.com.cn": "device-system",
    "nb.zol.com.cn": "device-system",
    "a.wjsq.info": "device-system",
    "www.popsoft.com": "device-system",
    "www.ssyqyw.com": "life-business",
    "mobile.9om.com": "life-business",
    "app.16888.com": "life-business",
    "aq.qq.com": "life-business",
    "www.price.com.hk": "life-business",
    "www.eprice.com.hk": "life-business",
    "oopsiak.soup.io": "life-business",
    "rent.wuhan.soufun.com": "life-business",
    "company.zhaopin.com": "life-business",
    "special.zhaopin.com": "life-business",
    "www.cngold.org": "life-business",
    "www.myfax.com": "life-business",
    "www.mielefood.com": "life-business",
    "detail.tmall.com": "life-business",
    "support.weixin.qq.com": "life-business",
    "sale.jd.com": "life-business",
    "www.imgacademies.com": "life-business",
    "www.ijgt.com": "life-business",
    "www.ijgajapan.com": "life-business",
    "www.elmwood.com.cn": "life-business",
    "www.jsctraining.com": "life-business",
    "www.eataly.it": "life-business",
    "www.boc.cn": "life-business",
    "www.bankofchina.com": "life-business",
    "sz.fang.lianjia.com": "life-business",
    "zhilinservice.szu.edu.cn": "life-business",
    "www.openrice.com": "life-business",
    "bank.hangseng.com": "life-business",
    "www.che168.com": "life-business",
    "www.xin.com": "life-business",
    "www.nike.com": "life-business",
    "store.apple.com": "life-business",
    "www.diangao.com": "life-business",
    "pingguo.id": "account-service",
    "mail.qq.com": "account-service",
    "cover.weixin.qq.com": "account-service",
    "aliyun-finance-invoice-prd.oss-cn-shanghai.aliyuncs.com": "account-service",
    "caoliu2014.com": "media-culture",
    "caoliushequ1.tumblr.com": "media-culture",
    "bbs.duokan.com": "media-culture",
    "zh.asoiaf.wikia.com": "media-culture",
    "knowncreative.com": "media-culture",
    "people.mtime.com": "media-culture",
    "www.52miji.com": "media-culture",
    "www.hongshu.com": "media-culture",
    "www.qb5200.co": "media-culture",
    "v.17173.com": "media-culture",
    "www.xunjieshipin.com": "media-culture",
    "www.aconvert.com": "media-culture",
    "convert.freelrc.com": "media-culture",
    "www.zhuanhuanyun.cn": "media-culture",
    "app.xunjieshipin.com": "media-culture",
    "cn.pornhub.com": "media-culture",
    "51btbtt.com": "media-culture",
    "www.animetox.com": "media-culture",
    "t.me": "media-culture",
    "www.superso.top": "media-culture",
    "pan.iosi.vip": "media-culture",
    "www.axjbt.com": "media-culture",
    "www.renren.pro": "media-culture",
    "www.7meiju.com": "media-culture",
    "www.6vhao.net": "media-culture",
    "www.ttmeiju.vip": "media-culture",
    "blog.xunleihd.com": "media-culture",
}

TOOL_HOSTS = {
    "app.baidu.com",
    "www.favicon.cc",
    "findicons.com",
    "www.webxml.com.cn",
    "www.flagcounter.com",
    "is.gd",
    "www.myfax.com",
    "www.tineye.com",
    "www.xunjieshipin.com",
    "www.aconvert.com",
    "convert.freelrc.com",
    "www.zhuanhuanyun.cn",
    "app.xunjieshipin.com",
    "www.numberingplans.com",
    "mobile.9om.com",
    "app.16888.com",
    "www.boc.cn",
    "www.bankofchina.com",
    "www.cngold.org",
    "yoursunny.com",
    "key.deemind.com",
    "818ps.com",
    "www.gaoding.com",
    "www.appinn.com",
}

TOOL_KEYWORDS = [
    "生成器",
    "一键生成",
    "激活工具",
    "转换",
    "converter",
    "查询",
    "搜索引擎",
    "webservice",
    "压缩",
    "混淆",
    "解密",
    "统计代码",
    "缩短",
    "传真",
    "牌价",
    "汇率",
    "imei",
    "选牌",
    "吉凶",
]

TUTORIAL_KEYWORDS = [
    "教程",
    "指南",
    "手册",
    "guide",
    "tutorial",
    "how to",
    "replacement",
    "安装",
    "申请",
    "转移",
    "制作",
    "解决",
    "详解",
    "学习笔记",
    "解读",
    "步骤",
    "经验",
    "资源索引",
    "秘籍",
]

KNOWLEDGE_KEYWORDS = [
    "评测",
    "资讯",
    "新闻",
    "知识",
    "博客",
    "维基",
    "wiki",
    "benchmark",
    "参数",
    "对比",
    "资料",
    "标准",
    "规范",
    "素材",
    "模板",
    "灵感",
    "参考",
    "论坛",
    "社区",
    "学习",
    "academy",
]

ACCOUNT_KEYWORDS = [
    "控制台",
    "会员专区",
    "登录",
    "login",
    "帐号",
    "账号",
    "自助",
    "console",
    "admin",
    "mail",
    "发票",
    "红包封面",
]


def slugify(text):
    text = re.sub(r"[^\w\u4e00-\u9fff-]+", "-", text.strip().lower())
    text = re.sub(r"-+", "-", text).strip("-")
    return text or "untitled"


def esc(value):
    return html.escape(str(value or ""), quote=True)


def strip_text(value, limit=None):
    value = re.sub(r"\s+", " ", str(value or "")).strip()
    if limit and len(value) > limit:
        return value[: limit - 1].rstrip() + "…"
    return value


def host_of(url):
    try:
        return urllib.parse.urlsplit(url or "").netloc.lower()
    except Exception:
        return ""


def path_title(path_parts):
    return " / ".join(p for p in path_parts if p)


def node_title(node):
    return node.get("Title") or node.get("URIDictionary", {}).get("title") or ""


def walk_bookmarks(node, path=()):
    if node.get("WebBookmarkType") == "WebBookmarkTypeLeaf" and node.get("URLString"):
        yield node, path
    for child in node.get("Children", []) or []:
        yield from walk_bookmarks(child, path + (node_title(node),))


def read_bookmarks():
    with BOOKMARKS_PATH.open("rb") as f:
        data = plistlib.load(f)
    rows = []
    for idx, (node, path) in enumerate(walk_bookmarks(data), start=1):
        url = node.get("URLString", "")
        rows.append(
            {
                "id": idx,
                "bookmark_title": node_title(node),
                "url": url,
                "host": host_of(url),
                "source_path": path_title(path),
                "date_added": str(node.get("dateAdded", "")),
            }
        )
    return rows


def read_response_bytes(resp):
    chunks = []
    total = 0
    for chunk in resp.iter_content(chunk_size=16384):
        if not chunk:
            continue
        chunks.append(chunk)
        total += len(chunk)
        if total >= MAX_BYTES:
            break
    return b"".join(chunks)


def fetch_one(row):
    url = row["url"]
    result = {
        "status": "not_checked",
        "http_status": None,
        "final_url": url,
        "content_type": "",
        "page_title": "",
        "description": "",
        "headings": [],
        "snippet": "",
        "fetch_error": "",
    }
    try:
        with requests.get(
            url,
            headers={"User-Agent": USER_AGENT, "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"},
            timeout=TIMEOUT,
            allow_redirects=True,
            stream=True,
            verify=False,
        ) as resp:
            result["http_status"] = resp.status_code
            result["final_url"] = resp.url
            result["content_type"] = resp.headers.get("content-type", "")
            result["status"] = "ok" if resp.status_code < 400 else "http_error"
            ctype = result["content_type"].lower()
            if "text/html" not in ctype and "application/xhtml" not in ctype and "text/plain" not in ctype:
                if "pdf" in ctype:
                    result["snippet"] = "PDF 或二进制文档，保留为文件/票据类链接。"
                return result
            body = read_response_bytes(resp)
            if not body:
                return result
            definite_encodings = []
            if resp.encoding and resp.encoding.lower() not in {"iso-8859-1", "ascii"}:
                definite_encodings.append(resp.encoding)
            definite_encodings.extend(["utf-8", "gb18030", "big5"])
            text = UnicodeDammit(body, known_definite_encodings=definite_encodings).unicode_markup
            if not text:
                text = body.decode("utf-8", errors="replace")
            soup = BeautifulSoup(text, "lxml")
            for tag in soup(["script", "style", "noscript", "svg"]):
                tag.decompose()
            title = soup.find("title")
            result["page_title"] = strip_text(title.get_text(" ")) if title else ""
            desc = soup.find("meta", attrs={"name": re.compile("^description$", re.I)})
            if not desc:
                desc = soup.find("meta", attrs={"property": re.compile("og:description", re.I)})
            if desc and desc.get("content"):
                result["description"] = strip_text(desc.get("content"), 260)
            headings = []
            for tag in soup.find_all(["h1", "h2", "h3"], limit=8):
                text = strip_text(tag.get_text(" "), 90)
                if text and text not in headings:
                    headings.append(text)
            result["headings"] = headings
            main_text = strip_text(soup.get_text(" "), 520)
            result["snippet"] = main_text
    except Exception as exc:
        result["status"] = "failed"
        result["fetch_error"] = strip_text(f"{type(exc).__name__}: {exc}", 180)
    return result


def classify_topic(row):
    host = row["host"]
    host_no_www = host[4:] if host.startswith("www.") else host
    if host in HOST_TOPIC:
        return HOST_TOPIC[host]
    if host_no_www in HOST_TOPIC:
        return HOST_TOPIC[host_no_www]

    text = combined_text(row)
    if any(k in text for k in ["php", "wordpress", "bootstrap", "html", "css", "ajax", "javascript", "github", "主机", "域名", "vps", "云", "api", "codeigniter", "建站", "服务器", "编程"]):
        return "dev-web"
    if any(k in text for k in ["设计", "ui", "logo", "图标", "模板", "素材", "室内", "装修", "建筑", "3d", "vray", "排版", "品牌", "矢量", "灵感"]):
        return "design-ui"
    if any(k in text for k in ["iphone", "ios", "android", "安卓", "rom", "固件", "越狱", "windows", "mac", "boot camp", "驱动", "路由", "openwrt", "手机", "电脑"]):
        return "device-system"
    if any(k in text for k in ["电影", "电视剧", "音乐", "音频", "mp3", "小说", "阅读", "游戏", "动漫", "bt", "网盘", "磁力", "迅雷", "adobe", "photoshop"]):
        return "media-culture"
    if any(k in text for k in ["银行", "汇率", "车", "房", "招聘", "高尔夫", "食品", "餐饮", "购物", "淘宝", "京东", "微信", "发票"]):
        return "life-business"
    return "archive"


def combined_text(row):
    parts = [
        row.get("bookmark_title", ""),
        row.get("page_title", ""),
        row.get("description", ""),
        " ".join(row.get("headings", []) or []),
        row.get("snippet", ""),
        row.get("url", ""),
        row.get("host", ""),
        row.get("source_path", ""),
    ]
    return strip_text(" ".join(parts)).lower()


def metadata_text(row):
    parts = [
        row.get("bookmark_title", ""),
        row.get("page_title", ""),
        row.get("description", ""),
        " ".join(row.get("headings", []) or []),
        row.get("url", ""),
        row.get("host", ""),
        row.get("source_path", ""),
    ]
    return strip_text(" ".join(parts)).lower()


def classify_type(row):
    text = metadata_text(row)
    host = row["host"]
    if host in TOOL_HOSTS or any(k in text for k in TOOL_KEYWORDS):
        return "tool"
    if any(k in text for k in TUTORIAL_KEYWORDS):
        return "tutorial"
    if any(k in text for k in ACCOUNT_KEYWORDS):
        return "other"
    if any(k in text for k in KNOWLEDGE_KEYWORDS):
        return "knowledge"
    if row["topic"] in {"media-culture", "life-business", "account-service"}:
        return "other"
    return "knowledge"


def is_sensitive_or_low_value(row):
    text = combined_text(row)
    host = row["host"]
    return any(
        marker in text
        for marker in [
            "pornhub",
            "草榴",
            "破解版",
            "磁力",
            "bt下载",
            "复刻奢侈品",
            "成人",
            "无码",
            "账号",
            "登录",
            "发票",
        ]
    ) or host in {"cn.pornhub.com", "caoliu2014.com", "pingguo.id", "mail.qq.com"}


def summarize_row(row):
    title = row.get("page_title") or row.get("bookmark_title")
    text = combined_text(row)
    status = row["status"]
    topic = TOPIC_LABELS.get(row["topic"], row["topic"])
    type_label = TYPE_LABELS.get(row["content_type"], row["content_type"])

    if row["content_type"] == "tool":
        if row["tool_bucket"] == "offline":
            action = "适合纳入本地 HTML 工具台，先做纯前端版本。"
        elif row["tool_bucket"] == "api":
            action = "需要外部接口或登录，适合做成本地入口加缓存说明。"
        elif row["tool_bucket"] == "binary":
            action = "需要本地命令行/WASM 引擎，建议后续单独实现。"
        else:
            action = "作为外部工具入口保留，暂不本地化。"
        summary = f"工具型链接，主题归入「{topic}」。{action}"
    elif row["content_type"] == "tutorial":
        summary = f"教程/方法型内容，适合沉淀为「{topic}」下的步骤资料。"
        action = "保留到教程文档；后续可摘出步骤、命令、注意事项。"
    elif row["content_type"] == "knowledge":
        summary = f"知识参考型内容，适合沉淀为「{topic}」资料索引。"
        action = "保留到知识文档；如果页面易失效，建议补做本地摘要。"
    else:
        if is_sensitive_or_low_value(row):
            summary = "非知识库核心内容，且可能涉及隐私、版权或阶段性兴趣。"
            action = "建议单独归档或从公开知识库中隐藏，只保留私人索引。"
        else:
            summary = f"不属于知识/教程/工具主线，归入「{topic}」待处理。"
            action = "建议按用途决定保留、归档或删除。"

    if status not in {"ok", "not_checked"}:
        action += " 当前抓取状态异常，后续复查可访问性。"

    return strip_text(summary, 180), strip_text(action, 180), strip_text(title, 130)


def classify_tool_bucket(row):
    text = combined_text(row)
    host = row["host"]
    if host in {"www.gaoding.com", "818ps.com", "jpsmile.com"}:
        return "external"
    offline_markers = [
        "js/html压缩",
        "代码压缩",
        "混淆",
        "favicon",
        "emoji",
        "html",
        "css",
        "表单",
        "图标",
        "图片原图对比",
    ]
    binary_markers = [
        "ogg",
        "mp3",
        "qmc",
        "ncm",
        "音频转换",
        "视频",
        "下载器",
        "res-downloader",
        "php解密",
    ]
    api_markers = [
        "汇率",
        "牌价",
        "银行",
        "天气",
        "webservice",
        "缩短",
        "传真",
        "imei",
        "车牌",
        "吉凶",
        "查询",
    ]
    if host in {"app.baidu.com", "www.favicon.cc", "photar.net", "www.tineye.com"} or any(k in text for k in offline_markers):
        return "offline"
    if host in {"github.com", "www.xunjieshipin.com", "www.aconvert.com", "convert.freelrc.com", "www.zhuanhuanyun.cn", "app.xunjieshipin.com", "yoursunny.com"} or any(k in text for k in binary_markers):
        return "binary"
    if host in {"www.boc.cn", "www.bankofchina.com", "www.cngold.org", "www.webxml.com.cn", "is.gd", "www.myfax.com", "www.numberingplans.com", "app.16888.com", "mobile.9om.com"} or any(k in text for k in api_markers):
        return "api"
    return "external"


def enrich_rows(rows):
    for row in rows:
        row["topic"] = classify_topic(row)
        row["content_type"] = classify_type(row)
        row["tool_bucket"] = classify_tool_bucket(row) if row["content_type"] == "tool" else ""
        summary, action, effective_title = summarize_row(row)
        row["effective_title"] = effective_title
        row["analysis"] = summary
        row["suggestion"] = action
        row["sensitive_or_low_value"] = is_sensitive_or_low_value(row)
    return rows


def load_or_fetch(rows, output_dir):
    data_dir = output_dir / "data"
    data_dir.mkdir(parents=True, exist_ok=True)
    raw_path = data_dir / "fetch_raw.json"
    cached = {}
    if raw_path.exists():
        try:
            cached_rows = json.loads(raw_path.read_text(encoding="utf-8"))
            cached = {item["url"]: item for item in cached_rows}
        except Exception:
            cached = {}

    to_fetch = [row for row in rows if row["url"] not in cached]
    if to_fetch:
        print(f"fetching {len(to_fetch)} links")
        with concurrent.futures.ThreadPoolExecutor(max_workers=WORKERS) as executor:
            future_map = {executor.submit(fetch_one, row): row for row in to_fetch}
            done = 0
            for future in concurrent.futures.as_completed(future_map):
                row = future_map[future]
                done += 1
                meta = future.result()
                cached[row["url"]] = meta
                if done % 25 == 0 or done == len(to_fetch):
                    print(f"checked {done}/{len(to_fetch)}")
        raw_path.write_text(
            json.dumps([{"url": url, **meta} for url, meta in cached.items()], ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
    else:
        print(f"using cached fetch data for {len(cached)} links")

    for row in rows:
        row.update(cached.get(row["url"], {}))
    return rows


def write_assets(output_dir):
    assets = output_dir / "assets"
    assets.mkdir(parents=True, exist_ok=True)
    (assets / "bookmark-kb.css").write_text(
        """
:root {
  --paper: #fffaf2;
  --ink: #23201c;
  --muted: #6c6258;
  --line: #ded2c3;
  --panel: #fffefd;
  --orange: #f47b20;
  --teal: #087f8c;
  --plum: #7d426d;
  --green: #497d3d;
  --blue: #315f9b;
  --shadow: 0 18px 45px rgba(45, 33, 20, .12);
}
* { box-sizing: border-box; }
html { background: var(--paper); color: var(--ink); }
body {
  margin: 0;
  font-family: "Avenir Next", "PingFang SC", "Hiragino Sans GB", "Songti SC", sans-serif;
  line-height: 1.6;
  letter-spacing: 0;
}
a { color: #0f6792; text-decoration-thickness: .08em; text-underline-offset: .18em; }
a:hover { color: #b45012; }
.shell { width: min(1180px, calc(100vw - 32px)); margin: 0 auto; }
.hero {
  border-bottom: 1px solid var(--line);
  background:
    linear-gradient(110deg, rgba(244, 123, 32, .15), transparent 36%),
    linear-gradient(290deg, rgba(8, 127, 140, .12), transparent 38%),
    #fff4e4;
}
.hero-inner { padding: 42px 0 30px; }
.eyebrow { color: var(--teal); font-weight: 800; font-size: 13px; text-transform: uppercase; }
h1 { font-family: "Songti SC", Georgia, serif; font-size: clamp(34px, 6vw, 68px); line-height: 1.05; margin: 12px 0 14px; letter-spacing: 0; }
h2 { font-family: "Songti SC", Georgia, serif; font-size: 30px; margin: 38px 0 14px; }
h3 { font-size: 18px; margin: 24px 0 8px; }
.lead { font-size: 18px; color: #51483f; max-width: 860px; }
.meta-row { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 18px; }
.pill {
  display: inline-flex; align-items: center; gap: 6px;
  border: 1px solid var(--line); background: rgba(255,255,255,.72);
  border-radius: 999px; padding: 6px 12px; font-size: 13px; color: #53483e;
}
.nav {
  display: flex; flex-wrap: wrap; gap: 10px;
  padding: 16px 0; border-bottom: 1px solid var(--line);
}
.nav a {
  display: inline-flex; align-items: center;
  min-height: 36px; padding: 8px 12px;
  border: 1px solid var(--line); border-radius: 8px;
  background: #fffefd; color: var(--ink); text-decoration: none; font-weight: 700; font-size: 14px;
}
.nav a:hover { border-color: var(--orange); color: #9a3e07; }
.grid { display: grid; grid-template-columns: repeat(12, 1fr); gap: 16px; margin: 22px 0; }
.card {
  grid-column: span 4;
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 18px;
  box-shadow: var(--shadow);
}
.card.wide { grid-column: span 8; }
.card.full { grid-column: 1 / -1; }
.stat { font-size: 34px; font-weight: 900; line-height: 1; color: #a5440e; }
.stat-label { color: var(--muted); margin-top: 6px; }
.toolbar {
  display: flex; flex-wrap: wrap; gap: 10px; align-items: center;
  margin: 24px 0 14px;
}
.search {
  width: min(520px, 100%);
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 11px 12px;
  font-size: 15px;
  background: white;
  color: var(--ink);
}
.table-wrap { overflow-x: auto; border: 1px solid var(--line); border-radius: 8px; background: white; }
table { width: 100%; border-collapse: collapse; min-width: 940px; }
th, td { padding: 10px 12px; vertical-align: top; border-bottom: 1px solid #eadfce; text-align: left; }
th { font-size: 12px; text-transform: uppercase; color: #6a5b4e; background: #fbf2e5; position: sticky; top: 0; z-index: 1; }
td { font-size: 14px; }
tr:last-child td { border-bottom: 0; }
.badge {
  display: inline-flex; border-radius: 999px; padding: 3px 9px;
  font-size: 12px; font-weight: 800; white-space: nowrap;
}
.type-knowledge { background: rgba(49, 95, 155, .12); color: #214c86; }
.type-tutorial { background: rgba(244, 123, 32, .15); color: #984306; }
.type-tool { background: rgba(8, 127, 140, .14); color: #06616b; }
.type-other { background: rgba(125, 66, 109, .13); color: #70375f; }
.status-ok { color: var(--green); font-weight: 800; }
.status-bad { color: #a73322; font-weight: 800; }
.url { max-width: 420px; word-break: break-all; color: #4d443b; font-size: 12px; }
.note { color: var(--muted); font-size: 13px; }
.list { display: grid; gap: 12px; }
.entry {
  border: 1px solid var(--line);
  border-radius: 8px;
  background: white;
  padding: 14px;
}
.entry-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
.entry-title { font-weight: 850; font-size: 16px; }
.entry-title a { color: var(--ink); }
.entry-meta { display: flex; flex-wrap: wrap; gap: 7px; margin: 8px 0; }
.small { font-size: 12px; color: var(--muted); }
.kicker { font-weight: 900; color: var(--plum); }
.callout {
  border-left: 5px solid var(--orange);
  background: #fff5e9;
  padding: 14px 16px;
  border-radius: 0 8px 8px 0;
  margin: 18px 0;
}
.two-col { columns: 2 320px; column-gap: 26px; }
.two-col li { break-inside: avoid; margin-bottom: 8px; }
footer { margin: 42px 0 30px; padding-top: 18px; border-top: 1px solid var(--line); color: var(--muted); font-size: 13px; }
@media (max-width: 820px) {
  .card, .card.wide { grid-column: 1 / -1; }
  .hero-inner { padding-top: 30px; }
  h1 { font-size: 36px; }
}
        """.strip()
        + "\n",
        encoding="utf-8",
    )
    (assets / "bookmark-kb.js").write_text(
        """
document.addEventListener("DOMContentLoaded", () => {
  const search = document.querySelector("[data-search]");
  if (!search) return;
  const rows = Array.from(document.querySelectorAll("[data-row]"));
  const count = document.querySelector("[data-visible-count]");
  const update = () => {
    const query = search.value.trim().toLowerCase();
    let visible = 0;
    for (const row of rows) {
      const match = !query || row.textContent.toLowerCase().includes(query);
      row.style.display = match ? "" : "none";
      if (match) visible += 1;
    }
    if (count) count.textContent = String(visible);
  };
  search.addEventListener("input", update);
  update();
});
        """.strip()
        + "\n",
        encoding="utf-8",
    )


def page_head(title, subtitle, active=None):
    nav_items = [
        ("总览", DOCS["index"]),
        ("全量分析", DOCS["all"]),
        ("工具整合", DOCS["tools"]),
        ("其他建议", DOCS["others"]),
        ("开发知识", DOCS["knowledge-dev"]),
        ("设计知识", DOCS["knowledge-design"]),
        ("系统知识", DOCS["knowledge-device"]),
        ("生活知识", DOCS["knowledge-life"]),
        ("媒体知识", DOCS["knowledge-media"]),
        ("开发教程", DOCS["tutorial-dev"]),
        ("设计教程", DOCS["tutorial-design"]),
        ("系统教程", DOCS["tutorial-device"]),
    ]
    nav = "\n".join(
        f'<a href="{href}"{" aria-current=\"page\"" if href == active else ""}>{esc(label)}</a>'
        for label, href in nav_items
    )
    return f"""<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{esc(title)}</title>
  <link rel="stylesheet" href="assets/bookmark-kb.css">
  <script src="assets/bookmark-kb.js" defer></script>
</head>
<body>
  <header class="hero">
    <div class="shell hero-inner">
      <div class="eyebrow">Safari Bookmark Knowledge Base</div>
      <h1>{esc(title)}</h1>
      <p class="lead">{esc(subtitle)}</p>
    </div>
  </header>
  <div class="shell">
    <nav class="nav">{nav}</nav>
"""


def page_foot(generated_at):
    return f"""
    <footer>生成时间：{esc(generated_at)}。数据来源：Safari Bookmarks.plist；页面抓取只用于元信息与分类判断。</footer>
  </div>
</body>
</html>
"""


def link_entry(row):
    status_class = "status-ok" if row.get("status") == "ok" else "status-bad"
    status = row.get("http_status") or row.get("status")
    headings = ", ".join(row.get("headings") or [])
    snippet = row.get("description") or row.get("snippet") or row.get("fetch_error")
    return f"""
<article class="entry" data-row>
  <div class="entry-head">
    <div class="entry-title"><a href="{esc(row['url'])}" target="_blank" rel="noreferrer">{esc(row['effective_title'] or row['bookmark_title'])}</a></div>
    <span class="badge {TYPE_CLASS[row['content_type']]}">{esc(TYPE_LABELS[row['content_type']])}</span>
  </div>
  <div class="entry-meta">
    <span class="pill">{esc(TOPIC_LABELS.get(row['topic'], row['topic']))}</span>
    <span class="pill {status_class}">状态 {esc(status)}</span>
    <span class="pill">{esc(row['host'])}</span>
  </div>
  <p>{esc(row['analysis'])}</p>
  <p class="note"><strong>建议：</strong>{esc(row['suggestion'])}</p>
  {f'<p class="small"><strong>页面线索：</strong>{esc(strip_text(headings, 180))}</p>' if headings else ''}
  {f'<p class="small"><strong>摘要：</strong>{esc(strip_text(snippet, 240))}</p>' if snippet else ''}
  <p class="url">{esc(row['url'])}</p>
</article>
"""


def row_cells(row):
    status_class = "status-ok" if row.get("status") == "ok" else "status-bad"
    status = row.get("http_status") or row.get("status")
    return f"""
<tr data-row>
  <td>{row['id']}</td>
  <td><span class="badge {TYPE_CLASS[row['content_type']]}">{esc(TYPE_LABELS[row['content_type']])}</span></td>
  <td>{esc(TOPIC_LABELS.get(row['topic'], row['topic']))}</td>
  <td><span class="{status_class}">{esc(status)}</span><br><span class="small">{esc(row.get('fetch_error', ''))}</span></td>
  <td><a href="{esc(row['url'])}" target="_blank" rel="noreferrer">{esc(row['effective_title'] or row['bookmark_title'])}</a><br><span class="small">{esc(row['host'])}</span></td>
  <td>{esc(row['analysis'])}</td>
  <td>{esc(row['suggestion'])}</td>
  <td class="url">{esc(row['url'])}</td>
</tr>
"""


def write_index(rows, output_dir, generated_at):
    by_type = Counter(row["content_type"] for row in rows)
    by_topic = Counter(row["topic"] for row in rows)
    by_status = Counter("ok" if row.get("status") == "ok" else "异常/未抓取" for row in rows)
    body = page_head(
        "来自收藏夹知识库",
        "把 Safari 收藏夹重新梳理为知识、教程、工具和待处理链接。每个链接都有状态、主题判断和后续处理建议。",
        DOCS["index"],
    )
    body += '<section class="grid">'
    for label, value in [
        ("全部链接", len(rows)),
        ("知识参考", by_type["knowledge"]),
        ("教程方法", by_type["tutorial"]),
        ("工具/平台", by_type["tool"]),
        ("其他/归档", by_type["other"]),
        ("可访问", by_status["ok"]),
    ]:
        body += f'<div class="card"><div class="stat">{value}</div><div class="stat-label">{esc(label)}</div></div>'
    body += "</section>"
    body += """
<section class="card full">
  <h2>处理判断</h2>
  <ul class="two-col">
    <li><strong>知识参考</strong>：适合沉淀为索引和摘要的资料页，例如设计灵感、硬件参数、建站资料、金融/车辆参考。</li>
    <li><strong>教程方法</strong>：包含步骤、安装、申请、迁移、解决方案的内容，后续可以拆成操作手册。</li>
    <li><strong>工具/平台</strong>：能被本地 HTML 工具台吸收的优先本地化；需要接口、登录或本地二进制的先做计划。</li>
    <li><strong>其他/归档</strong>：账号入口、购物、影视资源、阶段性兴趣、隐私或版权敏感项，建议从公开知识库主线中分离。</li>
  </ul>
</section>
"""
    body += '<section class="grid">'
    body += '<div class="card wide"><h2>主题分布</h2><ul>'
    for topic, count in by_topic.most_common():
        body += f"<li><strong>{esc(TOPIC_LABELS.get(topic, topic))}</strong>：{count}</li>"
    body += "</ul></div>"
    body += '<div class="card"><h2>下一步</h2><p>优先把纯前端工具做成本地工具台，再把教程页里的高价值旧教程摘录成操作卡片。账号、购物和资源类链接建议只留私人索引。</p></div>'
    body += "</section>"
    body += page_foot(generated_at)
    (output_dir / DOCS["index"]).write_text(body, encoding="utf-8")


def write_all(rows, output_dir, generated_at):
    body = page_head(
        "全量链接逐个分析",
        "221 个链接的逐项核对表。可以按标题、域名、分类、建议搜索。",
        DOCS["all"],
    )
    body += f"""
<div class="toolbar">
  <input class="search" data-search placeholder="搜索标题、域名、分类或建议">
  <span class="pill">当前显示 <strong data-visible-count>{len(rows)}</strong> / {len(rows)}</span>
</div>
<div class="table-wrap">
<table>
  <thead><tr><th>#</th><th>类型</th><th>主题</th><th>状态</th><th>链接</th><th>分析</th><th>建议</th><th>URL</th></tr></thead>
  <tbody>
"""
    body += "\n".join(row_cells(row) for row in rows)
    body += "</tbody></table></div>"
    body += page_foot(generated_at)
    (output_dir / DOCS["all"]).write_text(body, encoding="utf-8")


def write_topic_page(rows, output_dir, generated_at, doc_key, title, subtitle, content_type, topics):
    filtered = [
        row
        for row in rows
        if row["content_type"] == content_type and row["topic"] in topics
    ]
    body = page_head(title, subtitle, DOCS[doc_key])
    body += f"""
<div class="toolbar">
  <input class="search" data-search placeholder="搜索本页链接">
  <span class="pill">当前显示 <strong data-visible-count>{len(filtered)}</strong> / {len(filtered)}</span>
</div>
"""
    if not filtered:
        body += '<div class="callout">这轮没有归入本页的链接。</div>'
    for topic in topics:
        topic_rows = [row for row in filtered if row["topic"] == topic]
        if not topic_rows:
            continue
        body += f"<h2>{esc(TOPIC_LABELS.get(topic, topic))}</h2><div class=\"list\">"
        body += "\n".join(link_entry(row) for row in topic_rows)
        body += "</div>"
    body += page_foot(generated_at)
    (output_dir / DOCS[doc_key]).write_text(body, encoding="utf-8")


def tool_plan(row):
    text = combined_text(row)
    bucket = row["tool_bucket"]
    if bucket == "offline":
        if "favicon" in text:
            return "用 Canvas 生成多尺寸 favicon/PNG，支持上传图片和纯色字母图标。", "高"
        if "压缩" in text or "混淆" in text:
            return "先做 HTML/CSS/JS 简易压缩、格式化、HTML 转义/反转义，纯前端可运行。", "高"
        if "tineye" in text or "图片" in text:
            return "本地做图片尺寸、哈希、EXIF 与相似度预处理；反搜仍跳转外部。", "中"
        if "emoji" in text:
            return "做离线 emoji 检索和复制面板，数据可静态 JSON 化。", "中"
        return "适合做纯前端小工具，先放入本地工具台第一批。", "中"
    if bucket == "api":
        if "汇率" in text or "牌价" in text:
            return "做汇率查询入口；若允许联网，可接银行/公开汇率 API 并缓存当天数据。", "中"
        if "天气" in text:
            return "旧 WebService 作为参考；新实现建议接现代天气 API，保存城市配置。", "低"
        if "缩短" in text:
            return "URL 缩短必须依赖外部服务；本地只做入口、二维码和历史记录。", "低"
        return "依赖外部接口或登录，适合做本地入口和结果缓存，不建议伪装成离线工具。", "中"
    if bucket == "binary":
        if "音频" in text or "mp3" in text or "qmc" in text or "ncm" in text:
            return "用本地 ffmpeg/WASM 或专用解密库实现，先做文件拖拽和任务队列设计。", "中"
        if "res-downloader" in text or "下载器" in text:
            return "作为本地命令行包装器更合适，HTML 负责配置和任务状态展示。", "中"
        if "php解密" in text:
            return "存在安全风险，建议只做离线沙盒分析，不执行未知 PHP。", "低"
        return "需要本地二进制、WASM 或 CLI 才能真正实现。", "中"
    return "外部平台/账号型工具，保留为入口并记录用途。", "低"


def write_tools(rows, output_dir, generated_at):
    tools = [row for row in rows if row["content_type"] == "tool"]
    for row in tools:
        row["local_plan"], row["priority"] = tool_plan(row)
    body = page_head(
        "工具链接本地整合计划",
        "把工具型收藏拆成四种可执行路径：纯前端、需要 API、需要本地引擎、保留外部入口。",
        DOCS["tools"],
    )
    by_bucket = Counter(row["tool_bucket"] for row in tools)
    body += '<section class="grid">'
    labels = {"offline": "纯前端可做", "api": "需要接口", "binary": "需要本地引擎", "external": "保留外部入口"}
    for bucket in ["offline", "api", "binary", "external"]:
        body += f'<div class="card"><div class="stat">{by_bucket[bucket]}</div><div class="stat-label">{esc(labels[bucket])}</div></div>'
    body += "</section>"
    body += """
<div class="callout"><strong>建议实现顺序：</strong>先做纯前端工具台的第一批：代码压缩/转义、favicon 生成、emoji 检索、图片基础检查。第二批再接汇率/天气等联网 API。音频转换和资源下载类需要 ffmpeg、WASM 或 CLI，不建议塞进单个静态 HTML 里硬做。</div>
<div class="toolbar">
  <input class="search" data-search placeholder="搜索工具、域名、计划">
  <span class="pill">当前显示 <strong data-visible-count>0</strong> / """ + str(len(tools)) + """</span>
</div>
<div class="table-wrap">
<table>
<thead><tr><th>工具</th><th>整合路径</th><th>优先级</th><th>本地实现计划</th><th>当前建议</th><th>URL</th></tr></thead><tbody>
"""
    for row in sorted(tools, key=lambda r: (r["tool_bucket"], r["priority"], r["host"])):
        body += f"""
<tr data-row>
  <td><a href="{esc(row['url'])}" target="_blank" rel="noreferrer">{esc(row['effective_title'])}</a><br><span class="small">{esc(row['host'])}</span></td>
  <td>{esc(labels.get(row['tool_bucket'], row['tool_bucket']))}</td>
  <td>{esc(row['priority'])}</td>
  <td>{esc(row['local_plan'])}</td>
  <td>{esc(row['suggestion'])}</td>
  <td class="url">{esc(row['url'])}</td>
</tr>
"""
    body += "</tbody></table></div>"
    body += page_foot(generated_at)
    (output_dir / DOCS["tools"]).write_text(body, encoding="utf-8")


def write_others(rows, output_dir, generated_at):
    others = [row for row in rows if row["content_type"] == "other"]
    grouped = defaultdict(list)
    for row in others:
        if row["sensitive_or_low_value"]:
            grouped["隐私/版权敏感或低公开价值"].append(row)
        elif row["topic"] == "account-service":
            grouped["账号、控制台、票据入口"].append(row)
        elif row["topic"] == "life-business":
            grouped["生活消费、车辆、房产、商务入口"].append(row)
        elif row["topic"] == "media-culture":
            grouped["影音资源与娱乐收藏"].append(row)
        else:
            grouped["阶段性兴趣或待定归档"].append(row)
    body = page_head(
        "其他链接处理建议",
        "这些链接不适合直接沉淀为知识或教程，但仍有保留、归档、隐藏或删除的处理价值。",
        DOCS["others"],
    )
    body += """
<section class="card full">
  <h2>建议原则</h2>
  <ul>
    <li>账号、发票、邮箱、控制台只保留私人入口，不做公开知识库内容。</li>
    <li>购物、二手车、房产、课程活动等阶段性链接建议设过期复查。</li>
    <li>影音资源、成人或版权敏感链接建议独立私密归档，不混入主知识库。</li>
    <li>旧硬件、旧系统、旧软件资源如果没有再用场景，可以只留全量分析表，不再精加工。</li>
  </ul>
</section>
<div class="toolbar">
  <input class="search" data-search placeholder="搜索其他链接">
  <span class="pill">当前显示 <strong data-visible-count>0</strong> / """ + str(len(others)) + """</span>
</div>
"""
    for group, group_rows in grouped.items():
        body += f"<h2>{esc(group)} <span class=\"small\">{len(group_rows)}</span></h2><div class=\"list\">"
        body += "\n".join(link_entry(row) for row in group_rows)
        body += "</div>"
    body += page_foot(generated_at)
    (output_dir / DOCS["others"]).write_text(body, encoding="utf-8")


def write_data(rows, output_dir):
    data_dir = output_dir / "data"
    data_dir.mkdir(parents=True, exist_ok=True)
    (data_dir / "bookmarks_analysis.json").write_text(
        json.dumps(rows, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    with (data_dir / "bookmarks_analysis.csv").open("w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(
            f,
            fieldnames=[
                "id",
                "bookmark_title",
                "effective_title",
                "url",
                "host",
                "source_path",
                "status",
                "http_status",
                "content_type",
                "topic",
                "tool_bucket",
                "analysis",
                "suggestion",
                "description",
                "fetch_error",
            ],
            extrasaction="ignore",
        )
        writer.writeheader()
        writer.writerows(rows)


def clean_output_dir(output_dir):
    output_dir.mkdir(parents=True, exist_ok=True)
    for name in DOCS.values():
        target = output_dir / name
        if target.exists():
            target.unlink()
    for child in ["assets/bookmark-kb.css", "assets/bookmark-kb.js"]:
        target = output_dir / child
        if target.exists():
            target.unlink()


def main():
    requests.packages.urllib3.disable_warnings()  # Safari-era bookmarks include many legacy TLS hosts.
    generated_at = dt.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    output_dir = OUTPUT_DIR
    clean_output_dir(output_dir)
    rows = read_bookmarks()
    rows = load_or_fetch(rows, output_dir)
    rows = enrich_rows(rows)
    rows.sort(key=lambda r: (r["content_type"], r["topic"], r["host"], r["effective_title"]))

    write_assets(output_dir)
    write_data(rows, output_dir)
    write_index(rows, output_dir, generated_at)
    write_all(rows, output_dir, generated_at)
    write_tools(rows, output_dir, generated_at)
    write_others(rows, output_dir, generated_at)

    write_topic_page(
        rows,
        output_dir,
        generated_at,
        "knowledge-dev",
        "开发、建站与云服务知识",
        "适合保留为开发资料、建站服务、云服务和基础 Web 参考的链接。",
        "knowledge",
        ["dev-web"],
    )
    write_topic_page(
        rows,
        output_dir,
        generated_at,
        "knowledge-design",
        "设计、UI 与空间素材知识",
        "设计灵感、模板素材、UI 参考、空间/建筑/3D 素材的知识索引。",
        "knowledge",
        ["design-ui"],
    )
    write_topic_page(
        rows,
        output_dir,
        generated_at,
        "knowledge-device",
        "数码设备与系统知识",
        "旧手机、iOS/Android、Mac/Windows、硬件参数、ROM 与系统维护资料。",
        "knowledge",
        ["device-system"],
    )
    write_topic_page(
        rows,
        output_dir,
        generated_at,
        "knowledge-life",
        "生活、金融、车辆与商务知识",
        "生活服务、金融汇率、车辆房产、商务消费和学习资料的参考索引。",
        "knowledge",
        ["life-business", "account-service", "archive"],
    )
    write_topic_page(
        rows,
        output_dir,
        generated_at,
        "knowledge-media",
        "影音、阅读与文化资源知识",
        "读物、影视、音乐、游戏和文化资料中仍有参考价值的部分。",
        "knowledge",
        ["media-culture"],
    )
    write_topic_page(
        rows,
        output_dir,
        generated_at,
        "tutorial-dev",
        "开发与建站教程",
        "域名、主机、PHP、HTML/CSS、Web 表单、建站系统和开发相关教程。",
        "tutorial",
        ["dev-web"],
    )
    write_topic_page(
        rows,
        output_dir,
        generated_at,
        "tutorial-design",
        "设计、建模与素材教程",
        "UI、Logo、Material Design、3D 建模、室内设计和素材使用相关教程。",
        "tutorial",
        ["design-ui"],
    )
    write_topic_page(
        rows,
        output_dir,
        generated_at,
        "tutorial-device",
        "设备、系统与刷机教程",
        "iOS、Android、BlackBerry、Windows、Mac、路由器和硬件维护相关教程。",
        "tutorial",
        ["device-system"],
    )

    summary = {
        "output_dir": str(output_dir),
        "total": len(rows),
        "by_type": Counter(row["content_type"] for row in rows),
        "by_topic": Counter(row["topic"] for row in rows),
        "by_status": Counter("ok" if row.get("status") == "ok" else row.get("status", "unknown") for row in rows),
        "files": sorted([str(p.relative_to(output_dir)) for p in output_dir.rglob("*") if p.is_file()]),
    }
    (output_dir / "data" / "summary.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2, default=dict), encoding="utf-8")
    print(json.dumps(summary, ensure_ascii=False, indent=2, default=dict))


if __name__ == "__main__":
    main()
