from django.urls import path
from django.views.generic import TemplateView
from dynamic import views
urlpatterns = [
    path('map/', views.render_map)
    ]
