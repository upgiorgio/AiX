#!/usr/bin/env python3
import argparse
import concurrent.futures
import datetime as dt
import os
import plistlib
import shutil
import socket
import ssl
import sys
import time
import urllib.error
import urllib.parse
import urllib.request


DEFAULT_TITLE_PATTERNS = {
    "apple",
    "icloud",
    "yahoo!",
    "yahoo",
    "bing",
    "wikipedia",
    "facebook",
    "twitter",
    "linkedin",
    "popular",
    "news",
    "weather",
    "welcome to safari",
    "getting started",
    "safari",
    "apple - start",
    "apple start",
}

DEFAULT_HOSTS = {
    "apple.com",
    "www.apple.com",
    "icloud.com",
    "www.icloud.com",
    "bing.com",
    "www.bing.com",
    "yahoo.com",
    "www.yahoo.com",
    "wikipedia.org",
    "www.wikipedia.org",
    "facebook.com",
    "www.facebook.com",
    "twitter.com",
    "www.twitter.com",
    "linkedin.com",
    "www.linkedin.com",
}

VALID_BLOCKED_CODES = {401, 403, 405, 406, 407, 409, 418, 421, 423, 425, 426, 429, 451}


def node_title(node):
    return node.get("Title") or node.get("URIDictionary", {}).get("title") or ""


def normalize_url(raw):
    raw = (raw or "").strip()
    if not raw:
        return ""
    parsed = urllib.parse.urlsplit(raw)
    scheme = parsed.scheme.lower()
    netloc = parsed.netloc.lower()
    if scheme in {"http", "https"}:
        if netloc.startswith("www."):
            hostkey = netloc[4:]
        else:
            hostkey = netloc
        path = urllib.parse.unquote(parsed.path or "/")
        if path != "/":
            path = path.rstrip("/")
        query = parsed.query
        return urllib.parse.urlunsplit((scheme, hostkey, path, query, ""))
    return raw.lower().rstrip("/")


def host_of(raw):
    try:
        return urllib.parse.urlsplit(raw or "").netloc.lower()
    except Exception:
        return ""


def is_default_bookmark(node):
    url = node.get("URLString") or ""
    title = node_title(node).strip().lower()
    host = host_of(url)
    host_no_www = host[4:] if host.startswith("www.") else host

    if title in DEFAULT_TITLE_PATTERNS:
        return True
    if host in DEFAULT_HOSTS or host_no_www in DEFAULT_HOSTS:
        if title in DEFAULT_TITLE_PATTERNS or title.startswith("apple") or title.startswith("icloud"):
            return True
    if host_no_www.endswith(".apple.com") and title.startswith("apple"):
        return True
    return False


def should_probe(raw):
    try:
        return urllib.parse.urlsplit(raw or "").scheme.lower() in {"http", "https"}
    except Exception:
        return False


def probe_url(raw, timeout):
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
            "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15"
        ),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    }
    context = ssl._create_unverified_context()

    def attempt(method):
        req = urllib.request.Request(raw, method=method, headers=headers)
        with urllib.request.urlopen(req, timeout=timeout, context=context) as resp:
            return resp.getcode() or 0

    try:
        code = attempt("HEAD")
        return code < 400 or code in VALID_BLOCKED_CODES, f"HTTP {code}"
    except urllib.error.HTTPError as exc:
        if exc.code in {405, 403, 401, 429}:
            return True, f"HTTP {exc.code}"
        if exc.code >= 400:
            try:
                code = attempt("GET")
                return code < 400 or code in VALID_BLOCKED_CODES, f"HTTP {code}"
            except urllib.error.HTTPError as get_exc:
                return get_exc.code in VALID_BLOCKED_CODES, f"HTTP {get_exc.code}"
            except Exception as get_exc:
                return False, type(get_exc).__name__
        return True, f"HTTP {exc.code}"
    except Exception:
        try:
            code = attempt("GET")
            return code < 400 or code in VALID_BLOCKED_CODES, f"HTTP {code}"
        except urllib.error.HTTPError as exc:
            return exc.code in VALID_BLOCKED_CODES, f"HTTP {exc.code}"
        except (urllib.error.URLError, TimeoutError, socket.timeout) as exc:
            reason = getattr(exc, "reason", exc)
            return False, str(reason)[:180]
        except Exception as exc:
            return False, type(exc).__name__


def collect_leaves(node, leaves):
    if node.get("WebBookmarkType") == "WebBookmarkTypeLeaf" and node.get("URLString"):
        leaves.append(node)
    for child in node.get("Children", []) or []:
        collect_leaves(child, leaves)


def prune_tree(node, invalid_ids, stats, keep_root=False):
    children = node.get("Children")
    if not isinstance(children, list):
        return True

    kept = []
    for child in children:
        if not prune_tree(child, invalid_ids, stats):
            continue
        if child.get("WebBookmarkType") == "WebBookmarkTypeLeaf":
            if id(child) in invalid_ids:
                continue
        if child.get("Children") == [] and child.get("WebBookmarkType") == "WebBookmarkTypeList":
            stats["empty_folders_removed"] += 1
            continue
        kept.append(child)
    node["Children"] = kept
    return keep_root or bool(kept) or node.get("WebBookmarkType") != "WebBookmarkTypeList"


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--bookmarks", default=os.path.expanduser("~/Library/Safari/Bookmarks.plist"))
    parser.add_argument("--timeout", type=float, default=7.0)
    parser.add_argument("--workers", type=int, default=24)
    parser.add_argument("--no-network", action="store_true")
    args = parser.parse_args()

    path = os.path.abspath(os.path.expanduser(args.bookmarks))
    with open(path, "rb") as f:
        data = plistlib.load(f)

    stamp = dt.datetime.now().strftime("%Y%m%d-%H%M%S")
    backup = f"{path}.codex-backup-{stamp}"
    shutil.copy2(path, backup)

    leaves = []
    collect_leaves(data, leaves)

    invalid_ids = set()
    reasons = {}
    seen = {}
    stats = {
        "before": len(leaves),
        "duplicates_removed": 0,
        "default_removed": 0,
        "non_web_removed": 0,
        "invalid_removed": 0,
        "empty_folders_removed": 0,
    }

    for leaf in leaves:
        url = leaf.get("URLString") or ""
        parsed = urllib.parse.urlsplit(url)
        scheme = parsed.scheme.lower()
        norm = normalize_url(url)

        if scheme not in {"http", "https"}:
            invalid_ids.add(id(leaf))
            reasons[id(leaf)] = ("non-web", url)
            stats["non_web_removed"] += 1
            continue

        if is_default_bookmark(leaf):
            invalid_ids.add(id(leaf))
            reasons[id(leaf)] = ("default", url)
            stats["default_removed"] += 1
            continue

        if norm in seen:
            invalid_ids.add(id(leaf))
            reasons[id(leaf)] = ("duplicate", url)
            stats["duplicates_removed"] += 1
            continue
        seen[norm] = leaf

    probe_targets = [
        leaf
        for leaf in leaves
        if id(leaf) not in invalid_ids and should_probe(leaf.get("URLString"))
    ]

    if not args.no_network and probe_targets:
        checked = 0
        with concurrent.futures.ThreadPoolExecutor(max_workers=args.workers) as executor:
            future_map = {
                executor.submit(probe_url, leaf.get("URLString"), args.timeout): leaf
                for leaf in probe_targets
            }
            for future in concurrent.futures.as_completed(future_map):
                leaf = future_map[future]
                checked += 1
                try:
                    ok, reason = future.result()
                except Exception as exc:
                    ok, reason = False, type(exc).__name__
                if not ok:
                    invalid_ids.add(id(leaf))
                    reasons[id(leaf)] = ("invalid", f"{leaf.get('URLString')} :: {reason}")
                    stats["invalid_removed"] += 1
                if checked % 50 == 0:
                    print(f"checked {checked}/{len(probe_targets)}", flush=True)

    prune_tree(data, invalid_ids, stats, keep_root=True)

    after_leaves = []
    collect_leaves(data, after_leaves)
    stats["after"] = len(after_leaves)

    tmp = f"{path}.codex-tmp-{stamp}"
    with open(tmp, "wb") as f:
        plistlib.dump(data, f, fmt=plistlib.FMT_BINARY, sort_keys=False)
    os.replace(tmp, path)

    report = f"{path}.codex-clean-report-{stamp}.txt"
    with open(report, "w", encoding="utf-8") as f:
        for key in [
            "before",
            "after",
            "duplicates_removed",
            "default_removed",
            "non_web_removed",
            "invalid_removed",
            "empty_folders_removed",
        ]:
            f.write(f"{key}: {stats[key]}\n")
        f.write(f"backup: {backup}\n")
        f.write("\nremoved:\n")
        for leaf in leaves:
            info = reasons.get(id(leaf))
            if info:
                title = node_title(leaf).replace("\n", " ").strip()
                f.write(f"{info[0]}\t{title}\t{info[1]}\n")

    print(f"backup={backup}")
    print(f"report={report}")
    for key in [
        "before",
        "after",
        "duplicates_removed",
        "default_removed",
        "non_web_removed",
        "invalid_removed",
        "empty_folders_removed",
    ]:
        print(f"{key}={stats[key]}")


if __name__ == "__main__":
    started = time.time()
    try:
        main()
    finally:
        print(f"elapsed={time.time() - started:.1f}s", file=sys.stderr)
