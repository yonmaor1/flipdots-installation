''' opens a local server with no cache
'''

import http.server
import socketserver
import sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8081

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

err = None

try:
    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        print("serving at port", PORT)
        httpd.serve_forever()
except OSError as e:
    err = e
    i = 0
    while(err.errno == 48): # Address already in use
        new_port = PORT + i
        if new_port > PORT + 10:
            print('Failed to start server')
            break
        try:
            with socketserver.TCPServer(("", new_port), MyHTTPRequestHandler) as httpd:
                print("serving at port", new_port)
                httpd.serve_forever()
        except OSError as e:
            err = e
            i += 1