from django.shortcuts import render
from django.conf import settings
from http.client import HTTPSConnection
from base64 import b64encode
import requests
from django.http import HttpResponse
import os
from django.contrib.auth.decorators import login_required

"""
from borinud.utils.source import get_db
from borinud.v1.views import dbajson
import itertools
import dballe
from borinud.utils.source import MergeDB, SummaryCacheDB
import random


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
    
"""


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
        if not (hasattr(settings, 'USERNAME_ARKIWEB') and  hasattr(settings, 'PASSWORD_ARKIWEB')):
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
        file_path = repository + (request.POST["startTime"] + "_" + request.POST["endTime"]).replace(" ", "")+".grib1"
        if r.status_code == 200:
            if len(r.content) > 0:
                with open(file_path, 'wb') as f:
                    for chunk in r.iter_content(chunk_size=1024):
                        f.write(chunk)
                return HttpResponse(status=200)
            return HttpResponse(status=204)
        return HttpResponse(status=404)
    return render(request, "extract_page.html")


"""
def pass_qc(attrs):
    attrs_dict = {v.code: v.get() for v in attrs}

    # Data already checked and checked as invalid by QC filter
    if attrs_dict.get("B33007", 100) == 0:
        return False

    # Gross error check failed
    if attrs_dict.get("B33192", 100) == 0:
        return False

    # Manual invalidation
    if attrs_dict.get("B33196", 100) == 1:
        return False

    total_score = 0

    for bcode, threshold, lt_score, gte_score in (
            ("B33192", 10, -1, 0),
            ("B33193", 10, -1, 1),
            ("B33194", 10, -1, 1),
    ):
        if bcode in attrs_dict:
            if attrs_dict[bcode] < threshold:
                total_score = total_score + lt_score
            else:
                total_score = total_score + gte_score

    return total_score >= -1


def prova(request):
    memdb = dballe.DB.connect("mem:")
    dbs = get_db()
    for db in dbs:
        db.fill_data_db({"var": "B12101", "query": "attrs"}, memdb)

    with memdb.transaction() as tr:
        for rec in tr.query_data({"var": "B12101", "query": "attrs"}):
            rec.insert_attrs({"B33196": 1})
            print(rec["attrs"])

    with memdb.transaction() as tr:
        for rec in tr.query_data({"var": "B12101", "query": "attrs"}):
            print(rec["attrs"])
"""
