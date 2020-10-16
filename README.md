[![Build Status](https://badges.herokuapp.com/travis/ARPA-SIMC/cosudo?branch=master&env=DOCKER_IMAGE=centos:8&label=centos8)](https://travis-ci.org/ARPA-SIMC/cosudo)
[![Build Status](https://badges.herokuapp.com/travis/ARPA-SIMC/cosudo?branch=master&env=DOCKER_IMAGE=fedora:31&label=fedora31)](https://travis-ci.org/ARPA-SIMC/cosudo)
[![Build Status](https://badges.herokuapp.com/travis/ARPA-SIMC/cosudo?branch=master&env=DOCKER_IMAGE=fedora:32&label=fedora32)](https://travis-ci.org/ARPA-SIMC/cosudo)

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
    
Edit your `settings.py` file to add the wms service path (the standard path is  "http://0.0.0.0:5000/wms").


    WMS_URL = "..."

Edit your `settings.py` file to add the repository directory path (the standard path is  "/testgrib").


    REPOSITORY_DIR = "..."
    
Edit your `settings.py` file to add the credentials for arkiweb and the url for arkiweb (standard is https://simc.arpae.it/services/arkiweb/data).


    USERNAME_ARKIWEB = "..."
    PASSWORD_ARKIWEB = "..."
    ARKIWEB_URL = "..." 

Edit your project `urls.py` file to import the URLs:



    url_patterns = [
        ...

        path('dynamic/', include('dynamic.urls')),
    ]


