[![Build Status](https://badges.herokuapp.com/travis/ARPA-SIMC/cosudo?branch=master&env=DOCKER_IMAGE=centos:7&label=centos7)](https://travis-ci.org/ARPA-SIMC/cosudo)
[![Build Status](https://badges.herokuapp.com/travis/ARPA-SIMC/cosudo?branch=master&env=DOCKER_IMAGE=centos:8&label=centos8)](https://travis-ci.org/ARPA-SIMC/cosudo)
[![Build Status](https://badges.herokuapp.com/travis/ARPA-SIMC/cosudo?branch=master&env=DOCKER_IMAGE=fedora:30&label=fedora30)](https://travis-ci.org/ARPA-SIMC/cosudo)

django-dynamic-map-borinud
==========================

Introduction
---------------

This app shows the borinud data, on a dynamic map.

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


