#!/usr/bin/env python3
"""Recover broken AI tool links with search-based replacement candidates."""

from __future__ import annotations

import argparse
import concurrent.futures
import json
import re
import subprocess
import time
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Iterable
from urllib.parse import parse_qs, unquote, urlparse

import pandas as pd
import requests
from bs4 import BeautifulSoup


DIRECTORY_DOMAIN_BLACKLIST = {
    "futurepedia.io",
    "aitoolnet.com",
    "toolify.ai",
    "aipure.ai",
    "theresanaiforthat.com",
    "topai.tools",
    "alternativeto.net",
    "producthunt.com",
    "www.producthunt.com",
    "www.futurepedia.io",
    "www.toolify.ai",
    "www.aitoolnet.com",
    "www.aipure.ai",
}


@dataclass
class RecoveryRow:
    tool_name: str
    old_url: str
    candidate_url: str
    candidate_domain: str
    http_status: int
    confidence: float
    accepted: int
    reason: str


def normalize_text(value: str) -> str:
    cleaned = re.sub(r"[^a-z0-9]+", " ", value.lower()).strip()
    return re.sub(r"\s+", " ", cleaned)


def extract_ddg_target(href: str) -> str:
    if not href:
        return ""
    if href.startswith("//duckduckgo.com/l/?"):
        href = "https:" + href
    if "duckduckgo.com/l/?" not in href:
        return href
    query = parse_qs(urlparse(href).query)
    uddg = query.get("uddg", [""])[0]
    return unquote(uddg)


def is_blacklisted(domain: str) -> bool:
    domain = domain.lower()
    return domain in DIRECTORY_DOMAIN_BLACKLIST


def curl_status(url: str) -> int:
    command = ["curl", "-I", "-L", "--max-time", "12", "-o", "/dev/null", "-s", "-w", "%{http_code}", url]
    try:
        output = subprocess.check_output(command, text=True).strip()
        return int(output) if output.isdigit() else -1
    except Exception:
        return -1


def score_candidate(tool_name: str, title: str, domain: str, url: str) -> float:
    tool = normalize_text(tool_name)
    title_norm = normalize_text(title)
    domain_norm = normalize_text(domain.replace(".", " "))
    score = 0.0

    if tool and tool in title_norm:
        score += 0.45
    if tool and tool.replace(" ", "") in domain_norm.replace(" ", ""):
        score += 0.35

    tool_tokens = set(tool.split())
    if tool_tokens:
        overlap = len(tool_tokens.intersection(set(domain_norm.split()))) / len(tool_tokens)
        score += min(0.2, overlap * 0.2)

    parsed = urlparse(url)
    if parsed.path in ("", "/"):
        score += 0.05

    return min(score, 1.0)


def fetch_candidates(session: requests.Session, tool_name: str, limit: int) -> list[tuple[str, str, str]]:
    query = f"{tool_name} official website"
    response = session.get(
        "https://duckduckgo.com/html/",
        params={"q": query},
        timeout=15,
        headers={"User-Agent": "Mozilla/5.0 (compatible; AIToolsDirectoryRecovery/1.0)"},
    )
    response.raise_for_status()

    soup = BeautifulSoup(response.text, "html.parser")
    rows: list[tuple[str, str, str]] = []
    for result in soup.select(".result"):
        anchor = result.select_one(".result__a")
        if not anchor:
            continue
        raw_href = anchor.get("href", "")
        target = extract_ddg_target(raw_href)
        if not target.startswith(("http://", "https://")):
            continue
        parsed = urlparse(target)
        domain = parsed.netloc.lower()
        if not domain or is_blacklisted(domain):
            continue
        title = anchor.get_text(" ", strip=True)
        rows.append((target, domain, title))
        if len(rows) >= limit:
            break
    return rows


def choose_replacement(tool_name: str, old_url: str, candidates: Iterable[tuple[str, str, str]], min_confidence: float) -> RecoveryRow:
    old_domain = urlparse(old_url).netloc.lower()
    best_row = RecoveryRow(
        tool_name=tool_name,
        old_url=old_url,
        candidate_url="",
        candidate_domain="",
        http_status=-1,
        confidence=0.0,
        accepted=0,
        reason="no_candidate",
    )

    for url, domain, title in candidates:
        if domain == old_domain:
            continue
        status = curl_status(url)
        if status < 200 or status >= 400:
            continue
        confidence = score_candidate(tool_name, title, domain, url)
        reason = "accepted" if confidence >= min_confidence else "low_confidence"
        row = RecoveryRow(
            tool_name=tool_name,
            old_url=old_url,
            candidate_url=url,
            candidate_domain=domain,
            http_status=status,
            confidence=confidence,
            accepted=1 if confidence >= min_confidence else 0,
            reason=reason,
        )
        if row.confidence > best_row.confidence:
            best_row = row
        if row.accepted == 1:
            return row

    if best_row.candidate_url:
        return best_row
    return best_row


def recover_one(tool_name: str, old_url: str, candidate_limit: int, min_confidence: float) -> RecoveryRow:
    with requests.Session() as session:
        try:
            candidates = fetch_candidates(session, tool_name, candidate_limit)
            if not candidates:
                return RecoveryRow(
                    tool_name=tool_name,
                    old_url=old_url,
                    candidate_url="",
                    candidate_domain="",
                    http_status=-1,
                    confidence=0.0,
                    accepted=0,
                    reason="no_search_result",
                )
            return choose_replacement(tool_name, old_url, candidates, min_confidence)
        except Exception as exc:
            return RecoveryRow(
                tool_name=tool_name,
                old_url=old_url,
                candidate_url="",
                candidate_domain="",
                http_status=-1,
                confidence=0.0,
                accepted=0,
                reason=f"error:{str(exc)[:80]}",
            )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--audit-csv", required=True, type=Path, help="Path to tools_with_audit.csv")
    parser.add_argument("--out-csv", default=Path("audit/recovered_links.csv"), type=Path)
    parser.add_argument("--workers", default=10, type=int, help="Concurrent recovery jobs")
    parser.add_argument("--candidate-limit", default=5, type=int, help="Max search results to evaluate")
    parser.add_argument("--min-confidence", default=0.62, type=float, help="Auto-accept threshold")
    parser.add_argument("--max-rows", default=0, type=int, help="Optional cap on rows to process (0 means all)")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    out_path = args.out_csv
    out_path.parent.mkdir(parents=True, exist_ok=True)

    df = pd.read_csv(args.audit_csv)
    invalid_rows = df[df["ok"] != 1][["Tool Name", "Website Link"]].drop_duplicates()
    if args.max_rows > 0:
        invalid_rows = invalid_rows.head(args.max_rows)

    targets = list(invalid_rows.itertuples(index=False, name=None))
    total = len(targets)
    print(f"recover_targets={total} workers={args.workers} min_confidence={args.min_confidence}")
    started = time.time()

    recovered: list[RecoveryRow] = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=args.workers) as executor:
        future_to_target = {
            executor.submit(recover_one, tool, old_url, args.candidate_limit, args.min_confidence): (tool, old_url)
            for tool, old_url in targets
        }
        completed = 0
        for future in concurrent.futures.as_completed(future_to_target):
            completed += 1
            row = future.result()
            recovered.append(row)
            if completed % 50 == 0 or completed == total:
                elapsed = time.time() - started
                print(f"progress={completed}/{total} elapsed_sec={elapsed:.1f}")

    out_df = pd.DataFrame([asdict(row) for row in recovered]).sort_values(["accepted", "confidence"], ascending=[False, False])
    out_df.to_csv(out_path, index=False)

    summary = {
        "recover_targets": int(total),
        "accepted_replacements": int(out_df["accepted"].sum()) if not out_df.empty else 0,
        "accept_rate": round(float(out_df["accepted"].mean()) if not out_df.empty else 0.0, 4),
        "elapsed_sec": round(time.time() - started, 2),
    }
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
