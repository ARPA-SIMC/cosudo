from django.db import models

# Create your models here.
class Permissions(models.Model):

    can_search_blue_flower = 'dynamic.can_extract'

    class Meta:
        permissions = [
            ('can_extract', 'Allowed to extract grib'),
        ]