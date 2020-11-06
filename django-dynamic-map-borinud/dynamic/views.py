from django.shortcuts import render
from django.conf import settings
from http.client import HTTPSConnection
from base64 import b64encode
import requests
from django.http import HttpResponse
import os
from django.contrib.auth.decorators import login_required, permission_required
from django.views.decorators.csrf import csrf_exempt
import json
import dballe
import datetime

def render_map(request):
    url = settings.BORINUD_URL if hasattr(settings, 'BORINUD_URL') else "/borinud/api/v1"
    url_wms = settings.WMS_URL if hasattr(settings, 'WMS_URL') else "http://0.0.0.0:5000/wms"
    return render(request, "map.html", {"url_borinud": url, "url_wms": url_wms})


def render_map_validation(request):
    url = settings.BORINUD_URL if hasattr(settings, 'BORINUD_URL') else "/borinud/api/v1"
    return render(request, "map_validation.html", {"url_borinud": url})


@login_required
@permission_required('dynamic.can_extract')
def render_extract_page(request):
    if request.method == 'POST':
        repository = settings.REPOSITORY_DIR if hasattr(settings, 'REPOSITORY_DIR') else "./testgrib/"
        url = settings.ARKIWEB_URL if hasattr(settings,
                                              'ARKIWEB_URL') else "https://simc.arpae.it/services/arkiweb/data"
        if not (hasattr(settings, 'USERNAME_ARKIWEB')
                and hasattr(settings, 'PASSWORD_ARKIWEB')
                and os.path.exists(repository)
                and "startTime" in request.POST
                and "product" in request.POST
                and "level" in request.POST
                and "endTime" in request.POST
                and "dataset" in request.POST):
            return HttpResponse(status=500)
        username = settings.USERNAME_ARKIWEB
        password = settings.PASSWORD_ARKIWEB
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


@csrf_exempt
@login_required
@permission_required('dynamic.can_extract')
def manual_edit_attributes(request):
    if request.method == 'POST':
        try:
            json_str = request.body.decode('utf-8')
            data = json.loads(json_str)
        except ValueError:
            return JsonResponse({"error": "Error decoding json"})
        startDate = datetime.datetime.strptime(data["initialDate"], '%Y-%m-%dT%H:%M:%S.%fZ')
        endDate = datetime.datetime.strptime(data["finalDate"], '%Y-%m-%dT%H:%M:%S.%fZ')
        dataObj = data["data"]
        type = data["type"]
        memdb = dballe.DB.connect("sqlite://test.sqlite")
        with memdb.transaction() as tr:
            for row in dataObj:
                query_params = {"var": row["var"],
                                "datetimemin": startDate,
                                "ident": row["ident"],
                                # "network": row["network"],
                                "lon": int(row["lon"]),
                                "lat": int(row["lat"]),
                                #"level": tuple(map(int, row["level"].replace("(", "").replace(")", "").split(','))),
                                "trange": tuple(map(int, row["trange"].replace("(", "").replace(")", "").split(','))),
                                "query": "attrs"
                                }
                if endDate != "":
                    query_params["datetimemax"] = endDate
                for rec in tr.query_data(query_params):
                    print(rec)
                    if type == "invalidate":
                        rec.insert_attrs({"B33196": 1})
                    else:
                        rec.remove_attrs(["B33196"])
        return HttpResponse("success")
    return HttpResponse(status=404)


def get_db(dsn="report", last=True):
    from django.utils.module_loading import import_string
    BORINUD = getattr(settings, 'BORINUD', {})
    BORINUDLAST = getattr(settings, 'BORINUDLAST', {})
    dbs = [
        import_string(i["class"])(**{
            k: v for k, v in list(i.items()) if k != "class"
        })
        for i in (BORINUDLAST[dsn]["SOURCES"] if last else BORINUD[dsn]["SOURCES"])
    ]
    return dbs


""""
def prova(request):
    memdb = dballe.DB.connect("sqlite://test.sqlite")

    with memdb.transaction() as tr:
        for rec in tr.query_data({"var": "B12101", "query": "attrs"}):
            rec.insert_attrs({"B33196": 1})
            # rec.remove_attrs(["B33196"])
    return HttpResponse("success")
"""
