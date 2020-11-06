from django.urls import path
from django.views.generic import TemplateView
from dynamic import views

urlpatterns = [
    path('map/', views.render_map, name="map"),
    path('map-validation/', views.render_map_validation),
    path('extract-grib/', views.render_extract_page, name="extract-page"),
    path('manual-edit-attributes/', views.manual_edit_attributes, name="manual-edit-attrs"),
    #path('prova/', views.prova),
]
