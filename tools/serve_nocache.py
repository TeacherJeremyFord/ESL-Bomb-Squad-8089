#!/usr/bin/env python3
"""Serve a folder like `python3 -m http.server`, but tell browsers to check for a newer copy on every load.

Plain http.server sends no Cache-Control, so browsers keep old copies of index.html and the module
files for a while and a change doesn't show up. With "no-cache" the browser still keeps its copy but
asks first; an unchanged file comes back as a short 304, so it stays fast.
Usage: serve_nocache.py PORT BIND_IP DIRECTORY
"""
import functools, http.server, sys

class NoCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()

port, bind, directory = int(sys.argv[1]), sys.argv[2], sys.argv[3]
http.server.ThreadingHTTPServer((bind, port), functools.partial(NoCache, directory=directory)).serve_forever()
