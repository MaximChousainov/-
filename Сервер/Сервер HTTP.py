from http.server import BaseHTTPRequestHandler
from http.server import HTTPServer
from urllib.parse import urlparse, parse_qs
from datetime import datetime

def run(server_class=HTTPServer, handler_class=BaseHTTPRequestHandler):
  server_address = ('0.0.0.0', 20000)
  httpd = server_class(server_address, handler_class)
  try:
      httpd.serve_forever()
  except KeyboardInterrupt:
      httpd.server_close()
	  
текущееНазваниеАрхива = "data.csv"
счетчик = 0

class HttpGetHandler(BaseHTTPRequestHandler):
    """Обработчик с реализованным методом do_GET."""

    def do_GET(self):
        global текущееНазваниеАрхива
        #print(self.path)
        result = urlparse(self.path)
        #print(result)
        data = parse_qs(result.query)

        if 'opyt' in data:
            self.novtjOpyt()
        if 'temperature' in data:
            температура = data["temperature"][0]
            self.pishiOpyt(температура)

        #print(f"{текущееНазваниеАрхива} {счетчик}")
        
        self.send_response(200)
        self.send_header("Content-type", "text/html")
        self.end_headers()
        self.wfile.write('Ok'.encode())
        #self.wfile.write('<html><head><meta charset="utf-8">'.encode())
        #self.wfile.write('<title>Простой HTTP-сервер.</title></head>'.encode())
        #self.wfile.write('<body>Был получен GET-запрос.</body></html>'.encode())

    def novtjOpyt(self):
        global текущееНазваниеАрхива
        current_datetime = datetime.now().strftime("%Y%m%d %H%M%S")
        текущееНазваниеАрхива = "data "+current_datetime+".csv"
        my_file = open(текущееНазваниеАрхива, "w+")
        my_file.write(f"Время\tТемпература\n")
        my_file.close()
        
    def pishiOpyt(self, температура):
        global текущееНазваниеАрхива
        current_datetime = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        #print(f"{текущееНазваниеАрхива}: {current_datetime}\t{температура}")
        my_file = open(текущееНазваниеАрхива, "a+")
        my_file.write(f"{current_datetime}\t{температура}\n")
        my_file.close()
		
run(handler_class=HttpGetHandler)