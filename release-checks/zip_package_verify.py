"""Offline, fail-closed ZIP byte verifier for a future trusted release backend.

Never deploys, writes to GitHub, extracts ZIP contents or verifies identity.
The caller MUST fetch trusted_head independently from GitHub, authenticate the
administrator server-side, and require separate PR/CI/review/rollback gates.
"""

import hashlib
import io
import json
import re
import stat
import zipfile


class PackageError(ValueError):
    """Untrusted package rejected. Do not leak archive content in logs."""


TARGET = "sanastoyhteiso/sanastoyhteiso.github.io"
ALLOWED_FILES = frozenset({
    "index.html", "app.js", "i18n.js", "style.css", "family.js",
    "community.js", "mobile-nav.js", "home-refresh.js",
    "account-settings.js", "sw.js", "about.html", "privacy.html",
    "terms.html", "data.js", "ipad-selects.js", "ipad-selects.css",
    "v3-backup-codec.js", "v3-mediatri-guide.js", "v3-sync-core.js",
    "v3-sync-diff.js", "v3-sync-engine.js", "v3-sync-finds.js",
    "v3-sync-pages.js", "v3-sync-release.js", "v3-sync-sha256.js",
    "v3-sync-shadow.js", "study-diagnostics.js",
})
MAX_ARCHIVE_BYTES = 5 * 1024 * 1024
MAX_TOTAL_BYTES = 4 * 1024 * 1024
MAX_SINGLE_BYTES = 1024 * 1024
MAX_MANIFEST_BYTES = 16 * 1024
MAX_CHANGED_FILES = 20
SHA40 = re.compile(r"[0-9a-f]{40}", re.IGNORECASE)
SHA64 = re.compile(r"[0-9a-f]{64}", re.IGNORECASE)
PACKAGE_ID = re.compile(r"[a-z0-9][a-z0-9._-]{4,79}")


def _reject_duplicates(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise PackageError("Duplicate JSON key")
        result[key] = value
    return result


def _reject_constant(_value):
    raise PackageError("Non-finite JSON number")


def _object(value, allowed, required):
    if type(value) is not dict or not required.issubset(value) or not set(value).issubset(allowed):
        raise PackageError("Invalid manifest fields")


def _read_exact(zf, entry, limit):
    if entry.file_size > limit:
        raise PackageError("Uncompressed size limit")
    with zf.open(entry, "r") as stream:
        data = stream.read(limit + 1)
    if len(data) != entry.file_size or len(data) > limit:
        raise PackageError("ZIP entry length mismatch")
    return data


def verify_zip(archive: bytes, trusted_head: str) -> dict:
    """Verify actual ZIP bytes against manifest; always readyToPublish=False.

    Pure offline component, NOT sufficient authorization or server protection.
    trusted_head MUST originate from an independent trusted GitHub read.
    """
    if type(archive) is not bytes or len(archive) > MAX_ARCHIVE_BYTES or len(archive) < 22:
        raise PackageError("Invalid ZIP byte length")
    if not isinstance(trusted_head, str) or not SHA40.fullmatch(trusted_head):
        raise PackageError("Trusted GitHub HEAD missing")
    if archive[:4] != b"PK\x03\x04" or archive[-22:-18] != b"PK\x05\x06":
        raise PackageError("Unexpected ZIP prefix, comment, or trailing content")
    try:
        with zipfile.ZipFile(io.BytesIO(archive), "r") as zf:
            if zf.comment:
                raise PackageError("ZIP comment forbidden")
            entries = zf.infolist()
            if not 2 <= len(entries) <= MAX_CHANGED_FILES + 1:
                raise PackageError("Invalid ZIP entry count")
            by_name = {}
            for info in entries:
                name = info.filename
                if name in by_name or not isinstance(name, str):
                    raise PackageError("Duplicate or invalid ZIP path")
                if name != "manifest.json" and name not in ALLOWED_FILES:
                    raise PackageError("Unapproved ZIP path")
                if info.is_dir() or info.flag_bits & 1 or info.comment:
                    raise PackageError("Directory, encrypted, or commented ZIP entry")
                if info.compress_type not in (zipfile.ZIP_STORED, zipfile.ZIP_DEFLATED):
                    raise PackageError("Unsupported ZIP compression")
                mode = (info.external_attr >> 16) & 0xFFFF
                kind = stat.S_IFMT(mode)
                if info.create_system == 3 and kind not in (0, stat.S_IFREG):
                    raise PackageError("Non-regular ZIP entry")
                limit = MAX_MANIFEST_BYTES if name == "manifest.json" else MAX_SINGLE_BYTES
                if info.file_size < 0 or info.file_size > limit:
                    raise PackageError("Oversized ZIP entry")
                by_name[name] = info
            if "manifest.json" not in by_name:
                raise PackageError("Manifest missing")
            raw = _read_exact(zf, by_name["manifest.json"], MAX_MANIFEST_BYTES)
            try:
                manifest = json.loads(raw.decode("utf-8"), object_pairs_hook=_reject_duplicates,
                                      parse_constant=_reject_constant)
            except (UnicodeError, json.JSONDecodeError) as exc:
                raise PackageError("Manifest is not strict UTF-8 JSON") from exc
            _object(manifest,
                    {"schemaVersion", "packageId", "target", "baseCommit", "releaseType", "files", "description"},
                    {"schemaVersion", "packageId", "target", "baseCommit", "releaseType", "files"})
            if type(manifest["schemaVersion"]) is not int or manifest["schemaVersion"] != 1:
                raise PackageError("Unsupported schema")
            if type(manifest["packageId"]) is not str or not PACKAGE_ID.fullmatch(manifest["packageId"]):
                raise PackageError("Invalid packageId")
            if manifest["target"] != TARGET:
                raise PackageError("Wrong target")
            base = manifest["baseCommit"]
            if not isinstance(base, str) or not SHA40.fullmatch(base) or base.lower() != trusted_head.lower():
                raise PackageError("Base commit mismatch")
            if manifest["releaseType"] not in ("catalog", "application"):
                raise PackageError("Unsupported release type")
            if "description" in manifest and (type(manifest["description"]) is not str or len(manifest["description"]) > 500):
                raise PackageError("Invalid description")
            declared = manifest["files"]
            if type(declared) is not list or not 1 <= len(declared) <= MAX_CHANGED_FILES:
                raise PackageError("Invalid manifest file count")
            expected = {"manifest.json"}
            total = 0
            for item in declared:
                _object(item, {"path", "sha256", "bytes"}, {"path", "sha256", "bytes"})
                path = item["path"]
                digest = item["sha256"]
                size = item["bytes"]
                if type(path) is not str or path not in ALLOWED_FILES or path in expected:
                    raise PackageError("Invalid or duplicate manifest path")
                if manifest["releaseType"] == "catalog" and path != "data.js":
                    raise PackageError("Catalog can only update data.js")
                if type(digest) is not str or not SHA64.fullmatch(digest):
                    raise PackageError("Invalid SHA-256 declaration")
                if type(size) is not int or not 1 <= size <= MAX_SINGLE_BYTES:
                    raise PackageError("Invalid declared file size")
                expected.add(path)
                total += size
                if total > MAX_TOTAL_BYTES:
                    raise PackageError("Total uncompressed size exceeds limit")
            if set(by_name) != expected:
                raise PackageError("Manifest and ZIP entry lists differ")
            for item in declared:
                body = _read_exact(zf, by_name[item["path"]], MAX_SINGLE_BYTES)
                if len(body) != item["bytes"]:
                    raise PackageError("Declared byte length mismatch")
                if hashlib.sha256(body).hexdigest() != item["sha256"].lower():
                    raise PackageError("SHA-256 does not match ZIP bytes")
                try:
                    decoded = body.decode("utf-8")
                except UnicodeError as exc:
                    raise PackageError("Text file is not UTF-8") from exc
                if "\x00" in decoded:
                    raise PackageError("NUL in text file")
            return {
                "valid": True,
                "packageId": manifest["packageId"],
                "verifiedFiles": len(declared),
                "verifiedBytes": total,
                "readyToPublish": False,
                "needsAuthenticatedBackend": True,
            }
    except PackageError:
        raise
    except (zipfile.BadZipFile, RuntimeError, EOFError, OSError, ValueError) as exc:
        raise PackageError("ZIP structurally invalid or corrupt") from exc
