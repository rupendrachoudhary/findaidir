#!/usr/bin/env python3
"""Audit AI tool URLs from an XLSX file and export row-level health results."""

from __future__ import annotations

import argparse
import asyncio
import json
import time
from dataclasses import asdict, dataclass
from pathlib import Path

import aiohttp
import pandas as pd


@dataclass
class AuditResult:
    url: str
    status: int
    method: str
    final_url: str
    ok: int
    error: str


RETRY_STATUSES = {400, 401, 403, 405, 406, 409, 418, 421, 429, 500, 501, 502, 503, 504, 520, 521, 525, 526, 530}


async def check_url(
    session: aiohttp.ClientSession,
    sem: asyncio.Semaphore,
    url: str,
    idx: int,
    total: int,
    started_at: float,
    progress_every: int,
) -> AuditResult:
    async with sem:
        status = -1
        final_url = url
        method = "HEAD"
        error = ""
        try:
            async with session.head(url, allow_redirects=True) as response:
                status = response.status
                final_url = str(response.url)
            if status in RETRY_STATUSES:
                method = "GET"
                async with session.get(url, allow_redirects=True, headers={"Range": "bytes=0-1024"}) as response:
                    status = response.status
                    final_url = str(response.url)
        except Exception:
            method = "GET"
            try:
                async with session.get(url, allow_redirects=True, headers={"Range": "bytes=0-1024"}) as response:
                    status = response.status
                    final_url = str(response.url)
            except Exception as inner:
                error = str(inner).replace("\n", " ")[:220]

        if idx % progress_every == 0 or idx == total:
            elapsed = time.time() - started_at
            print(f"progress={idx}/{total} elapsed_sec={elapsed:.1f}")

        return AuditResult(
            url=url,
            status=status,
            method=method,
            final_url=final_url,
            ok=1 if 200 <= status < 400 else 0,
            error=error,
        )


async def run_audit(urls: list[str], concurrency: int, progress_every: int) -> list[AuditResult]:
    started_at = time.time()
    timeout = aiohttp.ClientTimeout(total=20, connect=8, sock_connect=8, sock_read=12)
    connector = aiohttp.TCPConnector(limit=max(concurrency + 20, 40), ttl_dns_cache=300)
    headers = {
        "User-Agent": "Mozilla/5.0 (compatible; AIToolsDirectoryAudit/1.0)",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    }
    sem = asyncio.Semaphore(concurrency)
    async with aiohttp.ClientSession(timeout=timeout, connector=connector, headers=headers) as session:
        tasks = [
            check_url(session, sem, url, idx + 1, len(urls), started_at, progress_every)
            for idx, url in enumerate(urls)
        ]
        return await asyncio.gather(*tasks)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--xlsx", required=True, type=Path, help="Path to source xlsx file")
    parser.add_argument("--out-dir", default=Path("audit"), type=Path, help="Directory for audit files")
    parser.add_argument("--concurrency", default=80, type=int, help="Concurrent URL checks")
    parser.add_argument("--progress-every", default=500, type=int, help="Progress log interval")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    out_dir = args.out_dir
    out_dir.mkdir(parents=True, exist_ok=True)

    df = pd.read_excel(args.xlsx)
    df["Website Link"] = df["Website Link"].astype(str).str.strip()
    urls = df["Website Link"].dropna().unique().tolist()

    print(f"rows={len(df)} unique_urls={len(urls)} concurrency={args.concurrency}")
    started_at = time.time()
    results = asyncio.run(run_audit(urls, args.concurrency, args.progress_every))

    result_df = pd.DataFrame([asdict(row) for row in results]).sort_values("url")
    result_df.to_csv(out_dir / "url_audit.csv", index=False)

    merged = df.merge(result_df, left_on="Website Link", right_on="url", how="left")
    merged.to_csv(out_dir / "tools_with_audit.csv", index=False)
    merged[merged["ok"] != 1][["Tool Name", "Category", "Website Link", "status", "error"]].to_csv(
        out_dir / "invalid_rows.csv", index=False
    )

    summary = {
        "rows": int(len(df)),
        "unique_urls": int(len(urls)),
        "ok_urls": int(result_df["ok"].sum()),
        "bad_urls": int((1 - result_df["ok"]).sum()),
        "ok_rows": int(merged["ok"].fillna(0).sum()),
        "bad_rows": int(len(merged) - merged["ok"].fillna(0).sum()),
        "elapsed_sec": round(time.time() - started_at, 2),
    }
    with (out_dir / "audit_summary.json").open("w", encoding="utf-8") as handle:
        json.dump(summary, handle, indent=2)
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
