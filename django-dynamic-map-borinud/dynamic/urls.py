from django.urls import path
from django.views.generic import TemplateView
from dynamic import views
from django.urls import include, path
from rest_framework import routers

router = routers.DefaultRouter()
router.register(r"edits", views.EditViewSet, basename="edits")
router.register(r"alarms", views.AlarmViewSetEdit, basename="alarms")


urlpatterns = [
    path("", include(router.urls)),
    path("map/", views.render_map, name="map"),
    path("extract-grib/", views.render_extract_page, name="extract-page"),
    path(
        "manual-edit-attributes-data/",
        views.manual_edit_attributes,
        name="manual-edit-attrs",
    ),
    path(
        "manual-edit-attributes-station/",
        views.manual_edit_attributes_station,
        name="manual-edit-attrs-station",
    ),
    path(
        "get-all-stations-vm2/", views.get_all_stations_vm2, name="get-all-stations-vm2"
    ),
    path("get-all-vars-vm2/", views.get_all_vars_vm2, name="get-all-vars-vm2"),
    path(
        "download-table-validation/<int:id>/<str:type>/",
        views.download_table_validations,
        name="download-table-validation",
    ),
    path(
        "compare-summaries/",
        views.compare_summaries,
        name="compare-summaries",
    ),
    path(
        "wms/",
        views.WMS.as_view(),
        name="wms",
    ),
    path(
        "wms-mapserver/",
        views.MAPSERVERWMS.as_view(),
        name="mapserver-wms",
    ),
    # path('prova/', views.prova),
]
