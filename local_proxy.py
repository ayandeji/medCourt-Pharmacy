#!/usr/bin/env python3
from http.server import BaseHTTPRequestHandler, HTTPServer
import urllib.request
import urllib.error
import sys
import ssl
import traceback

# Target Apps Script URL (matches index.html WEBAPP_URL)
WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbyvRkY3Cn_gHGEc4VXm506hF5E5qcuAa7KVkxZFi0ITftlqlFSCNrRjRI327DegovLEzw/exec'

class ProxyHandler(BaseHTTPRequestHandler):
    def _set_cors(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')

    def do_OPTIONS(self):
        self.send_response(204)
        self._set_cors()
        self.end_headers()

    def do_POST(self):
        try:
            length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(length) if length > 0 else None
            print('Forwarding request to', WEBAPP_URL)
            req = urllib.request.Request(WEBAPP_URL, data=body, headers={'Content-Type': self.headers.get('Content-Type','application/json')})
            # Create an SSL context that does not verify certificates for local testing
            ctx = ssl.create_default_context()
            ctx.check_hostname = False
            ctx.verify_mode = ssl.CERT_NONE
            with urllib.request.urlopen(req, timeout=30, context=ctx) as resp:
                resp_body = resp.read()
                status = resp.getcode()
                ctype = resp.getheader('Content-Type') or 'application/json'
                self.send_response(status)
                self._set_cors()
                self.send_header('Content-Type', ctype)
                self.end_headers()
                self.wfile.write(resp_body)
        except urllib.error.HTTPError as e:
            try:
                body = e.read()
            except:
                body = b''
            self.send_response(e.code)
            self._set_cors()
            self.end_headers()
            self.wfile.write(body)
        except Exception as e:
            print('Proxy error:')
            traceback.print_exc()
            self.send_response(502)
            self._set_cors()
            self.end_headers()
            self.wfile.write(str(e).encode('utf-8'))

if __name__ == '__main__':
    port = 8001
    server = HTTPServer(('0.0.0.0', port), ProxyHandler)
    print(f"Local proxy running on http://0.0.0.0:{port}/ — forwarding to {WEBAPP_URL}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        server.server_close()
        print('Proxy stopped')
