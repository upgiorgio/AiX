#!/usr/bin/env python3
import argparse
import datetime as dt
import os
import plistlib
import shutil
import urllib.parse
import uuid


CATEGORIES = [
    "开发建站与云服务",
    "设计素材与灵感",
    "数码设备与系统",
    "生活服务与商务",
    "影音阅读与资源",
]


HOST_CATEGORY = {
    "console.cloud.tencent.com": "开发建站与云服务",
    "wanwang.aliyun.com": "开发建站与云服务",
    "netcn.console.aliyun.com": "开发建站与云服务",
    "cp.hichina.com": "开发建站与云服务",
    "www.net.cn": "开发建站与云服务",
    "www.vpser.net": "开发建站与云服务",
    "bbs.idcspy.com": "开发建站与云服务",
    "github.com": "开发建站与云服务",
    "www.bootcdn.cn": "开发建站与云服务",
    "www.bootcss.com": "开发建站与云服务",
    "codeigniter.org.cn": "开发建站与云服务",
    "www.webxml.com.cn": "开发建站与云服务",
    "www.phpnow.org": "开发建站与云服务",
    "fir.im": "开发建站与云服务",
    "www.coze.com": "开发建站与云服务",
    "chat.openai.com": "开发建站与云服务",
    "is.gd": "开发建站与云服务",
    "www.flagcounter.com": "开发建站与云服务",
    "app.baidu.com": "开发建站与云服务",
    "yoursunny.com": "开发建站与云服务",
    "www.cnfree.org": "开发建站与云服务",
    "hzfwq.com": "开发建站与云服务",
    "my.hengtian.org": "开发建站与云服务",
    "www.51yuansu.com": "设计素材与灵感",
    "818ps.com": "设计素材与灵感",
    "www.ui.cn": "设计素材与灵感",
    "www.gaoding.com": "设计素材与灵感",
    "www.zcool.com.cn": "设计素材与灵感",
    "www.uisdc.com": "设计素材与灵感",
    "www.yfu.cn": "设计素材与灵感",
    "www.sj33.cn": "设计素材与灵感",
    "abduzeedo.com": "设计素材与灵感",
    "banjiajia.com": "设计素材与灵感",
    "www.banjiajia.com": "设计素材与灵感",
    "www.snren.com": "设计素材与灵感",
    "www.toprender.com": "设计素材与灵感",
    "www.tuozhe8.com": "设计素材与灵感",
    "yydes.com": "设计素材与灵感",
    "www.szbcd.cn": "设计素材与灵感",
    "findicons.com": "设计素材与灵感",
    "ui-cloud.com": "设计素材与灵感",
    "html5up.net": "设计素材与灵感",
    "tympanus.net": "设计素材与灵感",
    "paranimage.com": "设计素材与灵感",
    "xuui.net": "设计素材与灵感",
    "www.barrelny.com": "设计素材与灵感",
    "9ye.jp": "设计素材与灵感",
    "www.ordinateinfo.com": "设计素材与灵感",
    "blog.templatemonster.com": "设计素材与灵感",
    "imediapixel.com": "设计素材与灵感",
    "90sheji.com": "设计素材与灵感",
    "abc.2008php.com": "设计素材与灵感",
    "www.ifixit.com": "数码设备与系统",
    "www.lidroid.com": "数码设备与系统",
    "samsung-updates.com": "数码设备与系统",
    "www.weiphone.com": "数码设备与系统",
    "iphone.sj.91.com": "数码设备与系统",
    "bbs.hiapk.com": "数码设备与系统",
    "mobile.91.com": "数码设备与系统",
    "51souapp.com": "数码设备与系统",
    "www.ntexe.com": "数码设备与系统",
    "soft.shouji.com.cn": "数码设备与系统",
    "www.52blackberry.com": "数码设备与系统",
    "www.blovestorm.com": "数码设备与系统",
    "hi.baidu.com": "数码设备与系统",
    "www.numberingplans.com": "数码设备与系统",
    "www.notebookcheck.com.cn": "数码设备与系统",
    "www.notebookcheck.net": "数码设备与系统",
    "www.dell.com": "数码设备与系统",
    "support.apple.com": "数码设备与系统",
    "www.appinn.com": "数码设备与系统",
    "bbs.ithome.com": "数码设备与系统",
    "www.dualwan.cn": "数码设备与系统",
    "www.right.com.cn": "数码设备与系统",
    "www.pc6.com": "数码设备与系统",
    "www.ventoy.net": "数码设备与系统",
    "www.smartisan.com": "数码设备与系统",
    "www.aichunjing.com": "数码设备与系统",
    "www.wsf1234.com": "数码设备与系统",
    "selfsolve.apple.com": "数码设备与系统",
    "www.pingguo110.com": "数码设备与系统",
    "www.gevey3.com": "数码设备与系统",
    "bbs.bhgbox.org": "数码设备与系统",
    "product.pconline.com.cn": "数码设备与系统",
    "dc.pconline.com.cn": "数码设备与系统",
    "nb.zol.com.cn": "数码设备与系统",
    "aq.qq.com": "生活服务与商务",
    "www.price.com.hk": "生活服务与商务",
    "www.eprice.com.hk": "生活服务与商务",
    "oopsiak.soup.io": "生活服务与商务",
    "rent.wuhan.soufun.com": "生活服务与商务",
    "company.zhaopin.com": "生活服务与商务",
    "special.zhaopin.com": "生活服务与商务",
    "www.cngold.org": "生活服务与商务",
    "www.myfax.com": "生活服务与商务",
    "www.mielefood.com": "生活服务与商务",
    "detail.tmall.com": "生活服务与商务",
    "support.weixin.qq.com": "生活服务与商务",
    "sale.jd.com": "生活服务与商务",
    "www.imgacademies.com": "生活服务与商务",
    "www.ijgt.com": "生活服务与商务",
    "www.ijgajapan.com": "生活服务与商务",
    "www.elmwood.com.cn": "生活服务与商务",
    "www.jsctraining.com": "生活服务与商务",
    "www.eataly.it": "生活服务与商务",
    "www.boc.cn": "生活服务与商务",
    "www.bankofchina.com": "生活服务与商务",
    "sz.fang.lianjia.com": "生活服务与商务",
    "zhilinservice.szu.edu.cn": "生活服务与商务",
    "app.16888.com": "生活服务与商务",
    "www.openrice.com": "生活服务与商务",
    "bank.hangseng.com": "生活服务与商务",
    "www.che168.com": "生活服务与商务",
    "www.xin.com": "生活服务与商务",
    "www.nike.com": "生活服务与商务",
    "www.ssyqyw.com": "生活服务与商务",
    "mobile.9om.com": "生活服务与商务",
    "store.apple.com": "生活服务与商务",
    "caoliu2014.com": "影音阅读与资源",
    "caoliushequ1.tumblr.com": "影音阅读与资源",
    "bbs.duokan.com": "影音阅读与资源",
    "zh.asoiaf.wikia.com": "影音阅读与资源",
    "knowncreative.com": "影音阅读与资源",
    "people.mtime.com": "影音阅读与资源",
    "www.52miji.com": "影音阅读与资源",
    "www.hongshu.com": "影音阅读与资源",
    "www.qb5200.co": "影音阅读与资源",
    "v.17173.com": "影音阅读与资源",
    "www.xunjieshipin.com": "影音阅读与资源",
    "www.aconvert.com": "影音阅读与资源",
    "convert.freelrc.com": "影音阅读与资源",
    "www.zhuanhuanyun.cn": "影音阅读与资源",
    "app.xunjieshipin.com": "影音阅读与资源",
    "cn.pornhub.com": "影音阅读与资源",
    "51btbtt.com": "影音阅读与资源",
    "www.animetox.com": "影音阅读与资源",
    "t.me": "影音阅读与资源",
    "www.superso.top": "影音阅读与资源",
    "pan.iosi.vip": "影音阅读与资源",
    "www.axjbt.com": "影音阅读与资源",
    "www.renren.pro": "影音阅读与资源",
    "www.7meiju.com": "影音阅读与资源",
    "www.6vhao.net": "影音阅读与资源",
    "www.ttmeiju.vip": "影音阅读与资源",
    "key.deemind.com": "开发建站与云服务",
    "www.pypypy.cn": "开发建站与云服务",
    "a.wjsq.info": "数码设备与系统",
    "blog.xunleihd.com": "影音阅读与资源",
    "www.popsoft.com": "数码设备与系统",
    "www.tineye.com": "设计素材与灵感",
}


KEYWORD_CATEGORY = [
    (
        "影音阅读与资源",
        [
            "电影",
            "电视剧",
            "美剧",
            "影视",
            "动漫",
            "番剧",
            "音乐",
            "音频",
            "mp3",
            "ogg",
            "qmc",
            "ncm",
            "小说",
            "txt",
            "阅读",
            "kindle",
            "游戏",
            "lol",
            "bt",
            "磁力",
            "迅雷",
            "网盘",
            "adobe",
            "photoshop",
            "草榴",
            "pornhub",
        ],
    ),
    (
        "数码设备与系统",
        [
            "iphone",
            "ios",
            "ipad",
            "android",
            "安卓",
            "rom",
            "固件",
            "越狱",
            "jailbreak",
            "三星",
            "blackberry",
            "黑莓",
            "wp7",
            "nokia",
            "macbook",
            "boot camp",
            "windows",
            "win10",
            "win7",
            "驱动",
            "dell",
            "openwrt",
            "路由",
            "u盘",
            "ventoy",
            "imei",
            "手机",
            "电脑",
            "autocad",
            "激活",
            "系统",
        ],
    ),
    (
        "设计素材与灵感",
        [
            "设计",
            "素材",
            "logo",
            "图标",
            "模板",
            "主题",
            "皮肤",
            "矢量",
            "标志",
            "vi模板",
            "ui中国",
            "灵感",
            "样机",
            "mockup",
            "html5",
            "css3",
            "codrops",
            "form",
            "表单",
            "室内",
            "装修",
            "吊顶",
            "3dsmax",
            "vray",
            "建筑",
            "效果图",
            "品牌",
            "排版",
        ],
    ),
    (
        "开发建站与云服务",
        [
            "php",
            "codeigniter",
            "wordpress",
            "bootstrap",
            "cdn",
            "html",
            "css",
            "ajax",
            "javascript",
            "js/",
            "github",
            "开源",
            "api",
            "webservice",
            "web 服务",
            "favicon",
            "主机",
            "域名",
            "vps",
            "云主机",
            "控制台",
            "万网",
            "阿里云",
            "腾讯云",
            "建站",
            "服务器",
            "统计代码",
            "解密",
            "压缩",
            "混淆",
            "coze",
            "chatgpt",
            "编程",
        ],
    ),
    (
        "生活服务与商务",
        [
            "银行",
            "汇率",
            "牌价",
            "金融",
            "外汇",
            "招聘",
            "人力",
            "租房",
            "房",
            "车",
            "车牌",
            "二手车",
            "奔驰",
            "宝马",
            "smart",
            "本田",
            "高尔夫",
            "食品",
            "餐饮",
            "红酒",
            "京东",
            "天猫",
            "淘宝",
            "微信",
            "解封",
            "传真",
            "fax",
            "nike",
            "jordan",
            "openrice",
            "eataly",
            "号码",
            "风水",
        ],
    ),
]


def title_of(node):
    return node.get("Title") or node.get("URIDictionary", {}).get("title") or ""


def host_of(url):
    return urllib.parse.urlsplit(url or "").netloc.lower()


def text_of(node):
    return f"{title_of(node)} {node.get('URLString', '')} {host_of(node.get('URLString'))}".lower()


def classify(node):
    host = host_of(node.get("URLString"))
    host_no_www = host[4:] if host.startswith("www.") else host
    if host in HOST_CATEGORY:
        return HOST_CATEGORY[host]
    if host_no_www in HOST_CATEGORY:
        return HOST_CATEGORY[host_no_www]

    text = text_of(node)
    for category, keywords in KEYWORD_CATEGORY:
        if any(keyword in text for keyword in keywords):
            return category
    return "生活服务与商务"


def collect_leaves(node, leaves):
    if node.get("WebBookmarkType") == "WebBookmarkTypeLeaf" and node.get("URLString"):
        leaves.append(node)
    for child in node.get("Children", []) or []:
        collect_leaves(child, leaves)


def find_root(data, title):
    for child in data.get("Children", []) or []:
        if child.get("Title") == title:
            return child
    raise RuntimeError(f"missing Safari bookmark root: {title}")


def sort_key(node):
    host = host_of(node.get("URLString"))
    return (host[4:] if host.startswith("www.") else host, title_of(node).casefold())


def make_folder(title, children):
    return {
        "WebBookmarkUUID": str(uuid.uuid4()).upper(),
        "dateAdded": dt.datetime.now(dt.timezone.utc).replace(tzinfo=None),
        "Children": children,
        "WebBookmarkType": "WebBookmarkTypeList",
        "Title": title,
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--bookmarks", default=os.path.expanduser("~/Library/Safari/Bookmarks.plist"))
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    path = os.path.abspath(os.path.expanduser(args.bookmarks))
    with open(path, "rb") as f:
        data = plistlib.load(f)

    bar = find_root(data, "BookmarksBar")
    menu = find_root(data, "BookmarksMenu")
    reading = find_root(data, "com.apple.ReadingList")

    ordinary_leaves = []
    collect_leaves(bar, ordinary_leaves)
    collect_leaves(menu, ordinary_leaves)

    reading_leaves = []
    collect_leaves(reading, reading_leaves)

    grouped = {category: [] for category in CATEGORIES}
    for leaf in ordinary_leaves:
        grouped[classify(leaf)].append(leaf)

    for children in grouped.values():
        children.sort(key=sort_key)

    folders = [make_folder(category, grouped[category]) for category in CATEGORIES if grouped[category]]

    stamp = dt.datetime.now().strftime("%Y%m%d-%H%M%S")
    backup = f"{path}.codex-classify-backup-{stamp}"
    report = f"{path}.codex-classify-report-{stamp}.txt"

    if not args.dry_run:
        shutil.copy2(path, backup)
        bar["Children"] = folders
        menu["Children"] = []
        tmp = f"{path}.codex-classify-tmp-{stamp}"
        with open(tmp, "wb") as f:
            plistlib.dump(data, f, fmt=plistlib.FMT_BINARY, sort_keys=False)
        os.replace(tmp, path)

    with open(report, "w", encoding="utf-8") as f:
        f.write(f"bookmarks: {path}\n")
        f.write(f"backup: {backup if not args.dry_run else '(dry-run)'}\n")
        f.write(f"ordinary_moved: {len(ordinary_leaves)}\n")
        f.write(f"reading_list_unchanged: {len(reading_leaves)}\n")
        f.write(f"top_categories: {len(folders)}\n\n")
        for category in CATEGORIES:
            f.write(f"[{category}] {len(grouped[category])}\n")
            for leaf in grouped[category]:
                f.write(f"- {title_of(leaf)}\t{leaf.get('URLString')}\n")
            f.write("\n")

    print(f"backup={backup if not args.dry_run else '(dry-run)'}")
    print(f"report={report}")
    print(f"ordinary_moved={len(ordinary_leaves)}")
    print(f"reading_list_unchanged={len(reading_leaves)}")
    print(f"top_categories={len(folders)}")
    for category in CATEGORIES:
        print(f"{category}={len(grouped[category])}")


if __name__ == "__main__":
    main()
