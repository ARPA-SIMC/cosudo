from django.shortcuts import render
from django.conf import settings
from http.client import HTTPSConnection
from base64 import b64encode
import requests
from django.http import HttpResponse
import os
from django.contrib.auth.decorators import login_required


def render_map(request):
    url = settings.BORINUD_URL if hasattr(settings, 'BORINUD_URL') else "/borinud/api/v1"
    url_wms = settings.WMS_URL if hasattr(settings, 'WMS_URL') else "http://0.0.0.0:5000/wms"
    return render(request, "map.html", {"url_borinud": url, "url_wms": url_wms})


def render_map_validation(request):
    url = settings.BORINUD_URL if hasattr(settings, 'BORINUD_URL') else "/borinud/api/v1"
    return render(request, "map_validation.html", {"url_borinud": url})


@login_required
def render_extract_page(request):
    if request.method == 'POST':
        repository = settings.REPOSITORY_DIR if hasattr(settings, 'REPOSITORY_DIR') else "./testgrib/"
        if not (hasattr(settings, 'USERNAME_ARKIWEB') and hasattr(settings, 'PASSWORD_ARKIWEB')):
            print("arkiweb credentials not in settings")
            return HttpResponse(status=500)
        if not os.path.exists(repository):
            print("repository path does not exists")
            return HttpResponse(status=500)
        username = settings.USERNAME_ARKIWEB
        password = settings.PASSWORD_ARKIWEB
        print(request.POST)
        url = settings.ARKIWEB_URL if hasattr(settings,
                                              'ARKIWEB_URL') else "https://simc.arpae.it/services/arkiweb/data"
        product = " or ".join(request.POST.getlist("product"))
        level = " or ".join(request.POST.getlist("level"))
        query = "reftime: >= " + request.POST["startTime"] + ",<=" + \
                request.POST["endTime"] + "; product:" + product + "; level:" + level
        r = requests.get(url, auth=(username, password),
                         params={"datasets[]": request.POST["dataset"], "query": query}, stream=True)
        file_path = repository + (request.POST["startTime"] + "_" + request.POST["endTime"]).replace(" ", "") + ".grib1"
        if r.status_code == 200:
            if len(r.content) > 0:
                with open(file_path, 'wb') as f:
                    for chunk in r.iter_content(chunk_size=1024):
                        f.write(chunk)
                return HttpResponse(status=200)
            return HttpResponse(status=204)
        return HttpResponse(status=404)
    return render(request, "extract_page.html")
