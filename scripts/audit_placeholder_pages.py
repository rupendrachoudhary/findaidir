#!/usr/bin/env python3
"""Detect placeholder/parked tool websites from exported D1 JSON results."""

from __future__ import annotations

import argparse
import asyncio
import json
import time
from pathlib import Path
from urllib.parse import urlparse

import aiohttp
import pandas as pd

STRONG_PHRASES = {
    "nginx_default_1": "welcome to nginx",
    "nginx_default_2": "if you see this page, the nginx web server is successfully installed",
    "apache_default_1": "apache2 debian default page",
    "apache_default_2": "it works! apache",
    "iis_default": "iis windows server",
    "parking_sedo": "sedo domain parking",
    "parking_generic_1": "this domain is parked",
    "parking_generic_2": "domain for sale",
    "parking_generic_3": "buy this domain",
}

STRONG_HOSTS = {
    "sedoparking.com",
    "parkingcrew.net",
    "bodis.com",
    "afternic.com",
    "dan.com",
    "undeveloped.com",
    "parking-page.net",
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--d1-json",
        required=True,
        type=Path,
        help="Path to JSON exported from `wrangler d1 execute --json` with slug/name/domain/website_url fields.",
    )
    parser.add_argument("--out-all", default=Path("audit/live_link_audit.csv"), type=Path)
    parser.add_argument("--out-flagged", default=Path("audit/live_flagged_placeholder.csv"), type=Path)
    parser.add_argument("--concurrency", default=80, type=int)
    parser.add_argument("--progress-every", default=250, type=int)
    return parser.parse_args()


def normalize_url(url: str) -> str:
    value = str(url or "").strip()
    if not value:
        return ""
    if not value.startswith(("http://", "https://")):
        value = f"https://{value}"
    return value


def detect_signatures(html: str, final_url: str) -> list[str]:
    text = (html or "").lower()
    hits: list[str] = []
    for key, phrase in STRONG_PHRASES.items():
        if phrase in text:
            hits.append(key)
    host = (urlparse(final_url).hostname or "").lower()
    for parked_host in STRONG_HOSTS:
        if host == parked_host or host.endswith(f".{parked_host}"):
            hits.append(f"parked_host:{parked_host}")
    return hits


async def fetch_one(
    session: aiohttp.ClientSession,
    sem: asyncio.Semaphore,
    row: dict[str, str],
    idx: int,
    total: int,
    started_at: float,
    progress_every: int,
) -> dict[str, str | int]:
    async with sem:
        url = normalize_url(row.get("website_url", ""))
        result: dict[str, str | int] = {
            "slug": row.get("slug", ""),
            "name": row.get("name", ""),
            "domain": row.get("domain", ""),
            "website_url": url,
            "quality_status": row.get("quality_status", ""),
            "status": -1,
            "final_url": "",
            "signature_hits": "",
            "error": "",
            "ok": 0,
        }
        if not url:
            result["error"] = "empty_url"
            return result

        try:
            async with session.get(url, allow_redirects=True, headers={"Range": "bytes=0-65535"}) as response:
                result["status"] = response.status
                result["final_url"] = str(response.url)
                body = (await response.text(errors="ignore"))[:80_000]
                hits = detect_signatures(body, str(response.url))
                result["signature_hits"] = "|".join(hits)
                result["ok"] = 1 if (200 <= response.status < 400 and not hits) else 0
        except Exception as exc:  # noqa: BLE001
            result["error"] = str(exc).replace("\n", " ")[:220]

        if idx % progress_every == 0 or idx == total:
            elapsed = time.time() - started_at
            print(f"progress={idx}/{total} elapsed_sec={elapsed:.1f}")
        return result


async def run(rows: list[dict[str, str]], concurrency: int, progress_every: int) -> list[dict[str, str | int]]:
    timeout = aiohttp.ClientTimeout(total=22, connect=8, sock_connect=8, sock_read=14)
    headers = {
        "User-Agent": "Mozilla/5.0 (compatible; FindAIDirPlaceholderAudit/1.0)",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    }
    connector = aiohttp.TCPConnector(limit=max(concurrency + 20, 40), ttl_dns_cache=300)
    sem = asyncio.Semaphore(concurrency)
    started = time.time()

    async with aiohttp.ClientSession(timeout=timeout, connector=connector, headers=headers) as session:
        tasks = [
            fetch_one(session, sem, row, idx + 1, len(rows), started, progress_every) for idx, row in enumerate(rows)
        ]
        return await asyncio.gather(*tasks)


def main() -> None:
    args = parse_args()
    payload = json.loads(args.d1_json.read_text(encoding="utf-8"))
    rows = payload[0]["results"]
    print(f"rows={len(rows)} concurrency={args.concurrency}")

    audit_rows = asyncio.run(run(rows, args.concurrency, args.progress_every))
    all_df = pd.DataFrame(audit_rows)
    flagged_df = all_df[all_df["signature_hits"].astype(str) != ""].copy()

    args.out_all.parent.mkdir(parents=True, exist_ok=True)
    all_df.to_csv(args.out_all, index=False)
    flagged_df.to_csv(args.out_flagged, index=False)

    print(f"flagged={len(flagged_df)}")
    if len(flagged_df):
        cols = ["slug", "website_url", "status", "final_url", "signature_hits"]
        print(flagged_df[cols].head(25).to_string(index=False))


if __name__ == "__main__":
    main()
