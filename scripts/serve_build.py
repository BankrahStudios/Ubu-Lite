import http.server
import os
import socketserver
from pathlib import Path
import mimetypes


# Simple static server with SPA fallback to index.html
# Serves files from templates/ubu-lite-homepage/build

BASE = Path(__file__).resolve().parent.parent / "templates" / "ubu-lite-homepage" / "build"


class SPARequestHandler(http.server.SimpleHTTPRequestHandler):
    def translate_path(self, path: str) -> str:  # type: ignore[override]
        # Serve from the React build directory
        root = str(BASE)
        # Build absolute path
        path = path.split("?", 1)[0].split("#", 1)[0]
        path = os.path.normpath(path)
        words = path.strip("/").split("/") if path != "/" else []
        fullpath = root
        for word in words:
            if os.path.dirname(word) or os.path.basename(word) != word:
                # security: skip if path tries to escape
                continue
            fullpath = os.path.join(fullpath, word)
        return fullpath

    def do_GET(self):  # type: ignore[override]
        fullpath = self.translate_path(self.path)
        # If the requested file exists, serve it normally
        if os.path.exists(fullpath) and os.path.isfile(fullpath):
            return http.server.SimpleHTTPRequestHandler.do_GET(self)

        # Try adding index.html for directories
        if os.path.isdir(fullpath):
            idx = os.path.join(fullpath, "index.html")
            if os.path.exists(idx):
                self.path = self.path.rstrip("/") + "/index.html"
                return http.server.SimpleHTTPRequestHandler.do_GET(self)

        # Otherwise, SPA fallback: serve build/index.html
        index_file = BASE / "index.html"
        if index_file.exists():
            try:
                data = index_file.read_bytes()
                self.send_response(200)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.send_header("Content-Length", str(len(data)))
                self.end_headers()
                self.wfile.write(data)
                return
            except Exception:
                pass

        self.send_error(404, "File not found")


def main():
    port = int(os.environ.get("PORT", "8011"))
    os.chdir(BASE)
    with socketserver.TCPServer(("", port), SPARequestHandler) as httpd:
        print(f"Serving {BASE} with SPA fallback on http://localhost:{port}")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            pass


if __name__ == "__main__":
    main()

