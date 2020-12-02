from django.http import HttpResponse
import sys
from http.client import HTTPConnection
from urllib.parse import urlsplit
from django.conf import settings
import base64


class Proxy(object):
    def __init__(self, server_url, server_port):
        self.server_url = server_url
        self.server_port = server_port
        self.server_base = urlsplit(server_url).netloc

    def request(self, request):
        return self._proxy_request(request)

    def _proxy_request(self, request):
        headers = {}
        # add username and password for geoserver ifis present in request.session
        server_port = self.server_port

        if "url" in request.GET:
            server_url = request.GET.get("url", self.server_url)
            server_base = urlsplit(server_url).netloc
        else:
            server_base = self.server_base
            server_url = self.server_url

        conn = HTTPConnection(server_base, server_port)

        url = "?".join([server_url, request.environ["QUERY_STRING"]])
        print(url)
        conn.request(request.method, url, request.body, headers)

        result = conn.getresponse()

        # If we get a redirect, let's add a useful message.
        if result.status in (301, 302, 303, 307):
            response = HttpResponse(
                (
                    'This proxy does not support redirects. The server in "%s" '
                    'asked for a redirect to "%s"'
                    % ("localhost", result.getheader("Location"))
                ),
                status=result.status,
                content_type=result.getheader("Content-Type", "text/plain"),
            )

            response["Location"] = result.getheader("Location")
        else:
            response = HttpResponse(
                result.read(),
                status=result.status,
                content_type=result.getheader("Content-Type", "text/plain"),
            )

        return response