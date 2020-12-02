from django.shortcuts import render
from dynamic import settings
from http.client import HTTPSConnection
from base64 import b64encode
import requests
from django.http import HttpResponse, JsonResponse
import os
from django.contrib.auth.decorators import login_required, permission_required
from django.views.decorators.csrf import csrf_exempt
import json
import dballe
import datetime
from dynamic.models import StationEdit, DataEdit, Edit, Alarm
from rest_framework import viewsets, mixins
from rest_framework import permissions
from dynamic.serializers import EditSerializer, AlarmSerializer, AlarmEditSerializer
from django.http import HttpResponseNotFound
from dynamic.compare_summaries import compare_summaries_data
from dynamic.permissions import HasCanExtract
from django.contrib.staticfiles import finders
from django.views.generic import View
from .proxy import Proxy
from django.contrib.auth.mixins import PermissionRequiredMixin


def render_map(request):

    return render(
        request,
        "map.html",
        {
            "url_borinud": settings.BORINUD_URL,
        },
    )


class WMS(PermissionRequiredMixin, View):
    permission_required = "dynamic.can_extract"
    proxy = Proxy(settings.WMS_URL, settings.WMS_PORT)

    def get(self, request, *args, **kwargs):
        return self.proxy.request(request)


class MAPSERVERWMS(PermissionRequiredMixin, View):
    permission_required = "dynamic.can_extract"
    proxy = Proxy(settings.MAP_SERVER_WMS_URL, settings.MAP_SERVER_WMS_PORT)

    def get(self, request, *args, **kwargs):
        return self.proxy.request(request)


@login_required
@permission_required("dynamic.can_extract")
def render_extract_page(request):
    if request.method == "POST":
        repository = settings.REPOSITORY_DIR
        url = settings.ARKIWEB_URL

        if not (
            os.path.exists(repository)
            and "startTime" in request.POST
            and "product" in request.POST
            and "level" in request.POST
            and "endTime" in request.POST
            and "dataset" in request.POST
        ):
            return HttpResponse(status=500)
        username = settings.USERNAME_ARKIWEB
        password = settings.PASSWORD_ARKIWEB
        product = " or ".join(request.POST.getlist("product"))
        level = " or ".join(request.POST.getlist("level"))
        query = (
            "reftime: >= "
            + request.POST["startTime"]
            + ",<="
            + request.POST["endTime"]
            + "; product:"
            + product
            + "; level:"
            + level
        )

        r = requests.get(
            url,
            auth=(username, password),
            params={"datasets[]": request.POST["dataset"], "query": query},
            stream=True,
        )
        file_path = (
            repository
            + (request.POST["startTime"] + "_" + request.POST["endTime"]).replace(
                " ", ""
            )
            + ".grib1"
        )

        if r.status_code == 200:
            if len(r.content) > 0:
                with open(file_path, "wb") as f:
                    for chunk in r.iter_content(chunk_size=1024):
                        f.write(chunk)
                return HttpResponse(status=200)
            return HttpResponse(status=204)
        return HttpResponse(status=404)
    return render(request, "extract_page.html")


@csrf_exempt
@login_required
@permission_required("dynamic.can_extract")
def manual_edit_attributes(request):
    if request.method == "POST":
        try:
            json_str = request.body.decode("utf-8")
            data = json.loads(json_str)
        except ValueError:
            return JsonResponse({"error": "Error decoding json"})
        dataObj = data["data"]
        type = data["type"]
        memdb = dballe.DB.connect(settings.DBALLE_DB_DYNAMIC)
        edit_obj = Edit(type="i" if type == "invalidate" else "v")
        edit_obj.save()
        with memdb.transaction() as tr:
            for row in dataObj:
                query_params = {
                    "var": list(row["data"][0]["vars"].keys())[0],
                    "ident": row["ident"] if row["ident"] != "null" else None,
                    "rep_memo": row["network"],
                    "lon": int(row["lon"]),
                    "lat": int(row["lat"]),
                    "level": dballe.Level(
                        row["level"][0],
                        row["level"][1],
                        row["level"][2],
                        row["level"][3],
                    ),
                    "trange": dballe.Trange(
                        row["trange"][0], row["trange"][1], row["trange"][2]
                    ),
                    "query": "attrs",
                    "datetime": datetime.datetime.strptime(
                        row["date"], "%Y-%m-%dT%H:%M:%S"
                    ),
                }
                DataEdit(
                    var=query_params["var"],
                    ident=query_params["ident"],
                    network=query_params["rep_memo"],
                    lon=query_params["lon"],
                    lat=query_params["lat"],
                    level=query_params["level"],
                    trange=query_params["trange"],
                    date=query_params["datetime"],
                    edit=edit_obj,
                ).save()
                for rec in tr.query_data(query_params):
                    if type == "invalidate":
                        rec.insert_attrs({"B33196": 1})
                    else:
                        rec.remove_attrs(["B33196"])
        return JsonResponse({"success": True})
    return JsonResponse({"success": False})


@csrf_exempt
@login_required
@permission_required("dynamic.can_extract")
def manual_edit_attributes_station(request):
    if request.method == "POST":
        try:
            json_str = request.body.decode("utf-8")
            data = json.loads(json_str)
        except ValueError:
            return JsonResponse({"error": "Error decoding json"})
        dataObj = data["data"]
        type = data["type"]
        startDate = datetime.datetime.strptime(
            data["initialDate"], "%Y-%m-%dT%H:%M:%S.%fZ"
        )
        endDate = data["finalDate"]
        memdb = dballe.DB.connect(settings.DBALLE_DB_DYNAMIC)
        edit_obj = Edit(
            type="i" if type == "invalidate" else "v",
            data_type="s",
            startDate=startDate,
        )
        if endDate != "":
            edit_obj.finalDate = datetime.datetime.strptime(
                endDate, "%Y-%m-%dT%H:%M:%S.%fZ"
            )
        edit_obj.save()
        with memdb.transaction() as tr:
            for row in dataObj:
                query_params = {
                    "var": row["var"],
                    "ident": row["ident"] if row["ident"] != "null" else None,
                    "rep_memo": row["network"],
                    "lon": int(row["lon"]),
                    "lat": int(row["lat"]),
                    "level": dballe.Level(
                        row["level"][0],
                        row["level"][1],
                        row["level"][2],
                        row["level"][3],
                    ),
                    "trange": dballe.Trange(
                        row["trange"][0], row["trange"][1], row["trange"][2]
                    ),
                    "query": "attrs",
                    "datetimemin": startDate,
                }
                edit_station = StationEdit(
                    var=query_params["var"],
                    ident=query_params["ident"],
                    network=query_params["rep_memo"],
                    lon=query_params["lon"],
                    lat=query_params["lat"],
                    level=query_params["level"],
                    trange=query_params["trange"],
                    startDate=query_params["datetimemin"],
                    edit=edit_obj,
                )
                if endDate != "":
                    query_params["datetimemax"] = datetime.datetime.strptime(
                        endDate, "%Y-%m-%dT%H:%M:%S.%fZ"
                    )
                    edit_station.finalDate = query_params["datetimemax"]
                edit_station.save()
                for rec in tr.query_data(query_params):
                    if type == "invalidate":
                        rec.insert_attrs({"B33196": 1})
                    else:
                        rec.remove_attrs(["B33196"])
        return JsonResponse({"success": True})
    return JsonResponse({"success": False})


@login_required
@permission_required("dynamic.can_extract")
def get_all_stations_vm2(request):
    f = open(finders.find("dynamic/fixtures/stations.json"), encoding="utf-8")
    data = json.load(f)
    stations = list(data.values())
    for station in stations:
        station["network"] = station.pop("rep")
        if station["ident"] == "nil":
            station["ident"] = "null"
    return JsonResponse({"stations": stations})


@login_required
@permission_required("dynamic.can_extract")
def get_all_vars_vm2(request):
    f = open(finders.find("dynamic/fixtures/variables.json"), encoding="utf-8")
    data = json.load(f)
    variables = list(data.values())
    return JsonResponse({"variables": variables})


def find_id_station(json_stations, ident, lon, lat, network):
    ident = "nil" if ident is None else ident
    lon = int(lon)
    lat = int(lat)
    for key, value in json_stations.items():
        if (
            value["ident"] == ident
            and value["lon"] == lon
            and value["lat"] == lat
            and value["rep"] == network
        ):
            return key
    return False


def none_to_nil_or_int(str):
    if str == "None":
        return "nil"
    return int(str)


def find_id_var(json_variables, bcode, trange, level):
    trange = trange.split(",")
    level = level.split(",")
    lt1 = none_to_nil_or_int(level[0])
    l1 = none_to_nil_or_int(level[1])
    lt2 = none_to_nil_or_int(level[2])
    l2 = none_to_nil_or_int(level[3])
    tr = int(trange[0])
    p1 = int(trange[1])
    p2 = int(trange[2])
    for key, value in json_variables.items():
        if (
            value["bcode"] == bcode
            and value["tr"] == tr
            and value["p1"] == p1
            and value["p2"] == p2
            and value["lt1"] == lt1
            and value["lt2"] == lt2
            and value["l2"] == l2
            and value["l1"] == l1
        ):
            return key
    return False


def read_json(path):
    f = open(path, encoding="utf-8")
    return json.load(f)


@login_required
@permission_required("dynamic.can_extract")
def download_table_validations(request, id, type):
    edit = Edit.objects.filter(id=id).first()
    if not edit:
        return HttpResponseNotFound()
    data = (
        StationEdit.objects.filter(edit=edit)
        if type == "station"
        else DataEdit.objects.filter(edit=edit)
    )
    if len(data) <= 0:
        return HttpResponseNotFound()
    stations = read_json(finders.find("dynamic/fixtures/stations.json"))
    variables = read_json(finders.find("dynamic/fixtures/variables.json"))
    type_edit = "1" if edit.type == "i" else "0"
    table = ""
    for d in data:
        id_station = find_id_station(stations, d.ident, d.lon, d.lat, d.network)
        id_var = find_id_var(variables, d.var, d.trange, d.level)
        start_date = d.startDate if type == "station" else d.date
        date = start_date.strftime("%Y/%m/%d/%H/%M")
        if type == "station" and d.finalDate:
            date += "," + d.finalDate.strftime("%Y/%m/%d/%H/%M")
        table += "{},{},{},{} \n".format(id_station, id_var, type_edit, date)

    response = HttpResponse(table, content_type="application/text charset=utf-8")
    response["Content-Disposition"] = 'attachment; filename="table_validation.txt"'
    return response


class EditViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    serializer_class = EditSerializer
    permission_classes = [permissions.IsAuthenticated, HasCanExtract]

    def get_queryset(self):
        queryset = Edit.objects.all().order_by("-created_date")
        type = self.request.query_params.get("type", None)
        if type is not None:
            queryset = queryset.filter(data_type=type)
        return queryset


class AlarmViewSetEdit(
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    serializer_class = AlarmSerializer
    permission_classes = [permissions.IsAuthenticated, HasCanExtract]

    def get_queryset(self):
        queryset = Alarm.objects.all().order_by("-created_date")
        status = self.request.query_params.get("status", None)
        network = self.request.query_params.get("network", None)
        var = self.request.query_params.get("var", None)

        if status is not None:
            queryset = queryset.filter(status=status)
        if network is not None:
            queryset = queryset.filter(network=network)
        if var is not None:
            queryset = queryset.filter(var=var)
        return queryset

    def __init__(self, *args, **kwargs):
        super(AlarmViewSetEdit, self).__init__(*args, **kwargs)
        self.serializer_action_classes = {
            "list": AlarmSerializer,
            "retrieve": AlarmSerializer,
            "update": AlarmEditSerializer,
            "partial_update": AlarmEditSerializer,
            "destroy": AlarmSerializer,
        }

    def get_serializer_class(self, *args, **kwargs):
        """Instantiate the list of serializers per action from class attribute (must be defined)."""
        try:
            return self.serializer_action_classes[self.action]
        except (KeyError, AttributeError):
            return super(AlarmViewSetEdit, self).get_serializer_class()


@login_required
@permission_required("dynamic.can_extract")
def compare_summaries(request):
    start_date_first_period = request.GET.get("startDateFirstPeriod")
    end_date_first_period = request.GET.get("endDateFirstPeriod")
    start_date_second_period = request.GET.get("startDateSecondPeriod")
    end_date_second_period = request.GET.get("endDateSecondPeriod")

    return HttpResponse(
        compare_summaries_data(
            start_date_first_period,
            end_date_first_period,
            start_date_second_period,
            end_date_second_period,
        )
    )
