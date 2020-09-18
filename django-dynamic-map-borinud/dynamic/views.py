from django.shortcuts import render
from django.conf import settings
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


def render_map(request):
    url = settings.BORINUD_URL if hasattr(settings, 'BORINUD_URL') else "/borinud/api/v1"
    url_wms = settings.WMS_URL if hasattr(settings, 'WMS_URL') else "http://0.0.0.0:5000/wms"
    return render(request, "map.html", {"url_borinud": url, "url_wms": url_wms})


def render_map_validation(request):
    url = settings.BORINUD_URL if hasattr(settings, 'BORINUD_URL') else "/borinud/api/v1"
    return render(request, "map_validation.html", {"url_borinud": url})


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
