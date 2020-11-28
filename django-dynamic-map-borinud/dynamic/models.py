from django.db import models
from dynamic.choices import *


# Create your models here.


class Permissions(models.Model):
    can_search_blue_flower = "dynamic.can_extract"

    class Meta:
        permissions = [
            ("can_extract", "Allowed to extract grib"),
        ]


class Edit(models.Model):
    created_date = models.DateTimeField(auto_now_add=True)
    type = models.CharField(choices=EDIT_TYPE, max_length=1)
    startDate = models.DateTimeField(null=True, blank=True)
    finalDate = models.DateTimeField(null=True, blank=True)
    data_type = models.CharField(choices=DATA_TYPE, max_length=1, default="d")


class StationEdit(models.Model):
    var = models.CharField(max_length=6)
    trange = models.CharField(max_length=20)
    level = models.CharField(max_length=20)
    ident = models.CharField(max_length=20, null=True)
    network = models.CharField(max_length=20)
    lon = models.CharField(max_length=20)
    lat = models.CharField(max_length=20)
    startDate = models.DateTimeField()
    finalDate = models.DateTimeField(null=True, blank=True)
    edit = models.ForeignKey("dynamic.edit", on_delete=models.CASCADE)


class DataEdit(models.Model):
    var = models.CharField(max_length=6)
    trange = models.CharField(max_length=20)
    level = models.CharField(max_length=20)
    ident = models.CharField(max_length=20, null=True)
    network = models.CharField(max_length=20)
    lon = models.CharField(max_length=20)
    lat = models.CharField(max_length=20)
    date = models.DateTimeField()
    edit = models.ForeignKey("dynamic.edit", on_delete=models.CASCADE)


class Alarm(models.Model):
    var = models.CharField(max_length=6)
    trange = models.CharField(max_length=20)
    level = models.CharField(max_length=20)
    ident = models.CharField(max_length=20, null=True)
    network = models.CharField(max_length=20)
    lon = models.CharField(max_length=20)
    lat = models.CharField(max_length=20)
    status = models.CharField(max_length=1, choices=ALARM_STATUS)
    created_date = models.DateTimeField(auto_now_add=True)

