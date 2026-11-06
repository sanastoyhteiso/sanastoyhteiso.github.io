"""Offline synthetic archive tests. Never invoke a live service or GitHub write."""
import hashlib
import io
import json
import stat
import unittest
import warnings
import zipfile

from zip_package_verify import PackageError, TARGET, verify_zip

HEAD = "1" * 40


def manifest(files=None, **updates):
    items = files or {"app.js": b"console.log('safe test');\n"}
    doc = {
        "schemaVersion": 1, "packageId": "release-2026-11-06-a", "target": TARGET,
        "baseCommit": HEAD, "releaseType": "application",
        "files": [{"path": name, "sha256": hashlib.sha256(data).hexdigest(), "bytes": len(data)}
                  for name, data in items.items()],
    }
    doc.update(updates)
    return doc


def package(files=None, doc=None, extras=None, manifest_bytes=None):
    files = files if files is not None else {"app.js": b"console.log('safe test');\n"}
    data = manifest_bytes if manifest_bytes is not None else json.dumps(
        doc if doc is not None else manifest(files), separators=(",", ":")
    ).encode("utf-8")
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        zf.writestr("manifest.json", data)
        for name, body in files.items():
            zf.writestr(name, body)
        for name, body in extras or []:
            with warnings.catch_warnings():
                warnings.simplefilter("ignore", UserWarning)
                zf.writestr(name, body)
    return buffer.getvalue()


class ZIPVerifierTests(unittest.TestCase):
    def denied(self, archive, head=HEAD):
        with self.assertRaises(PackageError):
            verify_zip(archive, head)

    def test_valid_archive_requires_backend(self):
        result = verify_zip(package(), HEAD)
        self.assertTrue(result["valid"])
        self.assertEqual(result["verifiedFiles"], 1)
        self.assertFalse(result["readyToPublish"])
        self.assertTrue(result["needsAuthenticatedBackend"])

    def test_catalog_only_data(self):
        data = {"data.js": b"window.DATA=[];\n"}
        self.assertTrue(verify_zip(package(data, manifest(data, releaseType="catalog")), HEAD)["valid"])
        self.denied(package(doc=manifest(releaseType="catalog")))

    def test_missing_or_wrong_server_head(self):
        self.denied(package(), "")
        self.denied(package(), "2" * 40)
        self.denied(package(), None)

    def test_wrong_target(self):
        self.denied(package(doc=manifest(target="other/repo")))

    def test_undeclared_config_and_path_traversal(self):
        self.denied(package(extras=[("config.js", b"secret")]))
        self.denied(package(extras=[("../app.js", b"bad")]))

    def test_duplicate_zip_entry(self):
        self.denied(package(extras=[("app.js", b"duplicate")]))

    def test_duplicate_manifest_file(self):
        doc = manifest()
        doc["files"].append(doc["files"][0].copy())
        self.denied(package(doc=doc))

    def test_unknown_manifest_fields(self):
        self.denied(package(doc=manifest(admin=True)))

    def test_invalid_json_duplicate_key(self):
        txt = json.dumps(manifest()).replace('"schemaVersion": 1,', '"schemaVersion": 1, "schemaVersion": 1,')
        self.denied(package(manifest_bytes=txt.encode()))

    def test_digest_mismatch(self):
        doc = manifest()
        doc["files"][0]["sha256"] = "a" * 64
        self.denied(package(doc=doc))

    def test_byte_count_mismatch_and_bool(self):
        doc = manifest()
        doc["files"][0]["bytes"] += 1
        self.denied(package(doc=doc))
        doc["files"][0]["bytes"] = True
        self.denied(package(doc=doc))

    def test_extra_and_missing_bytes(self):
        self.denied(package(files={}))
        self.denied(package(files={"app.js": b"altered"}, doc=manifest()))

    def test_size_bomb(self):
        big = {"app.js": b"a" * (1024 * 1024 + 1)}
        self.denied(package(big))

    def test_non_text(self):
        data = {"app.js": b"\xff\xfe\xfd"}
        self.denied(package(data))
        self.denied(package({"app.js": b"x\x00y"}))

    def test_symlink(self):
        output = io.BytesIO()
        with zipfile.ZipFile(output, "w", compression=zipfile.ZIP_STORED) as zf:
            zf.writestr("manifest.json", json.dumps(manifest()))
            link = zipfile.ZipInfo("app.js")
            link.create_system = 3
            link.external_attr = (stat.S_IFLNK | 0o777) << 16
            zf.writestr(link, b"console.log('safe test');\n")
        self.denied(output.getvalue())

    def test_comment_and_trailing_bytes(self):
        self.denied(package() + b"junk")
        output = io.BytesIO()
        with zipfile.ZipFile(output, "w") as zf:
            zf.writestr("manifest.json", json.dumps(manifest()))
            zf.writestr("app.js", b"console.log('safe test');\n")
            zf.comment = b"hidden"
        self.denied(output.getvalue())

    def test_corrupt_archive(self):
        self.denied(b"not a zip")
        self.denied(package()[:-10])

    def test_no_unexpected_binary_or_code_execution(self):
        data = {"app.js": b"throw new Error('this file must not run during inspection');\n"}
        self.assertTrue(verify_zip(package(data), HEAD)["valid"])


if __name__ == "__main__":
    unittest.main()
