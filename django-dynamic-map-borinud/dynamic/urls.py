from django.urls import path
from django.views.generic import TemplateView
from dynamic import views

urlpatterns = [
    path('map/', views.render_map),
    path('map-validation/', views.render_map_validation),
    #path('prova/', views.prova)
]
