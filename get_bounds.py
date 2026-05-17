import http.server
import socketserver
import webbrowser
import sys
import urllib.parse

class Handler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/':
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            html = """
            <!DOCTYPE html>
            <html><body>
            <canvas id="c"></canvas>
            <script>
            const img = new Image();
            img.src = 'tc22_27.png';
            img.onload = () => {
                const c = document.getElementById('c');
                c.width = img.width; c.height = img.height;
                const ctx = c.getContext('2d');
                ctx.drawImage(img, 0, 0);
                const d = ctx.getImageData(0,0,c.width,c.height).data;
                let min_x = c.width, max_x = 0, min_y = c.height, max_y = 0;
                let found = false;
                for(let y=Math.floor(c.height*0.1); y<c.height*0.9; y++) {
                    for(let x=Math.floor(c.width*0.1); x<c.width*0.9; x++) {
                        const i = (y*c.width + x)*4;
                        if(d[i+3] === 0) {
                            if(x < min_x) min_x = x;
                            if(x > max_x) max_x = x;
                            if(y < min_y) min_y = y;
                            if(y > max_y) max_y = y;
                            found = true;
                        }
                    }
                }
                const res = found ? `T:${min_y/c.height*100}|L:${min_x/c.width*100}|W:${(max_x-min_x+1)/c.width*100}|H:${(max_y-min_y+1)/c.height*100}` : 'NOT_FOUND';
                fetch('/result?data=' + encodeURIComponent(res)).then(() => window.close());
            };
            </script>
            </body></html>
            """
            self.wfile.write(html.encode())
        elif self.path.startswith('/result'):
            query = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
            print("BOUNDS:", query.get('data', [''])[0])
            self.send_response(200)
            self.end_headers()
            self.server.server_close()
            sys.exit(0)
        else:
            super().do_GET()

httpd = socketserver.TCPServer(("", 8080), Handler)
webbrowser.open('http://localhost:8080/')
httpd.serve_forever()
