from django.shortcuts import render
from django.conf import settings


def render_map(request):
    url = settings.BORINUD_URL if hasattr(settings, 'BORINUD_URL') else "/borinud/api/v1"
    return render(request, "map.html", {"url_borinud": url})
