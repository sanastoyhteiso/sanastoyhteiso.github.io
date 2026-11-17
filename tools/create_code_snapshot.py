#!/usr/bin/env python3
"""Create a reproducible, integrity-checked snapshot of tracked repository files.
This is a CODE-ONLY snapshot, never a backup of Firestore/Auth/Drive or secrets.
"""
import argparse
import datetime as dt
import hashlib
import json
import pathlib
import subprocess
import zipfile

def sha(data):
    return hashlib.sha256(data).hexdigest()

def main():
    p = argparse.ArgumentParser()
    p.add_argument("--site", required=True, choices=["velar-dream", "sanastoyhteiso"])
    p.add_argument("--output", default="recovery-output")
    args = p.parse_args()
    root = pathlib.Path(__file__).resolve().parents[1]
    out = root / args.output
    out.mkdir(parents=True, exist_ok=True)
    revision = subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=root, text=True).strip()
    files = subprocess.check_output(["git", "ls-files", "-z"], cwd=root).split(b"\0")
    entries = []
    payloads = {}
    for item in files:
        if not item:
            continue
        name = item.decode("utf-8")
        rel = pathlib.PurePosixPath(name)
        if rel.is_absolute() or ".." in rel.parts or name.startswith(".git/"):
            raise ValueError("Unsafe path: " + name)
        path = root / name
        if path.is_symlink():
            raise ValueError("Symlinks require explicit review: " + name)
        if not path.is_file():
            raise ValueError("Missing tracked file: " + name)
        data = path.read_bytes()
        entries.append({"path": name, "bytes": len(data), "sha256": sha(data)})
        payloads[name] = data
    entries.sort(key=lambda x: x["path"])
    moment = dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    manifest = {
        "schema": "site-code-snapshot/v1",
        "site": args.site, "createdUtc": moment,
        "gitCommit": revision,
        "scope": "git-tracked-files-only",
        "completeSiteBackup": False,
        "notIncluded": ["Firestore", "Firebase Auth", "Cloudflare D1", "Google Drive",
                        "remote media", "secrets", "uncommitted files", "browser storage"],
        "files": entries,
    }
    manifest_data = (json.dumps(manifest, ensure_ascii=False, indent=2) + "\n").encode()
    readme = (
        "CODE SNAPSHOT ONLY — NOT A FULL RESTORABLE SITE BACKUP.\n"
        "The snapshot contains only Git-tracked repository files as of commit " + revision + ".\n"
        "The external databases, user accounts, media and credentials must be backed up separately.\n"
        "Verify SHA-256 for every file listed in SNAPSHOT_MANIFEST.json before restore.\n"
        "Do not publish private data or credentials in a public Git repository.\n"
    ).encode()
    filename = f"{args.site}-code-{revision[:12]}.zip"
    target = out / filename
    with zipfile.ZipFile(target, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        for name in sorted(payloads):
            z.writestr("site/" + name, payloads[name])
        z.writestr("SNAPSHOT_MANIFEST.json", manifest_data)
        z.writestr("README_RECOVERY.txt", readme)
    with zipfile.ZipFile(target) as z:
        assert z.testzip() is None
        for row in entries:
            assert sha(z.read("site/" + row["path"])) == row["sha256"]
    checksum = sha(target.read_bytes())
    (out / (filename + ".sha256")).write_text(checksum + "  " + filename + "\n")
    print(json.dumps({"archive": str(target), "sha256": checksum, "files": len(entries),
                      "completeSiteBackup": False}))

if __name__ == "__main__":
    main()
