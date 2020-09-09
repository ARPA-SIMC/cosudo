[![Build Status](https://travis-ci.com/ARPA-SIMC/cosudo.svg?branch=master)](https://travis-ci.com/ARPA-SIMC/cosudo)

django-dynamic-map-borinud
==========================

Introduction
---------------

This app shows the borinud data, on a dynamic map.

This app can be installed and used in your django project by:


    $ pip install django-dynamic-map-borinud


Edit your `settings.py` file to include `'dynamic'` in the `INSTALLED_APPS`
listing.


    INSTALLED_APPS = [
        ...

        'dynamic',
    ]

Edit your `settings.py` file to add borinud web service path (the standard path is "/borinud/api/v1").


    BORINUD_URL = "..."

Edit your project `urls.py` file to import the URLs:



    url_patterns = [
        ...

        path('dynamic/', include('dynamic.urls')),
    ]


