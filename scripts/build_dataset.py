#!/usr/bin/env python3
"""Build cleaned and Cloudflare-ready dataset artifacts from audit outputs."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from urllib.parse import urlparse

import pandas as pd


def slugify(value: str) -> str:
    value = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    value = re.sub(r"-{2,}", "-", value)
    return value[:110]


def sql_escape(value: str) -> str:
    return value.replace("'", "''")


TRACKING_DOMAIN_BLACKLIST = {
    "sjv.io",
    "jvz8.com",
    "bit.ly",
    "tinyurl.com",
    "lnkd.in",
    "t.co",
    "buff.ly",
    "linktr.ee",
}

NAME_TOKEN_STOPWORDS = {"ai", "tool", "tools", "app", "the", "and", "for", "with"}


def canonical_homepage(url: str) -> str:
    parsed = urlparse(str(url).strip())
    if parsed.scheme not in ("http", "https") or not parsed.netloc:
        return str(url).strip()
    return f"{parsed.scheme}://{parsed.netloc.lower()}/"


def root_domain(domain: str) -> str:
    domain = domain.lower().strip()
    if domain.startswith("www."):
        domain = domain[4:]
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


def name_domain_match_score(tool_name: str, domain: str) -> tuple[float, int]:
    tokens = [token for token in re.findall(r"[a-z0-9]+", str(tool_name).lower()) if len(token) > 2 and token not in NAME_TOKEN_STOPWORDS]
    if not tokens:
        return 1.0, 0
    domain_text = str(domain).lower()
    if domain_text.startswith("www."):
        domain_text = domain_text[4:]
    domain_text = re.sub(r"[^a-z0-9]+", " ", domain_text)
    hits = sum(1 for token in tokens if token in domain_text)
    return hits / len(tokens), len(tokens)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--audit-csv", required=True, type=Path, help="Path to tools_with_audit.csv")
    parser.add_argument("--recover-csv", type=Path, default=Path("audit/recovered_links.csv"))
    parser.add_argument("--new-tools-csv", type=Path, default=Path("audit/new_tools_verified.csv"))
    parser.add_argument("--out-dir", type=Path, default=Path("data"))
    parser.add_argument(
        "--xlsx-out",
        type=Path,
        default=Path("All_ai_tools_cleaned_enriched.xlsx"),
        help="Export xlsx with original schema",
    )
    parser.add_argument(
        "--drop-mismatch-score",
        type=float,
        default=0.0,
        help="Drop legacy rows where name-domain score is <= this threshold (0.0 drops exact mismatches only).",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    out_dir = args.out_dir
    out_dir.mkdir(parents=True, exist_ok=True)

    df = pd.read_csv(args.audit_csv)
    df = df.rename(columns={"Website Link": "website_link"})
    df["Tool Name"] = df["Tool Name"].astype(str).str.strip()
    df["Category"] = df["Category"].astype(str).str.strip()
    df["Tags"] = df["Tags"].astype(str).str.strip()
    df["Description"] = df["Description"].astype(str).str.strip()
    df["website_link"] = df["website_link"].astype(str).str.strip()
    if "final_url" in df.columns:
        has_final = df["final_url"].notna() & df["final_url"].astype(str).str.startswith(("http://", "https://"))
        df.loc[has_final, "website_link"] = df.loc[has_final, "final_url"].astype(str)
    df["quality_status"] = df["ok"].apply(lambda x: "verified" if int(x) == 1 else "invalid")

    recovered_count = 0
    if args.recover_csv.exists():
        recover_df = pd.read_csv(args.recover_csv)
        accepted = recover_df[recover_df["accepted"] == 1][["tool_name", "old_url", "candidate_url", "confidence"]]
        accepted = accepted.rename(
            columns={
                "tool_name": "Tool Name",
                "old_url": "website_link",
                "candidate_url": "recovered_url",
                "confidence": "recovered_confidence",
            }
        )
        df = df.merge(accepted, on=["Tool Name", "website_link"], how="left")
        recovered_mask = df["recovered_url"].notna()
        df.loc[recovered_mask, "website_link"] = df.loc[recovered_mask, "recovered_url"]
        df.loc[recovered_mask, "quality_status"] = "recovered"
        recovered_count = int(recovered_mask.sum())
    else:
        df["recovered_confidence"] = None

    # Keep only verified or recovered rows.
    df = df[df["quality_status"].isin(["verified", "recovered"])].copy()
    df["website_link"] = df["website_link"].apply(canonical_homepage)

    df["domain"] = df["website_link"].apply(lambda x: urlparse(x).netloc.lower())
    df = df[~df["domain"].isin(TRACKING_DOMAIN_BLACKLIST)].copy()
    df["tool_slug"] = df["Tool Name"].apply(slugify)
    df["category_slug"] = df["Category"].apply(slugify)

    # Remove obvious duplicates by canonical key.
    df = df.sort_values(
        by=["quality_status", "status", "Tool Name"],
        ascending=[True, True, True],
    )
    df = df.drop_duplicates(subset=["Tool Name", "domain"], keep="first")
    df = df.drop_duplicates(subset=["tool_slug"], keep="first")

    output_columns = [
        "tool_slug",
        "Tool Name",
        "Category",
        "Tags",
        "Description",
        "website_link",
        "domain",
        "quality_status",
        "recovered_confidence",
    ]
    cleaned = df[output_columns].rename(
        columns={
            "Tool Name": "tool_name",
            "Category": "category",
            "Tags": "tags",
            "Description": "description",
        }
    )

    added_new_tools = 0
    if args.new_tools_csv.exists():
        new_df = pd.read_csv(args.new_tools_csv)
        if not new_df.empty:
            rename_map = {
                "name": "tool_name",
                "category": "category",
                "heading": "category",
                "desc": "description",
                "website": "website_link",
            }
            for old, new in rename_map.items():
                if old in new_df.columns and new not in new_df.columns:
                    new_df = new_df.rename(columns={old: new})

            required_cols = {"tool_name", "category", "description", "website_link", "domain"}
            if required_cols.issubset(set(new_df.columns)):
                new_df["tool_name"] = new_df["tool_name"].astype(str).str.strip()
                new_df["category"] = new_df["category"].astype(str).str.strip()
                new_df["description"] = new_df["description"].astype(str).str.strip()
                new_df["website_link"] = new_df["website_link"].astype(str).str.strip().apply(canonical_homepage)
                new_df["domain"] = new_df["website_link"].apply(lambda x: urlparse(x).netloc.lower())
                new_df["tags"] = new_df["category"].astype(str)
                new_df["quality_status"] = "scraped_verified"
                new_df["recovered_confidence"] = None
                new_df["tool_slug"] = new_df["tool_name"].apply(slugify)
                new_df["domain_root"] = new_df["domain"].apply(root_domain)
                new_df = new_df[
                    [
                        "tool_slug",
                        "tool_name",
                        "category",
                        "tags",
                        "description",
                        "website_link",
                        "domain",
                        "domain_root",
                        "quality_status",
                        "recovered_confidence",
                    ]
                ]
                new_df = new_df[(new_df["tool_name"] != "") & (new_df["domain"] != "")]
                new_df = new_df[~new_df["domain"].isin(TRACKING_DOMAIN_BLACKLIST)]
                new_df = new_df.drop_duplicates(subset=["domain_root"], keep="first").drop(columns=["domain_root"])
                added_new_tools = int(len(new_df))
                cleaned = pd.concat([cleaned, new_df], ignore_index=True)

    cleaned["quality_rank"] = cleaned["quality_status"].map({"verified": 1, "recovered": 2, "scraped_verified": 3}).fillna(9)
    cleaned = cleaned.sort_values(by=["quality_rank", "tool_name"], ascending=[True, True])
    cleaned = cleaned.drop_duplicates(subset=["tool_name", "domain"], keep="first")
    cleaned = cleaned.drop_duplicates(subset=["tool_slug"], keep="first")

    scores = cleaned.apply(lambda row: name_domain_match_score(row["tool_name"], row["domain"]), axis=1)
    cleaned["name_domain_score"] = [score for score, _ in scores]
    cleaned["name_domain_tokens"] = [token_count for _, token_count in scores]
    legacy_mask = cleaned["quality_status"].isin(["verified", "recovered"])
    mismatch_mask = legacy_mask & (cleaned["name_domain_tokens"] > 0) & (cleaned["name_domain_score"] <= args.drop_mismatch_score)
    dropped_mismatch_rows = int(mismatch_mask.sum())
    cleaned = cleaned[~mismatch_mask].copy()
    cleaned = cleaned.drop(columns=["quality_rank", "name_domain_score", "name_domain_tokens"])

    cleaned = cleaned.sort_values(by=["tool_name"]).reset_index(drop=True)
    cleaned.to_csv(out_dir / "tools_cleaned.csv", index=False)
    cleaned.to_json(out_dir / "tools_cleaned.json", orient="records", indent=2, force_ascii=True)

    top_for_seed = cleaned.copy()
    top_for_seed.to_json(out_dir / "tools_seed.json", orient="records", indent=2, force_ascii=True)

    sql_lines = [
        "-- Generated by scripts/build_dataset.py",
        "DELETE FROM tools;",
    ]
    for row in top_for_seed.itertuples(index=False):
        sql_lines.append(
            "INSERT INTO tools (slug, name, category, tags, description, website_url, domain, quality_status) "
            f"VALUES ('{sql_escape(row.tool_slug)}', '{sql_escape(row.tool_name)}', '{sql_escape(row.category)}', "
            f"'{sql_escape(row.tags)}', '{sql_escape(row.description)}', '{sql_escape(row.website_link)}', "
            f"'{sql_escape(row.domain)}', '{sql_escape(row.quality_status)}');"
        )
    (out_dir / "seed.sql").write_text("\n".join(sql_lines) + "\n", encoding="utf-8")

    xlsx_df = cleaned.rename(
        columns={
            "tool_name": "Tool Name",
            "category": "Category",
            "tags": "Tags",
            "description": "Description",
            "website_link": "Website Link",
        }
    )[["Tool Name", "Category", "Tags", "Description", "Website Link"]]
    xlsx_df.to_excel(args.xlsx_out, index=False, sheet_name="AI Tools")

    summary = {
        "final_tool_count": int(len(cleaned)),
        "seed_tool_count": int(len(top_for_seed)),
        "recovered_links_used": recovered_count,
        "new_scraped_tools_merged": added_new_tools,
        "legacy_mismatch_rows_dropped": dropped_mismatch_rows,
        "categories": int(cleaned["category"].nunique()) if not cleaned.empty else 0,
        "xlsx_output": str(args.xlsx_out),
    }
    (out_dir / "dataset_summary.json").write_text(json.dumps(summary, indent=2), encoding="utf-8")
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
