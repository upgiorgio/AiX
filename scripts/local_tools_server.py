#!/usr/bin/env python3
import argparse
import json
import mimetypes
import os
import urllib.parse
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

import requests


BASE = Path("/Users/mac/Documents/参考素材/来自收藏夹知识库")
USER_AGENT = "CodexLocalTools/1.0 (+local personal tool hub)"


class LocalToolsHandler(SimpleHTTPRequestHandler):
    server_version = "LocalToolsHTTP/1.0"

    def __init__(self, *args, directory=None, **kwargs):
        super().__init__(*args, directory=str(BASE if directory is None else directory), **kwargs)

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path.startswith("/api/"):
            self.handle_api(parsed)
            return
        if parsed.path == "/":
            self.path = "/local-tools-hub.html"
        return super().do_GET()

    def json_response(self, payload, status=200):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def handle_api(self, parsed):
        try:
            params = {key: values[-1] for key, values in urllib.parse.parse_qs(parsed.query).items()}
            if parsed.path == "/api/status":
                self.json_response({"ok": True, "service": "local-tools-server", "port": self.server.server_port})
            elif parsed.path == "/api/rates":
                self.api_rates(params)
            elif parsed.path == "/api/weather":
                self.api_weather(params)
            elif parsed.path == "/api/shorten":
                self.api_shorten(params)
            else:
                self.json_response({"error": "unknown api endpoint"}, 404)
        except Exception as exc:
            self.json_response({"error": f"{type(exc).__name__}: {exc}"}, 500)

    def request_json(self, url, timeout=15):
        response = requests.get(url, timeout=timeout, headers={"User-Agent": USER_AGENT})
        text = response.text
        try:
            payload = response.json()
        except Exception:
            try:
                payload = json.loads(text)
            except Exception:
                if response.status_code >= 400 or text.lower().startswith("error"):
                    raise RuntimeError(text[:300] or f"HTTP {response.status_code}")
                raise
        if response.status_code >= 400:
            message = payload.get("message") or payload.get("error") or text[:200]
            raise RuntimeError(f"HTTP {response.status_code}: {message}")
        return payload

    def api_rates(self, params):
        base = (params.get("base") or "USD").upper()
        symbols = (params.get("symbols") or "CNY").upper()
        url = "https://api.frankfurter.dev/v1/latest?" + urllib.parse.urlencode({"base": base, "symbols": symbols})
        payload = self.request_json(url)
        payload["provider"] = "Frankfurter"
        self.json_response(payload)

    def api_weather(self, params):
        city = (params.get("city") or "深圳").strip()
        geo_url = "https://geocoding-api.open-meteo.com/v1/search?" + urllib.parse.urlencode(
            {"name": city, "count": 1, "language": "zh", "format": "json"}
        )
        geo = self.request_json(geo_url)
        results = geo.get("results") or []
        if not results:
            self.json_response({"error": f"没有找到城市：{city}"}, 404)
            return
        place = results[0]
        forecast_params = {
            "latitude": place["latitude"],
            "longitude": place["longitude"],
            "current": "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m",
            "daily": "temperature_2m_max,temperature_2m_min",
            "timezone": "auto",
        }
        forecast_url = "https://api.open-meteo.com/v1/forecast?" + urllib.parse.urlencode(forecast_params)
        forecast = self.request_json(forecast_url)
        self.json_response({"place": place, "forecast": forecast, "provider": "Open-Meteo"})

    def api_shorten(self, params):
        target = params.get("url") or ""
        if not target.startswith(("http://", "https://")):
            self.json_response({"error": "url must start with http:// or https://"}, 400)
            return
        isgd_url = "https://is.gd/create.php?" + urllib.parse.urlencode({"format": "json", "url": target})
        try:
            payload = self.request_json(isgd_url)
            if "errormessage" in payload:
                raise RuntimeError(payload["errormessage"])
            payload["provider"] = "is.gd"
            self.json_response(payload)
            return
        except Exception as isgd_error:
            tiny_url = "https://tinyurl.com/api-create.php?" + urllib.parse.urlencode({"url": target})
            response = requests.get(tiny_url, timeout=15, headers={"User-Agent": USER_AGENT})
            short = response.text.strip()
            if response.status_code >= 400 or not short.startswith("http"):
                self.json_response({"error": f"is.gd failed: {isgd_error}; TinyURL failed: {short[:200]}"}, 502)
                return
            self.json_response({"shorturl": short, "provider": "TinyURL", "fallbackFrom": "is.gd"})


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8765)
    args = parser.parse_args()
    os.chdir(BASE)
    mimetypes.add_type("application/javascript", ".js")
    server = ThreadingHTTPServer((args.host, args.port), LocalToolsHandler)
    print(f"Local tools server: http://{args.host}:{args.port}/local-tools-hub.html")
    server.serve_forever()


if __name__ == "__main__":
    main()
