#!/usr/bin/env python3
"""Scrape curated sources for additional AI tools not present in local dataset."""

from __future__ import annotations

import argparse
import asyncio
import json
import re
import time
from pathlib import Path
from urllib.parse import urlparse

import aiohttp
import pandas as pd
import requests

SOURCE_URLS = [
    "https://raw.githubusercontent.com/mahseema/awesome-ai-tools/main/README.md",
    "https://raw.githubusercontent.com/tankvn/awesome-ai-tools/master/README.md",
]

BLOCKED_DOMAINS = {
    "awesome.re",
    "github.com",
    "raw.githubusercontent.com",
    "altern.ai",
    "newsletter.altern.ai",
    "theresanai.com",
    "futurepedia.io",
    "toolify.ai",
    "aitoolnet.com",
    "aipure.ai",
    "theresanaiforthat.com",
    "topai.tools",
    "alternativeto.net",
    "youtube.com",
    "x.com",
    "twitter.com",
    "linkedin.com",
    "facebook.com",
    "instagram.com",
    "discord.gg",
    "reddit.com",
    "huggingface.co",
    "ai.meta.com",
    "ai.facebook.com",
    "deepmind.com",
    "docs.google.com",
    "chrome.google.com",
    "workspace.google.com",
    "apps.apple.com",
    "play.google.com",
    "wikipedia.org",
}

STOPWORDS = {"ai", "tool", "tools", "app", "the", "and", "for", "with"}
SKIP_SECTION_PATTERNS = ("learning resources", "extensions", "models")
BAD_URL_PATTERNS = ("utm_", "?ref=", "&ref=", "badge-flat.svg")


def clean_domain(domain: str) -> str:
    domain = domain.lower().strip()
    if domain.startswith("www."):
        domain = domain[4:]
    return domain


def root_domain(domain: str) -> str:
    domain = clean_domain(domain)
    parts = domain.split(".")
    if len(parts) <= 2:
        return domain
    if (
        parts[-1] in {"uk", "au", "in", "jp", "nz", "za", "br"}
        and parts[-2] in {"co", "com", "org", "net", "gov", "edu"}
        and len(parts) >= 3
    ):
        return ".".join(parts[-3:])
    return ".".join(parts[-2:])


def normalize_heading(raw_heading: str) -> str:
    heading = re.sub(r"[^a-zA-Z0-9 /&-]", "", raw_heading).strip()
    return heading or "Other"


def heading_to_category(heading: str) -> str:
    lowered = heading.lower()
    mapping = {
        "text": "writing generators",
        "chatbots": "ai chatbots",
        "search engines": "search engine",
        "writing assistants": "writing generators",
        "productivity": "personal assistant",
        "meeting assistants": "meeting assistant",
        "customer support": "customer support",
        "developer tools": "code assistant",
        "code with ai": "code assistant",
        "image generator": "image generators",
        "generative ai images": "image generators",
        "generative ai video": "video generators",
        "generative ai audio": "audio generators",
        "marketing ai tools": "marketing",
        "startup tools": "startup tools",
        "design generators": "design generators",
        "low-code/no-code": "low-code/no-code",
        "finance": "finance",
    }
    for key, value in mapping.items():
        if key in lowered:
            return value
    return heading


def name_domain_score(name: str, domain: str) -> float:
    tokens = [token for token in re.findall(r"[a-z0-9]+", name.lower()) if len(token) > 2 and token not in STOPWORDS]
    if not tokens:
        return 0.0
    target = domain.replace(".", " ")
    hits = sum(1 for token in tokens if token in target)
    return hits / len(tokens)


def parse_markdown_sources(existing_roots: set[str]) -> pd.DataFrame:
    bullet_re = re.compile(r"^\s*[-*]\s*\[([^\]]{2,100})\]\((https?://[^)\s]+)\)\s*(?:[-:]\s*(.*))?$")
    heading_re = re.compile(r"^#{2,4}\s+(.+?)\s*$")

    records: list[dict[str, str]] = []
    for source_url in SOURCE_URLS:
        response = requests.get(source_url, timeout=30)
        response.raise_for_status()
        heading = "Other"
        for line in response.text.splitlines():
            heading_match = heading_re.match(line)
            if heading_match:
                heading = normalize_heading(heading_match.group(1))
                continue

            bullet_match = bullet_re.match(line)
            if not bullet_match:
                continue
            name, raw_url, description = bullet_match.group(1).strip(), bullet_match.group(2).strip(), (bullet_match.group(3) or "").strip()

            if name.startswith("![") or len(name) < 2:
                continue
            if any(pattern in heading.lower() for pattern in SKIP_SECTION_PATTERNS):
                continue
            if any(pattern in raw_url.lower() for pattern in BAD_URL_PATTERNS):
                continue

            parsed = urlparse(raw_url)
            domain = clean_domain(parsed.netloc)
            root = root_domain(domain)
            if not domain or root in existing_roots:
                continue
            if root in BLOCKED_DOMAINS or domain in BLOCKED_DOMAINS:
                continue
            if any(domain == blocked or domain.endswith(f".{blocked}") for blocked in BLOCKED_DOMAINS):
                continue
            if not re.match(r"^[a-z0-9.-]+$", domain):
                continue

            score = name_domain_score(name, domain)
            if score < 0.25 and len(re.findall(r"[a-z0-9]+", name.lower())) > 1:
                continue

            records.append(
                {
                    "name": name,
                    "heading": heading,
                    "category": heading_to_category(heading),
                    "desc": description,
                    "domain": domain,
                    "website": f"https://{domain}/",
                    "score": round(score, 4),
                    "source": source_url,
                }
            )

    if not records:
        return pd.DataFrame(columns=["name", "heading", "category", "desc", "domain", "website", "score", "source"])
    return pd.DataFrame(records).drop_duplicates(subset=["domain"])


async def validate_urls(urls: list[str], concurrency: int) -> dict[str, int]:
    timeout = aiohttp.ClientTimeout(total=14, connect=6, sock_connect=6, sock_read=8)
    connector = aiohttp.TCPConnector(limit=max(concurrency + 20, 40), ttl_dns_cache=300)
    semaphore = asyncio.Semaphore(concurrency)
    statuses: dict[str, int] = {}
    headers = {"User-Agent": "Mozilla/5.0 (compatible; FindAIDirBot/1.0)"}

    retry_statuses = {400, 401, 403, 405, 406, 409, 418, 421, 429, 500, 501, 502, 503, 504, 520, 521, 525, 526, 530}

    async with aiohttp.ClientSession(timeout=timeout, connector=connector, headers=headers) as session:
        async def check(url: str) -> tuple[str, int]:
            async with semaphore:
                status = -1
                try:
                    async with session.head(url, allow_redirects=True) as response:
                        status = response.status
                    if status in retry_statuses:
                        async with session.get(url, allow_redirects=True, headers={"Range": "bytes=0-512"}) as response:
                            status = response.status
                except Exception:
                    try:
                        async with session.get(url, allow_redirects=True, headers={"Range": "bytes=0-512"}) as response:
                            status = response.status
                    except Exception:
                        status = -1
                return url, status

        tasks = [check(url) for url in urls]
        for idx, result in enumerate(await asyncio.gather(*tasks), 1):
            url, status = result
            statuses[url] = status
            if idx % 100 == 0 or idx == len(urls):
                print(f"validated={idx}/{len(urls)}")

    return statuses


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--existing-csv", type=Path, default=Path("data/tools_cleaned.csv"))
    parser.add_argument("--out-csv", type=Path, default=Path("audit/new_tools_verified.csv"))
    parser.add_argument("--max-checks", type=int, default=900, help="Max candidate homepages to validate")
    parser.add_argument("--max-add", type=int, default=220, help="Max validated tools to output")
    parser.add_argument("--concurrency", type=int, default=60)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    started = time.time()
    args.out_csv.parent.mkdir(parents=True, exist_ok=True)

    existing = pd.read_csv(args.existing_csv)
    existing_roots = set(existing["domain"].astype(str).apply(root_domain))

    candidates = parse_markdown_sources(existing_roots)
    if candidates.empty:
        args.out_csv.write_text("", encoding="utf-8")
        print(json.dumps({"candidates": 0, "validated": 0, "accepted": 0, "elapsed_sec": round(time.time() - started, 2)}, indent=2))
        return

    candidates = candidates.sort_values(by=["score", "name"], ascending=[False, True]).head(args.max_checks).copy()
    statuses = asyncio.run(validate_urls(candidates["website"].tolist(), args.concurrency))
    candidates["status"] = candidates["website"].map(statuses).fillna(-1).astype(int)

    accepted = candidates[(candidates["status"] >= 200) & (candidates["status"] < 400)].copy().head(args.max_add)
    accepted.to_csv(args.out_csv, index=False)

    summary = {
        "candidates": int(len(candidates)),
        "validated": int(len(statuses)),
        "accepted": int(len(accepted)),
        "elapsed_sec": round(time.time() - started, 2),
    }
    print(json.dumps(summary, indent=2))
    print(f"saved={args.out_csv}")


if __name__ == "__main__":
    main()
